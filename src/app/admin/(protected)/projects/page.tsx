import { Pencil, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { EmptyState } from "@/components/admin/EmptyState";
import { PageHeader } from "@/components/admin/PageHeader";
import { ProjectActions } from "@/components/admin/ProjectActions";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { getAdminProjects } from "@/data/admin/projects";

export const metadata: Metadata = { title: "Projects" };

export default async function ProjectsAdminPage() {
  const projects = await getAdminProjects();
  const readOnly = process.env.VERCEL_ENV === "preview" || process.env.CMS_MUTATIONS_ENABLED !== "true";
  return <div className="mx-auto max-w-[92rem]"><PageHeader eyebrow="Owner workspace / Case studies" title="Projects" description="Manage public project cards and the structured evidence behind each case study." actions={<Link href="/admin/projects/new" aria-disabled={readOnly} className={`inline-flex min-h-11 items-center gap-2 bg-primary px-4 font-mono text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-primary-foreground ${readOnly ? "pointer-events-none opacity-40" : ""}`}><Plus className="size-4" aria-hidden="true" /> New project</Link>} />{projects.length === 0 ? <div className="mt-8"><EmptyState label="No projects" title="Create the first database-backed case study." description="Prepare at least one skill and media asset before publishing an active project." /></div> : <section className="mt-8 border border-border bg-card" aria-labelledby="project-list-heading"><div className="flex items-center justify-between border-b border-border px-5 py-4"><h2 id="project-list-heading" className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.18em]">Index / {String(projects.length).padStart(2, "0")}</h2>{readOnly && <StatusBadge tone="pending">Read only</StatusBadge>}</div><ul>{projects.map((project, index) => <li key={project.id} className="grid gap-4 border-b border-border px-5 py-5 last:border-b-0 lg:grid-cols-[3rem_minmax(14rem,1fr)_8rem_8rem_auto] lg:items-center"><span className="font-mono text-[0.6rem] text-muted-foreground">{String(index + 1).padStart(2, "0")}</span><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{project.title}</p>{project.featured && <StatusBadge>Featured</StatusBadge>}{project.status === "ARCHIVED" && <StatusBadge tone="archived">Archived</StatusBadge>}</div><p className="mt-1 truncate text-sm text-muted-foreground">{project.role} · {project.slug}</p></div><span className="font-mono text-[0.58rem] uppercase tracking-[0.1em] text-muted-foreground">{project.category.toLowerCase()}</span><span className="text-xs text-muted-foreground">{project._count.media} images · {project._count.skills} skills</span><div className="flex items-center justify-end gap-1">{project.status === "ACTIVE" && <Link href={`/admin/projects/${project.id}/edit`} className="grid size-9 place-items-center border border-border hover:bg-accent"><span className="sr-only">Edit {project.title}</span><Pencil className="size-3.5" aria-hidden="true" /></Link>}<ProjectActions id={project.id} title={project.title} readOnly={readOnly || project.status === "ARCHIVED"} /></div></li>)}</ul></section>}</div>;
}
