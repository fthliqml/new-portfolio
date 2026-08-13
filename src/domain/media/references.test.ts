import { describe, expect, it } from "vitest";

import { assertMediaCanBeDeleted } from "./references";

describe("media reference protection", () => {
  it("allows unused media to be deleted", () => {
    expect(() =>
      assertMediaCanBeDeleted({ projectMedia: 0, experienceCovers: 0 }),
    ).not.toThrow();
  });

  it("rejects media still used by content", () => {
    expect(() =>
      assertMediaCanBeDeleted({ projectMedia: 2, experienceCovers: 1 }),
    ).toThrow(/3 content records/);
  });
});
