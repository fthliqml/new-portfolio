import type { Metadata } from "next";

import { SectionPlaceholder } from "@/components/admin/SectionPlaceholder";

export const metadata: Metadata = { title: "Skills" };

export default function SkillsAdminPage() {
  return (
    <SectionPlaceholder
      title="Skills"
      description="Keep the reusable technology vocabulary tidy and control which skills appear on the homepage."
    />
  );
}
