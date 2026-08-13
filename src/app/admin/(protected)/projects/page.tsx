import type { Metadata } from "next";

import { SectionPlaceholder } from "@/components/admin/SectionPlaceholder";

export const metadata: Metadata = { title: "Projects" };

export default function ProjectsAdminPage() {
  return (
    <SectionPlaceholder
      title="Projects"
      description="Manage portfolio cards, structured case studies, media, skills, and publishing status."
    />
  );
}
