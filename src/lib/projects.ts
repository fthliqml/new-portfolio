import projectsData from "@/data/projects.json";
import { formatProjectCategory } from "@/domain/content/format";
import type { Project } from "@/domain/content/types";

export { formatProjectCategory };
export { projectCategories } from "@/domain/content/types";
export type {
  Project,
  ProjectCategory,
  ProjectImage,
  ProjectImpactStat,
} from "@/domain/content/types";

export const projects = projectsData as Project[];

export const featuredProjects = projects.filter((project) => project.featured);

export function getProjectBySlug(slug: string) {
  return projects.find((project) => project.id === slug);
}
