import Link from "next/link";
import { site } from "@/content/site";

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="shell flex flex-col gap-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {site.name}
        </p>
        <p className="font-mono text-xs">Next.js · Set in Instrument Serif &amp; Inter · Models run in your browser</p>
        <nav className="flex gap-5">
          <Link href="/projects" className="link-underline hover:text-fg">
            Projects
          </Link>
          <Link href="/playground" className="link-underline hover:text-fg">
            Playground
          </Link>
          <Link href="/resume" className="link-underline hover:text-fg">
            Resume
          </Link>
        </nav>
      </div>
    </footer>
  );
}
