import "server-only";

import { ContentStatus } from "@/generated/prisma/enums";

import { destructiveImpact, type ContentEntity } from "@/domain/content/lifecycle";
import { getDb } from "@/lib/db";

export interface ArchivedContentItem {
  id: string;
  entity: ContentEntity;
  title: string;
  subtitle: string;
  references: number;
  archivedAt: string | null;
  impact: string;
}

export async function getArchivedContent(): Promise<ArchivedContentItem[]> {
  const db = getDb();
  const [projects, experiences, skills] = await Promise.all([
    db.project.findMany({
      where: { status: ContentStatus.ARCHIVED },
      select: {
        id: true,
        title: true,
        slug: true,
        archivedAt: true,
        _count: { select: { media: true } },
      },
      orderBy: { archivedAt: "desc" },
    }),
    db.experience.findMany({
      where: { status: ContentStatus.ARCHIVED },
      select: {
        id: true,
        company: true,
        role: true,
        archivedAt: true,
        _count: { select: { projects: true } },
      },
      orderBy: { archivedAt: "desc" },
    }),
    db.skill.findMany({
      where: { status: ContentStatus.ARCHIVED },
      select: {
        id: true,
        name: true,
        slug: true,
        archivedAt: true,
        _count: { select: { projects: true } },
      },
      orderBy: { archivedAt: "desc" },
    }),
  ]);

  return [
    ...projects.map((item) => ({
      id: item.id,
      entity: "project" as const,
      title: item.title,
      subtitle: item.slug,
      references: item._count.media,
      archivedAt: item.archivedAt?.toISOString() ?? null,
      impact: destructiveImpact("project", item._count.media),
    })),
    ...experiences.map((item) => ({
      id: item.id,
      entity: "experience" as const,
      title: item.company,
      subtitle: item.role,
      references: item._count.projects,
      archivedAt: item.archivedAt?.toISOString() ?? null,
      impact: destructiveImpact("experience", item._count.projects),
    })),
    ...skills.map((item) => ({
      id: item.id,
      entity: "skill" as const,
      title: item.name,
      subtitle: item.slug,
      references: item._count.projects,
      archivedAt: item.archivedAt?.toISOString() ?? null,
      impact: destructiveImpact("skill", item._count.projects),
    })),
  ].sort((left, right) =>
    (right.archivedAt ?? "").localeCompare(left.archivedAt ?? ""),
  );
}
