"use client";

import { useGSAP } from "@gsap/react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

import ProjectCard from "@/components/ProjectCard";
import { featuredProjects } from "@/lib/projects";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function ProjectsSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const bgTextRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const container = containerRef.current;
      const bgText = bgTextRef.current;

      if (!section || !container || !bgText) return;

      const media = gsap.matchMedia();

      media.add(
        {
          isDesktop: "(min-width: 768px)",
          isMobile: "(max-width: 767px)",
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { isDesktop, isMobile, reduceMotion } =
            context.conditions ?? {};
          const cards = container.querySelectorAll("[data-project-card]");

          if (reduceMotion) {
            const experienceSection = document.querySelector(
              "section[aria-labelledby='experience-heading']",
            );
            if (experienceSection) {
              gsap.set(experienceSection, { clearProps: "y,yPercent" });
            }
            gsap.set([section, bgText, cards], { clearProps: "all" });
            return;
          }

          if (isMobile) {
            gsap.set([section, bgText], { clearProps: "all" });

            cards.forEach((card) => {
              gsap.fromTo(
                card,
                { opacity: 0, y: 36 },
                {
                  opacity: 1,
                  y: 0,
                  ease: "none",
                  scrollTrigger: {
                    trigger: card,
                    start: "top 92%",
                    end: "top 62%",
                    scrub: 0.25,
                    invalidateOnRefresh: true,
                  },
                },
              );
            });

            return;
          }

          if (!isDesktop) {
            return;
          }

          gsap.fromTo(
            section,
            { yPercent: 16 },
            {
              yPercent: 0,
              ease: "power2.out",
              scrollTrigger: {
                trigger: section,
                start: "top bottom",
                end: "top 58%",
                scrub: 0.65,
                invalidateOnRefresh: true,
              },
            },
          );

          // --- 2. Parallax background text ---
          gsap.fromTo(
            bgText,
            { y: -100, opacity: 0 },
            {
              y: 100,
              opacity: 1,
              ease: "none",
              scrollTrigger: {
                trigger: section,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            },
          );

          // --- 3. Scroll Reveal for Project Cards ---
          cards.forEach((card) => {
            gsap.fromTo(
              card,
              { opacity: 0, y: 56, scale: 0.97 },
              {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.75,
                ease: "power2.out",
                scrollTrigger: {
                  trigger: card,
                  start: "top 112%",
                  end: "top 72%",
                  scrub: 0.35,
                },
              },
            );
          });
        },
      );

      return () => media.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section
      id="projects"
      ref={sectionRef}
      aria-labelledby="projects-heading"
      className="projects-section relative z-30 mt-0 rounded-t-[2rem] bg-background px-6 pt-16 pb-20 text-foreground sm:px-10 sm:pt-24 md:-mt-[14vh] md:rounded-t-[2.5rem] md:pt-36 md:shadow-[0_-30px_60px_rgba(0,0,0,0.15)] lg:-mt-[10vh] lg:px-24 lg:pt-48"
    >
      <h2 id="projects-heading" className="sr-only">
        Selected projects
      </h2>

      {/* Large Background Text */}
      <div
        ref={bgTextRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-20 hidden select-none items-center justify-center text-center text-[clamp(5rem,17vw,17rem)] font-bold leading-none tracking-[-0.075em] text-foreground/4.5 blur-[3px] md:flex"
      >
        PROJECTS
      </div>

      <div ref={containerRef} className="relative z-10 mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mb-9 flex flex-col items-start justify-between gap-6 border-b border-foreground/10 pb-6 sm:mb-12 sm:flex-row sm:items-end sm:pb-8 lg:mb-24">
          <div>
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.3em] text-foreground/65">
              Portfolio showcase
            </p>
            <p className="mt-3 text-3xl font-semibold uppercase tracking-[-0.035em] text-foreground">
              selected projects
            </p>
          </div>
          <Link
            href="/projects"
            className="group inline-flex items-center gap-3 border-b border-foreground/25 pb-1.5 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-foreground transition-colors hover:border-foreground"
          >
            View all projects
            <ArrowRight
              aria-hidden="true"
              className="size-4 transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>

        {/* Projects List */}
        <div className="flex flex-col gap-16 sm:gap-20 lg:gap-24">
          {featuredProjects.map((project, index) => (
            <div key={project.id} className="contents">
              <ProjectCard project={project} index={index} />
              {index < featuredProjects.length - 1 && (
                <div className="flex items-center gap-4 py-2 font-mono text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-foreground/65 sm:py-6 sm:text-[0.65rem] lg:py-8">
                  <span className="h-px flex-1 bg-foreground/10" />
                  <span className="shrink-0">
                    Next project / {String(index + 2).padStart(2, "0")} /{" "}
                    {String(featuredProjects.length).padStart(2, "0")}
                  </span>
                  <span className="h-px flex-1 bg-foreground/10" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-16 flex justify-center border-t border-foreground/10 pt-10 sm:mt-24 sm:pt-14">
          <Link
            href="/projects"
            className="group inline-flex items-center gap-5 rounded-full border border-foreground bg-foreground px-7 py-4 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-background transition-[transform,background-color,color] duration-300 hover:-translate-y-1 hover:bg-transparent hover:text-foreground sm:px-9 sm:py-5"
          >
            View all projects
            <ArrowRight
              aria-hidden="true"
              className="size-4 transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
