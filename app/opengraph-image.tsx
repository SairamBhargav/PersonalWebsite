import { ogSize, renderOg } from "@/lib/og";
import { site } from "@/content/site";

export const alt = `${site.name}: ${site.role}`;
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return renderOg({ eyebrow: `${site.current.label} @ ${site.current.org}`, title: "Machine-learning systems that hold up in the real world." });
}
