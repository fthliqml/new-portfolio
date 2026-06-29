"use client";

import { useGSAP } from "@gsap/react";
import ProjectCard, { type Project } from "@/components/ProjectCard";
import projectsData from "@/data/projects.json";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const projects: Project[] = projectsData;

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
          isAll: "(min-width: 0px)",
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { reduceMotion } = context.conditions ?? {};

          if (reduceMotion) {
            // Reset any inline styles if reduced motion
            const cards = container.querySelectorAll("[data-project-card]");
            const experienceSection = document.querySelector(
              "section[aria-labelledby='experience-heading']",
            );
            if (experienceSection) {
              gsap.set(experienceSection, { clearProps: "y,yPercent" });
            }
            gsap.set([section, bgText, cards], { clearProps: "all" });
            return;
          }

          // --- 1. Transition animations removed to optimize performance and prevent layout pinning conflicts ---

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
          const cards = container.querySelectorAll("[data-project-card]");
          cards.forEach((card) => {
            gsap.fromTo(
              card,
              { opacity: 0, y: 100, scale: 0.95 },
              {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 1,
                ease: "power2.out",
                scrollTrigger: {
                  trigger: card,
                  start: "top 85%", // start animation when card is 85% from top of viewport
                  end: "top 50%",
                  scrub: 0.5,
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
      className="projects-section relative z-30 -mt-[10vh] rounded-t-[2.5rem] bg-background px-6 pt-24 pb-24 text-foreground shadow-[0_-30px_60px_rgba(0,0,0,0.15)] sm:px-10 sm:pt-36 lg:px-24 lg:pt-48"
    >
      <h2 id="projects-heading" className="sr-only">
        Selected projects
      </h2>

      {/* Large Background Text */}
      <div
        ref={bgTextRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-20 flex select-none items-center justify-center text-center text-[clamp(5rem,17vw,17rem)] font-bold leading-none tracking-[-0.075em] text-foreground/4.5 blur-[3px]"
      >
        PROJECTS
      </div>

      <div ref={containerRef} className="relative z-10 mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mb-16 flex items-end justify-between gap-6 border-b border-foreground/10 pb-8 lg:mb-24">
          <div>
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.3em] text-foreground/45">
              Portfolio showcase
            </p>
            <p className="mt-3 text-3xl font-semibold uppercase tracking-[-0.035em] text-foreground">
              projects
            </p>
          </div>
          <p className="hidden max-w-104 text-right text-sm leading-relaxed text-foreground/45 md:block">
            Featured applications, systems, and contributions.
          </p>
        </div>

        {/* Projects List */}
        <div className="flex flex-col gap-24 sm:gap-32 lg:gap-40">
          {projects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
