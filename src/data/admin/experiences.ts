import "server-only";

import { MediaStatus } from "@/generated/prisma/enums";

import { getDb } from "@/lib/db";

export async function getAdminExperiences() {
  return getDb().experience.findMany({
    include: {
      _count: { select: { projects: true } },
      highlights: { orderBy: { position: "asc" } },
    },
    orderBy: [{ status: "asc" }, { sortOrder: "asc" }, { startDate: "desc" }],
  });
}

export async function getAdminExperience(id: string) {
  return getDb().experience.findUnique({
    where: { id },
    include: { highlights: { orderBy: { position: "asc" } } },
  });
}

export async function getReadyMediaOptions() {
  return getDb().mediaAsset.findMany({
    where: { status: MediaStatus.READY },
    select: { id: true, originalName: true, width: true, height: true },
    orderBy: { createdAt: "desc" },
  });
}
