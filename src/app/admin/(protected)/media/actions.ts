"use server";

import { MediaStatus } from "@/generated/prisma/enums";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdminMutation } from "@/lib/auth/admin";
import { getDb } from "@/lib/db";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  createMediaObjectPath,
  mediaPolicy,
  sanitizeMediaFileName,
  verifyStoredMedia,
} from "@/domain/media/policy";
import { assertMediaCanBeDeleted } from "@/domain/media/references";

const beginUploadSchema = z.object({
  originalName: z.string().trim().min(1).max(255),
  sizeBytes: z.number().int().positive().max(mediaPolicy.targetBytes),
  width: z.number().int().positive().max(mediaPolicy.maxDimension),
  height: z.number().int().positive().max(mediaPolicy.maxDimension),
  mimeType: z.literal("image/webp"),
});

const mediaIdSchema = z.uuid();

export type MediaActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export async function beginMediaUpload(
  input: z.input<typeof beginUploadSchema>,
): Promise<
  MediaActionResult<{ id: string; bucket: string; objectPath: string }>
> {
  const admin = await requireAdminMutation();
  const parsed = beginUploadSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "The prepared image does not meet the media policy." };
  }

  const id = crypto.randomUUID();
  const objectPath = createMediaObjectPath(
    admin.userId,
    id,
    sanitizeMediaFileName(parsed.data.originalName),
  );

  await getDb().mediaAsset.create({
    data: {
      id,
      bucket: mediaPolicy.bucket,
      objectPath,
      originalName: parsed.data.originalName,
      mimeType: parsed.data.mimeType,
      sizeBytes: parsed.data.sizeBytes,
      width: parsed.data.width,
      height: parsed.data.height,
      status: MediaStatus.PENDING,
      createdBy: admin.userId,
    },
  });

  return { ok: true, data: { id, bucket: mediaPolicy.bucket, objectPath } };
}

export async function finalizeMediaUpload(id: string): Promise<MediaActionResult> {
  const admin = await requireAdminMutation();
  const parsedId = mediaIdSchema.safeParse(id);
  if (!parsedId.success) return { ok: false, error: "Invalid media identifier." };

  const asset = await getDb().mediaAsset.findFirst({
    where: { id: parsedId.data, createdBy: admin.userId },
  });
  if (!asset || asset.status !== MediaStatus.PENDING) {
    return { ok: false, error: "The pending upload could not be found." };
  }

  const separator = asset.objectPath.lastIndexOf("/");
  const directory = asset.objectPath.slice(0, separator);
  const fileName = asset.objectPath.slice(separator + 1);
  const { data, error } = await getSupabaseAdminClient()
    .storage.from(asset.bucket)
    .list(directory, { search: fileName, limit: 2 });
  const uploadedObject = data?.find((item) => item.name === fileName);

  if (error || !uploadedObject) {
    return {
      ok: false,
      error: "Storage did not confirm the upload. The record remains pending.",
    };
  }

  if (
    !verifyStoredMedia(
      { sizeBytes: asset.sizeBytes, mimeType: asset.mimeType },
      uploadedObject.metadata,
    )
  ) {
    return {
      ok: false,
      error: "The stored object does not match the prepared image metadata.",
    };
  }

  await getDb().mediaAsset.update({
    where: { id: asset.id },
    data: { status: MediaStatus.READY },
  });
  revalidatePath("/admin");
  revalidatePath("/admin/media");

  return { ok: true, data: undefined };
}

export async function abandonMediaUpload(id: string): Promise<MediaActionResult> {
  const admin = await requireAdminMutation();
  const parsedId = mediaIdSchema.safeParse(id);
  if (!parsedId.success) return { ok: false, error: "Invalid media identifier." };

  await getDb().mediaAsset.deleteMany({
    where: {
      id: parsedId.data,
      createdBy: admin.userId,
      status: MediaStatus.PENDING,
    },
  });
  return { ok: true, data: undefined };
}

export async function deleteMediaAsset(id: string): Promise<MediaActionResult> {
  const admin = await requireAdminMutation();
  const parsedId = mediaIdSchema.safeParse(id);
  if (!parsedId.success) return { ok: false, error: "Invalid media identifier." };

  const asset = await getDb().mediaAsset.findFirst({
    where: { id: parsedId.data, createdBy: admin.userId },
    include: {
      _count: { select: { projectMedia: true, experienceCovers: true } },
    },
  });
  if (!asset) return { ok: false, error: "The media asset was not found." };

  try {
    assertMediaCanBeDeleted(asset._count);
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "This image is in use.",
    };
  }

  const { error } = await getSupabaseAdminClient()
    .storage.from(asset.bucket)
    .remove([asset.objectPath]);
  if (error) {
    return { ok: false, error: "Storage could not delete the image." };
  }

  await getDb().mediaAsset.delete({ where: { id: asset.id } });
  revalidatePath("/admin");
  revalidatePath("/admin/media");

  return { ok: true, data: undefined };
}
