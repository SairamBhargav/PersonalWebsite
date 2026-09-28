import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight, GitHub } from "@/components/icons";
import { Reveal } from "@/components/motion";
import { PageTransition } from "@/components/page-transition";
import { ProjectArt, ProjectTitle } from "@/components/project-card";
import { getProject, projects } from "@/content/projects";

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.summary,
    alternates: { canonical: `/projects/${slug}` },
    openGraph: { title: project.title, description: project.summary },
  };
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const { default: Content } = await import(`@/content/projects/${slug}.mdx`);
  const index = projects.findIndex((p) => p.slug === slug);
  const next = projects[(index + 1) % projects.length];

  const links = [
    project.links?.github && { href: project.links.github, label: "Source", icon: <GitHub size={16} /> },
    project.links?.demo && { href: project.links.demo, label: "Live site", icon: <ArrowUpRight size={16} /> },
    project.links?.paper && { href: project.links.paper, label: "Paper", icon: <ArrowUpRight size={16} /> },
  ].filter(Boolean) as { href: string; label: string; icon: React.ReactNode }[];

  return (
    <PageTransition>
      <article className="shell pb-24 pt-28 md:pt-36">
        <Link
          href="/projects"
          transitionTypes={["nav-back"]}
          className="group inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-fg"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" /> All projects
        </Link>

        <header className="mt-10 grid gap-10 md:grid-cols-12">
          <div className="md:col-span-7">
            <p className="label-mono flex flex-wrap items-center gap-3">
              {project.tags.join(" · ")}
              {project.status === "in-progress" && (
                <span className="rounded-full border border-accent/40 bg-accent-soft px-2.5 py-0.5 text-[10px] text-accent">
                  In progress
                </span>
              )}
            </p>
            <h1 className="mt-5 font-serif text-[clamp(2.5rem,6vw,4.75rem)] leading-[1.02] tracking-[-0.015em]">
              <ProjectTitle project={project} />
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted">{project.summary}</p>
            {links.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-3">
                {links.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-border-strong px-4 py-2 text-sm transition-colors hover:border-accent hover:text-accent"
                  >
                    {l.icon} {l.label}
                  </a>
                ))}
              </div>
            )}
          </div>
          <dl className="grid content-start gap-6 border-t border-border pt-6 text-sm md:col-span-4 md:col-start-9 md:border-l md:border-t-0 md:pl-8 md:pt-0">
            <div>
              <dt className="label-mono">Role</dt>
              <dd className="mt-1">{project.role}</dd>
            </div>
            <div>
              <dt className="label-mono">When</dt>
              <dd className="mt-1">{project.date}</dd>
            </div>
            <div>
              <dt className="label-mono">Stack</dt>
              <dd className="mt-2 flex flex-wrap gap-1.5">
                {project.stack.map((s) => (
                  <span key={s} className="rounded-full border border-border px-2.5 py-0.5 font-mono text-[11px] text-muted">
                    {s}
                  </span>
                ))}
              </dd>
            </div>
          </dl>
        </header>

        <ProjectArt project={project} className="mt-14 aspect-[16/9] md:aspect-[21/9]" />

        <Reveal className="prose-editorial mx-auto mt-16 md:mt-24">
          <Content />
        </Reveal>

        <Link
          href={`/projects/${next.slug}`}
          transitionTypes={["nav-forward"]}
          data-cursor-label="Next"
          className="group mt-24 flex items-end justify-between gap-6 border-t border-border pt-10"
        >
          <div>
            <p className="label-mono">Next project</p>
            <p className="mt-3 font-serif text-[clamp(1.75rem,4vw,3rem)] leading-tight transition-colors group-hover:text-accent">
              {next.title}
            </p>
          </div>
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-border transition-all group-hover:border-accent group-hover:bg-accent group-hover:text-on-accent">
            <ArrowRight size={18} />
          </span>
        </Link>
      </article>
    </PageTransition>
  );
}
