import Link from "next/link";
import { ArrowLeft } from "@/components/icons";

export default function NotFound() {
  return (
    <div className="shell flex min-h-[80svh] flex-col justify-center pt-24">
      <p className="label-mono text-accent">404 · Out of distribution</p>
      <h1 className="mt-5 max-w-3xl font-serif text-[clamp(3rem,9vw,7rem)] leading-[0.95] tracking-[-0.02em]">
        This page isn&apos;t in the <span className="italic text-accent">training set</span>.
      </h1>
      <p className="mt-6 max-w-lg text-lg text-muted">
        Confidence: 0.00. The link may be broken, or the page may have moved.
      </p>
      <Link
        href="/"
        className="group mt-10 inline-flex w-fit items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-on-accent transition-colors hover:bg-accent-strong"
      >
        <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" /> Back home
      </Link>
    </div>
  );
}
