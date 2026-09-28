import Link from "next/link";
import { ArrowRight } from "@/components/icons";
import { Reveal } from "@/components/motion";
import { FeaturedProjectCard } from "@/components/project-card";
import { SectionHeader } from "@/components/section-header";
import { projects } from "@/content/projects";

export function Work() {
  const featured = projects.filter((p) => p.featured);
  return (
    <section id="work" className="shell scroll-mt-24 py-24 md:py-32">
      <SectionHeader index="02" label="Selected work" title={<>Things I&apos;ve built.</>}>
        <Link
          href="/projects"
          className="group inline-flex shrink-0 items-center gap-2 text-sm text-muted transition-colors hover:text-accent"
        >
          All {projects.length} projects
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
        </Link>
      </SectionHeader>
      <div className="border-b border-border">
        {featured.map((p, i) => (
          <Reveal key={p.slug}>
            <FeaturedProjectCard project={p} index={i} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
