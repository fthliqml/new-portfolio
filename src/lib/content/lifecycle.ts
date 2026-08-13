import "server-only";

import { ContentStatus } from "@/generated/prisma/enums";

import {
  assertPermanentDeleteAllowed,
  type ContentEntity,
} from "@/domain/content/lifecycle";
import { getDb } from "@/lib/db";

async function normalizeOrder(entity: ContentEntity, status: ContentStatus) {
  const db = getDb();
  if (entity === "project") {
    const rows = await db.project.findMany({
      where: { status },
      select: { id: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    await db.$transaction(
      rows.map((row, sortOrder) =>
        db.project.update({ where: { id: row.id }, data: { sortOrder } }),
      ),
    );
  } else if (entity === "experience") {
    const rows = await db.experience.findMany({
      where: { status },
      select: { id: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    await db.$transaction(
      rows.map((row, sortOrder) =>
        db.experience.update({ where: { id: row.id }, data: { sortOrder } }),
      ),
    );
  } else {
    const rows = await db.skill.findMany({
      where: { status },
      select: { id: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    await db.$transaction(
      rows.map((row, sortOrder) =>
        db.skill.update({ where: { id: row.id }, data: { sortOrder } }),
      ),
    );
  }
}

async function nextOrder(entity: ContentEntity, status: ContentStatus) {
  const db = getDb();
  if (entity === "project") {
    return (
      (await db.project.aggregate({ where: { status }, _max: { sortOrder: true } }))
        ._max.sortOrder ?? -1
    ) + 1;
  }
  if (entity === "experience") {
    return (
      (await db.experience.aggregate({ where: { status }, _max: { sortOrder: true } }))
        ._max.sortOrder ?? -1
    ) + 1;
  }
  return (
    (await db.skill.aggregate({ where: { status }, _max: { sortOrder: true } }))
      ._max.sortOrder ?? -1
  ) + 1;
}

export async function setContentArchived(
  entity: ContentEntity,
  id: string,
  archived: boolean,
) {
  const db = getDb();
  const previousStatus = archived
    ? ContentStatus.ACTIVE
    : ContentStatus.ARCHIVED;
  const nextStatus = archived
    ? ContentStatus.ARCHIVED
    : ContentStatus.ACTIVE;
  const sortOrder = await nextOrder(entity, nextStatus);
  const common = {
    status: nextStatus,
    archivedAt: archived ? new Date() : null,
    sortOrder,
  };

  if (entity === "project") {
    await db.project.update({
      where: { id },
      data: { ...common, featured: archived ? false : undefined },
    });
  } else if (entity === "experience") {
    await db.experience.update({ where: { id }, data: common });
  } else {
    await db.skill.update({
      where: { id },
      data: { ...common, showOnHome: archived ? false : undefined },
    });
  }

  await normalizeOrder(entity, previousStatus);
  await normalizeOrder(entity, nextStatus);
}

export async function permanentlyDeleteContent(
  entity: ContentEntity,
  id: string,
) {
  const db = getDb();
  if (entity === "project") {
    const record = await db.project.findUnique({ where: { id } });
    if (!record) return;
    assertPermanentDeleteAllowed({
      entity,
      archived: record.status === ContentStatus.ARCHIVED,
    });
    await db.project.delete({ where: { id } });
  } else if (entity === "experience") {
    const record = await db.experience.findUnique({
      where: { id },
      include: { _count: { select: { projects: true } } },
    });
    if (!record) return;
    assertPermanentDeleteAllowed({
      entity,
      archived: record.status === ContentStatus.ARCHIVED,
      projectReferences: record._count.projects,
    });
    await db.$transaction([
      db.project.updateMany({
        where: { relatedExperienceId: id },
        data: { relatedExperienceId: null },
      }),
      db.experience.delete({ where: { id } }),
    ]);
  } else {
    const record = await db.skill.findUnique({
      where: { id },
      include: { _count: { select: { projects: true } } },
    });
    if (!record) return;
    assertPermanentDeleteAllowed({
      entity,
      archived: record.status === ContentStatus.ARCHIVED,
      projectReferences: record._count.projects,
    });
    await db.skill.delete({ where: { id } });
  }

  await normalizeOrder(entity, ContentStatus.ARCHIVED);
}
