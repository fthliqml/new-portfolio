"use server";

import { ContentStatus } from "@/generated/prisma/enums";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { assertImmutableSlug, createSlug } from "@/domain/content/format";
import { experienceInputSchema } from "@/domain/content/schemas";
import { requireAdminMutation } from "@/lib/auth/admin";
import { getDb } from "@/lib/db";

export interface ExperienceActionState {
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

function monthToDate(value: string) {
  return new Date(`${value}-01T00:00:00.000Z`);
}

function parseExperienceForm(formData: FormData, sortOrder: number) {
  const company = String(formData.get("company") ?? "");
  const highlights = formData
    .getAll("highlights")
    .map(String)
    .map((text) => text.trim())
    .filter(Boolean)
    .map((text, position) => ({ text, position }));

  return experienceInputSchema.safeParse({
    slug: String(formData.get("slug") || createSlug(company)),
    company,
    role: formData.get("role"),
    type: formData.get("type"),
    summary: formData.get("summary"),
    startMonth: formData.get("startMonth"),
    endMonth: formData.get("endMonth") || null,
    isCurrent: formData.get("isCurrent") === "on",
    durationLabel: formData.get("durationLabel") || null,
    monogram: formData.get("monogram"),
    sortOrder,
    status: "active",
    coverMediaId: formData.get("coverMediaId") || null,
    imageAlt: formData.get("imageAlt") || null,
    highlights,
  });
}

function formErrors(error: { flatten(): { fieldErrors: Record<string, string[]> } }) {
  return {
    error: "Review the highlighted experience details.",
    fieldErrors: error.flatten().fieldErrors,
  };
}

function databaseError(error: unknown): ExperienceActionState {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  ) {
    return { error: "An experience with this normalized slug already exists." };
  }
  throw error;
}

export async function createExperience(
  _state: ExperienceActionState,
  formData: FormData,
): Promise<ExperienceActionState> {
  await requireAdminMutation();
  const last = await getDb().experience.findFirst({
    select: { sortOrder: true },
    orderBy: { sortOrder: "desc" },
  });
  const result = parseExperienceForm(formData, (last?.sortOrder ?? -1) + 1);
  if (!result.success) return formErrors(result.error);

  try {
    await getDb().experience.create({
      data: {
        slug: result.data.slug,
        company: result.data.company,
        role: result.data.role,
        type: result.data.type,
        summary: result.data.summary,
        startDate: monthToDate(result.data.startMonth),
        endDate: result.data.endMonth
          ? monthToDate(result.data.endMonth)
          : null,
        isCurrent: result.data.isCurrent,
        durationLabel: result.data.durationLabel,
        monogram: result.data.monogram,
        sortOrder: result.data.sortOrder,
        coverMediaId: result.data.coverMediaId,
        imageAlt: result.data.imageAlt,
        highlights: { create: result.data.highlights },
      },
    });
  } catch (error) {
    return databaseError(error);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/experiences");
  redirect("/admin/experiences");
}

export async function updateExperience(
  id: string,
  _state: ExperienceActionState,
  formData: FormData,
): Promise<ExperienceActionState> {
  await requireAdminMutation();
  const current = await getDb().experience.findUnique({ where: { id } });
  if (!current) return { error: "The experience could not be found." };
  const result = parseExperienceForm(formData, current.sortOrder);
  if (!result.success) return formErrors(result.error);

  try {
    assertImmutableSlug(current.slug, result.data.slug);
    await getDb().experience.update({
      where: { id },
      data: {
        company: result.data.company,
        role: result.data.role,
        type: result.data.type,
        summary: result.data.summary,
        startDate: monthToDate(result.data.startMonth),
        endDate: result.data.endMonth
          ? monthToDate(result.data.endMonth)
          : null,
        isCurrent: result.data.isCurrent,
        durationLabel: result.data.durationLabel,
        monogram: result.data.monogram,
        coverMediaId: result.data.coverMediaId,
        imageAlt: result.data.imageAlt,
        highlights: {
          deleteMany: {},
          create: result.data.highlights,
        },
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("slug")) {
      return { error: error.message };
    }
    return databaseError(error);
  }

  revalidatePath("/admin/experiences");
  redirect("/admin/experiences");
}

export async function setExperienceArchived(id: string, archived: boolean) {
  await requireAdminMutation();
  await getDb().experience.update({
    where: { id },
    data: {
      status: archived ? ContentStatus.ARCHIVED : ContentStatus.ACTIVE,
      archivedAt: archived ? new Date() : null,
    },
  });
  revalidatePath("/admin");
  revalidatePath("/admin/experiences");
}

export async function moveExperience(id: string, direction: "up" | "down") {
  await requireAdminMutation();
  const db = getDb();
  const current = await db.experience.findUnique({ where: { id } });
  if (!current) return;
  const adjacent = await db.experience.findFirst({
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
    db.experience.update({
      where: { id: current.id },
      data: { sortOrder: adjacent.sortOrder },
    }),
    db.experience.update({
      where: { id: adjacent.id },
      data: { sortOrder: current.sortOrder },
    }),
  ]);
  revalidatePath("/admin/experiences");
}
