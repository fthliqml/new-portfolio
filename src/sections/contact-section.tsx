"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function ContactSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const bgTextRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      const heading = headingRef.current;
      const bgText = bgTextRef.current;
      if (!heading || !bgText) return;

      const media = gsap.matchMedia();

      media.add(
        {
          desktop: "(min-width: 768px)",
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { desktop, reduceMotion } = context.conditions ?? {};

          if (!desktop || reduceMotion) {
            gsap.set([heading, bgText], { clearProps: "all" });
            return;
          }

          // Parallax shift for the background "CONTACT" text
          gsap.fromTo(
            bgText,
            { yPercent: -20, opacity: 0 },
            {
              yPercent: 10,
              opacity: 1,
              ease: "none",
              scrollTrigger: {
                trigger: sectionRef.current,
                start: "top bottom",
                end: "bottom bottom",
                scrub: true,
              },
            }
          );

          // Slide up and fade in reveal for the main heading
          gsap.fromTo(
            heading,
            { y: 80, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 1.4,
              ease: "power3.out",
              scrollTrigger: {
                trigger: sectionRef.current,
                start: "top 80%",
              },
            }
          );
        }
      );

      return () => media.revert();
    },
    { scope: sectionRef }
  );

  return (
    <footer
      ref={sectionRef}
      aria-labelledby="contact-heading"
      className="contact-section relative z-10 w-full bg-subtle text-white flex flex-col justify-between overflow-hidden px-6 py-20 sm:px-10 md:sticky md:bottom-0 md:h-[65vh] md:min-h-[500px] md:px-24 md:py-16"
    >
      {/* Large Background Text */}
      <div
        ref={bgTextRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 select-none items-center justify-center text-center text-[clamp(6rem,20vw,20rem)] font-bold leading-none tracking-[-0.075em] text-white/3 select-none blur-[3px]"
      >
        CONTACT
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-between gap-16 md:gap-0">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center md:items-start md:text-left">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.3em] text-white/45">
            Get in touch
          </p>
          <h2
            id="contact-heading"
            ref={headingRef}
            className="mt-6 text-[clamp(2.5rem,7vw,6.5rem)] font-bold uppercase leading-[0.9] tracking-[-0.055em] text-white will-change-transform"
          >
            Let's Work<br />Together
          </h2>
        </div>

        {/* Email & Contact Details */}
        <div className="flex flex-col items-center text-center md:items-start md:text-left">
          <a
            href="mailto:fthliqml@gmail.com"
            className="group relative inline-flex items-center gap-2 font-sans text-xl font-light text-white/70 transition-colors duration-300 hover:text-white sm:text-2xl lg:text-3xl"
          >
            <span>fthliqml@gmail.com</span>
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
              ↗
            </span>
            <span className="absolute bottom-0 left-0 h-px w-0 bg-white transition-all duration-300 group-hover:w-full" />
          </a>
        </div>

        {/* Footer Bottom (Socials & Copyright) */}
        <div className="flex flex-col items-center justify-between gap-6 border-t border-white/10 pt-8 font-mono text-[11px] uppercase tracking-wider text-white/45 md:flex-row md:gap-0">
          <div className="flex flex-wrap justify-center gap-8">
            <a
              href="https://github.com/fthliqml"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors duration-300"
            >
              Github
            </a>
            <a
              href="https://linkedin.com/in/fthliqml"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors duration-300"
            >
              Linkedin
            </a>
            <a
              href="https://instagram.com/fthliqml"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors duration-300"
            >
              Instagram
            </a>
          </div>
          <div>
            © {new Date().getFullYear()} M. Fatihul Iqmal. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
