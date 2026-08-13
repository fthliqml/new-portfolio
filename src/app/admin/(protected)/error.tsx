"use client";

import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin route error", error);
  }, [error]);

  return (
    <section className="mx-auto max-w-3xl border border-destructive/40 bg-card p-6 sm:p-10">
      <p className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-destructive">
        Admin data unavailable
      </p>
      <h1 className="mt-4 text-3xl font-bold uppercase tracking-[-0.045em]">
        The workspace could not load.
      </h1>
      <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
        Check the Supabase database configuration and try again. No content was
        changed by this failed request.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-7 min-h-11 bg-primary px-5 font-mono text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-primary-foreground"
      >
        Try again
      </button>
    </section>
  );
}
