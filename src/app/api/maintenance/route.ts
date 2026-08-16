import { NextResponse, type NextRequest } from "next/server";

import { isCronAuthorized, storageUsageState } from "@/domain/ops/maintenance";
import { getDb } from "@/lib/db";
import { cleanupStalePendingMedia } from "@/lib/media/cleanup";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!isCronAuthorized(request.headers.get("authorization"), process.env.CRON_SECRET)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const [health, mediaStorage, resumeStorage, cleanup] = await Promise.all([
    db.$queryRaw<Array<{ ok: number }>>`SELECT 1 AS ok`,
    db.mediaAsset.aggregate({ _sum: { sizeBytes: true } }),
    db.resumeAsset.aggregate({ _sum: { sizeBytes: true } }),
    cleanupStalePendingMedia(),
  ]);
  const usage = storageUsageState(
    (mediaStorage._sum.sizeBytes ?? 0) +
      (resumeStorage._sum.sizeBytes ?? 0),
  );

  return NextResponse.json({
    ok: health[0]?.ok === 1,
    checkedAt: new Date().toISOString(),
    cleanup: {
      scanned: cleanup.scanned,
      removed: cleanup.removedIds.length,
      failures: cleanup.failures,
    },
    storage: usage,
  });
}
