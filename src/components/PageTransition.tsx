"use client";

import { LazyMotion, domAnimation, m, useReducedMotion } from "motion/react";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

type TransitionPhase = "idle" | "covering" | "revealing";

const transitionEase = [0.76, 0, 0.24, 1] as const;

export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const [phase, setPhase] = useState<TransitionPhase>("idle");
  const originPathRef = useRef(pathname);
  const targetHrefRef = useRef<string | null>(null);
  const targetHashRef = useRef<string>("");

  useEffect(() => {
    if (phase !== "idle") return;

    const handleInternalNavigation = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        prefersReducedMotion
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest("a");
      if (
        !anchor ||
        anchor.hasAttribute("download") ||
        anchor.dataset.noPageTransition === "true"
      ) {
        return;
      }

      const anchorTarget = anchor.getAttribute("target");
      if (anchorTarget && anchorTarget !== "_self") return;

      const rawHref = anchor.getAttribute("href");
      if (!rawHref) return;

      const currentUrl = new URL(window.location.href);
      const destination = new URL(
        rawHref,
        rawHref.startsWith("/") ? currentUrl.origin : currentUrl,
      );
      if (
        destination.origin !== window.location.origin ||
        !["http:", "https:"].includes(destination.protocol) ||
        /\.[a-z0-9]+$/i.test(destination.pathname)
      ) {
        return;
      }

      const isSameDocument =
        destination.pathname === currentUrl.pathname &&
        destination.search === currentUrl.search;

      if (isSameDocument) return;

      event.preventDefault();
      event.stopPropagation();

      originPathRef.current = pathname;
      targetHrefRef.current = `${destination.pathname}${destination.search}`;
      targetHashRef.current = destination.hash;
      setPhase("covering");
    };

    document.addEventListener("click", handleInternalNavigation, true);

    return () => {
      document.removeEventListener("click", handleInternalNavigation, true);
    };
  }, [pathname, phase, prefersReducedMotion]);

  useEffect(() => {
    if (phase !== "covering" || pathname === originPathRef.current) return;

    const frame = window.requestAnimationFrame(() => {
      const targetHash = targetHashRef.current;

      if (targetHash) {
        const targetId = decodeURIComponent(targetHash.slice(1));
        const targetElement = document.getElementById(targetId);

        targetElement?.scrollIntoView({ behavior: "auto", block: "start" });
        window.history.replaceState(
          window.history.state,
          "",
          `${window.location.pathname}${window.location.search}${targetHash}`,
        );
      }

      setPhase("revealing");
    });

    return () => window.cancelAnimationFrame(frame);
  }, [pathname, phase]);

  const handleAnimationComplete = useCallback(() => {
    if (phase === "covering") {
      const targetHref = targetHrefRef.current;

      if (!targetHref) {
        setPhase("idle");
        return;
      }

      router.push(targetHref, { scroll: !targetHashRef.current });
      return;
    }

    if (phase === "revealing") {
      targetHrefRef.current = null;
      targetHashRef.current = "";
      originPathRef.current = pathname;
      setPhase("idle");
    }
  }, [pathname, phase, router]);

  const clipPath =
    phase === "covering"
      ? "circle(150vmax at 100% 100%)"
      : phase === "revealing"
        ? "circle(0vmax at 0% 0%)"
        : "circle(0vmax at 100% 100%)";

  return (
    <>
      {children}

      <LazyMotion features={domAnimation}>
        <m.div
          aria-hidden="true"
          data-page-transition
          className="pointer-events-none fixed inset-0 z-[9999] bg-[#111114]"
          initial={false}
          animate={{ clipPath }}
          transition={
            phase === "idle"
              ? { duration: 0 }
              : {
                  duration: phase === "covering" ? 0.72 : 0.78,
                  ease: transitionEase,
                }
          }
          onAnimationComplete={handleAnimationComplete}
          style={{
            pointerEvents: phase === "idle" ? "none" : "auto",
            willChange: "clip-path",
          }}
        />
      </LazyMotion>
    </>
  );
}
