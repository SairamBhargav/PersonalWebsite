import { DemoShell } from "@/components/demos/demo-shell";
import { EurosatClient } from "@/components/demos/eurosat-client";
import { getEurosatAssets, getEurosatMetrics } from "@/lib/eurosat";

export function EurosatDemo() {
  const assets = getEurosatAssets();
  const metrics = getEurosatMetrics();

  return (
    <DemoShell
      id="demo-eurosat"
      title="What's in this satellite tile?"
      description="A ResNet-18 I fine-tuned on Sentinel-2 imagery classifies land cover into 10 classes and shows where it's looking."
      card={{
        model: "ResNet-18 · int8",
        size: assets ? `${assets.sizeMb} MB` : "~11 MB",
        runtime: "ONNX Runtime Web",
      }}
    >
      {assets ? (
        <EurosatClient meta={assets.meta} samples={assets.samples} sizeMb={assets.sizeMb} />
      ) : (
        <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border-strong bg-bg p-8 text-center">
          <p className="label-mono text-accent">Model in training</p>
          <p className="max-w-md text-sm text-muted">
            This demo goes live once the model finishes training and evaluation. Check back soon.
          </p>
        </div>
      )}
      {metrics && (
        <p className="mt-6 font-mono text-[11px] text-muted">
          Held-out test accuracy {(metrics.test_acc_int8_onnx * 100).toFixed(1)}% (int8) ·{" "}
          {metrics.split.test.toLocaleString()} test tiles never seen during training
        </p>
      )}
    </DemoShell>
  );
}
