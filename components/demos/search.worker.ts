/// <reference lib="webworker" />
import { env, pipeline } from "@huggingface/transformers";

env.allowLocalModels = false;

export type SearchIn = { type: "init"; docs: string[] } | { type: "query"; id: number; text: string };
export type SearchOut =
  | { type: "progress"; value: number }
  | { type: "ready" }
  | { type: "result"; id: number; scores: number[]; ms: number }
  | { type: "error"; message: string };

type Embedder = (
  texts: string | string[],
  opts: { pooling: "mean"; normalize: boolean },
) => Promise<{ tolist(): number[][] }>;
// Narrow the (very wide) pipeline() overloads to just what we use.
const createPipeline = pipeline as unknown as (
  task: "feature-extraction",
  model: string,
  opts: { dtype: "q8"; progress_callback: (p: { status: string; file?: string; progress?: number }) => void },
) => Promise<Embedder>;

let embed: Embedder | null = null;
let corpus: number[][] = [];
const post = (msg: SearchOut) => self.postMessage(msg);

self.onmessage = async (e: MessageEvent<SearchIn>) => {
  const msg = e.data;
  try {
    if (msg.type === "init") {
      embed = await createPipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2", {
        dtype: "q8",
        progress_callback: (p) => {
          if (p.status === "progress" && p.file?.endsWith(".onnx") && p.progress != null) {
            post({ type: "progress", value: p.progress / 100 });
          }
        },
      });
      corpus = (await embed(msg.docs, { pooling: "mean", normalize: true })).tolist();
      post({ type: "ready" });
    } else if (msg.type === "query") {
      if (!embed) throw new Error("Model not loaded");
      const t0 = performance.now();
      const [q] = (await embed(msg.text, { pooling: "mean", normalize: true })).tolist();
      // Vectors are L2-normalized, so the dot product is cosine similarity.
      const scores = corpus.map((v) => v.reduce((s, x, i) => s + x * q[i], 0));
      post({ type: "result", id: msg.id, scores, ms: performance.now() - t0 });
    }
  } catch (err) {
    post({ type: "error", message: err instanceof Error ? err.message : String(err) });
  }
};
