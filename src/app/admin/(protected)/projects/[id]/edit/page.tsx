import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/admin/PageHeader";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { getAdminProject, getProjectEditorOptions } from "@/data/admin/projects";

export const metadata: Metadata = { title: "Edit project" };

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [project, options] = await Promise.all([getAdminProject(id), getProjectEditorOptions()]);
  if (!project || project.status === "ARCHIVED") notFound();
  const readOnly = process.env.VERCEL_ENV === "preview" || process.env.CMS_MUTATIONS_ENABLED !== "true";
  return <div className="mx-auto max-w-6xl"><PageHeader eyebrow="Projects / Edit" title={project.title} description="Update the case study while preserving its stable public URL." actions={<Link href="/admin/projects" className="font-mono text-xs uppercase tracking-[0.16em] underline underline-offset-4">Back to projects</Link>} /><section className="mt-8 border border-border bg-card p-5 sm:p-8"><ProjectForm project={project} options={options} readOnly={readOnly} /></section></div>;
}
