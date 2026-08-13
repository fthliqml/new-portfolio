import { describe, expect, it } from "vitest";

import {
  assertImmutableSlug,
  createSlug,
  formatExperienceDuration,
  formatExperiencePeriod,
  formatSequenceNumber,
} from "./format";

describe("content formatting", () => {
  it("creates canonical slugs", () => {
    expect(createSlug("  Café & Learning Platform  ")).toBe(
      "cafe-learning-platform",
    );
  });

  it("rejects changes to a persisted slug", () => {
    expect(() => assertImmutableSlug("portfolio", "new-portfolio")).toThrow(
      "slug cannot be changed",
    );
    expect(() => assertImmutableSlug("portfolio", "portfolio")).not.toThrow();
  });

  it("formats stable sequence numbers", () => {
    expect(formatSequenceNumber(0)).toBe("01");
    expect(formatSequenceNumber(11)).toBe("12");
  });

  it("formats an experience period in UTC", () => {
    expect(
      formatExperiencePeriod(
        new Date("2025-08-01T00:00:00.000Z"),
        new Date("2026-06-01T00:00:00.000Z"),
        false,
      ),
    ).toBe("Aug 2025 — Jun 2026");
  });

  it("uses a curated duration when supplied", () => {
    expect(
      formatExperienceDuration(
        new Date("2025-08-01T00:00:00.000Z"),
        new Date("2026-06-01T00:00:00.000Z"),
        false,
        "10 months",
      ),
    ).toBe("10 months");
  });

  it("calculates a duration when no override is supplied", () => {
    expect(
      formatExperienceDuration(
        new Date("2024-01-01T00:00:00.000Z"),
        new Date("2025-03-01T00:00:00.000Z"),
        false,
      ),
    ).toBe("1 year 2 months");
  });
});
