import type { Metadata } from "next";

import { EmptyState } from "@/components/admin/EmptyState";
import { MediaLibrary } from "@/components/admin/MediaLibrary";
import { MediaUploader } from "@/components/admin/MediaUploader";
import { PageHeader } from "@/components/admin/PageHeader";
import { getAdminMediaAssets } from "@/data/admin/media";

export const metadata: Metadata = { title: "Media" };

export default async function MediaAdminPage() {
  const assets = await getAdminMediaAssets();
  const readOnly =
    process.env.VERCEL_ENV === "preview" ||
    process.env.CMS_MUTATIONS_ENABLED !== "true";

  return (
    <div className="mx-auto max-w-[92rem]">
      <PageHeader
        eyebrow="Owner workspace / Library"
        title="Media"
        description="Upload optimized source images once, then reuse them across projects and experience covers."
      />

      <div className="mt-8 grid items-start gap-8 xl:grid-cols-[20rem_minmax(0,1fr)]">
        <MediaUploader disabled={readOnly} />
        {assets.length > 0 ? (
          <MediaLibrary assets={assets} readOnly={readOnly} />
        ) : (
          <EmptyState
            label="Library empty"
            title="Upload the first portfolio image."
            description="Images are converted to WebP in the browser, capped near 2400 pixels, and verified before becoming available to content editors."
          />
        )}
      </div>
    </div>
  );
}
