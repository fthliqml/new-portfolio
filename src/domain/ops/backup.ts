import { createHash } from "node:crypto";

import { z } from "zod";

const isoDate = z.string().datetime();
const nullableIsoDate = isoDate.nullable();

const positionedText = z.object({ id: z.uuid(), text: z.string(), position: z.number().int() });
const impactStat = z.object({ id: z.uuid(), label: z.string(), value: z.string(), position: z.number().int() });
const projectSkill = z.object({ skillId: z.uuid(), position: z.number().int() });
const projectMedia = z.object({ id: z.uuid(), mediaAssetId: z.uuid(), altText: z.string(), label: z.string(), description: z.string(), position: z.number().int(), isCover: z.boolean() });

export const cmsBackupPayloadSchema = z.object({
  version: z.literal(1),
  exportedAt: isoDate,
  adminUsers: z.array(z.object({ userId: z.uuid(), email: z.email(), createdAt: isoDate, updatedAt: isoDate })),
  mediaAssets: z.array(z.object({ id: z.uuid(), bucket: z.string(), objectPath: z.string(), originalName: z.string(), mimeType: z.string(), sizeBytes: z.number().int(), width: z.number().int(), height: z.number().int(), blurDataUrl: z.string().nullable(), status: z.enum(["PENDING", "READY"]), createdBy: z.uuid(), createdAt: isoDate, updatedAt: isoDate })),
  skills: z.array(z.object({ id: z.uuid(), slug: z.string(), name: z.string(), category: z.enum(["FRONTEND", "BACKEND", "DATABASE", "DEVOPS", "TOOLS", "OTHER"]), showOnHome: z.boolean(), sortOrder: z.number().int(), status: z.enum(["ACTIVE", "ARCHIVED"]), archivedAt: nullableIsoDate, createdAt: isoDate, updatedAt: isoDate })),
  experiences: z.array(z.object({ id: z.uuid(), slug: z.string(), company: z.string(), role: z.string(), type: z.string(), summary: z.string(), startDate: isoDate, endDate: nullableIsoDate, isCurrent: z.boolean(), durationLabel: z.string().nullable(), monogram: z.string(), sortOrder: z.number().int(), status: z.enum(["ACTIVE", "ARCHIVED"]), coverMediaId: z.string().uuid().nullable(), imageAlt: z.string().nullable(), archivedAt: nullableIsoDate, createdAt: isoDate, updatedAt: isoDate, highlights: z.array(positionedText) })),
  projects: z.array(z.object({ id: z.uuid(), slug: z.string(), title: z.string(), role: z.string(), category: z.enum(["FRONTEND", "BACKEND", "FULLSTACK"]), summary: z.string(), liveUrl: z.string().nullable(), featured: z.boolean(), sortOrder: z.number().int(), status: z.enum(["ACTIVE", "ARCHIVED"]), relatedExperienceId: z.string().uuid().nullable(), impactSummary: z.string().nullable(), publishedAt: isoDate, archivedAt: nullableIsoDate, createdAt: isoDate, updatedAt: isoDate, highlights: z.array(positionedText), contributions: z.array(positionedText), impacts: z.array(positionedText), impactStats: z.array(impactStat), skills: z.array(projectSkill), media: z.array(projectMedia) })),
  mediaFiles: z.array(z.object({ mediaAssetId: z.uuid(), bucket: z.string(), objectPath: z.string(), file: z.string(), sha256: z.string().length(64), sizeBytes: z.number().int() })),
});

export type CmsBackupPayload = z.infer<typeof cmsBackupPayloadSchema>;
export type CmsBackupManifest = CmsBackupPayload & { checksum: string };

export function backupChecksum(payload: CmsBackupPayload) {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

export function parseBackupManifest(value: unknown): CmsBackupManifest {
  const input = z.object({ checksum: z.string().length(64) }).and(cmsBackupPayloadSchema).parse(value);
  const { checksum, ...payload } = input;
  if (backupChecksum(payload) !== checksum) throw new Error("Backup manifest checksum mismatch.");
  return { ...payload, checksum };
}
