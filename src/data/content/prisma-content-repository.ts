import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import {
  ContentStatus as DatabaseContentStatus,
  MediaStatus,
} from "@/generated/prisma/enums";
import type {
  ContentQueryOptions,
  ContentRepository,
} from "@/domain/content/repository";
import {
  formatExperienceDuration,
  formatExperiencePeriod,
  formatSequenceNumber,
  toContentStatus,
  toProjectCategory,
  toSkillCategory,
} from "@/domain/content/format";
import type {
  Experience,
  Project,
  ProjectImage,
  Skill,
} from "@/domain/content/types";
import { getDb } from "@/lib/db";

const projectInclude = {
  relatedExperience: true,
  highlights: { orderBy: { position: "asc" as const } },
  contributions: { orderBy: { position: "asc" as const } },
  impacts: { orderBy: { position: "asc" as const } },
  impactStats: { orderBy: { position: "asc" as const } },
  skills: {
    include: { skill: true },
    orderBy: { position: "asc" as const },
  },
  media: {
    include: { mediaAsset: true },
    orderBy: { position: "asc" as const },
  },
} satisfies Prisma.ProjectInclude;

const experienceInclude = {
  coverMedia: true,
  highlights: { orderBy: { position: "asc" as const } },
} satisfies Prisma.ExperienceInclude;

type ProjectRecord = Prisma.ProjectGetPayload<{ include: typeof projectInclude }>;
type ExperienceRecord = Prisma.ExperienceGetPayload<{
  include: typeof experienceInclude;
}>;

function statusFilter(options?: ContentQueryOptions) {
  return options?.includeArchived
    ? undefined
    : { status: DatabaseContentStatus.ACTIVE };
}

function getPublicMediaUrl(bucket: string, objectPath: string) {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");

  if (!baseUrl) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL is required to resolve CMS media URLs.",
    );
  }

  const encodedPath = objectPath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `${baseUrl}/storage/v1/object/public/${encodeURIComponent(bucket)}/${encodedPath}`;
}

function mapProjectMedia(record: ProjectRecord): ProjectImage[] {
  return record.media
    .filter(({ mediaAsset }) => mediaAsset.status === MediaStatus.READY)
    .map(({ id, mediaAsset, altText, label, description, isCover }) => ({
      id,
      src: getPublicMediaUrl(mediaAsset.bucket, mediaAsset.objectPath),
      alt: altText,
      label,
      description,
      isCover,
    }));
}

function mapProject(record: ProjectRecord, index: number): Project {
  return {
    databaseId: record.id,
    id: record.slug,
    number: formatSequenceNumber(index),
    name: record.title,
    role: record.role,
    category: toProjectCategory(record.category),
    featured: record.featured,
    status: toContentStatus(record.status),
    experienceId: record.relatedExperience?.slug,
    experienceLabel: record.relatedExperience?.company,
    summary: record.summary,
    contributions: record.contributions.map(({ text }) => text),
    impactSummary: record.impactSummary ?? undefined,
    impactStats: record.impactStats.map(({ value, label }) => ({ value, label })),
    impacts: record.impacts.map(({ text }) => text),
    highlights: record.highlights.map(({ text }) => text),
    techStack: record.skills.map(({ skill }) => skill.name),
    images: mapProjectMedia(record),
    link: record.liveUrl,
    updatedAt: record.updatedAt.toISOString(),
  };
}

function mapExperience(record: ExperienceRecord): Experience {
  const readyCover =
    record.coverMedia?.status === MediaStatus.READY ? record.coverMedia : null;

  return {
    databaseId: record.id,
    id: record.slug,
    role: record.role,
    company: record.company,
    type: record.type,
    period: formatExperiencePeriod(
      record.startDate,
      record.endDate,
      record.isCurrent,
    ),
    duration: formatExperienceDuration(
      record.startDate,
      record.endDate,
      record.isCurrent,
      record.durationLabel,
    ),
    summary: record.summary,
    highlights: record.highlights.map(({ text }) => text),
    image: readyCover
      ? getPublicMediaUrl(readyCover.bucket, readyCover.objectPath)
      : null,
    imageAlt: record.imageAlt ?? "",
    monogram: record.monogram,
    status: toContentStatus(record.status),
    startDate: record.startDate.toISOString(),
    endDate: record.endDate?.toISOString() ?? null,
    isCurrent: record.isCurrent,
    updatedAt: record.updatedAt.toISOString(),
  };
}

function mapSkill(record: {
  id: string;
  slug: string;
  name: string;
  category: string;
  showOnHome: boolean;
  status: string;
  sortOrder: number;
  updatedAt: Date;
}): Skill {
  return {
    id: record.id,
    slug: record.slug,
    name: record.name,
    category: toSkillCategory(record.category),
    showOnHome: record.showOnHome,
    status: toContentStatus(record.status),
    sortOrder: record.sortOrder,
    updatedAt: record.updatedAt.toISOString(),
  };
}

async function queryProjects(options?: ContentQueryOptions) {
  return getDb().project.findMany({
    where: statusFilter(options),
    include: projectInclude,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
}

export const prismaContentRepository: ContentRepository = {
  async getProjects(options) {
    const records = await queryProjects(options);
    return records.map(mapProject);
  },

  async getProjectBySlug(slug, options) {
    const projects = await this.getProjects(options);
    return projects.find((project) => project.id === slug) ?? null;
  },

  async getProjectSlugs(options) {
    const records = await getDb().project.findMany({
      where: statusFilter(options),
      select: { slug: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    return records.map(({ slug }) => slug);
  },

  async getExperiences(options) {
    const records = await getDb().experience.findMany({
      where: statusFilter(options),
      include: experienceInclude,
      orderBy: [{ sortOrder: "asc" }, { startDate: "desc" }],
    });
    return records.map(mapExperience);
  },

  async getSkills(options) {
    const records = await getDb().skill.findMany({
      where: statusFilter(options),
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
    return records.map(mapSkill);
  },

  async getHomeContent() {
    const [projects, experiences, skills] = await Promise.all([
      this.getProjects(),
      this.getExperiences(),
      this.getSkills(),
    ]);

    return {
      featuredProjects: projects.filter((project) => project.featured),
      experiences,
      skills: skills.filter((skill) => skill.showOnHome),
    };
  },
};
