import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/admin/PageHeader";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { getProjectEditorOptions } from "@/data/admin/projects";

export const metadata: Metadata = { title: "New project" };

export default async function NewProjectPage() {
  const options = await getProjectEditorOptions();
  const readOnly = process.env.VERCEL_ENV === "preview" || process.env.CMS_MUTATIONS_ENABLED !== "true";
  return <div className="mx-auto max-w-6xl"><PageHeader eyebrow="Projects / Create" title="New case study" description="Compose a complete publishable project from reusable content and verified media." actions={<Link href="/admin/projects" className="font-mono text-xs uppercase tracking-[0.16em] underline underline-offset-4">Back to projects</Link>} /><section className="mt-8 border border-border bg-card p-5 sm:p-8"><ProjectForm options={options} readOnly={readOnly} /></section></div>;
}
