import { createHash } from "node:crypto";

import { createSlug } from "@/domain/content/format";
import type { SkillCategory } from "@/domain/content/types";

const monthIndexes: Record<string, number> = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11,
};

export const legacyHomeSkills = [
  "Next.js",
  "Laravel",
  "Node.js",
  "Express",
  "Redis",
  "Redux",
] as const;

export function parseLegacyPeriod(period: string) {
  const parts = period.split(/\s+(?:—|-)\s+/).map((part) => part.trim());
  if (parts.length !== 2) throw new Error(`Invalid legacy period: ${period}`);

  function parsePart(value: string) {
    if (value.toLowerCase() === "present") return null;
    const match = /^(\w{3})\s+(\d{4})$/.exec(value);
    const month = match ? monthIndexes[match[1].toLowerCase()] : undefined;
    if (!match || month === undefined) {
      throw new Error(`Invalid legacy month: ${value}`);
    }
    return new Date(Date.UTC(Number(match[2]), month, 1));
  }

  const startDate = parsePart(parts[0]);
  const endDate = parsePart(parts[1]);
  if (!startDate) throw new Error(`Missing start date: ${period}`);
  if (endDate && endDate < startDate) {
    throw new Error(`Legacy period ends before it starts: ${period}`);
  }
  return { startDate, endDate, isCurrent: endDate === null };
}

export function inferSkillCategory(name: string): SkillCategory {
  const normalized = name.toLowerCase();
  if (/postgres|mysql|mongo|redis|database/.test(normalized)) return "database";
  if (/docker|vercel|supabase|deployment/.test(normalized)) return "devops";
  if (/figma|swagger|postman|git/.test(normalized)) return "tools";
  if (/laravel|php|node|express|rest api|prisma/.test(normalized)) return "backend";
  if (/react|next|redux|tailwind|blade|alpine|livewire|typescript|javascript/.test(normalized)) {
    return "frontend";
  }
  return "other";
}

export function buildSkillUnion(projectStacks: string[][]) {
  const names = [...legacyHomeSkills, ...projectStacks.flat()];
  const bySlug = new Map<string, string>();
  for (const name of names) {
    const slug = createSlug(name);
    if (!slug) throw new Error(`Cannot create a skill slug for: ${name}`);
    if (!bySlug.has(slug)) bySlug.set(slug, name);
  }
  return [...bySlug].map(([slug, name], sortOrder) => ({
    slug,
    name,
    sortOrder,
    showOnHome: legacyHomeSkills.some((skill) => createSlug(skill) === slug),
    category: inferSkillCategory(name),
  }));
}

export function sourceChecksum(value: unknown) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

export function assertUniqueLegacySlugs(
  values: Array<{ id: string }>,
  label: string,
) {
  const slugs = values.map(({ id }) => id);
  if (slugs.some((slug) => createSlug(slug) !== slug)) {
    throw new Error(`${label} contains a non-canonical slug.`);
  }
  if (new Set(slugs).size !== slugs.length) {
    throw new Error(`${label} contains a duplicate slug.`);
  }
}
