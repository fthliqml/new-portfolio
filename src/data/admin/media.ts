import "server-only";

import { getDb } from "@/lib/db";

function getPublicUrl(bucket: string, objectPath: string) {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  if (!baseUrl) return null;
  const path = objectPath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `${baseUrl}/storage/v1/object/public/${encodeURIComponent(bucket)}/${path}`;
}

export async function getAdminMediaAssets() {
  const assets = await getDb().mediaAsset.findMany({
    include: {
      _count: { select: { projectMedia: true, experienceCovers: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return assets.map((asset) => ({
    id: asset.id,
    originalName: asset.originalName,
    mimeType: asset.mimeType,
    sizeBytes: asset.sizeBytes,
    width: asset.width,
    height: asset.height,
    status: asset.status.toLowerCase() as "pending" | "ready",
    publicUrl: getPublicUrl(asset.bucket, asset.objectPath),
    referenceCount:
      asset._count.projectMedia + asset._count.experienceCovers,
    createdAt: asset.createdAt.toISOString(),
  }));
}
