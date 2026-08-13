import "server-only";

import { MediaStatus } from "@/generated/prisma/enums";

import { getDb } from "@/lib/db";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function cleanupStalePendingMedia(
  olderThan: Date = new Date(Date.now() - 60 * 60 * 1_000),
) {
  const db = getDb();
  const stale = await db.mediaAsset.findMany({
    where: { status: MediaStatus.PENDING, createdAt: { lt: olderThan } },
    select: { id: true, bucket: true, objectPath: true },
    take: 100,
  });
  const storage = getSupabaseAdminClient().storage;
  const removedIds: string[] = [];
  const failures: Array<{ id: string; error: string }> = [];

  for (const asset of stale) {
    const { error } = await storage.from(asset.bucket).remove([asset.objectPath]);
    if (error) {
      failures.push({ id: asset.id, error: error.message });
      continue;
    }

    await db.mediaAsset.deleteMany({
      where: { id: asset.id, status: MediaStatus.PENDING },
    });
    removedIds.push(asset.id);
  }

  return { scanned: stale.length, removedIds, failures };
}
