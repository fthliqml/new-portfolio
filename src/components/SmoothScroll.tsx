"use client";

import { useEffect } from "react";
import type LenisInstance from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (
      window.matchMedia("(pointer: coarse), (max-width: 767px)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    let lenis: LenisInstance | null = null;
    let cancelled = false;

    const updateLenis = (time: number) => {
      lenis?.raf(time * 1000);
    };

    async function setupLenis() {
      const { default: LenisClass } = await import("lenis");

      if (cancelled) {
        return;
      }

      lenis = new LenisClass({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
      });

      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(updateLenis);
      gsap.ticker.lagSmoothing(0);
    }

    setupLenis();

    return () => {
      cancelled = true;
      gsap.ticker.remove(updateLenis);
      lenis?.destroy();
    };
  }, []);

  return <>{children}</>;
}
