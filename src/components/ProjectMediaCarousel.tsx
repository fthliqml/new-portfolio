"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { A11y, Keyboard } from "swiper/modules";
import type { Swiper as SwiperInstance } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";

export interface ProjectImageSlide {
  src: string;
  alt: string;
  label: string;
  description: string;
}

interface ProjectMediaCarouselProps {
  images: ProjectImageSlide[];
  projectNumber: string;
  eagerFirstImage?: boolean;
}

function formatSlideNumber(value: number) {
  return String(value).padStart(2, "0");
}

const mediaHoverVariants = {
  rest: {
    scale: 1,
    filter: "brightness(1) contrast(1)",
  },
  hover: {
    scale: 1.025,
    filter: "brightness(1.03) contrast(1.04)",
  },
};

const overlayHoverVariants = {
  rest: { opacity: 0 },
  hover: { opacity: 1 },
};

const mediaHoverTransition = {
  type: "spring" as const,
  stiffness: 150,
  damping: 24,
  mass: 0.9,
};

export default function ProjectMediaCarousel({
  images,
  projectNumber,
  eagerFirstImage = false,
}: ProjectMediaCarouselProps) {
  const swiperRef = useRef<SwiperInstance | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [canHover, setCanHover] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const slides = useMemo(() => images.filter((image) => image.src), [images]);
  const activeSlide = slides[activeIndex] ?? slides[0];
  const canSlidePrev = activeIndex > 0;
  const canSlideNext = activeIndex < slides.length - 1;

  useEffect(() => {
    const query = window.matchMedia("(hover: hover) and (pointer: fine)");

    const updateHoverCapability = () => {
      setCanHover(query.matches);
    };

    updateHoverCapability();
    query.addEventListener("change", updateHoverCapability);

    return () => {
      query.removeEventListener("change", updateHoverCapability);
    };
  }, []);

  if (!activeSlide) {
    return null;
  }

  return (
    <div className="min-w-0 lg:[direction:ltr]">
      <div className="group/img relative isolate aspect-[16/10] overflow-hidden rounded-lg bg-secondary">
        <Swiper
          modules={[A11y, Keyboard]}
          className="project-media-swiper"
          slidesPerView={1}
          speed={680}
          grabCursor={slides.length > 1}
          keyboard={{ enabled: true, onlyInViewport: true }}
          a11y={{ enabled: true }}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          onSlideChange={(swiper) => {
            setActiveIndex(swiper.activeIndex);
          }}
        >
          {slides.map((slide, slideIndex) => (
            <SwiperSlide key={`${slide.src}-${slideIndex}`}>
              <motion.div
                className="relative h-full w-full overflow-hidden"
                initial={false}
                animate="rest"
                whileHover={
                  canHover && !prefersReducedMotion ? "hover" : undefined
                }
              >
                <motion.div
                  className="absolute inset-0"
                  variants={mediaHoverVariants}
                  transition={mediaHoverTransition}
                >
                  <Image
                    src={slide.src}
                    alt={slide.alt}
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    loading={
                      eagerFirstImage && slideIndex === 0 ? "eager" : "lazy"
                    }
                    className="h-full w-full object-cover motion-reduce:transform-none"
                    onLoad={() => swiperRef.current?.update()}
                  />
                </motion.div>
                <motion.div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.16),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.08),transparent_44%)]"
                  variants={overlayHoverVariants}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                />
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="pointer-events-none absolute inset-0 z-10 bg-linear-to-t from-black/30 via-transparent to-transparent" />
        <p className="pointer-events-none absolute right-5 top-4 z-20 font-mono text-3xl font-semibold text-white/80 sm:right-7 sm:top-6 sm:text-4xl">
          {projectNumber}
        </p>

        {slides.length > 1 && (
          <div className="pointer-events-none absolute inset-y-0 left-0 right-0 z-20 hidden items-center justify-between px-4 lg:flex">
            <button
              type="button"
              aria-label="Previous project image"
              disabled={!canSlidePrev}
              onClick={() => swiperRef.current?.slidePrev()}
              className="pointer-events-auto grid h-11 w-11 place-items-center rounded-full border border-white/18 bg-black/38 text-white/86 backdrop-blur-md transition-[background-color,opacity,transform] duration-300 hover:bg-black/58 hover:text-white disabled:pointer-events-none disabled:opacity-35 motion-reduce:transition-none"
            >
              <ChevronLeft aria-hidden="true" size={18} />
            </button>

            <button
              type="button"
              aria-label="Next project image"
              disabled={!canSlideNext}
              onClick={() => swiperRef.current?.slideNext()}
              className="pointer-events-auto grid h-11 w-11 place-items-center rounded-full border border-white/18 bg-black/38 text-white/86 backdrop-blur-md transition-[background-color,opacity,transform] duration-300 hover:bg-black/58 hover:text-white disabled:pointer-events-none disabled:opacity-35 motion-reduce:transition-none"
            >
              <ChevronRight aria-hidden="true" size={18} />
            </button>
          </div>
        )}
      </div>

      {slides.length > 1 && (
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 font-mono uppercase">
            <p className="text-[0.58rem] font-semibold tracking-[0.22em] text-foreground/40">
              {formatSlideNumber(activeIndex + 1)} /{" "}
              {formatSlideNumber(slides.length)}
            </p>
            <p className="mt-1 truncate text-[0.65rem] font-semibold tracking-[0.16em] text-foreground/65">
              {activeSlide.label}
            </p>
            <p className="mt-1 max-w-[32rem] text-[0.72rem] normal-case leading-relaxed tracking-normal text-foreground/45">
              {activeSlide.description}
            </p>
          </div>

          <div className="flex gap-2" aria-label="Project image slides">
            {slides.map((slide, slideIndex) => {
              const isActive = slideIndex === activeIndex;

              return (
                <button
                  key={`${slide.label}-${slideIndex}`}
                  type="button"
                  aria-label={`Show ${slide.label}`}
                  aria-pressed={isActive}
                  onClick={() => swiperRef.current?.slideTo(slideIndex)}
                  className={`h-1.5 rounded-full transition-[width,background-color] duration-300 motion-reduce:transition-none ${
                    isActive
                      ? "w-9 bg-foreground/70"
                      : "w-5 bg-foreground/16 hover:bg-foreground/34"
                  }`}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
