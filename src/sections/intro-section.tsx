"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const lines = [
  [
    { text: "I build", highlight: false },
    { text: "end-to-end web systems", highlight: true },
  ],
  [
    {
      text: "that connect clean interfaces, reliable backend logic,",
      highlight: false,
    },
  ],
  [
    { text: "and", highlight: false },
    { text: "AI-powered automation", highlight: true, italic: true },
  ],
  [
    { text: "helping businesses streamline workflows,", highlight: false },
    { text: "reduce manual work", highlight: true },
    { text: "and operate more efficiently.", highlight: false },
  ],
];

export default function IntroSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const shapeRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
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
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative flex h-fit flex-col items-center justify-center gap-28 border-b border-dashed border-zinc-600 bg-subtle px-6 pb-32"
    >
      <div
        ref={shapeRef}
        className="absolute left-1/2 -top-31 h-[180px] w-[130vw] -translate-x-1/2 rounded-[50%] bg-subtle"
      />

      <p className="max-w-6xl text-center font-sans text-[clamp(2.1rem,4.8vw,5.2rem)] leading-[1.12] tracking-[-0.055em]">
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
    </section>
  );
}
