import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import ProjectMediaCarousel from "@/components/ProjectMediaCarousel";
import type { Project } from "@/lib/projects";

interface ProjectCardProps {
  project: Project;
  index: number;
}

export default function ProjectCard({ project, index }: ProjectCardProps) {
  const isReversed = index % 2 !== 0;

  return (
    <article
      data-project-card
      className={`grid gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-12 lg:will-change-[transform,opacity] ${
        isReversed ? "lg:[direction:rtl]" : ""
      }`}
    >
      <ProjectMediaCarousel
        projectNumber={project.number}
        eagerFirstImage={index === 0}
        images={project.images}
      />

      {/* Content */}
      <div className="flex flex-col justify-center lg:[direction:ltr]">
        <div>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.26em] text-foreground/45">
            {project.role}
          </p>

          <Link
            href={`/projects/${project.id}`}
            className="group/title mt-4 inline-flex items-start gap-3"
          >
            <h3 className="text-[clamp(1.5rem,4vw,2.5rem)] font-bold leading-[1.05] tracking-[-0.04em] decoration-foreground/35 decoration-1 underline-offset-6 transition-[text-decoration-color] group-hover/title:underline">
              {project.name}
            </h3>
            <ArrowUpRight
              aria-hidden="true"
              className="mt-1 size-5 shrink-0 text-foreground/35 transition-transform duration-300 group-hover/title:-translate-y-0.5 group-hover/title:translate-x-0.5 sm:size-6"
            />
          </Link>

          <p className="mt-4 max-w-[55ch] text-sm leading-relaxed text-foreground/65 sm:text-base sm:leading-[1.7]">
            {project.summary}
          </p>
        </div>

        {/* Highlights */}
        <div className="mt-6 sm:mt-8">
          <p className="mb-2 text-[0.6rem] font-bold uppercase tracking-[0.24em] text-foreground/40 sm:mb-3 sm:text-xs">
            Highlights
          </p>
          <ul className="space-y-2">
            {project.highlights.map((highlight, i) => (
              <li
                key={highlight}
                className="flex items-start gap-3 text-[0.75rem] leading-relaxed text-foreground/70 sm:text-sm"
              >
                <span className="mt-0.5 font-mono text-[0.6rem] font-semibold text-foreground/35">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Tech Stack */}
        <div className="mt-6 flex flex-wrap gap-2 sm:mt-8">
          {project.techStack.map((tech) => (
            <span
              key={tech}
              className="rounded-full border border-foreground/12 px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-foreground/55 transition-colors duration-300 hover:border-foreground/30 hover:text-foreground/80 sm:text-xs"
            >
              {tech}
            </span>
          ))}
        </div>

        <Link
          href={`/projects/${project.id}`}
          className="group/link mt-8 inline-flex w-fit items-center gap-3 border-b border-foreground/25 pb-1.5 font-mono text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-foreground transition-colors hover:border-foreground sm:mt-10"
        >
          View project
          <ArrowUpRight
            aria-hidden="true"
            className="size-4 transition-transform duration-300 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5"
          />
        </Link>
      </div>
    </article>
  );
}
