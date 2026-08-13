"use server";

import { ProjectCategory } from "@/generated/prisma/enums";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { assertImmutableSlug, createSlug } from "@/domain/content/format";
import {
  projectInputSchema,
  type ProjectInput,
} from "@/domain/content/schemas";
import { requireAdminMutation } from "@/lib/auth/admin";
import { getDb } from "@/lib/db";
import { revalidatePublicContent } from "@/lib/content/revalidation";

export interface ProjectActionState {
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

function parseJsonArray(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function orderedText(value: FormDataEntryValue | null) {
  return parseJsonArray(value)
    .map(String)
    .map((text) => text.trim())
    .filter(Boolean)
    .map((text, position) => ({ text, position }));
}

function parseProjectForm(formData: FormData, sortOrder: number) {
  const title = String(formData.get("title") ?? "");
  const media = parseJsonArray(formData.get("media"));
  const impactStats = parseJsonArray(formData.get("impactStats"));

  return projectInputSchema.safeParse({
    slug: String(formData.get("slug") || createSlug(title)),
    title,
    role: formData.get("role"),
    category: formData.get("category"),
    summary: formData.get("summary"),
    liveUrl: formData.get("liveUrl") || null,
    featured: formData.get("featured") === "on",
    sortOrder,
    status: "active",
    relatedExperienceId: formData.get("relatedExperienceId") || null,
    impactSummary: formData.get("impactSummary") || null,
    highlights: orderedText(formData.get("highlights")),
    contributions: orderedText(formData.get("contributions")),
    impacts: orderedText(formData.get("impacts")),
    impactStats,
    skillIds: parseJsonArray(formData.get("skillIds")).map(String),
    media,
  });
}

function databaseCategory(value: ProjectInput["category"]) {
  return value.toUpperCase() as ProjectCategory;
}

function nestedProjectData(project: ProjectInput) {
  return {
    title: project.title,
    role: project.role,
    category: databaseCategory(project.category),
    summary: project.summary,
    liveUrl: project.liveUrl,
    featured: project.featured,
    sortOrder: project.sortOrder,
    relatedExperienceId: project.relatedExperienceId,
    impactSummary: project.impactSummary,
    highlights: { create: project.highlights },
    contributions: { create: project.contributions },
    impacts: { create: project.impacts },
    impactStats: { create: project.impactStats },
    skills: {
      create: project.skillIds.map((skillId, position) => ({
        skillId,
        position,
      })),
    },
    media: { create: project.media },
  };
}

function projectErrors(error: unknown): ProjectActionState {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  ) {
    return { error: "A project with this slug already exists." };
  }
  throw error;
}

export async function createProject(
  _state: ProjectActionState,
  formData: FormData,
): Promise<ProjectActionState> {
  await requireAdminMutation();
  const db = getDb();
  const last = await db.project.findFirst({
    select: { sortOrder: true },
    orderBy: { sortOrder: "desc" },
  });
  const result = parseProjectForm(formData, (last?.sortOrder ?? -1) + 1);
  if (!result.success) {
    return {
      error: result.error.issues[0]?.message ?? "Review the project details.",
      fieldErrors: result.error.flatten().fieldErrors,
    };
  }

  try {
    await db.project.create({
      data: { slug: result.data.slug, ...nestedProjectData(result.data) },
    });
  } catch (error) {
    return projectErrors(error);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/projects");
  revalidatePublicContent(result.data.slug);
  redirect("/admin/projects");
}

export async function updateProject(
  id: string,
  _state: ProjectActionState,
  formData: FormData,
): Promise<ProjectActionState> {
  await requireAdminMutation();
  const db = getDb();
  const current = await db.project.findUnique({ where: { id } });
  if (!current) return { error: "The project could not be found." };
  const result = parseProjectForm(formData, current.sortOrder);
  if (!result.success) {
    return {
      error: result.error.issues[0]?.message ?? "Review the project details.",
      fieldErrors: result.error.flatten().fieldErrors,
    };
  }

  try {
    assertImmutableSlug(current.slug, result.data.slug);
    const nested = nestedProjectData(result.data);
    await db.project.update({
      where: { id },
      data: {
        ...nested,
        highlights: { deleteMany: {}, ...nested.highlights },
        contributions: { deleteMany: {}, ...nested.contributions },
        impacts: { deleteMany: {}, ...nested.impacts },
        impactStats: { deleteMany: {}, ...nested.impactStats },
        skills: { deleteMany: {}, ...nested.skills },
        media: { deleteMany: {}, ...nested.media },
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("slug")) {
      return { error: error.message };
    }
    return projectErrors(error);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/projects");
  revalidatePublicContent(current.slug);
  redirect("/admin/projects");
}

export async function moveProject(id: string, direction: "up" | "down") {
  await requireAdminMutation();
  const db = getDb();
  const current = await db.project.findUnique({ where: { id } });
  if (!current) return;
  const adjacent = await db.project.findFirst({
    where: {
      status: current.status,
      sortOrder:
        direction === "up"
          ? { lt: current.sortOrder }
          : { gt: current.sortOrder },
    },
    orderBy: { sortOrder: direction === "up" ? "desc" : "asc" },
  });
  if (!adjacent) return;
  await db.$transaction([
    db.project.update({ where: { id }, data: { sortOrder: adjacent.sortOrder } }),
    db.project.update({
      where: { id: adjacent.id },
      data: { sortOrder: current.sortOrder },
    }),
  ]);
  revalidatePath("/admin/projects");
  revalidatePublicContent();
}
