import experiencesData from "../../../prisma/seed/experiences.v1.json";
import projectsData from "../../../prisma/seed/projects.v1.json";
import type {
  ContentQueryOptions,
  ContentRepository,
} from "@/domain/content/repository";
import type {
  Experience,
  HomeContent,
  Project,
  Skill,
} from "@/domain/content/types";
import { buildSkillUnion } from "@/domain/migration/legacy";

const projects = projectsData as Project[];
const experiences = experiencesData as Experience[];
const skills: Skill[] = buildSkillUnion(
  projects.map(({ techStack }) => techStack),
).map((skill) => ({
  id: skill.slug,
  slug: skill.slug,
  name: skill.name,
  category: skill.category,
  showOnHome: skill.showOnHome,
  status: "active",
  sortOrder: skill.sortOrder,
}));

function visible<T extends { status?: string }>(
  items: T[],
  options?: ContentQueryOptions,
) {
  return options?.includeArchived
    ? items
    : items.filter((item) => item.status !== "archived");
}

export const jsonContentRepository: ContentRepository = {
  async getProjects(options) {
    return visible(projects, options);
  },

  async getProjectBySlug(slug, options) {
    return (
      visible(projects, options).find((project) => project.id === slug) ?? null
    );
  },

  async getProjectSlugs(options) {
    return visible(projects, options).map((project) => project.id);
  },

  async getExperiences(options) {
    return visible(experiences, options);
  },

  async getSkills(options) {
    return visible(skills, options);
  },

  async getHomeContent(): Promise<HomeContent> {
    return {
      featuredProjects: projects.filter((project) => project.featured),
      experiences,
      skills: skills.filter((skill) => skill.showOnHome),
    };
  },
};
