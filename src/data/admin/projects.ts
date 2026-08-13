import "server-only";

import { ContentStatus, MediaStatus } from "@/generated/prisma/enums";

import { getDb } from "@/lib/db";

const projectEditorInclude = {
  highlights: { orderBy: { position: "asc" as const } },
  contributions: { orderBy: { position: "asc" as const } },
  impacts: { orderBy: { position: "asc" as const } },
  impactStats: { orderBy: { position: "asc" as const } },
  skills: { orderBy: { position: "asc" as const } },
  media: { orderBy: { position: "asc" as const } },
};

export async function getAdminProjects() {
  return getDb().project.findMany({
    where: { status: ContentStatus.ACTIVE },
    include: { _count: { select: { media: true, skills: true } } },
    orderBy: [{ status: "asc" }, { sortOrder: "asc" }, { title: "asc" }],
  });
}

export async function getAdminProject(id: string) {
  return getDb().project.findUnique({
    where: { id },
    include: projectEditorInclude,
  });
}

export async function getProjectEditorOptions() {
  const [experiences, skills, media] = await Promise.all([
    getDb().experience.findMany({
      where: { status: ContentStatus.ACTIVE },
      select: { id: true, company: true, role: true },
      orderBy: { sortOrder: "asc" },
    }),
    getDb().skill.findMany({
      where: { status: ContentStatus.ACTIVE },
      select: { id: true, name: true, category: true },
      orderBy: { sortOrder: "asc" },
    }),
    getDb().mediaAsset.findMany({
      where: { status: MediaStatus.READY },
      select: { id: true, originalName: true, width: true, height: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  return { experiences, skills, media };
}
