import type { Metadata } from "next";
import Link from "next/link";

import { ExperienceForm } from "@/components/admin/ExperienceForm";
import { PageHeader } from "@/components/admin/PageHeader";
import { getReadyMediaOptions } from "@/data/admin/experiences";

export const metadata: Metadata = { title: "New experience" };

export default async function NewExperiencePage() {
  const mediaOptions = await getReadyMediaOptions();
  const readOnly = process.env.VERCEL_ENV === "preview" || process.env.CMS_MUTATIONS_ENABLED !== "true";
  return <div className="mx-auto max-w-5xl"><PageHeader eyebrow="Experience / Create" title="New role" description="Build one structured career entry with an immutable public anchor." actions={<Link href="/admin/experiences" className="font-mono text-xs uppercase tracking-[0.16em] underline underline-offset-4">Back to experience</Link>} /><section className="mt-8 border border-border bg-card p-5 sm:p-8"><ExperienceForm mediaOptions={mediaOptions} readOnly={readOnly} /></section></div>;
}
