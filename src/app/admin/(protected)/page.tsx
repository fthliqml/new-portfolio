import { logout } from "@/app/admin/actions";

export default function AdminPage() {
  return (
    <main className="min-h-svh bg-background px-6 py-8 text-foreground sm:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between border-b border-border pb-5">
          <div>
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
              Portfolio CMS
            </p>
            <h1 className="mt-2 text-2xl font-bold uppercase tracking-[-0.04em]">
              Admin foundation
            </h1>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="border border-border bg-card px-4 py-2 font-mono text-[0.65rem] font-semibold uppercase tracking-[0.16em] transition hover:bg-accent"
            >
              Sign out
            </button>
          </form>
        </header>

        <section className="mt-12 border border-border bg-card p-6 sm:p-10">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
            Access verified
          </p>
          <p className="mt-4 max-w-2xl text-2xl font-semibold leading-tight tracking-[-0.035em] sm:text-4xl">
            The owner-only route is protected. The full dashboard arrives in the
            next backlog item.
          </p>
        </section>
      </div>
    </main>
  );
}
