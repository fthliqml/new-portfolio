import { describe, expect, it } from "vitest";

import {
  createMediaObjectPath,
  sanitizeMediaFileName,
  validateMediaFile,
  verifyStoredMedia,
} from "./policy";

describe("media policy", () => {
  it("accepts supported images within the input limit", () => {
    expect(
      validateMediaFile({ name: "cover.png", type: "image/png", size: 5_000 }),
    ).toBeNull();
  });

  it("rejects unsupported MIME types and oversized files", () => {
    expect(
      validateMediaFile({ name: "cover.svg", type: "image/svg+xml", size: 500 }),
    ).toMatch(/JPG/);
    expect(
      validateMediaFile({
        name: "large.jpg",
        type: "image/jpeg",
        size: 10 * 1_024 * 1_024 + 1,
      }),
    ).toMatch(/10 MB/);
  });

  it("normalizes names and scopes object paths to the owner", () => {
    expect(sanitizeMediaFileName("Résumé Dashboard.PNG")).toBe(
      "resume-dashboard.webp",
    );
    expect(createMediaObjectPath("owner-id", "asset-id", "Cover.PNG")).toBe(
      "owner-id/asset-id/cover.webp",
    );
  });

  it("rejects a stored object whose metadata does not match", () => {
    expect(
      verifyStoredMedia(
        { sizeBytes: 1_024, mimeType: "image/webp" },
        { size: 1_024, mimetype: "image/webp" },
      ),
    ).toBe(true);
    expect(
      verifyStoredMedia(
        { sizeBytes: 1_024, mimeType: "image/webp" },
        { size: 2_048, mimetype: "image/webp" },
      ),
    ).toBe(false);
  });
});
