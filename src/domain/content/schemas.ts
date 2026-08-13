import { z } from "zod";

import { createSlug } from "@/domain/content/format";

const slugSchema = z
  .string()
  .trim()
  .min(2)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use a lowercase URL-safe slug.")
  .refine((value) => createSlug(value) === value, "The slug is not canonical.");

const requiredText = (max: number) => z.string().trim().min(1).max(max);
const optionalText = (max: number) =>
  z.string().trim().max(max).nullable().optional();

export const orderedTextSchema = z.object({
  id: z.string().uuid().optional(),
  text: requiredText(2_000),
  position: z.number().int().nonnegative(),
});

export const impactStatSchema = z.object({
  id: z.string().uuid().optional(),
  value: requiredText(80),
  label: requiredText(120),
  position: z.number().int().nonnegative(),
});

export const projectMediaInputSchema = z.object({
  id: z.string().uuid().optional(),
  mediaAssetId: z.string().uuid(),
  altText: requiredText(320),
  label: requiredText(120),
  description: requiredText(1_000),
  position: z.number().int().nonnegative(),
  isCover: z.boolean(),
});

export const projectInputSchema = z
  .object({
    slug: slugSchema,
    title: requiredText(160),
    role: requiredText(120),
    category: z.enum(["frontend", "backend", "fullstack"]),
    summary: requiredText(2_000),
    liveUrl: z.url().max(2_048).nullable().optional(),
    featured: z.boolean().default(false),
    sortOrder: z.number().int().nonnegative(),
    status: z.enum(["active", "archived"]),
    relatedExperienceId: z.string().uuid().nullable().optional(),
    impactSummary: optionalText(2_000),
    highlights: z.array(orderedTextSchema).max(20),
    contributions: z.array(orderedTextSchema).max(30),
    impacts: z.array(orderedTextSchema).max(30),
    impactStats: z.array(impactStatSchema).max(12),
    skillIds: z.array(z.string().uuid()).max(30),
    media: z.array(projectMediaInputSchema).max(30),
  })
  .superRefine((project, context) => {
    const orderedCollections = [
      ["highlights", project.highlights],
      ["contributions", project.contributions],
      ["impacts", project.impacts],
      ["impactStats", project.impactStats],
      ["media", project.media],
    ] as const;

    for (const [field, items] of orderedCollections) {
      const positions = items.map(({ position }) => position);
      if (new Set(positions).size !== positions.length) {
        context.addIssue({
          code: "custom",
          path: [field],
          message: "Each item must have a unique position.",
        });
      }
    }

    if (new Set(project.skillIds).size !== project.skillIds.length) {
      context.addIssue({
        code: "custom",
        path: ["skillIds"],
        message: "A skill can only be selected once.",
      });
    }

    const mediaAssetIds = project.media.map(({ mediaAssetId }) => mediaAssetId);
    if (new Set(mediaAssetIds).size !== mediaAssetIds.length) {
      context.addIssue({
        code: "custom",
        path: ["media"],
        message: "A media asset can only be attached once.",
      });
    }

    const hasCaseStudy =
      project.contributions.length > 0 ||
      project.impacts.length > 0 ||
      project.impactStats.length > 0 ||
      Boolean(project.impactSummary);

    if (hasCaseStudy && !project.impactSummary) {
      context.addIssue({
        code: "custom",
        path: ["impactSummary"],
        message: "An impact summary is required for a structured case study.",
      });
    }

    if (project.contributions.length > 0 && project.impacts.length === 0) {
      context.addIssue({
        code: "custom",
        path: ["impacts"],
        message: "Add at least one impact when contributions are documented.",
      });
    }

    if (project.status === "active") {
      if (project.highlights.length === 0) {
        context.addIssue({
          code: "custom",
          path: ["highlights"],
          message: "An active project needs at least one highlight.",
        });
      }

      if (project.skillIds.length === 0) {
        context.addIssue({
          code: "custom",
          path: ["skillIds"],
          message: "An active project needs at least one skill.",
        });
      }

      if (project.media.length === 0) {
        context.addIssue({
          code: "custom",
          path: ["media"],
          message: "An active project needs at least one image.",
        });
      }
    }

    if (project.media.length > 0) {
      const coverCount = project.media.filter((item) => item.isCover).length;
      if (coverCount !== 1) {
        context.addIssue({
          code: "custom",
          path: ["media"],
          message: "Select exactly one cover image.",
        });
      }
    }
  });

const monthSchema = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Use the YYYY-MM format.");

export const experienceInputSchema = z
  .object({
    slug: slugSchema,
    company: requiredText(180),
    role: requiredText(140),
    type: requiredText(80),
    summary: requiredText(2_000),
    startMonth: monthSchema,
    endMonth: monthSchema.nullable(),
    isCurrent: z.boolean(),
    durationLabel: optionalText(80),
    monogram: requiredText(8),
    sortOrder: z.number().int().nonnegative(),
    status: z.enum(["active", "archived"]),
    coverMediaId: z.string().uuid().nullable(),
    imageAlt: optionalText(320),
    highlights: z.array(orderedTextSchema).max(20),
  })
  .superRefine((experience, context) => {
    const positions = experience.highlights.map(({ position }) => position);
    if (new Set(positions).size !== positions.length) {
      context.addIssue({
        code: "custom",
        path: ["highlights"],
        message: "Each highlight must have a unique position.",
      });
    }

    if (experience.isCurrent && experience.endMonth) {
      context.addIssue({
        code: "custom",
        path: ["endMonth"],
        message: "A current experience cannot have an end month.",
      });
    }

    if (!experience.isCurrent && !experience.endMonth) {
      context.addIssue({
        code: "custom",
        path: ["endMonth"],
        message: "An end month is required unless this role is current.",
      });
    }

    if (
      experience.endMonth &&
      experience.startMonth.localeCompare(experience.endMonth) > 0
    ) {
      context.addIssue({
        code: "custom",
        path: ["endMonth"],
        message: "The end month cannot be before the start month.",
      });
    }

    if (experience.coverMediaId && !experience.imageAlt) {
      context.addIssue({
        code: "custom",
        path: ["imageAlt"],
        message: "Alternative text is required when a cover image is selected.",
      });
    }
  });

export const skillInputSchema = z.object({
  slug: slugSchema,
  name: requiredText(80),
  category: z.enum([
    "frontend",
    "backend",
    "database",
    "devops",
    "tools",
    "other",
  ]),
  showOnHome: z.boolean().default(false),
  sortOrder: z.number().int().nonnegative(),
  status: z.enum(["active", "archived"]),
});

export type ProjectInput = z.infer<typeof projectInputSchema>;
export type ExperienceInput = z.infer<typeof experienceInputSchema>;
export type SkillInput = z.infer<typeof skillInputSchema>;
