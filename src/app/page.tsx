import ExperienceSection from "@/sections/experience-section";
import HeroSection from "@/sections/hero-section";
import IntroSection from "@/sections/intro-section";
import ProjectsSection from "@/sections/projects-section";
import GithubContributions from "@/sections/github-contributions";
import ContactSection from "@/sections/contact-section";
import StaggeredMenu from "@/components/StaggeredMenu";

const navigationItems = [
  { label: "Home", ariaLabel: "Go to home section", link: "#home" },
  { label: "About", ariaLabel: "Go to about section", link: "#about" },
  {
    label: "Experience",
    ariaLabel: "Go to experience section",
    link: "#experience",
  },
  {
    label: "Projects",
    ariaLabel: "Go to projects section",
    link: "#projects",
  },
  { label: "Contact", ariaLabel: "Go to contact section", link: "#contact" },
];

const socialItems = [
  { label: "GitHub", link: "https://github.com/fthliqml" },
  { label: "LinkedIn", link: "https://linkedin.com/in/mfiqmal" },
  { label: "Instagram", link: "https://instagram.com/fthliqml" },
];

export default function Home() {
  return (
    <main className="relative isolate min-h-dvh overflow-hidden bg-background text-foreground">
      <StaggeredMenu
        isFixed
        position="right"
        items={navigationItems}
        socialItems={socialItems}
        colors={["#aeb8b0", "#3d403f"]}
        accentColor="#aeb8b0"
        logoText="Iqmal / Portfolio"
        menuButtonColor="#111114"
        openMenuButtonColor="#111114"
      />
      <HeroSection />
      <IntroSection />
      <ExperienceSection />
      <ProjectsSection />
      <GithubContributions />
      <ContactSection />
    </main>
  );
}
