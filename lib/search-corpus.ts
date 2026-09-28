import { experience } from "@/content/experience";
import { projects } from "@/content/projects";

export type SearchDoc = { title: string; kind: "Project" | "Experience"; text: string; href: string };

/** Everything the semantic search demo can find: projects plus individual experience bullets. */
export function buildSearchCorpus(): SearchDoc[] {
  const docs: SearchDoc[] = projects.map((p) => ({
    title: p.title,
    kind: "Project",
    text: `${p.summary} Built with ${p.stack.join(", ")}.`,
    href: `/projects/${p.slug}`,
  }));
  for (const job of experience) {
    for (const bullet of job.bullets) {
      docs.push({
        title: `${job.role} · ${job.org}`,
        kind: "Experience",
        text: bullet,
        href: job.project ? `/projects/${job.project}` : "/#experience",
      });
    }
  }
  return docs;
}
