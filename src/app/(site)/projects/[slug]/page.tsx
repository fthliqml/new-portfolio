import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import ProjectMediaCarousel from "@/components/ProjectMediaCarousel";
import ProjectPageHeader from "@/components/ProjectPageHeader";
import { getPublicProjects } from "@/data/content/public-content";
import { formatProjectCategory } from "@/domain/content/format";
import { siteConfig } from "@/lib/site";

interface ProjectDetailPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 3600;

async function getProjectContext(slug: string) {
  const projects = await getPublicProjects();
  const projectIndex = projects.findIndex((project) => project.id === slug);
  if (projectIndex < 0) return null;

  return {
    project: projects[projectIndex],
    previousProject:
      projects[(projectIndex - 1 + projects.length) % projects.length],
    nextProject: projects[(projectIndex + 1) % projects.length],
  };
}

export async function generateMetadata({
  params,
}: ProjectDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const context = await getProjectContext(slug);

  if (!context) return {};
  const { project } = context;

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
  const context = await getProjectContext(slug);

  if (!context) notFound();
  const { project, previousProject, nextProject } = context;
  const hasProjectStory = Boolean(
    project.contributions?.length && project.impacts?.length,
  );

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

              <div className="mt-7 flex flex-wrap items-center gap-x-7 gap-y-4">
                <a
                  href={siteConfig.projectArchive}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-3 border-b border-foreground pb-1.5 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.2em]"
                >
                  View project archive
                  <ArrowUpRight
                    aria-hidden="true"
                    className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </a>

                {project.link && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-3 border-b border-foreground pb-1.5 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.2em]"
                  >
                    Visit live project
                    <ArrowUpRight
                      aria-hidden="true"
                      className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </a>
                )}
              </div>
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

              {project.experienceId && (
                <>
                  <p className="mt-6 font-mono text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-foreground/40">
                    Related experience
                  </p>
                  <Link
                    href={`/#experience-${project.experienceId}`}
                    className="group mt-2 inline-flex items-start gap-2 text-sm font-semibold leading-relaxed underline decoration-foreground/20 underline-offset-4 transition-[text-decoration-color] hover:decoration-foreground"
                  >
                    <span>{project.experienceLabel ?? "View experience"}</span>
                    <ArrowUpRight
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </Link>
                </>
              )}
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

        {hasProjectStory ? (
          <section className="mx-auto max-w-7xl px-6 py-20 sm:px-10 sm:py-24 lg:px-12 lg:py-28">
            <header className="mb-10 border-b border-foreground/15 pb-7 sm:mb-14 sm:flex sm:items-end sm:justify-between sm:gap-8">
              <div>
                <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-foreground/40">
                  Project story
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.045em] sm:text-5xl">
                  Contribution &amp; impact
                </h2>
              </div>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-foreground/50 sm:mt-0 sm:text-right">
                What I owned throughout delivery and what changed after the
                platform was introduced.
              </p>
            </header>

            <div className="grid gap-10 lg:grid-cols-[minmax(0,1.12fr)_minmax(22rem,0.88fr)] lg:items-start lg:gap-12">
              <div>
                <div className="flex items-center justify-between gap-5 pb-4">
                  <h3 className="text-xl font-semibold tracking-[-0.025em] sm:text-2xl">
                    My Contribution
                  </h3>
                  <span className="font-mono text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-foreground/35">
                    End-to-end ownership
                  </span>
                </div>
                <ol>
                  {project.contributions?.map((contribution, index) => (
                    <li
                      key={contribution}
                      className="grid grid-cols-[2.25rem_1fr] gap-3 border-t border-foreground/12 py-4 text-sm leading-relaxed text-foreground/68 sm:grid-cols-[2.75rem_1fr] sm:gap-4 sm:py-5 sm:text-base"
                    >
                      <span className="font-mono text-[0.58rem] font-semibold text-foreground/35">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span>{contribution}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <aside className="rounded-[1.75rem] bg-foreground p-7 text-background sm:p-9 lg:sticky lg:top-24">
                <p className="font-mono text-[0.6rem] font-semibold uppercase tracking-[0.24em] text-background/45">
                  Impact
                </p>
                <p className="mt-5 text-xl font-medium leading-relaxed tracking-[-0.025em] text-background/90 sm:text-2xl">
                  {project.impactSummary}
                </p>

                {project.impactStats && project.impactStats.length > 0 && (
                  <dl className="mt-8 grid grid-cols-2 gap-3 border-y border-background/15 py-6">
                    {project.impactStats.map((stat) => (
                      <div key={stat.label}>
                        <dd className="text-4xl font-semibold tracking-[-0.06em] sm:text-5xl">
                          {stat.value}
                        </dd>
                        <dt className="mt-2 font-mono text-[0.55rem] font-semibold uppercase tracking-[0.2em] text-background/45">
                          {stat.label}
                        </dt>
                      </div>
                    ))}
                  </dl>
                )}

                <ul className="mt-7 space-y-4">
                  {project.impacts?.map((impact) => (
                    <li
                      key={impact}
                      className="grid grid-cols-[0.45rem_1fr] gap-3 text-sm leading-relaxed text-background/68"
                    >
                      <span className="mt-2 size-1.5 rounded-full bg-background/65" />
                      <span>{impact}</span>
                    </li>
                  ))}
                </ul>
              </aside>
            </div>

            <div className="mt-14 border-t border-foreground/15 pt-7 sm:mt-20 sm:flex sm:items-start sm:justify-between sm:gap-10">
              <div>
                <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-foreground/40">
                  Technology
                </p>
                <p className="mt-2 text-sm text-foreground/48">
                  Core tools used to deliver the platform.
                </p>
              </div>
              <ul className="mt-5 flex max-w-2xl flex-wrap gap-2 sm:mt-0 sm:justify-end">
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
        ) : (
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
        )}

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
