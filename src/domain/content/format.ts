import type {
  ContentStatus,
  ProjectCategory,
  SkillCategory,
} from "@/domain/content/types";

const slugUnsafeCharacters = /[^a-z0-9]+/g;
const slugEdgeHyphens = /^-+|-+$/g;

export function createSlug(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(slugUnsafeCharacters, "-")
    .replace(slugEdgeHyphens, "");
}

export function assertImmutableSlug(original: string, candidate: string) {
  if (original !== candidate) {
    throw new Error("The slug cannot be changed after the content is created.");
  }
}

export function formatSequenceNumber(index: number) {
  return String(index + 1).padStart(2, "0");
}

export function formatProjectCategory(category: ProjectCategory) {
  if (category === "fullstack") return "Fullstack";

  return `${category[0].toUpperCase()}${category.slice(1)}`;
}

export function toProjectCategory(value: string): ProjectCategory {
  return value.toLowerCase() as ProjectCategory;
}

export function toSkillCategory(value: string): SkillCategory {
  return value.toLowerCase() as SkillCategory;
}

export function toContentStatus(value: string): ContentStatus {
  return value.toLowerCase() as ContentStatus;
}

export function toIsoDate(value: Date) {
  return value.toISOString().slice(0, 10);
}

export function formatExperiencePeriod(
  startDate: Date,
  endDate: Date | null,
  isCurrent: boolean,
) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
  const start = formatter.format(startDate);
  const end = isCurrent || !endDate ? "Present" : formatter.format(endDate);

  return `${start} — ${end}`;
}

export function formatExperienceDuration(
  startDate: Date,
  endDate: Date | null,
  isCurrent: boolean,
  override?: string | null,
) {
  if (override?.trim()) return override.trim();

  const effectiveEnd = isCurrent || !endDate ? new Date() : endDate;
  const months = Math.max(
    1,
    (effectiveEnd.getUTCFullYear() - startDate.getUTCFullYear()) * 12 +
      effectiveEnd.getUTCMonth() -
      startDate.getUTCMonth(),
  );

  if (months < 12) return `${months} ${months === 1 ? "month" : "months"}`;

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  const yearLabel = `${years} ${years === 1 ? "year" : "years"}`;

  if (remainingMonths === 0) return yearLabel;

  return `${yearLabel} ${remainingMonths} ${remainingMonths === 1 ? "month" : "months"}`;
}
