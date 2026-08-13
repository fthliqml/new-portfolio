import { describe, expect, it } from "vitest";

import {
  assertPermanentDeleteAllowed,
  destructiveImpact,
} from "./lifecycle";

describe("content lifecycle safeguards", () => {
  it("only permits permanent deletion after archive", () => {
    expect(() =>
      assertPermanentDeleteAllowed({ entity: "project", archived: false }),
    ).toThrow(/Only archived/);
    expect(() =>
      assertPermanentDeleteAllowed({ entity: "project", archived: true }),
    ).not.toThrow();
  });

  it("blocks permanent deletion of referenced skills", () => {
    expect(() =>
      assertPermanentDeleteAllowed({
        entity: "skill",
        archived: true,
        projectReferences: 2,
      }),
    ).toThrow(/Referenced skills/);
  });

  it("describes experience relationship cleanup before confirmation", () => {
    expect(destructiveImpact("experience", 2)).toMatch(
      /2 related projects.*no related experience/,
    );
  });

  it("makes clear that project media remains reusable", () => {
    expect(destructiveImpact("project")).toMatch(/media.*remain intact/);
  });
});
