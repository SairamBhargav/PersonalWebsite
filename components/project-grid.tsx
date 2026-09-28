"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { EASE_OUT_EXPO } from "@/components/motion";
import { ProjectCard } from "@/components/project-card";
import { allTags, projects, type ProjectTag } from "@/content/projects";

export function ProjectGrid() {
  const [tag, setTag] = useState<ProjectTag | "All">("All");
  const tags = allTags.filter((t) => projects.some((p) => p.tags.includes(t)));
  const shown = tag === "All" ? projects : projects.filter((p) => p.tags.includes(tag));

  return (
    <>
      <div role="group" aria-label="Filter by tag" className="mt-12 flex flex-wrap gap-2">
        {(["All", ...tags] as const).map((t) => {
          const count = t === "All" ? projects.length : projects.filter((p) => p.tags.includes(t)).length;
          const active = tag === t;
          return (
            <button
              key={t}
              type="button"
              aria-pressed={active}
              onClick={() => setTag(t)}
              className={`relative rounded-full border px-4 py-1.5 text-sm transition-colors ${
                active ? "border-accent text-on-accent" : "border-border text-muted hover:border-border-strong hover:text-fg"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="tag-pill"
                  className="absolute inset-0 -z-10 rounded-full bg-accent"
                  transition={{ type: "spring", stiffness: 400, damping: 34 }}
                />
              )}
              {t} <span className="ml-1 font-mono text-[11px] opacity-70">{count}</span>
            </button>
          );
        })}
      </div>

      <motion.ul layout className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {shown.map((p) => (
            <motion.li
              key={p.slug}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}
              transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
            >
              <ProjectCard project={p} />
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </>
  );
}
