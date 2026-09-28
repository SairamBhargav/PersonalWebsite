import type { Metadata } from "next";
import { PageTransition } from "@/components/page-transition";
import { ProjectGrid } from "@/components/project-grid";
import { projects } from "@/content/projects";

export const metadata: Metadata = {
  title: "Projects",
  description: "Machine learning, computer vision, geospatial and full-stack projects by Bhargav Sairam.",
  alternates: { canonical: "/projects" },
};

export default function ProjectsPage() {
  return (
    <PageTransition>
      <div className="shell pb-24 pt-28 md:pt-36">
        <p className="label-mono flex items-center gap-3">
          <span className="text-accent">{String(projects.length).padStart(2, "0")}</span>
          <span className="h-px w-8 bg-border-strong" />
          Projects
        </p>
        <h1 className="mt-5 max-w-3xl font-serif text-[clamp(2.75rem,7vw,5.5rem)] leading-[1] tracking-[-0.02em]">
          Things I&apos;ve built, trained, and <span className="italic text-accent">shipped</span>.
        </h1>
        <ProjectGrid />
      </div>
    </PageTransition>
  );
}
