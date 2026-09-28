import Link from "next/link";
import { ViewTransition } from "react";
import { ArrowUpRight } from "@/components/icons";
import { ProjectGlyph } from "@/components/project-glyph";
import type { Project } from "@/content/projects";

function StatusBadge({ project }: { project: Project }) {
  if (project.status !== "in-progress") return null;
  return (
    <span className="rounded-full border border-accent/40 bg-accent-soft px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-accent">
      In progress
    </span>
  );
}

export function ProjectTitle({ project, className }: { project: Project; className?: string }) {
  return (
    <ViewTransition name={`project-title-${project.slug}`} share="morph" default="none">
      <span className={`inline-block ${className ?? ""}`}>{project.title}</span>
    </ViewTransition>
  );
}

export function ProjectArt({ project, className }: { project: Project; className?: string }) {
  return (
    <ViewTransition name={`project-art-${project.slug}`} share="morph" default="none">
      <div className={`relative overflow-hidden rounded-xl border border-border bg-bg-elevated ${className ?? ""}`}>
        <div
          className="absolute inset-0 opacity-60"
          style={{ background: "radial-gradient(ellipse at 70% 20%, var(--accent-soft), transparent 60%)" }}
        />
        <ProjectGlyph glyph={project.glyph} className="relative" />
      </div>
    </ViewTransition>
  );
}

/** Large card used on the home page for featured work. */
export function FeaturedProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      transitionTypes={["nav-forward"]}
      data-cursor-label="View"
      className="group grid gap-6 border-t border-border py-10 md:grid-cols-12 md:gap-10 md:py-14"
    >
      <ProjectArt
        project={project}
        className="aspect-[4/3] transition-colors duration-500 group-hover:border-accent/50 md:col-span-6"
      />
      <div className="flex flex-col md:col-span-6">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-accent">{String(index + 1).padStart(2, "0")}</span>
          <span className="label-mono">{project.tags.join(" · ")}</span>
          <StatusBadge project={project} />
        </div>
        <h3 className="mt-5 font-serif text-[clamp(1.9rem,3.2vw,2.75rem)] leading-[1.08]">
          <ProjectTitle project={project} />
        </h3>
        <p className="mt-4 max-w-lg text-muted">{project.summary}</p>
        {project.metrics && (
          <dl className="mt-6 flex flex-wrap gap-8">
            {project.metrics.map((m) => (
              <div key={m.label}>
                <dt className="label-mono">{m.label}</dt>
                <dd className="mt-1 font-serif text-3xl text-accent">{m.value}</dd>
              </div>
            ))}
          </dl>
        )}
        <div className="mt-auto flex items-end justify-between gap-4 pt-8">
          <ul className="flex flex-wrap gap-1.5">
            {project.stack.slice(0, 5).map((s) => (
              <li key={s} className="rounded-full border border-border px-2.5 py-0.5 font-mono text-[11px] text-muted">
                {s}
              </li>
            ))}
          </ul>
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-border transition-all duration-500 group-hover:rotate-45 group-hover:border-accent group-hover:bg-accent group-hover:text-on-accent">
            <ArrowUpRight size={18} />
          </span>
        </div>
      </div>
    </Link>
  );
}

/** Compact card used on /projects. */
export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      transitionTypes={["nav-forward"]}
      data-cursor-label="View"
      className="group flex h-full flex-col rounded-2xl border border-border bg-bg-elevated/40 p-4 transition-colors duration-500 hover:border-accent/50"
    >
      <ProjectArt project={project} className="aspect-[4/3]" />
      <div className="flex flex-1 flex-col px-2 pb-2 pt-5">
        <div className="flex items-center gap-2">
          <span className="label-mono">{project.date}</span>
          <StatusBadge project={project} />
        </div>
        <h3 className="mt-2 font-serif text-2xl leading-tight">
          <ProjectTitle project={project} />
        </h3>
        <p className="mt-2 text-[15px] text-muted">{project.summary}</p>
        <div className="mt-auto flex items-center justify-between pt-5">
          <span className="font-mono text-[11px] text-muted">{project.tags.join(" · ")}</span>
          <ArrowUpRight size={18} className="text-muted transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
        </div>
      </div>
    </Link>
  );
}
