import { describe, expect, it } from "vitest";

import { createSlug } from "./format";
import { assertSkillCanBeDeleted, nextSkillSortOrder } from "./skills";

describe("skill lifecycle", () => {
  it("normalizes case variants to the same uniqueness key", () => {
    expect(createSlug("Next JS")).toBe(createSlug("next-js"));
  });

  it("appends new skills without disturbing the existing order", () => {
    expect(nextSkillSortOrder(null)).toBe(0);
    expect(nextSkillSortOrder(5)).toBe(6);
  });

  it("protects referenced skills from permanent deletion", () => {
    expect(() => assertSkillCanBeDeleted(0)).not.toThrow();
    expect(() => assertSkillCanBeDeleted(1)).toThrow(/Referenced skills/);
  });
});
