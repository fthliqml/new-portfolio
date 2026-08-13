import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/admin/PageHeader";
import { SkillForm } from "@/components/admin/SkillForm";
import { getAdminSkill } from "@/data/admin/skills";

export const metadata: Metadata = { title: "Edit skill" };

export default async function EditSkillPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const skill = await getAdminSkill(id);
  if (!skill || skill.status === "ARCHIVED") notFound();
  const readOnly =
    process.env.VERCEL_ENV === "preview" ||
    process.env.CMS_MUTATIONS_ENABLED !== "true";

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        eyebrow="Skills / Edit"
        title={skill.name}
        description="Update presentation details while preserving the stable project relationship slug."
        actions={<Link href="/admin/skills" className="font-mono text-xs uppercase tracking-[0.16em] underline underline-offset-4">Back to skills</Link>}
      />
      <section className="mt-8 border border-border bg-card p-5 sm:p-8">
        <SkillForm skill={skill} readOnly={readOnly} />
      </section>
    </div>
  );
}
