import Link from "next/link";

export default function ProjectPageHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-foreground/10 bg-background/88 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-10 lg:px-12">
        <Link
          href="/"
          className="group flex items-center gap-3"
          aria-label="Back to portfolio home"
        >
          <span className="grid size-9 place-items-center rounded-full bg-foreground font-serif text-lg italic text-background transition-transform duration-300 group-hover:-rotate-6">
            I
          </span>
          <span className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-foreground/75">
            Iqmal / Portfolio
          </span>
        </Link>

        <nav aria-label="Project pages" className="flex items-center gap-5 sm:gap-8">
          <Link
            href="/"
            className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-foreground/50 transition-colors hover:text-foreground"
          >
            Home
          </Link>
          <Link
            href="/projects"
            className="border-b border-foreground pb-1 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-foreground"
          >
            Projects
          </Link>
        </nav>
      </div>
    </header>
  );
}
