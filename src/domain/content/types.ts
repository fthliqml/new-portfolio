export const projectCategories = [
  "all",
  "frontend",
  "backend",
  "fullstack",
] as const;

export type ProjectCategory = Exclude<
  (typeof projectCategories)[number],
  "all"
>;

export type ContentStatus = "active" | "archived";

export type SkillCategory =
  | "frontend"
  | "backend"
  | "database"
  | "devops"
  | "tools"
  | "other";

export interface ProjectImage {
  id?: string;
  src: string;
  alt: string;
  label: string;
  description: string;
  isCover?: boolean;
}

export interface ProjectImpactStat {
  value: string;
  label: string;
}

export interface Project {
  databaseId?: string;
  id: string;
  number: string;
  name: string;
  role: string;
  category: ProjectCategory;
  featured: boolean;
  status?: ContentStatus;
  experienceId?: string;
  experienceLabel?: string;
  summary: string;
  contributions?: string[];
  impactSummary?: string;
  impactStats?: ProjectImpactStat[];
  impacts?: string[];
  highlights: string[];
  techStack: string[];
  images: ProjectImage[];
  link: string | null;
  updatedAt?: string;
}

export interface Experience {
  databaseId?: string;
  id: string;
  role: string;
  company: string;
  type: string;
  period: string;
  duration: string;
  summary: string;
  highlights: string[];
  image: string | null;
  imageAlt: string;
  monogram: string;
  status?: ContentStatus;
  startDate?: string;
  endDate?: string | null;
  isCurrent?: boolean;
  updatedAt?: string;
}

export interface Skill {
  id: string;
  slug: string;
  name: string;
  category: SkillCategory;
  showOnHome: boolean;
  status: ContentStatus;
  sortOrder: number;
  updatedAt?: string;
}

export interface HomeContent {
  featuredProjects: Project[];
  experiences: Experience[];
  skills: Skill[];
}
