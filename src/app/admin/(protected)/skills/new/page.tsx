import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/admin/PageHeader";
import { SkillForm } from "@/components/admin/SkillForm";

export const metadata: Metadata = { title: "New skill" };

export default function NewSkillPage() {
  const readOnly =
    process.env.VERCEL_ENV === "preview" ||
    process.env.CMS_MUTATIONS_ENABLED !== "true";

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        eyebrow="Skills / Create"
        title="New skill"
        description="Add one canonical technology label that can be reused and ordered everywhere."
        actions={<Link href="/admin/skills" className="font-mono text-xs uppercase tracking-[0.16em] underline underline-offset-4">Back to skills</Link>}
      />
      <section className="mt-8 border border-border bg-card p-5 sm:p-8">
        <SkillForm readOnly={readOnly} />
      </section>
    </div>
  );
}
