/// <reference lib="webworker" />
import * as ort from "onnxruntime-web/wasm";

// Keep in sync with the onnxruntime-web version in package.json.
ort.env.wasm.wasmPaths = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.30.0/dist/";
ort.env.wasm.numThreads = self.crossOriginIsolated ? Math.min(4, navigator.hardwareConcurrency || 1) : 1;

export type WorkerIn = { type: "load"; url: string } | { type: "run"; id: number; data: Float32Array; dims: number[] };

export type WorkerOut =
  | { type: "progress"; loaded: number; total: number }
  | { type: "ready"; backend: string }
  | { type: "result"; id: number; logits: Float32Array; cam: Float32Array; camDims: number[]; ms: number }
  | { type: "error"; message: string };

let session: ort.InferenceSession | null = null;
const post = (msg: WorkerOut) => self.postMessage(msg);

async function fetchWithProgress(url: string) {
  const res = await fetch(url);
  if (!res.ok || !res.body) throw new Error(`Model download failed (${res.status})`);
  const total = Number(res.headers.get("content-length")) || 0;
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let loaded = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    loaded += value.length;
    post({ type: "progress", loaded, total });
  }
  const buf = new Uint8Array(loaded);
  let offset = 0;
  for (const c of chunks) {
    buf.set(c, offset);
    offset += c.length;
  }
  return buf;
}

self.onmessage = async (e: MessageEvent<WorkerIn>) => {
  const msg = e.data;
  try {
    if (msg.type === "load") {
      const bytes = await fetchWithProgress(msg.url);
      session = await ort.InferenceSession.create(bytes, {
        executionProviders: ["wasm"],
        graphOptimizationLevel: "all",
      });
      // Warm-up run so the first real prediction reports honest latency.
      const [n, c, h, w] = [1, 3, 128, 128];
      await session.run({ input: new ort.Tensor("float32", new Float32Array(n * c * h * w), [n, c, h, w]) });
      post({ type: "ready", backend: `WASM${ort.env.wasm.numThreads! > 1 ? ` ×${ort.env.wasm.numThreads}` : ""}` });
    } else if (msg.type === "run") {
      if (!session) throw new Error("Model not loaded");
      const t0 = performance.now();
      const out = await session.run({ input: new ort.Tensor("float32", msg.data, msg.dims) });
      const ms = performance.now() - t0;
      post({
        type: "result",
        id: msg.id,
        logits: out.logits.data as Float32Array,
        cam: out.cam.data as Float32Array,
        camDims: out.cam.dims as number[],
        ms,
      });
    }
  } catch (err) {
    post({ type: "error", message: err instanceof Error ? err.message : String(err) });
  }
};
