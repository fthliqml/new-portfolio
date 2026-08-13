interface EmptyStateProps {
  label: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ label, title, description, action }: EmptyStateProps) {
  return (
    <section className="border border-dashed border-border bg-card px-6 py-12 text-center sm:px-10 sm:py-16">
      <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </p>
      <h2 className="mx-auto mt-4 max-w-xl text-2xl font-bold uppercase tracking-[-0.04em] sm:text-3xl">
        {title}
      </h2>
      <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      {action && <div className="mt-7">{action}</div>}
    </section>
  );
}
