import { getProject, projects } from "@/content/projects";
import { ogSize, renderOg } from "@/lib/og";

export const alt = "Project case study";
export const size = ogSize;
export const contentType = "image/png";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);
  return renderOg({ eyebrow: `Case study · ${project?.tags.join(" · ") ?? ""}`, title: project?.title ?? "Project" });
}
