import { describe, expect, it } from "vitest";

import { jsonContentRepository } from "./json-content-repository";

describe("public content selection", () => {
  it("preserves legacy project ordering and stable slugs", async () => {
    const projects = await jsonContentRepository.getProjects();
    expect(projects.map((project) => project.id)).toEqual([
      "kra-lms",
      "flight-booking",
      "kalimantan-biodiversity-portal",
      "new-portfolio",
    ]);
  });

  it("returns only featured projects on the homepage", async () => {
    const content = await jsonContentRepository.getHomeContent();
    expect(content.featuredProjects.every((project) => project.featured)).toBe(
      true,
    );
  });

  it("preserves the homepage skill marquee order", async () => {
    const content = await jsonContentRepository.getHomeContent();
    expect(content.skills.map((skill) => skill.name)).toEqual([
      "Next.js",
      "Laravel",
      "Node.js",
      "Express",
      "Redis",
      "Redux",
    ]);
  });
});
