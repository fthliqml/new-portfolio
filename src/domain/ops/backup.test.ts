import { describe, expect, it } from "vitest";

import {
  backupChecksum,
  cmsBackupPayloadSchema,
  parseBackupManifest,
} from "./backup";

function payload() {
  return cmsBackupPayloadSchema.parse({
    version: 1,
    exportedAt: "2026-08-13T00:00:00.000Z",
    adminUsers: [],
    mediaAssets: [],
    skills: [],
    experiences: [],
    projects: [],
    mediaFiles: [],
  });
}

describe("CMS backup manifests", () => {
  it("round-trips a valid export manifest", () => {
    const data = payload();
    const manifest = { ...data, checksum: backupChecksum(data) };
    expect(parseBackupManifest(JSON.parse(JSON.stringify(manifest)))).toEqual(
      manifest,
    );
  });

  it("protects managed resume metadata and files with the manifest checksum", () => {
    const data = cmsBackupPayloadSchema.parse({
      ...payload(),
      resumeAssets: [
        {
          id: "primary",
          bucket: "portfolio-files",
          objectPath:
            "98d5c2f0-fff2-48d9-9a29-7dbf09d285c3/resume/file-id/resume.pdf",
          originalName: "resume.pdf",
          mimeType: "application/pdf",
          sizeBytes: 1024,
          createdBy: "98d5c2f0-fff2-48d9-9a29-7dbf09d285c3",
          createdAt: "2026-08-16T00:00:00.000Z",
          updatedAt: "2026-08-16T00:00:00.000Z",
        },
      ],
      resumeFiles: [
        {
          resumeAssetId: "primary",
          bucket: "portfolio-files",
          objectPath:
            "98d5c2f0-fff2-48d9-9a29-7dbf09d285c3/resume/file-id/resume.pdf",
          file: "resume/primary.pdf",
          sha256: "a".repeat(64),
          sizeBytes: 1024,
        },
      ],
    });
    const manifest = { ...data, checksum: backupChecksum(data) };

    expect(parseBackupManifest(JSON.parse(JSON.stringify(manifest)))).toEqual(
      manifest,
    );
  });

  it("rejects metadata changed after export", () => {
    const data = payload();
    const manifest = { ...data, checksum: backupChecksum(data) };
    expect(() =>
      parseBackupManifest({ ...manifest, exportedAt: "2026-08-14T00:00:00.000Z" }),
    ).toThrow(/checksum mismatch/);
  });

  it("rejects an unsupported backup version", () => {
    const data = payload();
    expect(() =>
      parseBackupManifest({ ...data, version: 2, checksum: backupChecksum(data) }),
    ).toThrow();
  });
});
