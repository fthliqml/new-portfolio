export default function AdminLoading() {
  return (
    <div className="mx-auto max-w-[92rem]" role="status" aria-label="Loading admin content">
      <div className="h-3 w-40 animate-pulse bg-muted motion-reduce:animate-none" />
      <div className="mt-4 h-12 w-64 animate-pulse bg-muted motion-reduce:animate-none" />
      <div className="mt-5 h-4 max-w-xl animate-pulse bg-muted motion-reduce:animate-none" />
      <div className="mt-10 grid gap-px bg-border sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="h-48 animate-pulse bg-card motion-reduce:animate-none" />
        ))}
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
