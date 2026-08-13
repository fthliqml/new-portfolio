import type { Metadata } from "next";

import { SectionPlaceholder } from "@/components/admin/SectionPlaceholder";

export const metadata: Metadata = { title: "Media" };

export default function MediaAdminPage() {
  return (
    <SectionPlaceholder
      title="Media"
      description="Track optimized image assets, usage, metadata, and safe deletion from Supabase Storage."
    />
  );
}
