import type { Metadata } from "next";
import { EurosatDemo } from "@/components/demos/eurosat-demo";
import { FaceDemo } from "@/components/demos/face-demo";
import { SearchDemo } from "@/components/demos/search-demo";
import { PageTransition } from "@/components/page-transition";
import { buildSearchCorpus } from "@/lib/search-corpus";

export const metadata: Metadata = {
  title: "Playground",
  description: "Machine-learning demos that run entirely in your browser: satellite land-cover classification, face detection and semantic search.",
  alternates: { canonical: "/playground" },
};

export default function PlaygroundPage() {
  return (
    <PageTransition>
      <div className="shell pb-24 pt-28 md:pt-36">
        <p className="label-mono flex items-center gap-3">
          <span className="text-accent">03</span>
          <span className="h-px w-8 bg-border-strong" />
          Playground
        </p>
        <h1 className="mt-5 max-w-4xl font-serif text-[clamp(2.75rem,7vw,5.5rem)] leading-[1] tracking-[-0.02em]">
          Models that run <span className="italic text-accent">on your device</span>.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted">
          No servers, no API keys, no uploads. Each demo downloads a small model once, caches it, and runs inference
          locally with WebAssembly or WebGPU. Latency numbers are measured live on your machine.
        </p>

        <div className="mt-8">
          <EurosatDemo />
          <SearchDemo docs={buildSearchCorpus()} />
          <FaceDemo />
        </div>
      </div>
    </PageTransition>
  );
}
