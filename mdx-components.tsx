import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import { EurosatDemo } from "@/components/demos/eurosat-demo";
import { FaceDemo } from "@/components/demos/face-demo";
import { EurosatResults } from "@/components/mdx/eurosat-results";
import { Callout, Metrics, TLDR } from "@/components/mdx/blocks";

const components: MDXComponents = {
  a: ({ href = "", children, ...props }) =>
    href.startsWith("/") || href.startsWith("#") ? (
      <Link href={href} {...props}>
        {children}
      </Link>
    ) : (
      <a href={href} target="_blank" rel="noreferrer" {...props}>
        {children}
      </a>
    ),
  Callout,
  Metrics,
  TLDR,
  EurosatDemo,
  EurosatResults,
  FaceDemo,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
