import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import ProjectMediaCarousel from "@/components/ProjectMediaCarousel";
import ProjectPageHeader from "@/components/ProjectPageHeader";
import {
  formatProjectCategory,
  getProjectBySlug,
  projects,
} from "@/lib/projects";

interface ProjectDetailPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.id }));
}

export async function generateMetadata({
  params,
}: ProjectDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) return {};

  return {
    title: project.name,
    description: project.summary,
    alternates: { canonical: `/projects/${project.id}` },
    openGraph: {
      title: `${project.name} | Muhammad Fatihul Iqmal`,
      description: project.summary,
      url: `/projects/${project.id}`,
      images: project.images[0]?.src ? [project.images[0].src] : undefined,
    },
  };
}

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) notFound();

  const projectIndex = projects.findIndex((item) => item.id === project.id);
  const previousProject =
    projects[(projectIndex - 1 + projects.length) % projects.length];
  const nextProject = projects[(projectIndex + 1) % projects.length];

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <ProjectPageHeader />

      <article>
        <header className="mx-auto max-w-7xl px-6 pb-12 pt-10 sm:px-10 sm:pb-16 sm:pt-14 lg:px-12">
          <Link
            href="/projects"
            className="group inline-flex items-center gap-3 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-foreground/50 transition-colors hover:text-foreground"
          >
            <ArrowLeft
              aria-hidden="true"
              className="size-4 transition-transform duration-300 group-hover:-translate-x-1"
            />
            All projects
          </Link>

          <div className="mt-10 grid gap-9 lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-end lg:gap-12">
            <div>
              <div className="flex flex-wrap items-center gap-3 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-foreground/45">
                <span>Project {project.number}</span>
                <span aria-hidden="true">/</span>
                <span>{formatProjectCategory(project.category)}</span>
              </div>
              <h1 className="mt-5 max-w-4xl text-[clamp(2.8rem,5.4vw,5.6rem)] font-semibold leading-[0.94] tracking-[-0.055em]">
                {project.name}
              </h1>
              <p className="mt-6 max-w-3xl text-base leading-7 text-foreground/62 sm:text-lg sm:leading-8">
                {project.summary}
              </p>

              {project.link && (
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group mt-7 inline-flex items-center gap-3 border-b border-foreground pb-1.5 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.2em]"
                >
                  Visit live project
                  <ArrowUpRight
                    aria-hidden="true"
                    className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </a>
              )}
            </div>

            <div className="border-l border-foreground/15 pl-5 lg:mb-2">
              <p className="font-mono text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-foreground/40">
                Role
              </p>
              <p className="mt-2 text-sm font-semibold leading-relaxed">
                {project.role}
              </p>
              <p className="mt-6 font-mono text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-foreground/40">
                Discipline
              </p>
              <p className="mt-2 text-sm font-semibold">
                {formatProjectCategory(project.category)} Development
              </p>
            </div>
          </div>
        </header>

        <section className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-12" aria-label="Project media">
          <ProjectMediaCarousel
            projectNumber={project.number}
            eagerFirstImage
            images={project.images}
          />
        </section>

        <section className="mx-auto grid max-w-7xl gap-14 px-6 py-20 sm:px-10 sm:py-24 lg:grid-cols-2 lg:gap-20 lg:px-12 lg:py-28">
          <div>
            <p className="border-b border-foreground/15 pb-4 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-foreground/40">
              Key highlights
            </p>
            <ol className="mt-6 space-y-5">
              {project.highlights.map((highlight, index) => (
                <li
                  key={highlight}
                  className="grid grid-cols-[2rem_1fr] gap-3 text-sm leading-relaxed text-foreground/68 sm:text-base"
                >
                  <span className="font-mono text-[0.58rem] font-semibold text-foreground/35">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{highlight}</span>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <p className="border-b border-foreground/15 pb-4 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-foreground/40">
              Technology
            </p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {project.techStack.map((technology) => (
                <li
                  key={technology}
                  className="rounded-full border border-foreground/15 px-3.5 py-2 text-xs font-semibold text-foreground/65 sm:text-sm"
                >
                  {technology}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <nav
          aria-label="Previous and next projects"
          className="border-t border-foreground/12"
        >
          <div className="mx-auto grid max-w-7xl md:grid-cols-2">
            <Link
              href={`/projects/${previousProject.id}`}
              className="group flex min-h-52 flex-col justify-between border-b border-foreground/12 px-6 py-9 transition-colors hover:bg-foreground hover:text-background sm:px-10 md:border-b-0 md:border-r lg:px-12"
            >
              <span className="flex items-center gap-3 font-mono text-[0.58rem] font-semibold uppercase tracking-[0.2em] opacity-50">
                <ArrowLeft aria-hidden="true" className="size-4 transition-transform duration-300 group-hover:-translate-x-1" />
                Previous project
              </span>
              <span className="mt-8 text-2xl font-semibold leading-tight tracking-[-0.035em] sm:text-3xl">
                {previousProject.name}
              </span>
            </Link>

            <Link
              href={`/projects/${nextProject.id}`}
              className="group flex min-h-52 flex-col items-end justify-between px-6 py-9 text-right transition-colors hover:bg-foreground hover:text-background sm:px-10 lg:px-12"
            >
              <span className="flex items-center gap-3 font-mono text-[0.58rem] font-semibold uppercase tracking-[0.2em] opacity-50">
                Next project
                <ArrowRight aria-hidden="true" className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
              <span className="mt-8 text-2xl font-semibold leading-tight tracking-[-0.035em] sm:text-3xl">
                {nextProject.name}
              </span>
            </Link>
          </div>
        </nav>
      </article>
    </main>
  );
}
