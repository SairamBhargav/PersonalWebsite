export type ModelCard = { model: string; size: string; runtime: string };

export function DemoShell({
  id,
  title,
  description,
  card,
  children,
}: {
  id?: string;
  title: string;
  description: React.ReactNode;
  card: ModelCard;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="not-prose my-12 scroll-mt-24 overflow-hidden rounded-2xl border border-border bg-bg-elevated/50"
    >
      <header className="flex flex-col gap-4 border-b border-border p-5 md:flex-row md:items-start md:justify-between md:p-6">
        <div>
          <p className="label-mono flex items-center gap-2 text-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Live demo
          </p>
          <h3 className="mt-2 font-serif text-2xl leading-tight">{title}</h3>
          <p className="mt-1.5 max-w-xl text-[15px] text-muted">{description}</p>
        </div>
        <dl className="grid shrink-0 grid-cols-3 gap-x-5 gap-y-1 font-mono text-[11px] md:grid-cols-1 md:text-right">
          {Object.entries(card).map(([k, v]) => (
            <div key={k} className="md:flex md:justify-end md:gap-2">
              <dt className="uppercase tracking-[0.08em] text-muted">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </header>
      <div className="p-5 md:p-6">{children}</div>
      <footer className="border-t border-border px-5 py-3 font-mono text-[11px] text-muted md:px-6">
        Runs 100% in your browser. Nothing you provide leaves your device.
      </footer>
    </section>
  );
}

export function LoadButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-on-accent transition-colors hover:bg-accent-strong"
    >
      {children}
    </button>
  );
}

export function ProgressBar({ value, label }: { value: number; label: string }) {
  return (
    <div className="w-full max-w-sm" role="progressbar" aria-valuenow={Math.round(value * 100)} aria-valuemin={0} aria-valuemax={100}>
      <div className="mb-2 flex justify-between font-mono text-xs text-muted">
        <span>{label}</span>
        <span>{Math.round(value * 100)}%</span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-border">
        <div className="h-full rounded-full bg-accent transition-[width] duration-200" style={{ width: `${value * 100}%` }} />
      </div>
    </div>
  );
}

export function ErrorNote({ message }: { message: string }) {
  return (
    <p className="rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-600 dark:text-red-400">
      {message}
    </p>
  );
}
