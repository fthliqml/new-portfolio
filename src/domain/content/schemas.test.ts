import { describe, expect, it } from "vitest";

import {
  experienceInputSchema,
  projectInputSchema,
  skillInputSchema,
} from "./schemas";

const skillId = "61cf70c8-5690-4844-9cc7-b4a032e7d761";
const mediaId = "d2d46a8e-a384-4a62-878c-2530b8ae07a5";

function activeProject() {
  return {
    slug: "learning-platform",
    title: "Learning Platform",
    role: "Fullstack Developer",
    category: "fullstack" as const,
    summary: "A centralized employee learning platform.",
    liveUrl: null,
    featured: true,
    sortOrder: 0,
    status: "active" as const,
    relatedExperienceId: null,
    impactSummary: null,
    highlights: [{ text: "Approval workflows", position: 0 }],
    contributions: [],
    impacts: [],
    impactStats: [],
    skillIds: [skillId],
    media: [
      {
        mediaAssetId: mediaId,
        altText: "Learning platform dashboard",
        label: "Dashboard",
        description: "An overview of active learning programs.",
        position: 0,
        isCover: true,
      },
    ],
  };
}

describe("projectInputSchema", () => {
  it("accepts a complete active project", () => {
    expect(projectInputSchema.safeParse(activeProject()).success).toBe(true);
  });

  it("requires publishing essentials for active projects", () => {
    const result = projectInputSchema.safeParse({
      ...activeProject(),
      highlights: [],
      skillIds: [],
      media: [],
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.issues.map((issue) => issue.path[0])).toEqual(
      expect.arrayContaining(["highlights", "skillIds", "media"]),
    );
  });

  it("requires exactly one cover image", () => {
    const project = activeProject();
    project.media[0].isCover = false;

    const result = projectInputSchema.safeParse(project);
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.issues).toContainEqual(
      expect.objectContaining({ path: ["media"] }),
    );
  });

  it("requires an impact narrative for case-study details", () => {
    const result = projectInputSchema.safeParse({
      ...activeProject(),
      contributions: [{ text: "Led discovery", position: 0 }],
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.issues.map((issue) => issue.path[0])).toEqual(
      expect.arrayContaining(["impactSummary", "impacts"]),
    );
  });
});

describe("experienceInputSchema", () => {
  const experience = {
    slug: "binar-academy",
    company: "Binar Academy",
    role: "Fullstack Web Developer",
    type: "Trainee",
    summary: "Completed an intensive development program.",
    startMonth: "2024-09",
    endMonth: "2024-12",
    isCurrent: false,
    durationLabel: "3 months",
    monogram: "BA",
    sortOrder: 0,
    status: "active" as const,
    coverMediaId: null,
    imageAlt: null,
    highlights: [{ text: "React and Node.js", position: 0 }],
  };

  it("accepts a complete past experience", () => {
    expect(experienceInputSchema.safeParse(experience).success).toBe(true);
  });

  it("rejects an end date before the start date", () => {
    const result = experienceInputSchema.safeParse({
      ...experience,
      endMonth: "2024-08",
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.issues).toContainEqual(
      expect.objectContaining({ path: ["endMonth"] }),
    );
  });

  it("requires image alternative text", () => {
    const result = experienceInputSchema.safeParse({
      ...experience,
      coverMediaId: mediaId,
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.issues).toContainEqual(
      expect.objectContaining({ path: ["imageAlt"] }),
    );
  });

  it("allows a current experience only without an end month", () => {
    expect(
      experienceInputSchema.safeParse({
        ...experience,
        isCurrent: true,
        endMonth: null,
      }).success,
    ).toBe(true);

    const invalid = experienceInputSchema.safeParse({
      ...experience,
      isCurrent: true,
      endMonth: "2025-01",
    });
    expect(invalid.success).toBe(false);
  });
});

describe("skillInputSchema", () => {
  it("rejects non-canonical slugs", () => {
    const result = skillInputSchema.safeParse({
      slug: "React JS",
      name: "React.js",
      category: "frontend",
      showOnHome: true,
      sortOrder: 0,
      status: "active",
    });

    expect(result.success).toBe(false);
  });
});
