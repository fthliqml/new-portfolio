import { ExternalLink, LogOut } from "lucide-react";
import Link from "next/link";

import { logout } from "@/app/admin/actions";
import { AdminMobileMenu } from "@/components/admin/AdminMobileMenu";
import { AdminNavigation } from "@/components/admin/AdminNavigation";

interface AdminShellProps {
  children: React.ReactNode;
  ownerEmail: string;
}

export function AdminShell({ children, ownerEmail }: AdminShellProps) {
  const isReadOnly =
    process.env.VERCEL_ENV === "preview" ||
    process.env.CMS_MUTATIONS_ENABLED !== "true";

  return (
    <div className="min-h-svh bg-background text-foreground">
      <a
        href="#admin-content"
        className="fixed left-3 top-3 z-[100] -translate-y-20 bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground focus:translate-y-0"
      >
        Skip to content
      </a>

      <header className="relative flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:hidden">
        <Link
          href="/admin"
          className="font-mono text-[0.68rem] font-bold uppercase tracking-[0.18em]"
        >
          Portfolio / CMS
        </Link>
        <AdminMobileMenu />
      </header>

      <div className="mx-auto grid min-h-[calc(100svh-4rem)] max-w-[110rem] lg:min-h-svh lg:grid-cols-[17rem_minmax(0,1fr)]">
        <aside className="sticky top-0 hidden h-svh flex-col border-r border-border bg-card p-5 lg:flex">
          <div className="border-b border-border pb-5">
            <Link
              href="/admin"
              className="font-mono text-xs font-bold uppercase tracking-[0.2em]"
            >
              Portfolio / CMS
            </Link>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              Owner workspace
            </p>
          </div>

          <div className="py-6">
            <AdminNavigation />
          </div>

          <div className="mt-auto border-t border-border pt-5">
            <div className="mb-4 flex items-center gap-2 font-mono text-[0.58rem] uppercase tracking-[0.14em] text-muted-foreground">
              <span
                className={`size-2 rounded-full ${isReadOnly ? "bg-[#b2864c]" : "bg-[#78917b]"}`}
              />
              {isReadOnly ? "Read-only mode" : "Publishing enabled"}
            </div>
            <p className="truncate text-xs text-muted-foreground" title={ownerEmail}>
              {ownerEmail}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Link
                href="/"
                target="_blank"
                className="flex min-h-10 items-center justify-center border border-border bg-background transition-colors hover:bg-accent"
              >
                <span className="sr-only">Open public portfolio</span>
                <ExternalLink className="size-4" aria-hidden="true" />
              </Link>
              <form action={logout}>
                <button
                  type="submit"
                  className="grid min-h-10 w-full place-items-center border border-border bg-background transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  <span className="sr-only">Sign out</span>
                  <LogOut className="size-4" aria-hidden="true" />
                </button>
              </form>
            </div>
          </div>
        </aside>

        <main id="admin-content" tabIndex={-1} className="min-w-0 px-4 py-7 sm:px-7 lg:px-10 lg:py-10 xl:px-14">
          {children}
        </main>
      </div>
    </div>
  );
}
