import Image from "next/image";

export interface Experience {
  id: string;
  role: string;
  company: string;
  period: string;
  duration: string;
  summary: string;
  highlights: string[];
  image: string | null;
  imageAlt: string;
  monogram: string;
}

interface ExperienceCardProps {
  experience: Experience;
  index: number;
}

function formatCardNumber(value: number) {
  return String(value).padStart(2, "0");
}

function ExperienceVisual({ experience }: { experience: Experience }) {
  if (experience.image) {
    return (
      <Image
        src={experience.image}
        alt={experience.imageAlt}
        fill
        sizes="(min-width: 1024px) 440px, 100vw"
        className="h-full w-full object-cover grayscale transition-[filter,scale] duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/media:scale-105 group-hover/media:grayscale-0 motion-reduce:transition-none motion-reduce:group-hover/media:scale-100"
      />
    );
  }

  return (
    <div
      className="absolute inset-0 overflow-hidden bg-accent"
      aria-hidden="true"
    >
      <div className="absolute inset-5 border border-card-foreground/12 sm:inset-7" />
      <div className="absolute -right-20 top-16 h-px w-[130%] -rotate-12 bg-card-foreground/20" />
      <div className="absolute -left-16 bottom-28 h-px w-[130%] rotate-12 bg-card-foreground/20" />
      <div className="absolute right-8 top-8 font-mono text-[0.65rem] uppercase tracking-[0.28em] text-card-foreground/50">
        Selected work
      </div>

      <div className="absolute inset-x-8 bottom-8 sm:inset-x-10 sm:bottom-10">
        <p className="text-[clamp(5.5rem,14vw,10rem)] font-bold leading-[0.72] tracking-[-0.09em] text-card-foreground/10">
          {experience.monogram}
        </p>
        <p className="mt-8 max-w-[24rem] text-sm font-semibold uppercase leading-relaxed tracking-[0.18em] text-card-foreground/70">
          {experience.company}
        </p>
      </div>
    </div>
  );
}

export default function ExperienceCard({
  experience,
  index,
}: ExperienceCardProps) {
  return (
    <article
      data-experience-card
      className="experience-card grid h-full w-[calc(100vw-2rem)] shrink-0 snap-center grid-rows-[auto_minmax(0,1fr)] overflow-hidden border border-white/10 bg-card text-card-foreground shadow-[0_32px_90px_rgba(0,0,0,0.28)] sm:w-[calc(100vw-5rem)] sm:grid-rows-none md:snap-none md:grid-cols-[1.28fr_0.92fr] lg:w-[min(1120px,calc(100vw-12rem))] motion-reduce:h-auto motion-reduce:w-full motion-reduce:snap-none"
    >
      <div className="flex min-h-0 flex-col px-6 py-5 sm:px-10 sm:py-10 lg:px-14 lg:py-12">
        <header>
          <div className="font-mono text-[0.65rem] uppercase tracking-[0.26em] text-card-foreground/50">
            <span>Professional experience</span>
          </div>

          <h3 className="mt-5 max-w-[16ch] text-[clamp(1.75rem,8vw,2.15rem)] font-bold uppercase leading-[0.9] tracking-[-0.055em] sm:mt-10 sm:text-[clamp(2rem,4.2vw,4rem)] sm:leading-[0.93]">
            {experience.role}
          </h3>

          <p className="mt-4 text-[0.8rem] font-bold uppercase leading-relaxed tracking-[0.08em] sm:mt-5 sm:text-base">
            {experience.company}
          </p>
        </header>

        <p className="mt-6 max-w-[55ch] text-[0.8rem] leading-normal text-card-foreground/75 sm:mt-12 sm:text-lg sm:leading-[1.65] lg:mt-auto lg:pt-14">
          {experience.summary}
        </p>

        <div className="mt-5 sm:mt-10">
          <p className="mb-2 text-[0.6rem] font-bold uppercase tracking-[0.24em] text-card-foreground/50 sm:mb-4 sm:text-xs">
            Highlights
          </p>
          <ol className="grid sm:grid-cols-2">
            {experience.highlights.map((highlight, highlightIndex) => (
              <li
                key={highlight}
                className="flex items-center gap-3 border-t border-card-foreground/18 py-2 pr-2 sm:min-h-16 sm:gap-4 sm:py-4 sm:pr-4"
              >
                <span className="font-mono text-[0.6rem] font-semibold text-card-foreground/45 sm:text-xs">
                  {formatCardNumber(highlightIndex + 1)}
                </span>
                <span className="text-[0.65rem] font-semibold uppercase leading-[1.35] tracking-[0.06em] sm:text-[0.8rem] sm:leading-relaxed">
                  {highlight}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="group/media relative min-h-0 overflow-hidden border-t border-card-foreground/12 sm:min-h-90 md:min-h-full md:border-l md:border-t-0">
        <ExperienceVisual experience={experience} />
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/55 via-black/5 to-transparent" />
        <p className="absolute right-5 top-4 font-mono text-3xl font-semibold text-white sm:right-7 sm:top-6 sm:text-4xl">
          {formatCardNumber(index + 1)}
        </p>
        <p className="absolute bottom-4 left-5 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-white sm:bottom-6 sm:left-7 sm:text-xs">
          {experience.period}
        </p>
      </div>
    </article>
  );
}
