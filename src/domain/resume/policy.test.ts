import { describe, expect, it } from "vitest";

import {
  createResumeObjectPath,
  isOwnedResumeObjectPath,
  sanitizeResumeFileName,
  validateResumeFile,
  verifyStoredResume,
} from "./policy";

const userId = "98d5c2f0-fff2-48d9-9a29-7dbf09d285c3";
const uploadId = "6fdb2818-1984-4aad-8467-87fcddc1737f";

describe("resume upload policy", () => {
  it("accepts a non-empty PDF within the free-tier size budget", () => {
    expect(
      validateResumeFile({ name: "Iqmal CV.pdf", type: "application/pdf", size: 512_000 }),
    ).toBeNull();
  });

  it("rejects non-PDF and oversized files", () => {
    expect(validateResumeFile({ name: "cv.docx", type: "application/pdf", size: 10 })).toMatch(/PDF/);
    expect(validateResumeFile({ name: "cv.pdf", type: "text/plain", size: 10 })).toMatch(/PDF/);
    expect(validateResumeFile({ name: "cv.pdf", type: "application/pdf", size: 6 * 1_024 * 1_024 })).toMatch(/5 MB/);
  });

  it("creates a normalized owner-scoped object path", () => {
    expect(sanitizeResumeFileName("Muhammad Fátihul Iqmal — CV 2026.PDF")).toBe(
      "muhammad-fatihul-iqmal-cv-2026.pdf",
    );
    const path = createResumeObjectPath(userId, uploadId, "Iqmal CV.pdf");
    expect(path).toBe(`${userId}/resume/${uploadId}/iqmal-cv.pdf`);
    expect(isOwnedResumeObjectPath(userId, path)).toBe(true);
    expect(isOwnedResumeObjectPath("00000000-0000-0000-0000-000000000000", path)).toBe(false);
  });

  it("verifies stored PDF metadata when Supabase provides it", () => {
    expect(
      verifyStoredResume(
        { sizeBytes: 8000, mimeType: "application/pdf" },
        { size: 8000, mimetype: "application/pdf" },
      ),
    ).toBe(true);
    expect(
      verifyStoredResume(
        { sizeBytes: 8000, mimeType: "application/pdf" },
        { size: 7000, mimetype: "application/pdf" },
      ),
    ).toBe(false);
  });
});
