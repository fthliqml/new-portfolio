"use client";

import { useGSAP } from "@gsap/react";
import ExperienceCard, { type Experience } from "@/components/ExperienceCard";
import experienceData from "@/data/experiences.json";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import { A11y, Keyboard, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const experiences: Experience[] = experienceData;

export default function ExperienceSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const bgTextRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const mobileSwiperRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const viewport = viewportRef.current;
      const track = trackRef.current;
      const progress = progressRef.current;
      const bgText = bgTextRef.current;
      const header = headerRef.current;
      const mobileSwiper = mobileSwiperRef.current;

      if (!section || !bgText || !header) {
        return;
      }

      const media = gsap.matchMedia();

      media.add(
        {
          isDesktop: "(min-width: 1024px)",
          isMobileTablet: "(max-width: 1023px)",
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { isDesktop, isMobileTablet, reduceMotion } =
            context.conditions ?? {};
          const desktopCards =
            track?.querySelectorAll("[data-experience-card]") ?? [];
          const mobileCards =
            mobileSwiper?.querySelectorAll("[data-experience-card]") ?? [];

          if (reduceMotion) {
            gsap.set(
              [track, progress, bgText, header, desktopCards, mobileCards],
              { clearProps: "all" },
            );
            return;
          }

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

          if (isMobileTablet) {
            gsap.fromTo(
              header,
              { opacity: 0, y: 18 },
              {
                opacity: 1,
                y: 0,
                duration: 0.65,
                ease: "power2.out",
                scrollTrigger: {
                  trigger: section,
                  start: "top 72%",
                },
              },
            );

            gsap.fromTo(
              mobileCards,
              { opacity: 0, y: 70, scale: 0.96 },
              {
                opacity: 1,
                y: 0,
                scale: 1,
                stagger: 0.12,
                duration: 0.75,
                ease: "power3.out",
                scrollTrigger: {
                  trigger: mobileSwiper,
                  start: "top 78%",
                },
              },
            );

            return;
          }

          if (!isDesktop || !viewport || !track || !progress) {
            return;
          }

          const getScrollDistance = () =>
            Math.max(0, track.scrollWidth - viewport.clientWidth);

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

          gsap.set(header, { opacity: 0, y: 20 });
          gsap.set(desktopCards, { opacity: 0, y: 120, scale: 0.92 });

          timeline
            .fromTo(
              header,
              { opacity: 0, y: 20 },
              { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" },
              0,
            )
            .fromTo(
              desktopCards,
              { opacity: 0, y: 120, scale: 0.92 },
              { opacity: 1, y: 0, scale: 1, stagger: 0.15, duration: 0.5, ease: "power2.out" },
              0.2,
            )
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
      id="experience"
      ref={sectionRef}
      aria-labelledby="experience-heading"
      className="relative z-20 h-svh overflow-hidden bg-subtle px-4 py-5 sm:px-8 sm:py-7 lg:px-24 lg:py-10 motion-reduce:h-auto motion-reduce:min-h-svh motion-reduce:overflow-visible"
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

      <div className="relative z-10 mx-auto flex h-full min-h-0 max-w-7xl flex-col">
        <div
          ref={headerRef}
          className="mb-4 flex shrink-0 items-end justify-between gap-6 sm:mb-5 lg:mb-8"
        >
          <div>
            <p className="font-mono text-[0.58rem] uppercase tracking-[0.28em] text-white/45 sm:text-[0.65rem]">
              Career archive
            </p>
            <p className="mt-2 text-[clamp(1.9rem,9vw,2.6rem)] font-semibold uppercase leading-none tracking-[-0.035em] text-white sm:mt-3 lg:text-3xl">
              experiences
            </p>
          </div>

          <p className="hidden max-w-104 text-right text-sm leading-relaxed text-white/45 md:block">
            Roles, systems, and the work behind them.
          </p>
        </div>

        <div
          ref={mobileSwiperRef}
          data-experience-swiper
          className="min-h-0 flex-1 overflow-hidden lg:hidden"
        >
          <Swiper
            modules={[Pagination, A11y, Keyboard]}
            className="experience-swiper"
            slidesPerView={1}
            spaceBetween={16}
            speed={720}
            grabCursor
            keyboard={{ enabled: true, onlyInViewport: true }}
            pagination={{ clickable: true }}
            breakpoints={{
              640: {
                slidesPerView: 1.04,
                spaceBetween: 24,
              },
              768: {
                slidesPerView: 1.08,
                spaceBetween: 28,
              },
            }}
          >
            {experiences.map((experience, index) => (
              <SwiperSlide key={experience.id}>
                <ExperienceCard
                  experience={experience}
                  index={index}
                  className="h-full w-full sm:w-full lg:w-full"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div
          ref={viewportRef}
          data-experience-viewport
          className="hidden min-h-0 flex-1 overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:block lg:overflow-visible motion-reduce:overflow-visible"
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
          className="mt-6 hidden h-px shrink-0 overflow-hidden bg-white/12 lg:block motion-reduce:hidden"
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
