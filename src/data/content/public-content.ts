import "server-only";

import { unstable_cache } from "next/cache";

import { jsonContentRepository } from "@/data/content/json-content-repository";
import { prismaContentRepository } from "@/data/content/prisma-content-repository";

function repository() {
  return process.env.CONTENT_SOURCE === "database"
    ? prismaContentRepository
    : jsonContentRepository;
}

export const getPublicHomeContent = unstable_cache(
  () => repository().getHomeContent(),
  ["public-home-content"],
  { revalidate: 3_600, tags: ["public-content", "home-content"] },
);

export const getPublicProjects = unstable_cache(
  () => repository().getProjects(),
  ["public-projects"],
  { revalidate: 3_600, tags: ["public-content", "project-content"] },
);
