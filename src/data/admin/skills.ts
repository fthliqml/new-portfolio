import "server-only";

import { ContentStatus } from "@/generated/prisma/enums";

import { getDb } from "@/lib/db";

export async function getAdminSkills() {
  return getDb().skill.findMany({
    where: { status: ContentStatus.ACTIVE },
    include: { _count: { select: { projects: true } } },
    orderBy: [{ status: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
  });
}

export async function getAdminSkill(id: string) {
  return getDb().skill.findUnique({ where: { id } });
}
