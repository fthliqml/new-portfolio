"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef, useMemo, useState } from "react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface DayData {
  date: string;
  count: number;
  level: number;
  dayOfWeek: number;
  weekIndex: number;
  monthName: string;
}

// Helper to format date
function formatDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
}

// Generate deterministic contributions for the past year (53 weeks * 7 days)
function generateContributions(): {
  days: DayData[];
  total: number;
  longestStreak: number;
  currentStreak: number;
  activeDaysPercent: number;
} {
  const days: DayData[] = [];
  const today = new Date();
  
  // Start from 53 weeks ago, aligned to the starting Sunday
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 364 - today.getDay());

  let total = 0;
  let currentStreak = 0;
  let longestStreak = 0;
  let activeDays = 0;
  let tempStreak = 0;

  // Let's create a seedable-like random function to keep it deterministic
  let seed = 42;
  const random = () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  for (let w = 0; w < 53; w++) {
    for (let d = 0; d < 7; d++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + (w * 7) + d);
      
      if (currentDate > today) break;

      const dayOfWeek = currentDate.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      // Determine contribution probability & count based on day of week and season
      let prob = isWeekend ? 0.25 : 0.75;
      
      // Add simulated seasonal/release activity cycles
      const month = currentDate.getMonth();
      if (month === 9 || month === 10) prob += 0.15; // High activity in Oct/Nov (simulated release)
      if (month === 11 && currentDate.getDate() > 20) prob -= 0.5; // Holiday season dip

      let count = 0;
      let level = 0;

      if (random() < prob) {
        const randVal = random();
        if (randVal < 0.5) {
          count = Math.floor(random() * 3) + 1; // 1-3
          level = 1;
        } else if (randVal < 0.8) {
          count = Math.floor(random() * 3) + 4; // 4-6
          level = 2;
        } else if (randVal < 0.95) {
          count = Math.floor(random() * 4) + 7; // 7-10
          level = 3;
        } else {
          count = Math.floor(random() * 5) + 11; // 11-15
          level = 4;
        }
      }

      total += count;

      // Calculate streak stats
      if (count > 0) {
        activeDays++;
        tempStreak++;
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
      } else {
        tempStreak = 0;
      }

      days.push({
        date: formatDate(currentDate),
        count,
        level,
        dayOfWeek,
        weekIndex: w,
        monthName: months[month],
      });
    }
  }

  // Calculate current streak from the end
  let tempCurrent = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].count > 0) {
      tempCurrent++;
    } else {
      // If today or yesterday is 0, streak is broken
      if (i < days.length - 2) {
        break;
      }
    }
  }
  currentStreak = tempCurrent;

  const activeDaysPercent = Math.round((activeDays / days.length) * 100);

  return { days, total, longestStreak, currentStreak, activeDaysPercent };
}

export default function GithubContributions() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const gridRef = useRef<SVGSVGElement | null>(null);
  const totalCounterRef = useRef<HTMLDivElement | null>(null);
  const streakCounterRef = useRef<HTMLDivElement | null>(null);
  const activeCounterRef = useRef<HTMLDivElement | null>(null);
  const bgTextRef = useRef<HTMLDivElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const [hoveredCell, setHoveredCell] = useState<{
    date: string;
    count: number;
    x: number;
    y: number;
  } | null>(null);

  const { days, total, longestStreak, activeDaysPercent } = useMemo(
    () => generateContributions(),
    []
  );

  // Compute month labels positioning
  const monthLabels = useMemo(() => {
    const labels: { label: string; x: number }[] = [];
    let lastMonth = "";
    days.forEach((day) => {
      if (day.dayOfWeek === 0 && day.monthName !== lastMonth) {
        labels.push({
          label: day.monthName,
          x: day.weekIndex * 13,
        });
        lastMonth = day.monthName;
      }
    });

    // Filter labels to prevent collision if they are too close to each other
    // (e.g. at the beginning of the year where a month label might only span 1-2 weeks)
    const filteredLabels: { label: string; x: number }[] = [];
    for (let i = 0; i < labels.length; i++) {
      const current = labels[i];
      const next = labels[i + 1];
      
      // If the next label is too close (less than 35px / ~3 weeks away), skip the current one
      if (next && (next.x - current.x < 35)) {
        continue;
      }
      filteredLabels.push(current);
    }
    return filteredLabels;
  }, [days]);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const totalCounter = totalCounterRef.current;
      const streakCounter = streakCounterRef.current;
      const activeCounter = activeCounterRef.current;
      const bgText = bgTextRef.current;

      if (!section || !totalCounter || !streakCounter || !activeCounter || !bgText) return;

      const media = gsap.matchMedia();

      media.add(
        {
          isAll: "(min-width: 0px)",
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { reduceMotion } = context.conditions ?? {};

          if (reduceMotion) {
            gsap.set(".contrib-cell", { scale: 1, opacity: 1 });
            return;
          }

          // Parallax background text
          gsap.fromTo(
            bgText,
            { y: -50, opacity: 0 },
            {
              y: 50,
              opacity: 1,
              ease: "none",
              scrollTrigger: {
                trigger: section,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            }
          );

          // Staggered grid cell entry reveal
          gsap.fromTo(
            ".contrib-cell",
            { scale: 0, opacity: 0, transformOrigin: "center center" },
            {
              scale: 1,
              opacity: 1,
              stagger: {
                grid: [7, 53],
                from: "start",
                amount: 1.5,
              },
              duration: 0.6,
              ease: "back.out(1.5)",
              scrollTrigger: {
                trigger: ".contrib-grid-wrapper",
                start: "top 85%",
              },
            }
          );

          // Counter animations
          const animateCounter = (element: HTMLElement, finalValue: number, suffix = "") => {
            const obj = { val: 0 };
            gsap.to(obj, {
              val: finalValue,
              duration: 2,
              ease: "power2.out",
              scrollTrigger: {
                trigger: element,
                start: "top 90%",
              },
              onUpdate: () => {
                element.innerText = Math.floor(obj.val).toLocaleString() + suffix;
              },
            });
          };

          animateCounter(totalCounter, total);
          animateCounter(streakCounter, longestStreak, " days");
          animateCounter(activeCounter, activeDaysPercent, "%");
        }
      );

      return () => media.revert();
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      aria-labelledby="github-heading"
      className="github-section relative z-20 -mt-8 bg-background px-6 pt-24 pb-32 text-foreground shadow-[0_20px_50px_rgba(0,0,0,0.08)] sm:px-10 lg:px-24"
    >
      <h2 id="github-heading" className="sr-only">
        GitHub Contributions
      </h2>

      {/* Large Background Text */}
      <div
        ref={bgTextRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-12 flex select-none items-center justify-center text-center text-[clamp(4rem,15vw,15rem)] font-bold leading-none tracking-[-0.075em] text-foreground/4.5 blur-[3px]"
      >
        CONTRIBUTIONS
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mb-16 flex items-end justify-between gap-6 border-b border-foreground/10 pb-8 lg:mb-20">
          <div>
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.3em] text-foreground/45">
              Coding activity
            </p>
            <p className="mt-3 text-3xl font-semibold uppercase tracking-[-0.035em] text-foreground">
              GitHub Contributions
            </p>
          </div>
          <p className="hidden max-w-104 text-right text-sm leading-relaxed text-foreground/45 md:block">
            Open-source activity tracker showing commits, pull requests, and code reviews.
          </p>
        </div>

        {/* Content Layout */}
        <div className="grid gap-12 lg:grid-cols-[1fr_2fr] lg:gap-16">
          {/* Stats Cards */}
          <div className="flex flex-col justify-center gap-6">
            <div className="rounded-2xl border border-foreground/12 bg-card/30 p-6 backdrop-blur-xs">
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-foreground/50">
                Last 365 Days
              </p>
              <div
                ref={totalCounterRef}
                className="mt-3 font-serif text-5xl font-bold text-foreground sm:text-6xl"
              >
                {total}
              </div>
              <p className="mt-2 text-sm text-foreground/60">
                contributions in the last year
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-foreground/12 bg-card/20 p-5">
                <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-foreground/50">
                  Longest Streak
                </p>
                <div
                  ref={streakCounterRef}
                  className="mt-2 text-2xl font-semibold text-foreground"
                >
                  {longestStreak} days
                </div>
              </div>
              <div className="rounded-xl border border-foreground/12 bg-card/20 p-5">
                <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-foreground/50">
                  Active Days
                </p>
                <div
                  ref={activeCounterRef}
                  className="mt-2 text-2xl font-semibold text-foreground"
                >
                  {activeDaysPercent}%
                </div>
              </div>
            </div>
          </div>

          {/* GitHub Grid Calendar Wrapper */}
          <div
            ref={wrapperRef}
            className="contrib-grid-wrapper min-w-0 relative flex flex-col justify-center rounded-2xl border border-foreground/12 bg-card/10 p-6 sm:p-8"
          >
            <div
              data-lenis-prevent
              className="relative w-full min-w-0 overflow-x-auto pb-2 contrib-grid-scroll"
            >
              <style>{`
                .contrib-grid-scroll::-webkit-scrollbar {
                  height: 4px;
                }
                .contrib-grid-scroll::-webkit-scrollbar-track {
                  background: rgba(255, 255, 255, 0.03);
                  border-radius: 99px;
                }
                .contrib-grid-scroll::-webkit-scrollbar-thumb {
                  background: rgba(255, 255, 255, 0.12);
                  border-radius: 99px;
                }
              `}</style>
              <svg
                ref={gridRef}
                width={720}
                height={125}
                viewBox="0 0 720 125"
                className="mx-auto"
                onMouseLeave={() => setHoveredCell(null)}
              >
                {/* Month Labels */}
                <g className="text-[9px] font-medium fill-foreground/45 select-none">
                  {monthLabels.map((m, idx) => (
                    <text key={idx} x={m.x + 22} y={15}>
                      {m.label}
                    </text>
                  ))}
                </g>

                {/* Day Labels */}
                <g className="text-[8px] font-medium fill-foreground/35 select-none" transform="translate(0, 20)">
                  <text x={0} y={18}>Mon</text>
                  <text x={0} y={44}>Wed</text>
                  <text x={0} y={70}>Fri</text>
                </g>

                {/* Contribution Cells */}
                <g className="contrib-grid" transform="translate(22, 20)">
                  {days.map((day, index) => {
                    // Cell colors representing different levels matching the light/beige theme
                    const levelColors = [
                      "fill-foreground/10", // Level 0: subtle beige grey
                      "fill-emerald-800/25", // Level 1: light sage/green
                      "fill-emerald-700/50", // Level 2: medium green
                      "fill-emerald-600/80", // Level 3: dark green
                      "fill-emerald-500",    // Level 4: signature emerald green
                    ];

                    const col = day.weekIndex;
                    const row = day.dayOfWeek;

                    return (
                      <rect
                        key={index}
                        className={`contrib-cell cursor-pointer transition-colors duration-150 ${levelColors[day.level]} hover:stroke-foreground/20 hover:stroke-[1.5px]`}
                        width={10}
                        height={10}
                        rx={2}
                        ry={2}
                        x={col * 13}
                        y={row * 13}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const wrapperRect = wrapperRef.current?.getBoundingClientRect();
                          if (wrapperRect) {
                            setHoveredCell({
                              date: day.date,
                              count: day.count,
                              x: rect.left - wrapperRect.left + rect.width / 2,
                              y: rect.top - wrapperRect.top - 45,
                            });
                          }
                        }}
                      />
                    );
                  })}
                </g>
              </svg>
            </div>

            {/* Grid Hover Tooltip */}
            {hoveredCell && (
              <div
                className="pointer-events-none absolute z-30 rounded-md bg-foreground px-2.5 py-1.5 text-center font-mono text-[10px] leading-tight text-background shadow-lg transition-all duration-100 ease-out -translate-x-1/2"
                style={{
                  left: `${hoveredCell.x}px`,
                  top: `${hoveredCell.y}px`,
                }}
              >
                <span className="font-semibold block text-[11px]">
                  {hoveredCell.count === 0 ? "No" : hoveredCell.count} contributions
                </span>
                <span className="opacity-70 text-[9px] mt-0.5 block">{hoveredCell.date}</span>
              </div>
            )}

            {/* Legend */}
            <div className="mt-6 flex items-center justify-between text-[10px] text-foreground/45 border-t border-foreground/8 pt-4">
              <a
                href="https://github.com/fthliqml"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono hover:text-foreground hover:underline transition-colors"
              >
                @fthliqml
              </a>
              <div className="flex items-center gap-1.5 font-mono">
                <span>Less</span>
                <span className="inline-block w-2.5 h-2.5 rounded-sm bg-foreground/10" />
                <span className="inline-block w-2.5 h-2.5 rounded-sm bg-emerald-800/25" />
                <span className="inline-block w-2.5 h-2.5 rounded-sm bg-emerald-700/50" />
                <span className="inline-block w-2.5 h-2.5 rounded-sm bg-emerald-600/80" />
                <span className="inline-block w-2.5 h-2.5 rounded-sm bg-emerald-500" style={{ backgroundColor: "#10b981" }} />
                <span>More</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
