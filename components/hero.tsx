"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "motion/react";
import { ArrowDown, ArrowRight, Download, GitHub, LinkedIn } from "@/components/icons";
import { EASE_OUT_EXPO, Magnetic } from "@/components/motion";
import { RichText } from "@/components/rich-text";
import { site } from "@/content/site";

// The canvas is decorative; load it after first paint.
const HeroBackground = dynamic(() => import("@/components/hero-background").then((m) => m.HeroBackground), {
  ssr: false,
});

const [first, last] = site.name.split(" ");

function Line({ children, delay }: { children: React.ReactNode; delay: number }) {
  return (
    <span className="block overflow-hidden pb-[0.08em]">
      <motion.span
        className="block"
        initial={{ y: "105%" }}
        animate={{ y: 0 }}
        transition={{ duration: 1, ease: EASE_OUT_EXPO, delay }}
      >
        {children}
      </motion.span>
    </span>
  );
}

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: EASE_OUT_EXPO, delay },
});

export function Hero() {
  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden pb-16 pt-28">
      <HeroBackground />
      <div className="shell relative">
        <motion.p className="label-mono mb-8 flex items-center gap-3" {...fadeUp(0.1)}>
          <span className="relative h-2 w-2 rounded-full bg-accent" style={{ animation: "pulse-dot 2.4s infinite" }} />
          {site.current.label} @ {site.current.org} · {site.location}
        </motion.p>

        <h1 className="font-serif text-[clamp(4.25rem,11vw,9.5rem)] leading-[0.92] tracking-[-0.02em]">
          <Line delay={0.15}>{first}</Line>
          <Line delay={0.27}>
            <span className="italic text-accent">{last}</span>
            <span className="text-accent">.</span>
          </Line>
        </h1>

        <motion.div className="mt-10 max-w-2xl" {...fadeUp(0.55)}>
          <p className="text-muted">{site.hero.intro}</p>
          <p className="mt-2 text-[clamp(1.2rem,2.2vw,1.55rem)] leading-snug">
            <RichText text={site.hero.statement} />
          </p>
        </motion.div>

        <motion.div className="mt-10 flex flex-wrap items-center gap-3" {...fadeUp(0.7)}>
          <Magnetic>
            <Link
              href="/#work"
              className="group inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-on-accent transition-colors hover:bg-accent-strong"
            >
              View selected work
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Magnetic>
          <Magnetic>
            <Link
              href="/resume"
              className="inline-flex items-center gap-2 rounded-full border border-border-strong px-6 py-3 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
            >
              <Download size={16} /> Resume
            </Link>
          </Magnetic>
          <div className="ml-1 flex items-center gap-1">
            <Magnetic>
              <a
                href={site.links.github}
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="grid h-11 w-11 place-items-center rounded-full text-muted transition-colors hover:text-fg"
              >
                <GitHub size={20} />
              </a>
            </Magnetic>
            <Magnetic>
              <a
                href={site.links.linkedin}
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="grid h-11 w-11 place-items-center rounded-full text-muted transition-colors hover:text-fg"
              >
                <LinkedIn size={20} />
              </a>
            </Magnetic>
          </div>
        </motion.div>
      </div>

      <motion.a
        href="#about"
        aria-label="Scroll to about"
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-muted sm:flex"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
      >
        <span className="label-mono">Scroll</span>
        <motion.span animate={{ y: [0, 6, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
          <ArrowDown size={16} />
        </motion.span>
      </motion.a>
    </section>
  );
}
