"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type IntroLinePart = {
  text: string;
  highlight: boolean;
  italic?: boolean;
};

const lines: IntroLinePart[][] = [
  [
    { text: "I build", highlight: false },
    { text: "fullstack web systems", highlight: true },
  ],
  [
    { text: "with clean user interfaces,", highlight: false },
    { text: "reliable backend architecture,", highlight: true },
  ],
  [{ text: "and database-driven workflows", highlight: false }],
  [{ text: "helping teams turn complex processes", highlight: false }],
  [
    { text: "into", highlight: false },
    {
      text: "efficient digital products.",
      highlight: true,
    },
  ],
];

const skills = ["Next.js", "Laravel", "Node.js", "Express", "Redis", "Redux"];

export default function IntroSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const shapeRef = useRef<HTMLDivElement | null>(null);
  const marqueeRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 40%",
          end: "bottom 90%",
          scrub: 1.4,
        },
      });

      tl.fromTo(
        ".line",
        {
          opacity: 0,
          yPercent: 200,
        },
        {
          opacity: 1,
          yPercent: 0,
          duration: 3.2,
          stagger: {
            each: 0.55,
            ease: "power2.out",
          },
          ease: "power3.out",
        },
        "-=0.1",
      );

      gsap.fromTo(
        shapeRef.current,
        {
          scaleY: 0.6,
          y: 50,
        },
        {
          scaleY: 1.5,
          y: -50,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "top 20%",
            scrub: 1,
          },
        },
      );
    },
    { scope: sectionRef },
  );

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative flex h-fit flex-col items-center justify-center gap-20 bg-subtle px-6 pb-32 pt-20"
    >
      <div
        ref={shapeRef}
        className="absolute left-1/2 -top-31 h-[180px] w-[130vw] -translate-x-1/2 rounded-[50%] bg-subtle"
      />

      <p className="max-w-5xl text-center font-sans text-[clamp(1.75rem,3.8vw,3.6rem)] leading-[1.18] tracking-[-0.04em]">
        {lines.map((line, lineIndex) => (
          <span key={lineIndex} className="block overflow-hidden">
            <span className="line block will-change-transform">
              {line.map((part, partIndex) => (
                <span key={partIndex}>
                  {part.text.split(" ").map((word, wordIndex) => (
                    <span
                      key={`${lineIndex}-${partIndex}-${wordIndex}`}
                      className={`
                        mr-[0.14em] inline-block will-change-transform
                        ${
                          part.highlight
                            ? "font-semibold text-white"
                            : "font-normal text-white/45"
                        }
                        ${
                          part.italic
                            ? "font-serif font-thin italic tracking-wide"
                            : ""
                        }
                      `}
                    >
                      {word}
                    </span>
                  ))}
                </span>
              ))}
            </span>
          </span>
        ))}
      </p>

      {/* Infinite Skills Marquee */}
      <div
        ref={marqueeRef}
        className="relative z-10 mt-8 w-full max-w-5xl overflow-hidden border-y border-white/10 py-6"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, white 20%, white 80%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, white 20%, white 80%, transparent)",
        }}
      >
        <div className="animate-marquee flex gap-16 text-xs font-semibold uppercase tracking-[0.25em] text-white/50 sm:text-sm sm:gap-24">
          {/* First set */}
          {Array(3)
            .fill(skills)
            .flat()
            .map((skill, idx) => (
              <div
                key={`first-${idx}`}
                className="flex items-center gap-4 sm:gap-6"
              >
                <span className="text-white hover:text-white transition-colors duration-300 cursor-default">
                  {skill}
                </span>
                <span className="text-white/20 select-none">✦</span>
              </div>
            ))}
          {/* Second set for infinite loop */}
          {Array(3)
            .fill(skills)
            .flat()
            .map((skill, idx) => (
              <div
                key={`second-${idx}`}
                className="flex items-center gap-4 sm:gap-6"
              >
                <span className="text-white hover:text-white transition-colors duration-300 cursor-default">
                  {skill}
                </span>
                <span className="text-white/20 select-none">✦</span>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}
