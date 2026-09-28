import type { Metadata } from "next";
import Link from "next/link";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { Download } from "@/components/icons";
import { PageTransition } from "@/components/page-transition";
import { experience } from "@/content/experience";
import { education, skills } from "@/content/profile";
import { projects } from "@/content/projects";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Resume",
  description: `Resume of ${site.name}: education, experience, projects and skills.`,
  alternates: { canonical: "/resume" },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-4 border-t border-border py-8 md:grid-cols-4 md:gap-10">
      <h2 className="label-mono pt-1">{title}</h2>
      <div className="md:col-span-3">{children}</div>
    </section>
  );
}

export default function ResumePage() {
  const hasPdf = existsSync(join(process.cwd(), "public", "resume.pdf"));
  const resumeProjects = projects.filter((p) => p.featured);

  return (
    <PageTransition>
      <div className="shell max-w-[960px] pb-24 pt-28 md:pt-36">
        <header className="flex flex-col justify-between gap-6 pb-10 sm:flex-row sm:items-end">
          <div>
            <h1 className="font-serif text-[clamp(2.75rem,6vw,4.5rem)] leading-none">{site.name}</h1>
            <p className="mt-3 text-muted">
              {site.current.label} @ {site.current.org} · {site.location} ·{" "}
              <a href={`mailto:${site.email}`} className="link-underline">
                {site.email}
              </a>
            </p>
          </div>
          {hasPdf && (
            <a
              href={site.links.resume}
              download="Resume_BhargavSairam.pdf"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-on-accent transition-colors hover:bg-accent-strong"
            >
              <Download size={16} /> Download PDF
            </a>
          )}
        </header>

        <Section title="Education">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-lg font-medium">{education.school}</h3>
            <p className="font-mono text-xs text-muted">{education.graduation}</p>
          </div>
          <p className="text-muted">
            {education.degree} · GPA {education.gpa} · {education.honors.join(", ")}
          </p>
          <p className="mt-3 text-sm text-muted">
            <span className="text-fg">Coursework:</span> {education.coursework.join(", ")}
          </p>
        </Section>

        <Section title="Experience">
          <div className="space-y-8">
            {experience.map((job) => (
              <div key={job.org}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-lg font-medium">{job.org}</h3>
                  <p className="font-mono text-xs text-muted">
                    {job.start} – {job.end}
                  </p>
                </div>
                <p className="text-muted">
                  {job.role} · {job.location}
                </p>
                <ul className="mt-3 space-y-1.5 text-[15px]">
                  {job.bullets.map((b) => (
                    <li key={b} className="flex gap-3">
                      <span className="mt-[0.75em] h-px w-2.5 shrink-0 bg-accent" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Projects">
          <div className="space-y-5">
            {resumeProjects.map((p) => (
              <div key={p.slug}>
                <h3 className="font-medium">
                  <Link href={`/projects/${p.slug}`} className="link-underline hover:text-accent">
                    {p.title}
                  </Link>
                  <span className="ml-2 font-mono text-xs font-normal text-muted">{p.stack.slice(0, 4).join(", ")}</span>
                </h3>
                <p className="mt-1 text-[15px] text-muted">{p.summary}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Skills">
          <dl className="space-y-2 text-[15px]">
            {skills.map((g) => (
              <div key={g.group} className="grid gap-1 sm:grid-cols-[10rem_1fr]">
                <dt className="font-medium">{g.group}</dt>
                <dd className="text-muted">{g.items.join(", ")}</dd>
              </div>
            ))}
          </dl>
        </Section>
      </div>
    </PageTransition>
  );
}
