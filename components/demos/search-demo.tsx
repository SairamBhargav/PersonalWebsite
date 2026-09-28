"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "@/components/icons";
import { DemoShell, ErrorNote, LoadButton, ProgressBar } from "@/components/demos/demo-shell";
import type { SearchOut } from "@/components/demos/search.worker";
import type { SearchDoc } from "@/lib/search-corpus";

const SUGGESTIONS = ["satellite imagery", "working with LLMs", "databases and pipelines", "healthcare", "real-time video"];

export function SearchDemo({ docs }: { docs: SearchDoc[] }) {
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ doc: SearchDoc; score: number }[]>([]);
  const [ms, setMs] = useState<number | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const reqId = useRef(0);

  useEffect(() => () => workerRef.current?.terminate(), []);

  function load() {
    setStatus("loading");
    setError(null);
    const worker = new Worker(new URL("./search.worker.ts", import.meta.url), { type: "module" });
    workerRef.current = worker;
    worker.onmessage = (e: MessageEvent<SearchOut>) => {
      const m = e.data;
      if (m.type === "progress") setProgress(m.value);
      else if (m.type === "ready") setStatus("ready");
      else if (m.type === "result") {
        if (m.id !== reqId.current) return;
        setMs(m.ms);
        setResults(
          m.scores
            .map((score, i) => ({ doc: docs[i], score }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 5),
        );
      } else if (m.type === "error") {
        setError(m.message);
        setStatus((s) => (s === "loading" ? "error" : s));
      }
    };
    worker.postMessage({ type: "init", docs: docs.map((d) => `${d.title}. ${d.text}`) });
  }

  // Debounced search as you type.
  useEffect(() => {
    if (status !== "ready") return;
    const text = query.trim();
    if (!text) return;
    const t = setTimeout(() => {
      workerRef.current?.postMessage({ type: "query", id: ++reqId.current, text });
    }, 200);
    return () => clearTimeout(t);
  }, [query, status]);

  // Hide stale results once the box is cleared.
  const visible = query.trim() ? results : [];
  const maxScore = visible[0]?.score ?? 1;

  return (
    <DemoShell
      id="demo-search"
      title="Search my work by meaning"
      description="Every project and experience bullet is embedded as a vector. Your query is too, and results are ranked by cosine similarity, so matches don't need shared keywords."
      card={{ model: "all-MiniLM-L6-v2 · q8", size: "~23 MB", runtime: "Transformers.js" }}
    >
      {status !== "ready" ? (
        <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border-strong bg-bg p-8 text-center">
          {status === "loading" ? (
            <ProgressBar value={progress} label={progress < 1 ? "Downloading model" : `Embedding ${docs.length} documents`} />
          ) : (
            <>
              <p className="max-w-sm text-sm text-muted">Loads a small sentence-embedding model (~23 MB, cached after the first visit).</p>
              <LoadButton onClick={load}>Load search</LoadButton>
            </>
          )}
          {error && <ErrorNote message={error} />}
        </div>
      ) : (
        <div>
          <label htmlFor="semantic-q" className="sr-only">
            Search query
          </label>
          <input
            id="semantic-q"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. “computer vision on a budget”"
            autoFocus
            className="w-full rounded-xl border border-border bg-bg px-4 py-3 text-lg outline-none transition-colors placeholder:text-muted/70 focus:border-accent"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setQuery(s)}
                className="rounded-full border border-border px-3 py-1 text-xs text-muted transition-colors hover:border-accent hover:text-accent"
              >
                {s}
              </button>
            ))}
          </div>
          <ol className="mt-6 divide-y divide-border" aria-live="polite">
            {visible.map(({ doc, score }, i) => (
              <li key={`${doc.title}-${i}`}>
                <Link href={doc.href} className="group grid grid-cols-[1fr_auto] gap-4 py-4">
                  <div>
                    <p className="label-mono">
                      {doc.kind} · {doc.title}
                    </p>
                    <p className="mt-1.5 text-[15px] group-hover:text-accent">{doc.text}</p>
                  </div>
                  <div className="flex w-20 flex-col items-end gap-1.5 pt-0.5">
                    <span className="font-mono text-xs text-muted">{score.toFixed(3)}</span>
                    <span className="h-1 w-full overflow-hidden rounded-full bg-border">
                      <span className="block h-full bg-accent" style={{ width: `${Math.max(4, (score / maxScore) * 100)}%` }} />
                    </span>
                    <ArrowUpRight size={14} className="text-muted group-hover:text-accent" />
                  </div>
                </Link>
              </li>
            ))}
          </ol>
          {ms != null && visible.length > 0 && (
            <p className="mt-2 font-mono text-[11px] text-muted">
              Query embedded + ranked in {ms.toFixed(0)} ms across {docs.length} documents
            </p>
          )}
        </div>
      )}
    </DemoShell>
  );
}
