import { ArrowUpRight } from "@/components/icons";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion";
import { SectionHeader } from "@/components/section-header";
import { education, publications, skills } from "@/content/profile";

export function Skills() {
  return (
    <section id="skills" className="shell scroll-mt-24 py-24 md:py-32">
      <SectionHeader index="04" label="Toolkit" title="What I work with." />
      <RevealGroup className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
        {skills.map((g) => (
          <RevealItem key={g.group} className="bg-bg p-6 md:p-7">
            <h3 className="label-mono text-accent">{g.group}</h3>
            <ul className="mt-5 space-y-2">
              {g.items.map((s) => (
                <li key={s} className="text-[15px]">
                  {s}
                </li>
              ))}
            </ul>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}

export function Education() {
  return (
    <section id="education" className="shell scroll-mt-24 py-24 md:py-32">
      <SectionHeader index="05" label="Education" title="Where I study." />
      <Reveal className="grid gap-10 border-t border-border pt-10 md:grid-cols-12">
        <div className="md:col-span-5">
          <h3 className="font-serif text-3xl leading-tight">{education.school}</h3>
          <p className="mt-2 text-muted">{education.degree}</p>
          <dl className="mt-8 grid grid-cols-2 gap-6">
            <div>
              <dt className="label-mono">Graduation</dt>
              <dd className="mt-1">{education.graduation.replace("Expected ", "")}</dd>
            </div>
            <div>
              <dt className="label-mono">GPA</dt>
              <dd className="mt-1 font-serif text-3xl text-accent">{education.gpa.split(" ")[0]}</dd>
            </div>
            <div>
              <dt className="label-mono">Honors</dt>
              <dd className="mt-1">{education.honors.join(", ")}</dd>
            </div>
            <div>
              <dt className="label-mono">Location</dt>
              <dd className="mt-1">{education.location}</dd>
            </div>
          </dl>
        </div>
        <div className="md:col-span-7">
          <p className="label-mono">Relevant coursework</p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {education.coursework.map((c) => (
              <li
                key={c}
                className="rounded-full border border-border px-3.5 py-1.5 text-sm transition-colors hover:border-accent hover:text-accent"
              >
                {c}
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </section>
  );
}

/** Rendered only once there is at least one publication. */
export function Research() {
  if (publications.length === 0) return null;
  return (
    <section id="research" className="shell scroll-mt-24 py-24 md:py-32">
      <SectionHeader index="—" label="Research" title="Publications." />
      <ul className="border-t border-border">
        {publications.map((p) => (
          <Reveal key={p.title}>
            <li className="border-b border-border py-6">
              <a href={p.href} target="_blank" rel="noreferrer" className="group flex items-start justify-between gap-6">
                <div>
                  <p className="font-serif text-2xl leading-snug group-hover:text-accent">{p.title}</p>
                  <p className="label-mono mt-2">
                    {p.venue} · {p.year}
                  </p>
                </div>
                {p.href && <ArrowUpRight className="mt-2 shrink-0 text-muted group-hover:text-accent" />}
              </a>
            </li>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
