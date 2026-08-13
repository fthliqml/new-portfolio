import "server-only";

import { unstable_cache } from "next/cache";

import { prismaContentRepository } from "@/data/content/prisma-content-repository";

export const getPublicHomeContent = unstable_cache(
  () => prismaContentRepository.getHomeContent(),
  ["public-home-content"],
  { revalidate: 3_600, tags: ["public-content", "home-content"] },
);

export const getPublicProjects = unstable_cache(
  () => prismaContentRepository.getProjects(),
  ["public-projects"],
  { revalidate: 3_600, tags: ["public-content", "project-content"] },
);
