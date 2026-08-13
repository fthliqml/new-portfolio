"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import type { ContentEntity } from "@/domain/content/lifecycle";
import { requireAdminMutation } from "@/lib/auth/admin";
import {
  permanentlyDeleteContent,
  setContentArchived,
} from "@/lib/content/lifecycle";

const entitySchema = z.enum(["project", "experience", "skill"]);
const idSchema = z.uuid();

function revalidateAdmin(entity: ContentEntity) {
  revalidatePath("/admin");
  revalidatePath("/admin/archive");
  revalidatePath(`/admin/${entity === "experience" ? "experiences" : `${entity}s`}`);
}

export async function archiveContent(entity: ContentEntity, id: string) {
  await requireAdminMutation();
  const parsedEntity = entitySchema.parse(entity);
  const parsedId = idSchema.parse(id);
  await setContentArchived(parsedEntity, parsedId, true);
  revalidateAdmin(parsedEntity);
}

export async function restoreContent(entity: ContentEntity, id: string) {
  await requireAdminMutation();
  const parsedEntity = entitySchema.parse(entity);
  const parsedId = idSchema.parse(id);
  await setContentArchived(parsedEntity, parsedId, false);
  revalidateAdmin(parsedEntity);
}

export async function permanentlyDeleteArchivedContent(
  entity: ContentEntity,
  id: string,
) {
  await requireAdminMutation();
  const parsedEntity = entitySchema.parse(entity);
  const parsedId = idSchema.parse(id);
  await permanentlyDeleteContent(parsedEntity, parsedId);
  revalidateAdmin(parsedEntity);
}
