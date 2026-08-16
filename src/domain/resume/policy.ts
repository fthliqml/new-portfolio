const allowedResumeTypes = ["application/pdf"] as const;

export const resumePolicy = {
  bucket: "portfolio-files",
  singletonId: "primary",
  allowedTypes: allowedResumeTypes,
  maxBytes: 5 * 1_024 * 1_024,
} as const;

export interface ResumeFileDescriptor {
  name: string;
  type: string;
  size: number;
}

export function validateResumeFile(file: ResumeFileDescriptor) {
  const hasPdfExtension = file.name.toLowerCase().endsWith(".pdf");
  if (!resumePolicy.allowedTypes.includes(file.type as "application/pdf") || !hasPdfExtension) {
    return "Choose a PDF file.";
  }
  if (file.size <= 0) return "The selected PDF is empty.";
  if (file.size > resumePolicy.maxBytes) {
    return "The selected PDF exceeds the 5 MB limit.";
  }
  return null;
}

export function sanitizeResumeFileName(value: string) {
  const extensionIndex = value.lastIndexOf(".");
  const base = extensionIndex > 0 ? value.slice(0, extensionIndex) : value;
  const safeBase = base
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);

  return `${safeBase || "resume"}.pdf`;
}

export function createResumeObjectPath(
  userId: string,
  uploadId: string,
  originalName: string,
) {
  return `${userId}/resume/${uploadId}/${sanitizeResumeFileName(originalName)}`;
}

export function isOwnedResumeObjectPath(userId: string, objectPath: string) {
  const escapedUserId = userId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(
    `^${escapedUserId}/resume/[0-9a-f-]{36}/[a-z0-9-]+\\.pdf$`,
    "i",
  ).test(objectPath);
}

export function verifyStoredResume(
  expected: { sizeBytes: number; mimeType: string },
  actual: { size?: unknown; mimetype?: unknown } | null | undefined,
) {
  if (!actual) return false;
  const size = Number(actual.size ?? 0);
  const mimeType = String(actual.mimetype ?? "");

  return (
    (size === 0 || size === expected.sizeBytes) &&
    (!mimeType || mimeType === expected.mimeType)
  );
}
