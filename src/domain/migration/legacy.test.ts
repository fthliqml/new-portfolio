import { describe, expect, it } from "vitest";

import {
  assertUniqueLegacySlugs,
  buildSkillUnion,
  inferSkillCategory,
  parseLegacyPeriod,
  sourceChecksum,
} from "./legacy";

describe("legacy migration planning", () => {
  it("parses both legacy period separators", () => {
    expect(parseLegacyPeriod("Aug 2025 — Jun 2026")).toMatchObject({
      isCurrent: false,
      startDate: new Date("2025-08-01T00:00:00.000Z"),
      endDate: new Date("2026-06-01T00:00:00.000Z"),
    });
    expect(parseLegacyPeriod("Sep 2024 - Present")).toMatchObject({
      isCurrent: true,
      endDate: null,
    });
  });

  it("builds a stable case-insensitive skill union", () => {
    const union = buildSkillUnion([["React", "Next.js"], ["react", "Redis"]]);
    expect(union.filter((skill) => skill.slug === "react")).toHaveLength(1);
    expect(union.slice(0, 2).map((skill) => skill.slug)).toEqual([
      "next-js",
      "laravel",
    ]);
  });

  it("assigns pragmatic categories", () => {
    expect(inferSkillCategory("PostgreSQL")).toBe("database");
    expect(inferSkillCategory("Laravel")).toBe("backend");
    expect(inferSkillCategory("Tailwind CSS")).toBe("frontend");
  });

  it("rejects duplicate source slugs before writes", () => {
    expect(() =>
      assertUniqueLegacySlugs([{ id: "same" }, { id: "same" }], "Projects"),
    ).toThrow(/duplicate slug/);
  });

  it("produces deterministic source checksums", () => {
    expect(sourceChecksum({ version: 1 })).toBe(sourceChecksum({ version: 1 }));
    expect(sourceChecksum({ version: 1 })).not.toBe(sourceChecksum({ version: 2 }));
  });
});
