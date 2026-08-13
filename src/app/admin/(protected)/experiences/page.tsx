import { Pencil, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { EmptyState } from "@/components/admin/EmptyState";
import { ExperienceActions } from "@/components/admin/ExperienceActions";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { getAdminExperiences } from "@/data/admin/experiences";
import { formatExperiencePeriod } from "@/domain/content/format";

export const metadata: Metadata = { title: "Experience" };

export default async function ExperiencesAdminPage() {
  const experiences = await getAdminExperiences();
  const readOnly = process.env.VERCEL_ENV === "preview" || process.env.CMS_MUTATIONS_ENABLED !== "true";

  return (
    <div className="mx-auto max-w-[92rem]">
      <PageHeader eyebrow="Owner workspace / Career" title="Experience" description="Manage stable career anchors, structured timelines, ordered highlights, and project relationships." actions={<Link href="/admin/experiences/new" aria-disabled={readOnly} className={`inline-flex min-h-11 items-center gap-2 bg-primary px-4 font-mono text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-primary-foreground ${readOnly ? "pointer-events-none opacity-40" : ""}`}><Plus className="size-4" aria-hidden="true" /> New experience</Link>} />

      {experiences.length === 0 ? (
        <div className="mt-8"><EmptyState label="No career records" title="Add the first professional experience." description="Use month ranges, concise highlights, and an optional verified media cover." /></div>
      ) : (
        <section className="mt-8 border border-border bg-card" aria-labelledby="experience-list-heading">
          <div className="flex items-center justify-between border-b border-border px-5 py-4"><h2 id="experience-list-heading" className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.18em]">Timeline / {String(experiences.length).padStart(2, "0")}</h2>{readOnly && <StatusBadge tone="pending">Read only</StatusBadge>}</div>
          <ul>
            {experiences.map((experience, index) => {
              const archived = experience.status === "ARCHIVED";
              return (
                <li key={experience.id} className="grid gap-4 border-b border-border px-5 py-5 last:border-b-0 lg:grid-cols-[3rem_minmax(14rem,1fr)_12rem_8rem_auto] lg:items-center">
                  <span className="font-mono text-[0.6rem] text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
                  <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{experience.role}</p>{experience.isCurrent && <StatusBadge>Current</StatusBadge>}{archived && <StatusBadge tone="archived">Archived</StatusBadge>}</div><p className="mt-1 truncate text-sm text-muted-foreground">{experience.company} · {experience.type}</p></div>
                  <span className="font-mono text-[0.58rem] uppercase tracking-[0.1em] text-muted-foreground">{formatExperiencePeriod(experience.startDate, experience.endDate, experience.isCurrent)}</span>
                  <span className="text-xs text-muted-foreground">{experience._count.projects} {experience._count.projects === 1 ? "project" : "projects"}</span>
                  <div className="flex items-center justify-end gap-1">{!archived && <Link href={`/admin/experiences/${experience.id}/edit`} className="grid size-9 place-items-center border border-border hover:bg-accent"><span className="sr-only">Edit {experience.company}</span><Pencil className="size-3.5" aria-hidden="true" /></Link>}<ExperienceActions id={experience.id} company={experience.company} archived={archived} readOnly={readOnly} /></div>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
