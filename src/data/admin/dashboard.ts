import "server-only";

import type {
  DashboardActivity,
  DashboardData,
} from "@/data/admin/dashboard-state";
import { getDb } from "@/lib/db";

interface StatusCount {
  status: string;
  _count: number | { _all: number };
}

function countStatus(rows: StatusCount[], status: string) {
  const count = rows.find((row) => row.status === status)?._count;
  return typeof count === "number" ? count : (count?._all ?? 0);
}

export async function getDashboardData(): Promise<DashboardData> {
  const db = getDb();
  const [
    projectCounts,
    experienceCounts,
    skillCounts,
    mediaCounts,
    projects,
    experiences,
    skills,
    media,
  ] = await Promise.all([
    db.project.groupBy({ by: ["status"], _count: true }),
    db.experience.groupBy({ by: ["status"], _count: true }),
    db.skill.groupBy({ by: ["status"], _count: true }),
    db.mediaAsset.groupBy({
      by: ["status"],
      _count: true,
      _sum: { sizeBytes: true },
    }),
    db.project.findMany({
      select: { id: true, title: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    db.experience.findMany({
      select: { id: true, company: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    db.skill.findMany({
      select: { id: true, name: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    db.mediaAsset.findMany({
      select: { id: true, originalName: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
  ]);

  const recentActivity: DashboardActivity[] = [
    ...projects.map((item) => ({
      id: item.id,
      type: "project" as const,
      label: item.title,
      updatedAt: item.updatedAt,
    })),
    ...experiences.map((item) => ({
      id: item.id,
      type: "experience" as const,
      label: item.company,
      updatedAt: item.updatedAt,
    })),
    ...skills.map((item) => ({
      id: item.id,
      type: "skill" as const,
      label: item.name,
      updatedAt: item.updatedAt,
    })),
    ...media.map((item) => ({
      id: item.id,
      type: "media" as const,
      label: item.originalName,
      updatedAt: item.updatedAt,
    })),
  ]
    .sort((left, right) => right.updatedAt.getTime() - left.updatedAt.getTime())
    .slice(0, 8);

  return {
    projects: {
      active: countStatus(projectCounts, "ACTIVE"),
      archived: countStatus(projectCounts, "ARCHIVED"),
    },
    experiences: {
      active: countStatus(experienceCounts, "ACTIVE"),
      archived: countStatus(experienceCounts, "ARCHIVED"),
    },
    skills: {
      active: countStatus(skillCounts, "ACTIVE"),
      archived: countStatus(skillCounts, "ARCHIVED"),
    },
    media: {
      ready: countStatus(mediaCounts, "READY"),
      pending: countStatus(mediaCounts, "PENDING"),
      sizeBytes: mediaCounts.reduce(
        (total, row) => total + (row._sum.sizeBytes ?? 0),
        0,
      ),
    },
    recentActivity,
  };
}
