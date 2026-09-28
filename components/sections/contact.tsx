"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { ArrowUpRight, Check, Copy, GitHub, LinkedIn, Mail } from "@/components/icons";
import { Magnetic, Reveal } from "@/components/motion";
import { site } from "@/content/site";

export function Contact() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(site.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${site.email}`;
    }
  }

  const socials = [
    { label: "GitHub", href: site.links.github, handle: "SairamBhargav", icon: GitHub },
    { label: "LinkedIn", href: site.links.linkedin, handle: "in/bhargavsairam", icon: LinkedIn },
    { label: "Email", href: `mailto:${site.email}`, handle: site.email, icon: Mail },
  ];

  return (
    <section id="contact" className="relative scroll-mt-24 overflow-hidden border-t border-border py-28 md:py-40">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[70%]"
        style={{ background: "radial-gradient(ellipse at 50% 120%, var(--accent-glow), transparent 60%)" }}
      />
      <div className="shell relative">
        <Reveal>
          <p className="label-mono mb-6 flex items-center gap-3">
            <span className="text-accent">06</span>
            <span className="h-px w-8 bg-border-strong" />
            Contact
          </p>
          <h2 className="max-w-4xl font-serif text-[clamp(2.75rem,8vw,6.5rem)] leading-[0.98] tracking-[-0.02em]">
            Let&apos;s build something <span className="italic text-accent">that works.</span>
          </h2>
          <p className="mt-6 max-w-xl text-lg text-muted">
            Open to ML and software engineering internships, research collaborations, and interesting problems. The
            fastest way to reach me is email.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mt-12 flex flex-wrap items-center gap-3">
          <Magnetic>
            <button
              type="button"
              onClick={copy}
              data-cursor-label={copied ? "Copied" : "Copy"}
              className="group inline-flex items-center gap-3 rounded-full bg-accent px-7 py-4 text-on-accent transition-colors hover:bg-accent-strong"
            >
              <span className="font-mono text-sm sm:text-base">{site.email}</span>
              <span className="relative grid h-5 w-5 place-items-center">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={copied ? "check" : "copy"}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                  </motion.span>
                </AnimatePresence>
              </span>
            </button>
          </Magnetic>
          <span role="status" aria-live="polite" className="sr-only">
            {copied ? "Email address copied to clipboard" : ""}
          </span>
        </Reveal>

        <Reveal delay={0.2}>
          <ul className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-3">
            {socials.map(({ label, href, handle, icon: Icon }) => (
              <li key={label} className="bg-bg">
                <a
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  className="group flex items-center justify-between gap-4 p-6 transition-colors hover:bg-accent-soft"
                >
                  <span className="flex items-center gap-4">
                    <Icon size={20} className="text-muted transition-colors group-hover:text-accent" />
                    <span>
                      <span className="block text-sm font-medium">{label}</span>
                      <span className="block break-all font-mono text-xs text-muted">{handle}</span>
                    </span>
                  </span>
                  <ArrowUpRight
                    size={16}
                    className="shrink-0 text-muted transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
                  />
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
