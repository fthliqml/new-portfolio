"use server";

import { ContentStatus, SkillCategory } from "@/generated/prisma/enums";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { assertImmutableSlug, createSlug } from "@/domain/content/format";
import { skillInputSchema } from "@/domain/content/schemas";
import {
  assertSkillCanBeDeleted,
  nextSkillSortOrder,
} from "@/domain/content/skills";
import { requireAdminMutation } from "@/lib/auth/admin";
import { getDb } from "@/lib/db";
import { setContentArchived } from "@/lib/content/lifecycle";
import { revalidatePublicContent } from "@/lib/content/revalidation";

export interface SkillActionState {
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

function databaseCategory(category: string) {
  return category.toUpperCase() as SkillCategory;
}

function parseSkillForm(formData: FormData, sortOrder: number) {
  const name = String(formData.get("name") ?? "");
  return skillInputSchema.safeParse({
    slug: String(formData.get("slug") || createSlug(name)),
    name,
    category: formData.get("category"),
    showOnHome: formData.get("showOnHome") === "on",
    sortOrder,
    status: formData.get("status") || "active",
  });
}

function databaseError(error: unknown): SkillActionState {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  ) {
    return { error: "A skill with the same normalized slug already exists." };
  }
  throw error;
}

export async function createSkill(
  _previousState: SkillActionState,
  formData: FormData,
): Promise<SkillActionState> {
  await requireAdminMutation();
  const lastSkill = await getDb().skill.findFirst({
    select: { sortOrder: true },
    orderBy: { sortOrder: "desc" },
  });
  const result = parseSkillForm(
    formData,
    nextSkillSortOrder(lastSkill?.sortOrder ?? null),
  );
  if (!result.success) {
    return {
      error: "Review the highlighted skill details.",
      fieldErrors: result.error.flatten().fieldErrors,
    };
  }

  try {
    await getDb().skill.create({
      data: {
        slug: result.data.slug,
        name: result.data.name,
        category: databaseCategory(result.data.category),
        showOnHome: result.data.showOnHome,
        sortOrder: result.data.sortOrder,
        status: ContentStatus.ACTIVE,
      },
    });
  } catch (error) {
    return databaseError(error);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/skills");
  revalidatePublicContent();
  redirect("/admin/skills");
}

export async function updateSkill(
  id: string,
  _previousState: SkillActionState,
  formData: FormData,
): Promise<SkillActionState> {
  await requireAdminMutation();
  const skill = await getDb().skill.findUnique({ where: { id } });
  if (!skill) return { error: "The skill could not be found." };

  const result = parseSkillForm(formData, skill.sortOrder);
  if (!result.success) {
    return {
      error: "Review the highlighted skill details.",
      fieldErrors: result.error.flatten().fieldErrors,
    };
  }

  try {
    assertImmutableSlug(skill.slug, result.data.slug);
    await getDb().skill.update({
      where: { id },
      data: {
        name: result.data.name,
        category: databaseCategory(result.data.category),
        showOnHome: result.data.showOnHome,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("slug")) {
      return { error: error.message };
    }
    return databaseError(error);
  }

  revalidatePath("/admin/skills");
  revalidatePublicContent();
  redirect("/admin/skills");
}

export async function setSkillArchived(id: string, archived: boolean) {
  await requireAdminMutation();
  await setContentArchived("skill", id, archived);
  revalidatePath("/admin");
  revalidatePath("/admin/skills");
  revalidatePublicContent();
}

export async function moveSkill(id: string, direction: "up" | "down") {
  await requireAdminMutation();
  const db = getDb();
  const current = await db.skill.findUnique({ where: { id } });
  if (!current) return;

  const adjacent = await db.skill.findFirst({
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
    db.skill.update({
      where: { id: current.id },
      data: { sortOrder: adjacent.sortOrder },
    }),
    db.skill.update({
      where: { id: adjacent.id },
      data: { sortOrder: current.sortOrder },
    }),
  ]);
  revalidatePath("/admin/skills");
  revalidatePublicContent();
}

export async function deleteUnusedSkill(id: string) {
  await requireAdminMutation();
  const skill = await getDb().skill.findUnique({
    where: { id },
    include: { _count: { select: { projects: true } } },
  });
  if (!skill) return;
  assertSkillCanBeDeleted(skill._count.projects);
  await getDb().skill.delete({ where: { id } });
  revalidatePath("/admin");
  revalidatePath("/admin/skills");
  revalidatePublicContent();
}
