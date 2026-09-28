"""Fine-tune ResNet-18 on EuroSAT (Sentinel-2 RGB) and export it for the browser.

Pipeline:
  1. Stratified 80/10/10 train/val/test split (fixed seed).
  2. Fine-tune an ImageNet ResNet-18 at 128px with the stem max-pool removed,
     so the last feature map is 8x8 (usable for class activation maps).
  3. Export ONNX with two outputs: `logits` [1,10] and `cam` [1,10,8,8].
     CAM is computed in-graph from the final conv features and FC weights.
  4. Static int8 (QDQ) quantization, calibrated on training images.
  5. Evaluate fp32 + int8 on the held-out test set and write metrics.json.
  6. Save a few held-out test tiles as demo samples.

Usage:
  uv run train.py                 # full run
  uv run train.py --epochs 1      # quick smoke test
"""

from __future__ import annotations

import argparse
import json
import random
import shutil
import time
from pathlib import Path

import numpy as np
import onnxruntime as ort
import torch
import torch.nn as nn
import torch.nn.functional as F
from onnxruntime.quantization import CalibrationDataReader, QuantFormat, QuantType, quantize_static
from torch.utils.data import DataLoader, Subset
from torchvision import datasets, models, transforms
from tqdm import tqdm

HERE = Path(__file__).parent
REPO = HERE.parent.parent
DATA_DIR = HERE / "data"
OUT_DIR = HERE / "out"
WEB_MODEL_DIR = REPO / "public" / "models" / "eurosat"
WEB_SAMPLE_DIR = REPO / "public" / "demos" / "eurosat"
SITE_METRICS = REPO / "content" / "generated" / "eurosat-metrics.json"

IMG_SIZE = 128
MEAN = [0.485, 0.456, 0.406]
STD = [0.229, 0.224, 0.225]

# Friendlier names for the UI, keyed by EuroSAT folder name.
DISPLAY = {
    "AnnualCrop": "Annual crop",
    "Forest": "Forest",
    "HerbaceousVegetation": "Herbaceous vegetation",
    "Highway": "Highway",
    "Industrial": "Industrial",
    "Pasture": "Pasture",
    "PermanentCrop": "Permanent crop",
    "Residential": "Residential",
    "River": "River",
    "SeaLake": "Sea / lake",
}


class RandomRot90:
    """Satellite tiles have no canonical "up", so any 90-degree rotation is valid."""

    def __call__(self, img):
        return img.rotate(90 * random.randint(0, 3))


def seed_everything(seed: int) -> None:
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)


def stratified_split(targets: list[int], seed: int) -> tuple[list[int], list[int], list[int]]:
    rng = np.random.default_rng(seed)
    train, val, test = [], [], []
    targets_arr = np.array(targets)
    for c in np.unique(targets_arr):
        idx = np.flatnonzero(targets_arr == c)
        rng.shuffle(idx)
        n_val = n_test = len(idx) // 10
        test += idx[:n_test].tolist()
        val += idx[n_test : n_test + n_val].tolist()
        train += idx[n_test + n_val :].tolist()
    return train, val, test


def build_model(num_classes: int) -> nn.Module:
    model = models.resnet18(weights=models.ResNet18_Weights.IMAGENET1K_V1)
    model.maxpool = nn.Identity()  # 128px in -> 8x8 feature map out
    model.fc = nn.Linear(model.fc.in_features, num_classes)
    return model


class ExportWrapper(nn.Module):
    """Returns logits plus per-class activation maps (CAM, Zhou et al. 2016)."""

    def __init__(self, model: nn.Module):
        super().__init__()
        self.m = model

    def forward(self, x):
        m = self.m
        x = m.relu(m.bn1(m.conv1(x)))
        x = m.layer4(m.layer3(m.layer2(m.layer1(x))))  # [B,512,8,8]
        logits = m.fc(torch.flatten(F.adaptive_avg_pool2d(x, 1), 1))
        cam = torch.einsum("ck,bkhw->bchw", m.fc.weight, x)  # [B,C,8,8]
        return logits, cam


@torch.no_grad()
def evaluate(model: nn.Module, loader: DataLoader, device: str, num_classes: int):
    model.eval()
    confusion = np.zeros((num_classes, num_classes), dtype=np.int64)
    for x, y in loader:
        with torch.autocast(device_type=device, dtype=torch.bfloat16, enabled=device == "cuda"):
            pred = model(x.to(device, non_blocking=True)).argmax(1).cpu().numpy()
        for t, p in zip(y.numpy(), pred):
            confusion[t, p] += 1
    return confusion.trace() / confusion.sum(), confusion


class Calibration(CalibrationDataReader):
    def __init__(self, dataset, indices: list[int], input_name: str):
        self.items = iter([{input_name: dataset[i][0].unsqueeze(0).numpy()} for i in indices])

    def get_next(self):
        return next(self.items, None)


def onnx_accuracy(path: Path, dataset, indices: list[int], num_classes: int):
    sess = ort.InferenceSession(str(path), providers=["CPUExecutionProvider"])
    name = sess.get_inputs()[0].name
    confusion = np.zeros((num_classes, num_classes), dtype=np.int64)
    t0 = time.perf_counter()
    for i in indices:
        x, y = dataset[i]
        logits = sess.run(["logits"], {name: x.unsqueeze(0).numpy()})[0]
        confusion[y, int(logits.argmax())] += 1
    ms = (time.perf_counter() - t0) / len(indices) * 1000
    return confusion.trace() / confusion.sum(), confusion, ms


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--epochs", type=int, default=10)
    ap.add_argument("--batch-size", type=int, default=128)
    ap.add_argument("--lr", type=float, default=1e-3)
    ap.add_argument("--seed", type=int, default=42)
    ap.add_argument("--workers", type=int, default=4)
    args = ap.parse_args()

    seed_everything(args.seed)
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"device: {device} ({torch.cuda.get_device_name(0) if device == 'cuda' else 'cpu'})")
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    normalize = transforms.Normalize(MEAN, STD)
    train_tf = transforms.Compose([
        transforms.Resize(IMG_SIZE),
        RandomRot90(),
        transforms.RandomHorizontalFlip(),
        transforms.ColorJitter(0.15, 0.15, 0.1),
        transforms.ToTensor(),
        normalize,
    ])
    eval_tf = transforms.Compose([transforms.Resize(IMG_SIZE), transforms.ToTensor(), normalize])

    base = datasets.EuroSAT(DATA_DIR, download=True)
    classes = base.classes
    num_classes = len(classes)
    train_idx, val_idx, test_idx = stratified_split(base.targets, args.seed)
    print(f"classes: {classes}\nsplit: train={len(train_idx)} val={len(val_idx)} test={len(test_idx)}")

    train_ds = datasets.EuroSAT(DATA_DIR, transform=train_tf)
    eval_ds = datasets.EuroSAT(DATA_DIR, transform=eval_tf)
    loader_kw = dict(batch_size=args.batch_size, num_workers=args.workers, pin_memory=True, persistent_workers=args.workers > 0)
    train_dl = DataLoader(Subset(train_ds, train_idx), shuffle=True, drop_last=True, **loader_kw)
    val_dl = DataLoader(Subset(eval_ds, val_idx), **loader_kw)
    test_dl = DataLoader(Subset(eval_ds, test_idx), **loader_kw)

    model = build_model(num_classes).to(device).to(memory_format=torch.channels_last)
    opt = torch.optim.AdamW(model.parameters(), lr=args.lr, weight_decay=0.05)
    sched = torch.optim.lr_scheduler.OneCycleLR(opt, max_lr=args.lr, total_steps=args.epochs * len(train_dl), pct_start=0.15)
    loss_fn = nn.CrossEntropyLoss(label_smoothing=0.1)

    best_acc, history = 0.0, []
    ckpt = OUT_DIR / "best.pt"
    t_start = time.time()
    for epoch in range(1, args.epochs + 1):
        model.train()
        running = 0.0
        for x, y in tqdm(train_dl, desc=f"epoch {epoch}/{args.epochs}", leave=False):
            x = x.to(device, non_blocking=True).to(memory_format=torch.channels_last)
            y = y.to(device, non_blocking=True)
            with torch.autocast(device_type=device, dtype=torch.bfloat16, enabled=device == "cuda"):
                loss = loss_fn(model(x), y)
            opt.zero_grad(set_to_none=True)
            loss.backward()
            opt.step()
            sched.step()
            running += loss.item()
        val_acc, _ = evaluate(model, val_dl, device, num_classes)
        train_loss = running / len(train_dl)
        history.append({"epoch": epoch, "train_loss": round(train_loss, 4), "val_acc": round(float(val_acc), 4)})
        print(f"epoch {epoch}: train_loss={train_loss:.4f} val_acc={val_acc:.4f}")
        if val_acc > best_acc:
            best_acc = val_acc
            torch.save(model.state_dict(), ckpt)
    train_minutes = (time.time() - t_start) / 60

    model.load_state_dict(torch.load(ckpt, map_location=device))
    test_acc, test_conf = evaluate(model, test_dl, device, num_classes)
    print(f"test accuracy (torch): {test_acc:.4f}")

    # ---- ONNX export -------------------------------------------------------
    export = ExportWrapper(model.to("cpu").to(memory_format=torch.contiguous_format)).eval()
    fp32_path = OUT_DIR / "eurosat_resnet18.onnx"
    torch.onnx.export(
        export,
        torch.randn(1, 3, IMG_SIZE, IMG_SIZE),
        str(fp32_path),
        input_names=["input"],
        output_names=["logits", "cam"],
        opset_version=17,
        dynamo=False,
    )

    int8_path = OUT_DIR / "eurosat_resnet18.int8.onnx"
    calib_idx = random.Random(args.seed).sample(train_idx, 300)
    quantize_static(
        str(fp32_path),
        str(int8_path),
        Calibration(eval_ds, calib_idx, "input"),
        quant_format=QuantFormat.QDQ,
        per_channel=True,
        weight_type=QuantType.QInt8,
        activation_type=QuantType.QUInt8,
    )

    fp32_acc, _, fp32_ms = onnx_accuracy(fp32_path, eval_ds, test_idx, num_classes)
    int8_acc, int8_conf, int8_ms = onnx_accuracy(int8_path, eval_ds, test_idx, num_classes)
    print(f"onnx fp32: acc={fp32_acc:.4f} {fp32_ms:.1f}ms | int8: acc={int8_acc:.4f} {int8_ms:.1f}ms")

    # ---- Ship artifacts to the website -------------------------------------
    WEB_MODEL_DIR.mkdir(parents=True, exist_ok=True)
    shutil.copy(int8_path, WEB_MODEL_DIR / "model.int8.onnx")
    per_class = {c: round(float(int8_conf[i, i] / int8_conf[i].sum()), 4) for i, c in enumerate(classes)}
    metrics = {
        "model": "ResNet-18 (ImageNet init, stem max-pool removed)",
        "dataset": "EuroSAT RGB (Sentinel-2), 27,000 tiles, 10 classes",
        "input": [1, 3, IMG_SIZE, IMG_SIZE],
        "mean": MEAN,
        "std": STD,
        "classes": classes,
        "display": [DISPLAY.get(c, c) for c in classes],
        "split": {"train": len(train_idx), "val": len(val_idx), "test": len(test_idx)},
        "epochs": args.epochs,
        "train_minutes": round(train_minutes, 1),
        "device": torch.cuda.get_device_name(0) if torch.cuda.is_available() else "cpu",
        "history": history,
        "test_acc_torch": round(float(test_acc), 4),
        "test_acc_fp32_onnx": round(float(fp32_acc), 4),
        "test_acc_int8_onnx": round(float(int8_acc), 4),
        "size_mb_fp32": round(fp32_path.stat().st_size / 1e6, 1),
        "size_mb_int8": round(int8_path.stat().st_size / 1e6, 1),
        "cpu_ms_fp32": round(fp32_ms, 1),
        "cpu_ms_int8": round(int8_ms, 1),
        "per_class_acc_int8": per_class,
        "confusion_int8": int8_conf.tolist(),
    }
    (WEB_MODEL_DIR / "meta.json").write_text(json.dumps({k: metrics[k] for k in ("input", "mean", "std", "classes", "display")}, indent=2))
    SITE_METRICS.parent.mkdir(parents=True, exist_ok=True)
    SITE_METRICS.write_text(json.dumps(metrics, indent=2))

    # Two held-out test tiles per class for the demo picker.
    WEB_SAMPLE_DIR.mkdir(parents=True, exist_ok=True)
    samples, per_class_count = [], {c: 0 for c in classes}
    for i in random.Random(args.seed + 1).sample(test_idx, len(test_idx)):
        path, y = base.samples[i]
        c = classes[y]
        if per_class_count[c] >= 2:
            continue
        per_class_count[c] += 1
        name = f"{c.lower()}-{per_class_count[c]}.png"
        base.loader(path).save(WEB_SAMPLE_DIR / name)
        samples.append({"file": name, "label": c, "display": DISPLAY.get(c, c)})
        if all(v >= 2 for v in per_class_count.values()):
            break
    samples.sort(key=lambda s: (classes.index(s["label"]), s["file"]))
    (WEB_SAMPLE_DIR / "samples.json").write_text(json.dumps(samples, indent=2))
    print(f"wrote {WEB_MODEL_DIR} and {len(samples)} samples to {WEB_SAMPLE_DIR}")


if __name__ == "__main__":
    main()
