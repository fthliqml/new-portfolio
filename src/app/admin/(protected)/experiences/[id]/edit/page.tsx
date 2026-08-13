import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ExperienceForm } from "@/components/admin/ExperienceForm";
import { PageHeader } from "@/components/admin/PageHeader";
import { getAdminExperience, getReadyMediaOptions } from "@/data/admin/experiences";

export const metadata: Metadata = { title: "Edit experience" };

export default async function EditExperiencePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [experience, mediaOptions] = await Promise.all([getAdminExperience(id), getReadyMediaOptions()]);
  if (!experience || experience.status === "ARCHIVED") notFound();
  const readOnly = process.env.VERCEL_ENV === "preview" || process.env.CMS_MUTATIONS_ENABLED !== "true";
  return <div className="mx-auto max-w-5xl"><PageHeader eyebrow="Experience / Edit" title={experience.company} description="Update the structured role while preserving its anchor and linked projects." actions={<Link href="/admin/experiences" className="font-mono text-xs uppercase tracking-[0.16em] underline underline-offset-4">Back to experience</Link>} /><section className="mt-8 border border-border bg-card p-5 sm:p-8"><ExperienceForm experience={experience} mediaOptions={mediaOptions} readOnly={readOnly} /></section></div>;
}
