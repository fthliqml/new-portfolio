import type { Metadata } from "next";
import Link from "next/link";

import { login } from "@/app/admin/login/actions";
import { hasSupabasePublicEnv } from "@/lib/supabase/public-env";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

const errorMessages: Record<string, string> = {
  invalid_credentials: "Email or password is incorrect.",
  not_authorized: "This account is not authorized to manage the portfolio.",
};

interface LoginPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const error = first(params.error);
  const next = first(params.next);
  const isConfigured =
    hasSupabasePublicEnv() &&
    Boolean(process.env.ADMIN_EMAIL && process.env.ADMIN_USER_ID);

  return (
    <main className="grid min-h-svh bg-background text-foreground lg:grid-cols-[minmax(20rem,0.8fr)_1.2fr]">
      <section className="flex flex-col gap-10 border-border bg-card px-6 py-7 lg:min-h-svh lg:justify-between lg:border-r lg:px-10 lg:py-10">
        <Link
          href="/"
          className="w-fit font-mono text-xs font-semibold uppercase tracking-[0.2em]"
        >
          Iqmal / Portfolio
        </Link>

        <div className="max-w-md py-4 sm:py-10 lg:py-16">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.24em] text-muted-foreground">
            Private workspace
          </p>
          <h1 className="mt-4 text-balance text-5xl font-bold uppercase leading-[0.86] tracking-[-0.065em] sm:text-6xl">
            Content
            <br /> control room.
          </h1>
          <p className="mt-6 max-w-sm text-sm leading-6 text-muted-foreground">
            A single-owner console for projects, experience, skills, and media.
          </p>
        </div>

        <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">
          No public registration · Owner access only
        </p>
      </section>

      <section className="flex items-center px-6 py-14 lg:px-[clamp(3rem,9vw,9rem)]">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <p className="font-mono text-xs uppercase tracking-[0.2em]">
              Authenticate
            </p>
            <span className="flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-muted-foreground">
              <span className="size-2 rounded-full bg-[#78917b]" aria-hidden="true" />
              Secure area
            </span>
          </div>

          {!isConfigured && (
            <p
              role="status"
              className="mt-6 border border-border bg-accent px-4 py-3 text-sm leading-6"
            >
              Authentication is ready, but the Supabase owner credentials still
              need to be configured.
            </p>
          )}

          {error && (
            <p
              role="alert"
              className="mt-6 border border-destructive/40 bg-destructive/8 px-4 py-3 text-sm text-destructive"
            >
              {errorMessages[error] ?? "Sign in could not be completed."}
            </p>
          )}

          <form action={login} className="mt-8 space-y-6">
            {next && <input type="hidden" name="next" value={next} />}

            <label className="block">
              <span className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.18em]">
                Owner email
              </span>
              <input
                required
                autoComplete="email"
                spellCheck={false}
                inputMode="email"
                type="email"
                name="email"
                className="mt-2 h-12 w-full rounded-none border border-input bg-card px-3 text-base outline-none transition focus-visible:border-foreground focus-visible:ring-2 focus-visible:ring-ring/20"
              />
            </label>

            <label className="block">
              <span className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.18em]">
                Password
              </span>
              <input
                required
                autoComplete="current-password"
                type="password"
                name="password"
                className="mt-2 h-12 w-full rounded-none border border-input bg-card px-3 text-base outline-none transition focus-visible:border-foreground focus-visible:ring-2 focus-visible:ring-ring/20"
              />
            </label>

            <button
              type="submit"
              disabled={!isConfigured}
              className="h-12 w-full bg-primary px-5 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground transition hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Enter workspace
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
