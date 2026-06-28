import ExperienceSection from "@/sections/experience-section";
import HeroSection from "@/sections/hero-section";
import IntroSection from "@/sections/intro-section";

export default function Home() {
  return (
    <main className="relative isolate min-h-dvh overflow-hidden bg-background text-foreground">
      <HeroSection />
      <IntroSection />
      <ExperienceSection />
    </main>
  );
}
