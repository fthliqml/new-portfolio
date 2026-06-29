"use client";

import { useGSAP } from "@gsap/react";
import ExperienceCard, { type Experience } from "@/components/ExperienceCard";
import experienceData from "@/data/experiences.json";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const experiences: Experience[] = experienceData;

export default function ExperienceSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const bgTextRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const viewport = viewportRef.current;
      const track = trackRef.current;
      const progress = progressRef.current;
      const bgText = bgTextRef.current;
      const header = headerRef.current;

      if (!section || !viewport || !track || !progress || !bgText || !header) {
        return;
      }

      const media = gsap.matchMedia();

      media.add(
        {
          desktop: "(min-width: 768px)",
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { desktop, reduceMotion } = context.conditions ?? {};
          const cards = track.querySelectorAll("[data-experience-card]");

          if (!desktop || reduceMotion) {
            gsap.set([track, progress, bgText, header, cards], { clearProps: "all" });
            return;
          }

          const getScrollDistance = () =>
            Math.max(0, track.scrollWidth - viewport.clientWidth);

          // 1. ScrollTrigger to reveal the background text as the section enters the screen
          ScrollTrigger.create({
            trigger: section,
            start: "top bottom",
            end: "top top",
            scrub: true,
            animation: gsap.fromTo(
              bgText,
              { opacity: 0, filter: "blur(20px)", scale: 0.8 },
              { opacity: 1, filter: "blur(3px)", scale: 1, ease: "none" },
            ),
            invalidateOnRefresh: true,
          });

          // 2. Main ScrollTrigger for pinning, headers/cards reveal, and horizontal scroll
          const timeline = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: () => `+=${getScrollDistance() + window.innerHeight * 1.0}`,
              pin: true,
              scrub: 0.85,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });

          // Set initial states for elements that reveal once pinned
          gsap.set(header, { opacity: 0, y: 20 });
          gsap.set(cards, { opacity: 0, y: 120, scale: 0.92 });

          timeline
            // Phase 1: Headers fade in and slide to original position
            .fromTo(
              header,
              { opacity: 0, y: 20 },
              { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" },
              0,
            )
            // Phase 2: Experience cards enter staggered
            .fromTo(
              cards,
              { opacity: 0, y: 120, scale: 0.92 },
              { opacity: 1, y: 0, scale: 1, stagger: 0.15, duration: 0.5, ease: "power2.out" },
              0.2,
            )
            // Phase 3: Horizontal scroll + progress bar scaling
            .to(
              track,
              { x: () => -getScrollDistance(), duration: 1.2 },
              0.8,
            )
            .fromTo(
              progress,
              { scaleX: 0 },
              { scaleX: 1, transformOrigin: "left center", duration: 1.2 },
              0.8,
            );
        },
      );

      return () => media.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      aria-labelledby="experience-heading"
      className="relative z-20 h-svh overflow-hidden bg-subtle p-4 sm:px-10 sm:py-8 lg:px-24 lg:py-10 motion-reduce:h-auto motion-reduce:min-h-svh motion-reduce:overflow-visible"
    >
      <h2 id="experience-heading" className="sr-only">
        Professional experience
      </h2>

      <div
        ref={bgTextRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex select-none items-center justify-center text-center text-[clamp(5rem,17vw,17rem)] font-bold leading-none tracking-[-0.075em] text-white/4.5 blur-[3px]"
      >
        EXPERIENCES
      </div>

      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col">
        <div
          ref={headerRef}
          className="mb-6 hidden shrink-0 items-end justify-between gap-6 sm:flex lg:mb-8"
        >
          <div>
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.3em] text-white/45">
              Career archive
            </p>
            <p className="mt-3 text-3xl font-semibold uppercase tracking-[-0.035em] text-white">
              experiences
            </p>
          </div>

          <p className="hidden max-w-104 text-right text-sm leading-relaxed text-white/45 md:block">
            Roles, systems, and the work behind them.
          </p>
        </div>

        <div
          ref={viewportRef}
          data-experience-viewport
          className="min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:snap-none md:overflow-visible md:overscroll-auto motion-reduce:overflow-visible"
        >
          <div
            ref={trackRef}
            data-experience-track
            className="experience-track mx-auto flex h-full w-max gap-4 will-change-transform sm:gap-8 motion-reduce:h-auto motion-reduce:w-full motion-reduce:flex-col motion-reduce:will-change-auto"
          >
            {experiences.map((experience, index) => (
              <ExperienceCard
                key={experience.id}
                experience={experience}
                index={index}
              />
            ))}
          </div>
        </div>

        <div
          aria-hidden="true"
          className="mt-6 hidden h-px shrink-0 overflow-hidden bg-white/12 md:block motion-reduce:hidden"
        >
          <div
            ref={progressRef}
            className="h-full w-full origin-left scale-x-0 bg-white/70 will-change-transform"
          />
        </div>
      </div>
    </section>
  );
}
