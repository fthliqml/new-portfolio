import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import ProjectPageHeader from "@/components/ProjectPageHeader";
import ProjectsExplorer from "@/components/ProjectsExplorer";
import { getPublicProjects } from "@/data/content/public-content";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "All Projects",
  description:
    "Explore frontend, backend, and fullstack projects by Muhammad Fatihul Iqmal.",
  alternates: { canonical: "/projects" },
  openGraph: {
    title: "All Projects | Muhammad Fatihul Iqmal",
    description:
      "A collection of frontend, backend, and fullstack web development projects.",
    url: "/projects",
  },
};

export const revalidate = 3600;

export default async function ProjectsPage() {
  const projects = await getPublicProjects();
  return (
    <main className="min-h-dvh bg-background text-foreground">
      <ProjectPageHeader />

      <div className="mx-auto max-w-7xl px-6 pb-24 pt-16 sm:px-10 sm:pt-24 lg:px-12 lg:pb-32 lg:pt-28">
        <section className="relative overflow-hidden pb-16 sm:pb-24 lg:pb-28">
          <p
            aria-hidden="true"
            className="pointer-events-none absolute right-0 top-0 select-none text-[clamp(5rem,26vw,7rem)] font-bold leading-none tracking-[-0.08em] text-foreground/[0.035] sm:-right-3 sm:-top-10 sm:text-[clamp(7rem,22vw,18rem)]"
          >
            WORK
          </p>
          <div className="relative z-10 max-w-4xl">
            <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-foreground/50">
              Project index / {String(projects.length).padStart(2, "0")}
            </p>
            <h1 className="mt-6 text-[clamp(3.7rem,10vw,8.6rem)] font-semibold leading-[0.86] tracking-[-0.075em]">
              All projects.
            </h1>
            <p className="mt-8 max-w-2xl text-base leading-relaxed text-foreground/58 sm:text-lg sm:leading-8">
              A growing archive of digital products, internal systems, and web
              experiences — from interface craft to fullstack delivery.
            </p>
            <a
              href={siteConfig.projectArchive}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-8 inline-flex items-center gap-3 border-b border-foreground pb-1.5 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.2em]"
            >
              Open project archive
              <ArrowUpRight
                aria-hidden="true"
                className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </a>
          </div>
        </section>

        <ProjectsExplorer projects={projects} />

        <section className="mt-20 rounded-[2rem] bg-foreground px-7 py-12 text-background sm:mt-28 sm:px-12 sm:py-16 lg:flex lg:items-end lg:justify-between lg:px-16">
          <div>
            <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-background/50">
              Have a project in mind?
            </p>
            <h2 className="mt-4 max-w-2xl text-4xl font-semibold leading-[0.95] tracking-[-0.05em] sm:text-6xl">
              Let&apos;s build something useful.
            </h2>
          </div>
          <Link
            href="/#contact"
            className="mt-9 inline-flex border-b border-background/70 pb-1.5 font-mono text-[0.65rem] font-semibold uppercase tracking-[0.2em] lg:mt-0"
          >
            Start a conversation
          </Link>
        </section>
      </div>
    </main>
  );
}
