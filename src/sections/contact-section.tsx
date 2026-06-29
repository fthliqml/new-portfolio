"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef, useEffect, useState } from "react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function ContactSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const bgTextRef = useRef<HTMLDivElement | null>(null);
  const infoRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: "Asia/Jakarta",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      };
      setTime(now.toLocaleTimeString("en-US", options));
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const heading = headingRef.current;
      const bgText = bgTextRef.current;
      const info = infoRef.current;
      const bottom = bottomRef.current;
      if (!section || !heading || !bgText || !info || !bottom) return;

      const media = gsap.matchMedia();

      media.add(
        {
          desktop: "(min-width: 768px)",
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { desktop, reduceMotion } = context.conditions ?? {};
          const words = heading.querySelectorAll(".contact-word");

          if (!desktop || reduceMotion) {
            gsap.set([heading, bgText, info, bottom, words], {
              clearProps: "all",
            });
            return;
          }

          // Parallax shift for the background "CONTACT" text
          gsap.fromTo(
            bgText,
            { yPercent: -15, opacity: 0 },
            {
              yPercent: 15,
              opacity: 1,
              ease: "none",
              scrollTrigger: {
                trigger: section,
                start: "top bottom",
                end: "bottom bottom",
                scrub: true,
              },
            },
          );

          // Scrubbed staggered reveal timeline for the footer contents
          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "bottom bottom",
              scrub: 0.85,
              invalidateOnRefresh: true,
            },
          });

          // Animate words slide-up + fade-in
          timeline
            .fromTo(
              words,
              { yPercent: 100, opacity: 0 },
              {
                yPercent: 0,
                opacity: 1,
                stagger: 0.15,
                duration: 1.2,
                ease: "power2.out",
              },
              0,
            )
            .fromTo(
              info,
              { y: 60, opacity: 0 },
              { y: 0, opacity: 1, ease: "power1.out", duration: 1 },
              0.4,
            )
            .fromTo(
              bottom,
              { y: 40, opacity: 0 },
              { y: 0, opacity: 1, ease: "power1.out", duration: 1 },
              0.65,
            );
        },
      );

      return () => media.revert();
    },
    { scope: sectionRef },
  );

  return (
    <footer
      id="contact"
      ref={sectionRef}
      aria-labelledby="contact-heading"
      className="contact-section relative z-10 w-full bg-subtle text-white flex flex-col justify-between overflow-hidden px-6 py-20 sm:px-10 text-center md:sticky md:bottom-0 md:h-screen md:min-h-[600px] md:px-24 md:py-16"
    >
      {/* Large Background Text */}
      <div
        ref={bgTextRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex select-none items-center justify-center text-center text-[clamp(6rem,22vw,22rem)] font-bold leading-none tracking-[-0.075em] text-white/3 select-none blur-[3px]"
      >
        CONTACT
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-between items-center gap-12 md:gap-0">
        {/* Top Header */}
        <div className="flex flex-col items-center gap-2">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.3em] text-white/45">
            Get in touch
          </p>
          {time && (
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-white/35">
              Surakarta, ID / {time} WIB
            </p>
          )}
        </div>

        {/* Center Content */}
        <div className="flex flex-col items-center gap-8">
          <h2
            id="contact-heading"
            ref={headingRef}
            className="text-[clamp(3.5rem,10vw,8.5rem)] font-bold uppercase leading-[0.9] tracking-[-0.055em] text-white"
          >
            {/* Word-by-word reveal wrapping */}
            <span className="inline-block overflow-hidden mr-[0.2em] py-1">
              <span className="contact-word inline-block will-change-transform">
                Let&apos;s
              </span>
            </span>
            <span className="inline-block overflow-hidden py-1">
              <span className="contact-word inline-block will-change-transform">
                Work
              </span>
            </span>
            <br />
            <span className="inline-block overflow-hidden py-1">
              <span className="contact-word inline-block will-change-transform">
                Together
              </span>
            </span>
          </h2>

          <div ref={infoRef} className="mt-4 flex flex-col items-center gap-10">
            <a
              href="mailto:fatihuliqmazzz@gmail.com"
              className="group relative inline-flex items-center gap-2 font-sans text-xl font-light text-white/70 transition-colors duration-300 hover:text-white sm:text-2xl lg:text-3xl"
            >
              <span>fatihuliqmazzz@gmail.com</span>
              <span className="inline-block transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
                ↗
              </span>
              <span className="absolute bottom-0 left-0 h-px w-0 bg-white transition-all duration-300 group-hover:w-full" />
            </a>

            <div className="flex flex-wrap justify-center gap-8 font-mono text-[11px] uppercase tracking-wider text-white/45">
              <a
                href="https://github.com/fthliqml"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors duration-300"
              >
                Github
              </a>
              <a
                href="https://linkedin.com/in/mfiqmal"
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
          </div>
        </div>

        {/* Bottom Mascot and Copyright */}
        <div ref={bottomRef} className="flex flex-col items-center gap-4">
          <div className="text-white/45 hover:text-white transition-colors duration-300">
            <svg
              width="40"
              height="40"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="animate-pulse"
              style={{ animationDuration: "3s" }}
            >
              {/* Ears */}
              <rect x="2" y="1" width="2" height="3" />
              <rect x="12" y="1" width="2" height="3" />
              {/* Head/Body */}
              <rect x="4" y="3" width="8" height="9" />
              <rect x="3" y="4" width="10" height="7" />
              {/* Eyes */}
              <rect x="5" y="6" width="1" height="1" fill="#10b981" />
              <rect x="10" y="6" width="1" height="1" fill="#10b981" />
              {/* Mouth */}
              <rect x="7" y="8" width="2" height="1" fill="#111114" />
              {/* Feet */}
              <rect x="3" y="12" width="2" height="2" />
              <rect x="11" y="12" width="2" height="2" />
            </svg>
          </div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-white/30">
            © {new Date().getFullYear()} M. Fatihul Iqmal. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
