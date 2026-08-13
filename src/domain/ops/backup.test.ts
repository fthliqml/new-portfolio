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
