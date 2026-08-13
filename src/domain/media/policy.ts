const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"] as const;

export const mediaPolicy = {
  bucket: "portfolio-media",
  allowedImageTypes,
  maxInputBytes: 10 * 1_024 * 1_024,
  targetBytes: 2 * 1_024 * 1_024,
  maxDimension: 2_400,
} as const;

export type AllowedImageType = (typeof allowedImageTypes)[number];

export interface MediaFileDescriptor {
  name: string;
  type: string;
  size: number;
}

export function validateMediaFile(file: MediaFileDescriptor) {
  if (!mediaPolicy.allowedImageTypes.includes(file.type as AllowedImageType)) {
    return "Choose a JPG, PNG, or WebP image.";
  }
  if (file.size <= 0) return "The selected image is empty.";
  if (file.size > mediaPolicy.maxInputBytes) {
    return "The selected image exceeds the 10 MB input limit.";
  }
  return null;
}

export function sanitizeMediaFileName(value: string) {
  const extensionIndex = value.lastIndexOf(".");
  const base = extensionIndex > 0 ? value.slice(0, extensionIndex) : value;
  const safeBase = base
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return `${safeBase || "image"}.webp`;
}

export function createMediaObjectPath(
  userId: string,
  mediaId: string,
  originalName: string,
) {
  return `${userId}/${mediaId}/${sanitizeMediaFileName(originalName)}`;
}

export function verifyStoredMedia(
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
