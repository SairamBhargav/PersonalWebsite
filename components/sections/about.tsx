import Image from "next/image";
import { Reveal } from "@/components/motion";
import { site } from "@/content/site";
import headshot from "@/public/images/headshot.jpg";

function formatMonth(ym: string) {
  const [y, m] = ym.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
}

export function About() {
  return (
    <section id="about" className="shell scroll-mt-24 py-24 md:py-36">
      <div className="grid gap-12 md:grid-cols-12 md:gap-16">
        <Reveal className="md:col-span-5">
          <figure className="group relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-border">
              <Image
                src={headshot}
                alt="Portrait of Bhargav Sairam in front of the Flatirons in Boulder"
                placeholder="blur"
                sizes="(min-width: 768px) 40vw, 100vw"
                className="h-full w-full scale-[1.02] object-cover object-[50%_35%] transition-transform duration-[1.2s] ease-out group-hover:scale-[1.06]"
              />
              {/* Soft vignette so the bright sky sits well against the dark page. */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent dark:from-black/50" />
            </div>
            <figcaption className="label-mono mt-3 flex justify-between">
              <span>Boulder, CO</span>
              <span>40.0° N, 105.3° W</span>
            </figcaption>
          </figure>
        </Reveal>

        <div className="flex flex-col md:col-span-7">
          <Reveal>
            <p className="label-mono mb-5 flex items-center gap-3">
              <span className="text-accent">01</span>
              <span className="h-px w-8 bg-border-strong" />
              About
            </p>
            <h2 className="font-serif text-[clamp(2.25rem,4.5vw,3.5rem)] leading-[1.05]">
              Engineer by training, <span className="italic text-accent">researcher</span> by habit.
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="mt-8 space-y-5 text-[1.075rem] text-muted">
            {site.about.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </Reveal>

          <Reveal delay={0.2} className="mt-12 rounded-2xl border border-border bg-bg-elevated/60 p-6 md:p-7">
            <div className="flex items-center justify-between">
              <p className="label-mono flex items-center gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" style={{ animation: "pulse-dot 2.4s infinite" }} />
                Now
              </p>
              <p className="font-mono text-[11px] text-muted">Updated {formatMonth(site.now.updated)}</p>
            </div>
            <ul className="mt-4 space-y-2.5">
              {site.now.items.map((item) => (
                <li key={item} className="flex gap-3 text-[15px]">
                  <span className="mt-[0.7em] h-px w-3 shrink-0 bg-accent" />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
