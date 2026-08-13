import type {
  Experience,
  HomeContent,
  Project,
  Skill,
} from "@/domain/content/types";

export interface ContentQueryOptions {
  includeArchived?: boolean;
}

export interface ContentRepository {
  getProjects(options?: ContentQueryOptions): Promise<Project[]>;
  getProjectBySlug(
    slug: string,
    options?: ContentQueryOptions,
  ): Promise<Project | null>;
  getProjectSlugs(options?: ContentQueryOptions): Promise<string[]>;
  getExperiences(options?: ContentQueryOptions): Promise<Experience[]>;
  getSkills(options?: ContentQueryOptions): Promise<Skill[]>;
  getHomeContent(): Promise<HomeContent>;
}
