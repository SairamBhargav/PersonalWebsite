"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useLenis } from "lenis/react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Close, GitHub, LinkedIn, Menu } from "@/components/icons";
import { EASE_OUT_EXPO } from "@/components/motion";
import { site } from "@/content/site";

const links = [
  { href: "/projects", label: "Projects" },
  { href: "/#experience", label: "Experience" },
  { href: "/playground", label: "Playground" },
  { href: "/resume", label: "Resume" },
];

export function Nav() {
  const pathname = usePathname();
  const lenis = useLenis();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu on navigation.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (open) lenis?.stop();
    else lenis?.start();
    document.body.style.overflow = open ? "hidden" : "";
  }, [open, lenis]);

  return (
    <header
      style={{ viewTransitionName: "site-header" }}
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300 ${
        scrolled || open
          ? "border-b border-border bg-bg/75 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-accent focus:px-3 focus:py-2 focus:text-on-accent"
      >
        Skip to content
      </a>
      <nav className="shell flex h-16 items-center justify-between">
        <Link
          href="/"
          transitionTypes={["nav-back"]}
          className="group flex items-center gap-2.5"
          aria-label={`${site.name}, home`}
        >
          <span className="grid h-8 w-8 place-items-center rounded-full border border-border-strong font-serif text-[15px] leading-none transition-colors group-hover:border-accent group-hover:text-accent">
            {site.shortName}
          </span>
          <span className="hidden text-sm font-medium tracking-tight sm:inline">{site.name}</span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <ul className="hidden items-center gap-1 md:flex">
            {links.map((l) => {
              const active = l.href !== "/#experience" && pathname.startsWith(l.href);
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className={`relative rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                      active ? "text-fg" : "text-muted hover:text-fg"
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 -z-10 rounded-full bg-accent-soft"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    )}
                    {l.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <ThemeToggle />
          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-full border border-border md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <Close size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-x-0 bottom-0 top-16 z-40 flex flex-col justify-between bg-bg px-5 pb-10 pt-8 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          >
            <ul className="flex flex-col gap-2">
              {[{ href: "/", label: "Home" }, ...links].map((l, i) => (
                <motion.li
                  key={l.href}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: 0.05 + i * 0.06, duration: 0.6, ease: EASE_OUT_EXPO } }}
                >
                  <Link href={l.href} className="flex items-baseline gap-4 py-1 font-serif text-5xl" onClick={() => setOpen(false)}>
                    <span className="font-mono text-xs text-muted">0{i + 1}</span>
                    {l.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
            <motion.div
              className="flex items-center gap-5 text-muted"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.4 } }}
            >
              <a href={site.links.github} aria-label="GitHub" target="_blank" rel="noreferrer">
                <GitHub size={22} />
              </a>
              <a href={site.links.linkedin} aria-label="LinkedIn" target="_blank" rel="noreferrer">
                <LinkedIn size={22} />
              </a>
              <span className="label-mono ml-auto">{site.location}</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
