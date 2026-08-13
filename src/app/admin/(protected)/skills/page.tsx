import { Pencil, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { EmptyState } from "@/components/admin/EmptyState";
import { PageHeader } from "@/components/admin/PageHeader";
import { SkillActions } from "@/components/admin/SkillActions";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { getAdminSkills } from "@/data/admin/skills";

export const metadata: Metadata = { title: "Skills" };

export default async function SkillsAdminPage() {
  const skills = await getAdminSkills();
  const readOnly =
    process.env.VERCEL_ENV === "preview" ||
    process.env.CMS_MUTATIONS_ENABLED !== "true";

  return (
    <div className="mx-auto max-w-[92rem]">
      <PageHeader
        eyebrow="Owner workspace / Master data"
        title="Skills"
        description="Maintain one normalized technology vocabulary for project case studies and the homepage marquee."
        actions={
          <Link
            href="/admin/skills/new"
            aria-disabled={readOnly}
            className={`inline-flex min-h-11 items-center gap-2 bg-primary px-4 font-mono text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-primary-foreground ${readOnly ? "pointer-events-none opacity-40" : ""}`}
          >
            <Plus className="size-4" aria-hidden="true" /> New skill
          </Link>
        }
      />

      {skills.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            label="No master data"
            title="Create the first reusable skill."
            description="Begin with the current homepage order: Next.js, Laravel, Node.js, Express, Redis, and Redux."
          />
        </div>
      ) : (
        <section aria-labelledby="skill-list-heading" className="mt-8 border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 id="skill-list-heading" className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.18em]">
              Catalog / {String(skills.length).padStart(2, "0")}
            </h2>
            {readOnly && <StatusBadge tone="pending">Read only</StatusBadge>}
          </div>
          <ul>
            {skills.map((skill, index) => {
              const archived = skill.status === "ARCHIVED";
              return (
                <li
                  key={skill.id}
                  className="grid gap-4 border-b border-border px-5 py-4 last:border-b-0 md:grid-cols-[3rem_minmax(10rem,1fr)_9rem_7rem_auto] md:items-center"
                >
                  <span className="font-mono text-[0.6rem] text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{skill.name}</p>
                      {skill.showOnHome && <StatusBadge>Homepage</StatusBadge>}
                      {archived && <StatusBadge tone="archived">Archived</StatusBadge>}
                    </div>
                    <p className="mt-1 truncate font-mono text-[0.58rem] text-muted-foreground">
                      {skill.slug}
                    </p>
                  </div>
                  <span className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-muted-foreground">
                    {skill.category.toLowerCase()}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {skill._count.projects} {skill._count.projects === 1 ? "project" : "projects"}
                  </span>
                  <div className="flex items-center justify-end gap-1">
                    {!archived && (
                      <Link
                        href={`/admin/skills/${skill.id}/edit`}
                        className="grid size-9 place-items-center border border-border hover:bg-accent"
                      >
                        <span className="sr-only">Edit {skill.name}</span>
                        <Pencil className="size-3.5" aria-hidden="true" />
                      </Link>
                    )}
                    <SkillActions
                      id={skill.id}
                      name={skill.name}
                      archived={archived}
                      referenceCount={skill._count.projects}
                      readOnly={readOnly}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
