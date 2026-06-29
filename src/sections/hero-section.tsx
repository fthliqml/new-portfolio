"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

import AnimatedProfile from "@/components/AnimatedProfileCard";
import TextType from "@/components/TextType";

gsap.registerPlugin(useGSAP);

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia();

      media.add(
        {
          isDesktop: "(min-width: 768px)",
          isMobile: "(max-width: 767px)",
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { isDesktop, reduceMotion } = context.conditions ?? {};

          if (reduceMotion) {
            gsap.set(
              [
                ".hero-socials a",
                ".location",
                ".greetings",
                ".profile-card",
                ".hero-scroll-indicator",
              ],
              { clearProps: "all" },
            );
            return;
          }

          const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });

          if (isDesktop) {
            timeline
              .from(".hero-socials a", {
                opacity: 0,
                y: -20,
                stagger: 0.1,
                duration: 0.8,
              })
              .from(".location", { opacity: 0, x: -200 }, "-=0.6")
              .from(".greetings", { opacity: 0, x: 200, duration: 2 }, "-=0.8")
              .from(
                ".profile-card",
                { scale: 0.85, opacity: 0, duration: 1, rotate: 4 },
                "-=1.7",
              )
              .from(
                ".hero-scroll-indicator",
                { opacity: 0, y: 15, duration: 1 },
                "-=1.3",
              );

            return;
          }

          timeline
            .from(".hero-socials a", {
              opacity: 0,
              stagger: 0.08,
              duration: 0.45,
            })
            .from(".location", { opacity: 0, duration: 0.4 }, "-=0.25")
            .from(".greetings", { opacity: 0, duration: 0.55 }, "-=0.2")
            .from(
              ".hero-scroll-indicator",
              { opacity: 0, duration: 0.35 },
              "-=0.15",
            );
        },
      );

      return () => media.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section
      id="home"
      ref={sectionRef}
      className="hero-section relative mb-10 grid min-h-[calc(100vh-5rem)] content-start items-start gap-12 px-6 py-28 sm:px-10 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.7fr)] lg:content-center lg:items-center lg:gap-12 lg:px-24 lg:py-10"
    >
      {/* Background Dotted Grid Overlay */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(17,17,20,0.05)_1.5px,transparent_1.5px)] [background-size:32px_32px]"
        style={{
          maskImage:
            "radial-gradient(ellipse at center, white 40%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, white 40%, transparent 100%)",
        }}
      />

      <div className="relative z-10 max-w-4xl">
        <div className="hero-socials mb-6 flex items-center gap-6">
          <a
            href="https://github.com/fthliqml"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground/45 hover:text-foreground transition-colors duration-300"
            aria-label="GitHub"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
              <path d="M9 18c-4.51 2-5-2-7-2" />
            </svg>
          </a>
          <a
            href="https://linkedin.com/in/mfiqmal"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground/45 hover:text-foreground transition-colors duration-300"
            aria-label="LinkedIn"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
              <rect width="4" height="12" x="2" y="9" />
              <circle cx="4" cy="4" r="2" />
            </svg>
          </a>
          <a
            href="https://instagram.com/fthliqml"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground/45 hover:text-foreground transition-colors duration-300"
            aria-label="Instagram"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
            </svg>
          </a>
        </div>

        <p className="location font-sans text-sm uppercase tracking-[0.28em] text-muted-foreground">
          Central Java · Indonesia
        </p>

        <h1 className="greetings mt-5 min-h-[7.5rem] max-w-[11ch] font-serif text-6xl leading-none sm:min-h-[12rem] sm:text-8xl lg:min-h-[9rem] lg:text-9xl">
          Hi, I’m <span className="italic">Iqmal.</span>
        </h1>
        <TextType
          text={["Web Developer"]}
          typingSpeed={75}
          pauseDuration={1500}
          initialDelay={5}
          showCursor
          cursorCharacter="█"
          deletingSpeed={50}
          cursorBlinkDuration={0.5}
          className="role mt-3 block min-h-[5rem] min-w-[18ch] text-3xl font-thin! leading-tight tracking-[0.06em]! sm:min-h-[7rem] sm:text-5xl lg:min-h-[3.75rem]"
        />
      </div>

      <AnimatedProfile />

      {/* Animated Mouse Scroll Indicator */}
      <div className="hero-scroll-indicator absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none opacity-45">
        <div className="w-5 h-8 border border-foreground/50 rounded-full flex justify-center p-1">
          <div
            className="w-1 h-2 bg-foreground rounded-full animate-bounce"
            style={{ animationDuration: "1.8s" }}
          />
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="font-mono text-[8px] uppercase tracking-[0.25em] text-foreground/65">
            Scroll Down
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-2.5 w-2.5 animate-bounce text-foreground/50"
            style={{ animationDuration: "1.5s" }}
          >
            <path d="M12 5v14M19 12l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </section>
  );
}
