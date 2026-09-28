import { Reveal } from "@/components/motion";

export function SectionHeader({
  index,
  label,
  title,
  children,
}: {
  index: string;
  label: string;
  title: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <Reveal className="mb-12 md:mb-16">
      <p className="label-mono mb-5 flex items-center gap-3">
        <span className="text-accent">{index}</span>
        <span className="h-px w-8 bg-border-strong" />
        {label}
      </p>
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <h2 className="max-w-3xl font-serif text-[clamp(2.25rem,4.5vw,3.5rem)] leading-[1.05] tracking-[-0.01em]">
          {title}
        </h2>
        {children}
      </div>
    </Reveal>
  );
}
