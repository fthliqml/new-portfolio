import type { Metadata } from "next";

import { SectionPlaceholder } from "@/components/admin/SectionPlaceholder";

export const metadata: Metadata = { title: "Experience" };

export default function ExperiencesAdminPage() {
  return (
    <SectionPlaceholder
      title="Experience"
      description="Maintain roles, timelines, highlights, and the project relationships shown on the public site."
    />
  );
}
