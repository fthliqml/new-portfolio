import ExperienceCard, { type Experience } from "@/components/ExperienceCard";
import experienceData from "@/data/experiences.json";

const experiences: Experience[] = experienceData;

export default function ExperienceSection() {
  return (
    <section
      aria-labelledby="experience-heading"
      className="relative h-svh overflow-hidden bg-subtle p-4 sm:h-auto sm:min-h-screen sm:px-10 sm:py-28 lg:px-24 lg:py-32"
    >
      <h2 id="experience-heading" className="sr-only">
        Professional experience
      </h2>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex select-none items-center justify-center text-center text-[clamp(5rem,17vw,17rem)] font-bold leading-none tracking-[-0.075em] text-white/4.5 blur-[3px]"
      >
        EXPERIENCE
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-16 hidden items-end justify-between gap-6 sm:flex">
          <div>
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.3em] text-white/45">
              Career archive
            </p>
            <p className="mt-3 text-3xl font-semibold uppercase tracking-[-0.035em] text-white">
              experiences
            </p>
          </div>

          <p className="hidden max-w-104 text-right text-sm leading-relaxed text-white/45 md:block">
            Roles, systems, and the work behind them.
          </p>
        </div>

        <div data-experience-viewport>
          <div
            data-experience-track
            className="experience-track mx-auto flex w-max gap-4 sm:gap-8"
          >
            {experiences.map((experience, index) => (
              <ExperienceCard
                key={experience.id}
                experience={experience}
                index={index}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
