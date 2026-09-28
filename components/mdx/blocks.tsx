export function Callout({ title = "Note", children }: { title?: string; children: React.ReactNode }) {
  return (
    <aside className="rounded-xl border border-accent/30 bg-accent-soft px-5 py-4 text-[15px]">
      <p className="label-mono mb-1.5 text-accent">{title}</p>
      <div className="[&>p+p]:mt-2">{children}</div>
    </aside>
  );
}

export function Metrics({ items }: { items: { label: string; value: string }[] }) {
  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3">
      {items.map((m) => (
        <div key={m.label} className="bg-bg px-5 py-4">
          <dt className="label-mono">{m.label}</dt>
          <dd className="mt-1 font-serif text-3xl text-accent">{m.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function TLDR({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-bg-elevated/60 px-6 py-5">
      <p className="label-mono mb-2">TL;DR</p>
      <div className="[&_li+li]:mt-1.5">{children}</div>
    </div>
  );
}
