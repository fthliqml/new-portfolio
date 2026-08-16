import "server-only";

import { resumePolicy } from "@/domain/resume/policy";
import { getDb } from "@/lib/db";

export async function getAdminResume() {
  const resume = await getDb().resumeAsset.findUnique({
    where: { id: resumePolicy.singletonId },
  });

  if (!resume) return null;
  return {
    originalName: resume.originalName,
    sizeBytes: resume.sizeBytes,
    updatedAt: resume.updatedAt.toISOString(),
  };
}
