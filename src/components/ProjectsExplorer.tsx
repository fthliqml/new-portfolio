"use client";

import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import {
  formatProjectCategory,
  projectCategories,
  type Project,
} from "@/lib/projects";

type ProjectFilter = (typeof projectCategories)[number];

const filterLabels: Record<ProjectFilter, string> = {
  all: "All Projects",
  frontend: "Frontend",
  backend: "Backend",
  fullstack: "Fullstack",
};

interface ProjectsExplorerProps {
  projects: Project[];
}

export default function ProjectsExplorer({ projects }: ProjectsExplorerProps) {
  const [activeFilter, setActiveFilter] = useState<ProjectFilter>("all");

  const visibleProjects = useMemo(
    () =>
      activeFilter === "all"
        ? projects
        : projects.filter((project) => project.category === activeFilter),
    [activeFilter, projects],
  );

  const categoryCounts = useMemo(
    () =>
      projectCategories.reduce<Record<ProjectFilter, number>>(
        (counts, category) => {
          counts[category] =
            category === "all"
              ? projects.length
              : projects.filter((project) => project.category === category)
                  .length;
          return counts;
        },
        { all: 0, frontend: 0, backend: 0, fullstack: 0 },
      ),
    [projects],
  );

  return (
    <section aria-labelledby="project-index-heading">
      <div className="flex flex-col gap-7 border-y border-foreground/12 py-7 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p
            id="project-index-heading"
            className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-foreground/45"
          >
            Filter by discipline
          </p>
          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter projects">
            {projectCategories.map((category) => {
              const isActive = category === activeFilter;

              return (
                <button
                  key={category}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setActiveFilter(category)}
                  className={`rounded-full border px-4 py-2.5 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.14em] transition-[background-color,color,border-color,transform] duration-300 hover:-translate-y-0.5 sm:px-5 ${
                    isActive
                      ? "border-foreground bg-foreground text-background"
                      : "border-foreground/15 text-foreground/60 hover:border-foreground/40 hover:text-foreground"
                  }`}
                >
                  {filterLabels[category]}
                  <span className="ml-2 opacity-55">
                    {String(categoryCounts[category]).padStart(2, "0")}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <p aria-live="polite" className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-foreground/45">
          Showing {String(visibleProjects.length).padStart(2, "0")} project
          {visibleProjects.length === 1 ? "" : "s"}
        </p>
      </div>

      {visibleProjects.length > 0 ? (
        <div className="grid gap-x-7 gap-y-12 py-12 md:grid-cols-2 lg:gap-x-10 lg:gap-y-16 lg:py-16">
          {visibleProjects.map((project) => {
            const cover = project.images[0];

            return (
              <article key={project.id} className="group min-w-0">
                <Link
                  href={`/projects/${project.id}`}
                  className="relative block aspect-[16/10] overflow-hidden rounded-2xl bg-secondary"
                  aria-label={`View ${project.name}`}
                >
                  {cover && (
                    <Image
                      src={cover.src}
                      alt={cover.alt}
                      fill
                      sizes="(min-width: 768px) 50vw, 100vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035] motion-reduce:transition-none"
                    />
                  )}
                  <span className="absolute inset-0 bg-linear-to-t from-black/55 via-black/0 to-black/8" />
                  <span className="absolute left-5 top-5 rounded-full border border-white/18 bg-black/35 px-3 py-2 font-mono text-[0.56rem] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-md sm:left-6 sm:top-6">
                    {formatProjectCategory(project.category)}
                  </span>
                  <span className="absolute bottom-5 right-5 grid size-11 place-items-center rounded-full bg-white text-black transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 sm:bottom-6 sm:right-6">
                    <ArrowUpRight aria-hidden="true" className="size-5" />
                  </span>
                </Link>

                <div className="mt-5 flex items-start justify-between gap-5 border-t border-foreground/12 pt-5">
                  <div className="min-w-0">
                    <p className="font-mono text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-foreground/40">
                      {project.number} / {project.role}
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold leading-tight tracking-[-0.035em] sm:text-3xl">
                      <Link href={`/projects/${project.id}`} className="hover:underline hover:decoration-1 hover:underline-offset-5">
                        {project.name}
                      </Link>
                    </h2>
                    <p className="mt-3 line-clamp-3 max-w-[58ch] text-sm leading-relaxed text-foreground/55">
                      {project.summary}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="grid min-h-80 place-items-center border-b border-foreground/12 text-center">
          <div>
            <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-foreground/40">
              Nothing here yet
            </p>
            <p className="mt-3 text-2xl font-semibold tracking-[-0.035em]">
              Backend projects are coming soon.
            </p>
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              className="mt-6 border-b border-foreground pb-1 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.18em]"
            >
              View all projects
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
