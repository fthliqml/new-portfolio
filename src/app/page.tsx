"use client";

import AnimatedProfile from "@/components/animated-profile";
import AnimatedCodeSVG from "@/components/animated-code-svg";
import TextType from "@/components/TextType";
import gsap from "gsap";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .from(".location", { opacity: 0, x: -200 })
        .from(".greetings", { opacity: 0, x: 200, duration: 2 })
        .from(
          ".profile-card",
          { scale: 0.85, opacity: 0, duration: 1, rotate: 4 },
          "-=1.7",
        );
    }, ".hero-section");

    return () => ctx.revert();
  }, []);
  return (
    <main className="relative isolate min-h-dvh overflow-hidden bg-[#e8e8e5] px-6 py-10 text-[#111114] sm:px-10 lg:px-24">
      <AnimatedCodeSVG />
      <section className="hero-section relative grid min-h-[calc(100vh-5rem)] items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.7fr)] lg:gap-12">
        <div className="relative z-10 max-w-4xl">
          <p className="location font-sans text-sm uppercase tracking-[0.28em] text-[#111114]/60">
            Central Java · Indonesia
          </p>

          <h1 className="greetings mt-5 max-w-[11ch] font-serif text-6xl leading-none sm:text-8xl lg:text-9xl">
            Hi, I’m <span className="italic">Iqmal.</span>
          </h1>
          <TextType
            text={["Fullstack Web Developer", "AI Automation"]}
            typingSpeed={75}
            pauseDuration={1500}
            initialDelay={5}
            showCursor
            cursorCharacter="█"
            deletingSpeed={50}
            cursorBlinkDuration={0.5}
            className="role mt-3 text-3xl font-thin! leading-tight tracking-[0.06em]! sm:text-5xl"
          />
        </div>

        <AnimatedProfile />
      </section>
      <section className=""></section>
    </main>
  );
}
