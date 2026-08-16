"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  createResumeObjectPath,
  isOwnedResumeObjectPath,
  resumePolicy,
  sanitizeResumeFileName,
  verifyStoredResume,
} from "@/domain/resume/policy";
import { requireAdminMutation } from "@/lib/auth/admin";
import { getDb } from "@/lib/db";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const resumeUploadSchema = z.object({
  originalName: z.string().trim().min(1).max(255),
  mimeType: z.literal("application/pdf"),
  sizeBytes: z.number().int().positive().max(resumePolicy.maxBytes),
});

const finalizeResumeSchema = resumeUploadSchema.extend({
  objectPath: z.string().min(1).max(1024),
});

export type ResumeActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export async function beginResumeUpload(
  input: z.input<typeof resumeUploadSchema>,
): Promise<ResumeActionResult<{ bucket: string; objectPath: string }>> {
  const admin = await requireAdminMutation();
  const parsed = resumeUploadSchema.safeParse(input);
  if (!parsed.success || !parsed.data.originalName.toLowerCase().endsWith(".pdf")) {
    return { ok: false, error: "The selected file does not meet the resume policy." };
  }

  const uploadId = crypto.randomUUID();
  return {
    ok: true,
    data: {
      bucket: resumePolicy.bucket,
      objectPath: createResumeObjectPath(
        admin.userId,
        uploadId,
        sanitizeResumeFileName(parsed.data.originalName),
      ),
    },
  };
}

export async function abandonResumeUpload(
  objectPath: string,
): Promise<ResumeActionResult> {
  const admin = await requireAdminMutation();
  if (!isOwnedResumeObjectPath(admin.userId, objectPath)) {
    return { ok: false, error: "Invalid resume object path." };
  }

  const current = await getDb().resumeAsset.findUnique({
    where: { id: resumePolicy.singletonId },
    select: { objectPath: true },
  });
  if (current?.objectPath === objectPath) {
    return { ok: false, error: "The active resume cannot be abandoned." };
  }

  await getSupabaseAdminClient()
    .storage.from(resumePolicy.bucket)
    .remove([objectPath]);
  return { ok: true, data: undefined };
}

export async function finalizeResumeUpload(
  input: z.input<typeof finalizeResumeSchema>,
): Promise<ResumeActionResult<{ cleanupWarning: boolean }>> {
  const admin = await requireAdminMutation();
  const parsed = finalizeResumeSchema.safeParse(input);
  if (
    !parsed.success ||
    !parsed.data.originalName.toLowerCase().endsWith(".pdf") ||
    !isOwnedResumeObjectPath(admin.userId, parsed.data.objectPath)
  ) {
    return { ok: false, error: "The uploaded resume metadata is invalid." };
  }

  const separator = parsed.data.objectPath.lastIndexOf("/");
  const directory = parsed.data.objectPath.slice(0, separator);
  const fileName = parsed.data.objectPath.slice(separator + 1);
  const storage = getSupabaseAdminClient().storage.from(resumePolicy.bucket);
  const { data, error } = await storage.list(directory, {
    search: fileName,
    limit: 2,
  });
  const uploadedObject = data?.find((item) => item.name === fileName);

  if (
    error ||
    !uploadedObject ||
    !verifyStoredResume(
      { sizeBytes: parsed.data.sizeBytes, mimeType: parsed.data.mimeType },
      uploadedObject.metadata,
    )
  ) {
    return { ok: false, error: "Storage could not verify the uploaded PDF." };
  }

  const db = getDb();
  const previous = await db.resumeAsset.findUnique({
    where: { id: resumePolicy.singletonId },
    select: { bucket: true, objectPath: true },
  });

  await db.resumeAsset.upsert({
    where: { id: resumePolicy.singletonId },
    create: {
      id: resumePolicy.singletonId,
      bucket: resumePolicy.bucket,
      objectPath: parsed.data.objectPath,
      originalName: parsed.data.originalName,
      mimeType: parsed.data.mimeType,
      sizeBytes: parsed.data.sizeBytes,
      createdBy: admin.userId,
    },
    update: {
      bucket: resumePolicy.bucket,
      objectPath: parsed.data.objectPath,
      originalName: parsed.data.originalName,
      mimeType: parsed.data.mimeType,
      sizeBytes: parsed.data.sizeBytes,
      createdBy: admin.userId,
    },
  });

  let cleanupWarning = false;
  if (previous && previous.objectPath !== parsed.data.objectPath) {
    const { error: cleanupError } = await getSupabaseAdminClient()
      .storage.from(previous.bucket)
      .remove([previous.objectPath]);
    cleanupWarning = Boolean(cleanupError);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/resume");
  revalidatePath("/resume");
  return { ok: true, data: { cleanupWarning } };
}
