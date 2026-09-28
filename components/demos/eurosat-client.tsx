"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Upload } from "@/components/icons";
import { ErrorNote, LoadButton, ProgressBar } from "@/components/demos/demo-shell";
import type { WorkerOut } from "@/components/demos/eurosat.worker";

export type EurosatMeta = { input: number[]; mean: number[]; std: number[]; classes: string[]; display: string[] };
export type EurosatSample = { file: string; label: string; display: string };

type View = "rgb" | "cam" | "vari";
type Result = { probs: { i: number; p: number }[]; ms: number; cam: Float32Array; camDims: number[] };

const VIEWS: { id: View; label: string; legend: string }[] = [
  { id: "cam", label: "Model attention", legend: "Class activation map for the top prediction: brighter means more influence." },
  { id: "rgb", label: "RGB", legend: "The Sentinel-2 tile as the model sees it (128×128, upsampled from 64×64)." },
  {
    id: "vari",
    label: "Vegetation",
    legend: "VARI = (G − R) / (G + R − B), an RGB-only proxy for NDVI. Green is vegetated; brown is bare or built.",
  },
];

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Couldn't read that image"));
    img.src = src;
  });
}

function softmax(logits: Float32Array) {
  const max = Math.max(...logits);
  const exps = Array.from(logits, (v) => Math.exp(v - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((v) => v / sum);
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Diverging brown → cream → green colormap for t in [0,1]. */
function brbg(t: number): [number, number, number] {
  const stops: [number, number, number][] = [
    [140, 81, 10],
    [223, 194, 125],
    [245, 245, 220],
    [128, 205, 193],
    [1, 102, 94],
  ];
  const x = Math.min(0.9999, Math.max(0, t)) * (stops.length - 1);
  const i = Math.floor(x);
  const f = x - i;
  return [0, 1, 2].map((k) => lerp(stops[i][k], stops[i + 1][k], f)) as [number, number, number];
}

export function EurosatClient({
  meta,
  samples,
  sizeMb,
}: {
  meta: EurosatMeta;
  samples: EurosatSample[];
  sizeMb: number;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [backend, setBackend] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState<{ name: string; label?: string } | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [view, setView] = useState<View>("cam");

  const workerRef = useRef<Worker | null>(null);
  const reqId = useRef(0);
  const pixels = useRef<Uint8ClampedArray | null>(null);
  const imageCanvas = useRef<HTMLCanvasElement>(null);
  const overlayCanvas = useRef<HTMLCanvasElement>(null);
  const uploadUrl = useRef<string | null>(null);
  const size = meta.input[2];

  useEffect(
    () => () => {
      workerRef.current?.terminate();
      if (uploadUrl.current) URL.revokeObjectURL(uploadUrl.current);
    },
    [],
  );

  const classify = useCallback(
    async (src: string, name: string, label?: string) => {
      const worker = workerRef.current;
      const canvas = imageCanvas.current;
      if (!worker || !canvas) return;
      try {
        const img = await loadImage(src);
        canvas.width = canvas.height = size;
        const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
        ctx.imageSmoothingQuality = "high";
        const s = Math.min(img.naturalWidth, img.naturalHeight);
        ctx.drawImage(img, (img.naturalWidth - s) / 2, (img.naturalHeight - s) / 2, s, s, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);
        pixels.current = data;

        const plane = size * size;
        const input = new Float32Array(3 * plane);
        for (let i = 0; i < plane; i++) {
          for (let c = 0; c < 3; c++) input[c * plane + i] = (data[i * 4 + c] / 255 - meta.mean[c]) / meta.std[c];
        }
        setCurrent({ name, label });
        setBusy(true);
        const id = ++reqId.current;
        worker.postMessage({ type: "run", id, data: input, dims: [1, 3, size, size] }, [input.buffer]);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    },
    [meta, size],
  );

  function load() {
    setStatus("loading");
    setError(null);
    const worker = new Worker(new URL("./eurosat.worker.ts", import.meta.url), { type: "module" });
    workerRef.current = worker;
    worker.onmessage = (e: MessageEvent<WorkerOut>) => {
      const m = e.data;
      if (m.type === "progress") setProgress(m.total ? m.loaded / m.total : 0);
      else if (m.type === "ready") {
        setBackend(m.backend);
        setStatus("ready");
        if (samples[0]) classify(`/demos/eurosat/${samples[0].file}`, samples[0].file, samples[0].label);
      } else if (m.type === "result") {
        if (m.id !== reqId.current) return;
        const probs = softmax(m.logits)
          .map((p, i) => ({ i, p }))
          .sort((a, b) => b.p - a.p);
        setResult({ probs, ms: m.ms, cam: m.cam, camDims: m.camDims });
        setBusy(false);
      } else if (m.type === "error") {
        setError(m.message);
        setStatus((s) => (s === "loading" ? "error" : s));
        setBusy(false);
      }
    };
    worker.postMessage({ type: "load", url: "/models/eurosat/model.int8.onnx" });
  }

  // Paint the overlay (CAM or VARI) whenever the result or view changes.
  useEffect(() => {
    const canvas = overlayCanvas.current;
    if (!canvas || !result) return;
    const ctx = canvas.getContext("2d")!;

    if (view === "cam") {
      const [, , h, w] = result.camDims;
      const top = result.probs[0].i;
      const map = result.cam.subarray(top * h * w, (top + 1) * h * w);
      const max = Math.max(1e-6, ...Array.from(map, (v) => Math.max(0, v)));
      canvas.width = w;
      canvas.height = h;
      const img = ctx.createImageData(w, h);
      for (let i = 0; i < h * w; i++) {
        const v = Math.max(0, map[i]) / max;
        img.data[i * 4] = lerp(124, 245, v);
        img.data[i * 4 + 1] = lerp(58, 208, v);
        img.data[i * 4 + 2] = lerp(237, 254, v);
        img.data[i * 4 + 3] = Math.round(Math.pow(v, 1.4) * 210);
      }
      ctx.putImageData(img, 0, 0);
    } else if (view === "vari" && pixels.current) {
      const px = pixels.current;
      canvas.width = canvas.height = size;
      const img = ctx.createImageData(size, size);
      for (let i = 0; i < size * size; i++) {
        const r = px[i * 4] / 255;
        const g = px[i * 4 + 1] / 255;
        const b = px[i * 4 + 2] / 255;
        const denom = g + r - b;
        const vari = Math.abs(denom) < 1e-3 ? 0 : (g - r) / denom;
        const [cr, cg, cb] = brbg((Math.max(-0.4, Math.min(0.4, vari)) + 0.4) / 0.8);
        img.data.set([cr, cg, cb, 255], i * 4);
      }
      ctx.putImageData(img, 0, 0);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, [result, view, size]);

  function onFile(file: File | undefined) {
    if (!file || !file.type.startsWith("image/")) return;
    if (uploadUrl.current) URL.revokeObjectURL(uploadUrl.current);
    uploadUrl.current = URL.createObjectURL(file);
    classify(uploadUrl.current, file.name);
  }

  if (status !== "ready") {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-5 rounded-xl border border-dashed border-border-strong bg-bg p-8 text-center">
        <div className="grid grid-cols-5 gap-1.5 opacity-80">
          {samples.slice(0, 10).map((s) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={s.file} src={`/demos/eurosat/${s.file}`} alt="" className="h-10 w-10 rounded-sm [image-rendering:pixelated]" />
          ))}
        </div>
        {status === "loading" ? (
          <ProgressBar value={progress} label={progress < 1 ? "Downloading model" : "Initializing runtime"} />
        ) : (
          <>
            <p className="max-w-sm text-sm text-muted">
              The model is {sizeMb} MB. It downloads once, gets cached, and then runs locally on your CPU.
            </p>
            <LoadButton onClick={load}>Load model</LoadButton>
          </>
        )}
        {error && <ErrorNote message={error} />}
      </div>
    );
  }

  const legend = VIEWS.find((v) => v.id === view)!.legend;
  const top = result?.probs[0];
  const correct = current?.label && top ? meta.classes[top.i] === current.label : undefined;

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div>
        <div
          className="relative aspect-square overflow-hidden rounded-xl border border-border bg-bg"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            onFile(e.dataTransfer.files[0]);
          }}
        >
          <canvas
            ref={imageCanvas}
            className="absolute inset-0 h-full w-full [image-rendering:pixelated]"
            aria-label={current ? `Input tile: ${current.name}` : "Input tile"}
            role="img"
          />
          <canvas
            ref={overlayCanvas}
            aria-hidden
            className={`absolute inset-0 h-full w-full transition-opacity duration-300 ${
              view === "rgb" ? "opacity-0" : view === "vari" ? "opacity-100 [image-rendering:pixelated]" : "opacity-100"
            }`}
          />
          {busy && <div className="absolute inset-0 animate-pulse bg-bg/20" />}
        </div>

        <div role="tablist" aria-label="Visualization" className="mt-3 inline-flex rounded-full border border-border p-1">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              role="tab"
              aria-selected={view === v.id}
              onClick={() => setView(v.id)}
              className={`rounded-full px-3 py-1 text-xs transition-colors ${
                view === v.id ? "bg-accent text-on-accent" : "text-muted hover:text-fg"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted">{legend}</p>
      </div>

      <div className="flex flex-col">
        <div className="flex items-baseline justify-between">
          <p className="label-mono">Prediction</p>
          {result && (
            <p className="font-mono text-[11px] text-muted">
              {result.ms.toFixed(0)} ms · {backend}
            </p>
          )}
        </div>
        {top && (
          <p className="mt-2 font-serif text-4xl leading-tight">
            {meta.display[top.i]}
            <span className="ml-3 font-mono text-base text-accent">{(top.p * 100).toFixed(1)}%</span>
          </p>
        )}
        {current?.label && (
          <p className="mt-1 text-sm text-muted">
            Ground truth: {meta.display[meta.classes.indexOf(current.label)]}{" "}
            <span className={correct ? "text-accent" : "text-red-500"}>{correct ? "✓" : "✗"}</span>
          </p>
        )}
        <ul className="mt-5 space-y-2.5" aria-live="polite">
          {result?.probs.slice(0, 5).map(({ i, p }) => (
            <li key={i} className="grid grid-cols-[8.5rem_1fr_3.5rem] items-center gap-3 text-sm">
              <span className="truncate">{meta.display[i]}</span>
              <span className="h-1.5 overflow-hidden rounded-full bg-border">
                <span
                  className="block h-full rounded-full bg-accent transition-[width] duration-500"
                  style={{ width: `${Math.max(1, p * 100)}%` }}
                />
              </span>
              <span className="text-right font-mono text-xs text-muted">{(p * 100).toFixed(1)}%</span>
            </li>
          ))}
        </ul>

        <p className="label-mono mt-8">Try a held-out test tile</p>
        <div className="mt-3 grid grid-cols-10 gap-1.5 md:grid-cols-5 lg:grid-cols-10">
          {samples.map((s) => (
            <button
              key={s.file}
              type="button"
              title={s.display}
              aria-label={`Classify sample: ${s.display}`}
              onClick={() => classify(`/demos/eurosat/${s.file}`, s.file, s.label)}
              className={`overflow-hidden rounded-md border-2 transition-colors ${
                current?.name === s.file ? "border-accent" : "border-transparent hover:border-border-strong"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/demos/eurosat/${s.file}`} alt="" className="aspect-square w-full [image-rendering:pixelated]" />
            </button>
          ))}
        </div>
        <label className="mt-4 inline-flex w-fit cursor-pointer items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-muted transition-colors hover:border-accent hover:text-accent">
          <Upload size={15} /> Upload your own tile
          <input type="file" accept="image/*" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
        </label>
        <p className="mt-2 text-xs text-muted">
          Works best on top-down Sentinel-2-like imagery (~10 m/pixel). Street photos will confuse it.
        </p>
        {error && (
          <div className="mt-4">
            <ErrorNote message={error} />
          </div>
        )}
      </div>
    </div>
  );
}
