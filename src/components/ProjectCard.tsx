import ProjectMediaCarousel, {
  type ProjectImageSlide,
} from "@/components/ProjectMediaCarousel";

export interface Project {
  id: string;
  number: string;
  name: string;
  role: string;
  summary: string;
  highlights: string[];
  techStack: string[];
  images: ProjectImageSlide[];
  link: string | null;
}

interface ProjectCardProps {
  project: Project;
  index: number;
}

export default function ProjectCard({ project, index }: ProjectCardProps) {
  const isReversed = index % 2 !== 0;

  return (
    <article
      data-project-card
      className={`grid gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-12 lg:will-change-[transform,opacity] ${
        isReversed ? "lg:[direction:rtl]" : ""
      }`}
    >
      <ProjectMediaCarousel
        projectNumber={project.number}
        eagerFirstImage={index === 0}
        images={project.images}
      />

      {/* Content */}
      <div className="flex flex-col justify-center lg:[direction:ltr]">
        <div>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.26em] text-foreground/45">
            {project.role}
          </p>

          <h3 className="mt-4 text-[clamp(1.5rem,4vw,2.5rem)] font-bold leading-[1.05] tracking-[-0.04em]">
            {project.name}
          </h3>

          <p className="mt-4 max-w-[55ch] text-sm leading-relaxed text-foreground/65 sm:text-base sm:leading-[1.7]">
            {project.summary}
          </p>
        </div>

        {/* Highlights */}
        <div className="mt-6 sm:mt-8">
          <p className="mb-2 text-[0.6rem] font-bold uppercase tracking-[0.24em] text-foreground/40 sm:mb-3 sm:text-xs">
            Highlights
          </p>
          <ul className="space-y-2">
            {project.highlights.map((highlight, i) => (
              <li
                key={highlight}
                className="flex items-start gap-3 text-[0.75rem] leading-relaxed text-foreground/70 sm:text-sm"
              >
                <span className="mt-0.5 font-mono text-[0.6rem] font-semibold text-foreground/35">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Tech Stack */}
        <div className="mt-6 flex flex-wrap gap-2 sm:mt-8">
          {project.techStack.map((tech) => (
            <span
              key={tech}
              className="rounded-full border border-foreground/12 px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-foreground/55 transition-colors duration-300 hover:border-foreground/30 hover:text-foreground/80 sm:text-xs"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
