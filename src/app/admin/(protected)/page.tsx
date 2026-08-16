import { ArrowUpRight, ImagePlus, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { EmptyState } from "@/components/admin/EmptyState";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  formatStorageBytes,
  isDashboardEmpty,
} from "@/data/admin/dashboard-state";
import { storageUsageState } from "@/domain/ops/maintenance";
import {
  getDashboardData,
} from "@/data/admin/dashboard";

export const metadata: Metadata = { title: "Overview" };

const activityLabels = {
  project: "Project",
  experience: "Experience",
  skill: "Skill",
  media: "Media",
  resume: "Resume",
} as const;

function formatActivityTime(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(value);
}

export default async function AdminPage() {
  const data = await getDashboardData();
  const storageUsage = storageUsageState(data.media.sizeBytes);
  const empty = isDashboardEmpty(data);
  const metrics = [
    {
      label: "Projects",
      value: data.projects.active,
      detail: `${data.projects.archived} archived`,
    },
    {
      label: "Experience",
      value: data.experiences.active,
      detail: `${data.experiences.archived} archived`,
    },
    {
      label: "Skills",
      value: data.skills.active,
      detail: `${data.skills.archived} archived`,
    },
    {
      label: "Media",
      value: data.media.ready,
      detail: `${data.media.pending} processing`,
    },
  ];

  return (
    <div className="mx-auto max-w-[92rem]">
      <PageHeader
        eyebrow="Owner workspace / Overview"
        title="Control room"
        description="Monitor portfolio content, pick up recent work, and keep publishing within the free-tier operating budget."
        actions={
          <Link
            href="/admin/projects"
            className="inline-flex min-h-11 items-center gap-2 bg-primary px-4 font-mono text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-primary-foreground transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <Plus className="size-4" aria-hidden="true" />
            New project
          </Link>
        }
      />

      {empty ? (
        <div className="mt-8">
          <EmptyState
            label="No content yet"
            title="The database is ready for its first portfolio entry."
            description="Start with a skill library, then add experience and projects. The legacy importer can populate the current site later without duplicating records."
            action={
              <Link
                href="/admin/skills"
                className="inline-flex min-h-11 items-center bg-primary px-5 font-mono text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-primary-foreground"
              >
                Create first skill
              </Link>
            }
          />
        </div>
      ) : (
        <>
          <section
            aria-label="Content summary"
            className="mt-8 grid border-l border-t border-border sm:grid-cols-2 xl:grid-cols-4"
          >
            {metrics.map((metric, index) => (
              <article
                key={metric.label}
                className="min-h-48 border-b border-r border-border bg-card p-5 sm:p-6"
              >
                <div className="flex items-start justify-between">
                  <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {metric.label}
                  </p>
                  <span className="font-mono text-[0.55rem] text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <p className="mt-8 text-6xl font-bold leading-none tracking-[-0.075em]">
                  {String(metric.value).padStart(2, "0")}
                </p>
                <p className="mt-4 text-xs text-muted-foreground">
                  {metric.detail}
                </p>
              </article>
            ))}
          </section>

          <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.6fr)]">
            <section
              aria-labelledby="recent-heading"
              className="border border-border bg-card"
            >
              <div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6">
                <h2
                  id="recent-heading"
                  className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.18em]"
                >
                  Recent updates
                </h2>
                <StatusBadge>Live data</StatusBadge>
              </div>
              {data.recentActivity.length > 0 ? (
                <ol>
                  {data.recentActivity.map((activity) => (
                    <li
                      key={`${activity.type}-${activity.id}`}
                      className="grid gap-2 border-b border-border px-5 py-4 last:border-b-0 sm:grid-cols-[7rem_minmax(0,1fr)_auto] sm:items-center sm:px-6"
                    >
                      <span className="font-mono text-[0.58rem] uppercase tracking-[0.14em] text-muted-foreground">
                        {activityLabels[activity.type]}
                      </span>
                      <span className="truncate text-sm font-semibold">
                        {activity.label}
                      </span>
                      <time
                        dateTime={activity.updatedAt.toISOString()}
                        className="font-mono text-[0.58rem] text-muted-foreground"
                      >
                        {formatActivityTime(activity.updatedAt)}
                      </time>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="px-6 py-10 text-sm text-muted-foreground">
                  Content exists, but there is no recent activity to display.
                </p>
              )}
            </section>

            <aside className="space-y-8">
              <section className="border border-border bg-[#111114] p-6 text-[#f4f4f1]">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-white/60">
                    Storage footprint
                  </p>
                  <ImagePlus
                    className="size-4 text-white/60"
                    aria-hidden="true"
                  />
                </div>
                <p className="mt-8 text-4xl font-bold tracking-[-0.055em]">
                  {formatStorageBytes(data.media.sizeBytes)}
                </p>
                <p className="mt-3 text-xs leading-5 text-white/55">
                  Original uploads tracked by the CMS. Review Supabase for the
                  provider-level quota.
                </p>
                <div className="mt-5 h-1.5 overflow-hidden bg-white/15" aria-label={`${storageUsage.percentage.toFixed(1)} percent of the free storage allowance tracked`}>
                  <div className={`h-full ${storageUsage.warning ? "bg-[#d2a263]" : "bg-[#aeb8b0]"}`} style={{ width: `${storageUsage.percentage}%` }} />
                </div>
                {storageUsage.warning && <p className="mt-3 text-xs font-semibold text-[#e7bd83]">Storage has crossed the 80% warning threshold.</p>}
              </section>

              <section className="border border-border bg-card p-6">
                <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground">
                  Quick create
                </p>
                <div className="mt-5 divide-y divide-border border-y border-border">
                  {[
                    ["Project", "/admin/projects"],
                    ["Experience", "/admin/experiences"],
                    ["Skill", "/admin/skills"],
                  ].map(([label, href]) => (
                    <Link
                      key={href}
                      href={href}
                      className="flex min-h-12 items-center justify-between text-sm font-semibold transition-colors hover:text-muted-foreground"
                    >
                      {label}
                      <ArrowUpRight className="size-4" aria-hidden="true" />
                    </Link>
                  ))}
                </div>
              </section>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
