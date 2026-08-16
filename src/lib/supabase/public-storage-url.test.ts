import { describe, expect, it } from "vitest";

import { createPublicStorageUrl } from "./public-storage-url";

describe("public Storage URLs", () => {
  it("encodes every object path segment", () => {
    expect(
      createPublicStorageUrl(
        "https://example.supabase.co/",
        "portfolio-files",
        "owner/resume/id/Iqmal CV.pdf",
      ),
    ).toBe(
      "https://example.supabase.co/storage/v1/object/public/portfolio-files/owner/resume/id/Iqmal%20CV.pdf",
    );
  });

  it("adds an encoded download filename only when requested", () => {
    const url = createPublicStorageUrl(
      "https://example.supabase.co",
      "portfolio-files",
      "owner/resume/id/cv.pdf",
      "Iqmal CV.pdf",
    );
    expect(new URL(url).searchParams.get("download")).toBe("Iqmal CV.pdf");
  });
});
