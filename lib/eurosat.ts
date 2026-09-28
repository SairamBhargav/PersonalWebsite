import "server-only";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import type { EurosatMeta, EurosatSample } from "@/components/demos/eurosat-client";

// Paths are written out literally (not via variables) so the bundler can trace
// exactly these files instead of the whole project.

export type EurosatMetrics = {
  model: string;
  dataset: string;
  split: { train: number; val: number; test: number };
  epochs: number;
  train_minutes: number;
  device: string;
  history: { epoch: number; train_loss: number; val_acc: number }[];
  test_acc_torch: number;
  test_acc_fp32_onnx: number;
  test_acc_int8_onnx: number;
  size_mb_fp32: number;
  size_mb_int8: number;
  cpu_ms_fp32: number;
  cpu_ms_int8: number;
  per_class_acc_int8: Record<string, number>;
  confusion_int8: number[][];
  classes: string[];
  display: string[];
};

/** Everything the demo needs, or null until `ml/eurosat/train.py` has been run. */
export function getEurosatAssets() {
  const model = join(process.cwd(), "public", "models", "eurosat", "model.int8.onnx");
  const meta = join(process.cwd(), "public", "models", "eurosat", "meta.json");
  const samples = join(process.cwd(), "public", "demos", "eurosat", "samples.json");
  if (!existsSync(model) || !existsSync(meta) || !existsSync(samples)) return null;
  return {
    meta: JSON.parse(readFileSync(meta, "utf8")) as EurosatMeta,
    samples: JSON.parse(readFileSync(samples, "utf8")) as EurosatSample[],
    sizeMb: Math.round((statSync(model).size / 1e6) * 10) / 10,
  };
}

export function getEurosatMetrics(): EurosatMetrics | null {
  const metrics = join(process.cwd(), "content", "generated", "eurosat-metrics.json");
  if (!existsSync(metrics)) return null;
  return JSON.parse(readFileSync(metrics, "utf8")) as EurosatMetrics;
}
