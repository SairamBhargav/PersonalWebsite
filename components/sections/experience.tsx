"use client";

import Link from "next/link";
import { motion, useScroll, useSpring } from "motion/react";
import { useRef } from "react";
import { ArrowUpRight } from "@/components/icons";
import { Reveal } from "@/components/motion";
import { SectionHeader } from "@/components/section-header";
import { experience } from "@/content/experience";

export function ExperienceTimeline() {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 60%"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  return (
    <section id="experience" className="shell scroll-mt-24 py-24 md:py-32">
      <SectionHeader index="03" label="Experience" title="Where I've worked." />

      <ol ref={ref} className="relative">
        {/* Track + progress line, drawn as you scroll */}
        <div className="absolute bottom-0 left-[7px] top-0 w-px bg-border md:left-[calc(25%+7px)]" aria-hidden />
        <motion.div
          aria-hidden
          className="absolute bottom-0 left-[7px] top-0 w-px origin-top bg-accent md:left-[calc(25%+7px)]"
          style={{ scaleY }}
        />

        {experience.map((job) => (
          <li key={job.org} className="relative grid gap-3 pb-16 pl-10 last:pb-0 md:grid-cols-4 md:gap-10 md:pl-0">
            <Reveal className="md:pt-0.5 md:text-right">
              <p className="font-mono text-xs text-muted md:pr-10">
                {job.start} — {job.end}
              </p>
              <p className="label-mono mt-1 hidden md:block md:pr-10">{job.location}</p>
            </Reveal>

            <span
              aria-hidden
              className="absolute left-0 top-1 h-[15px] w-[15px] rounded-full border-2 border-accent bg-bg md:left-[25%]"
            />

            <Reveal className="md:col-span-3 md:pl-10" delay={0.05}>
              <h3 className="font-serif text-[1.85rem] leading-tight">{job.org}</h3>
              <p className="mt-1 text-muted">
                {job.role}
                <span className="md:hidden"> · {job.location}</span>
              </p>
              {job.highlight && (
                <p className="mt-4 inline-block rounded-full bg-accent-soft px-3 py-1 font-mono text-xs text-accent">
                  {job.highlight}
                </p>
              )}
              <ul className="mt-5 max-w-2xl space-y-3 text-[15px] text-fg/85">
                {job.bullets.map((b) => (
                  <li key={b} className="flex gap-3">
                    <span className="mt-[0.75em] h-px w-3 shrink-0 bg-accent" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex flex-wrap items-center gap-1.5">
                {job.stack.map((s) => (
                  <span key={s} className="rounded-full border border-border px-2.5 py-0.5 font-mono text-[11px] text-muted">
                    {s}
                  </span>
                ))}
                {job.project && (
                  <Link
                    href={`/projects/${job.project}`}
                    transitionTypes={["nav-forward"]}
                    className="ml-2 inline-flex items-center gap-1 text-sm text-accent link-underline"
                  >
                    Case study <ArrowUpRight size={14} />
                  </Link>
                )}
              </div>
            </Reveal>
          </li>
        ))}
      </ol>
    </section>
  );
}
