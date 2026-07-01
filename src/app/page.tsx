import ExperienceSection from "@/sections/experience-section";
import HeroSection from "@/sections/hero-section";
import IntroSection from "@/sections/intro-section";
import ProjectsSection from "@/sections/projects-section";
import GithubContributions from "@/sections/github-contributions";
import ContactSection from "@/sections/contact-section";
import StaggeredMenu from "@/components/StaggeredMenu";
import { siteConfig } from "@/lib/site";

const personId = `${siteConfig.url}/#person`;
const websiteId = `${siteConfig.url}/#website`;
const profilePageId = `${siteConfig.url}/#profile-page`;

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": personId,
      name: siteConfig.name,
      alternateName: siteConfig.shortName,
      url: siteConfig.url,
      image: `${siteConfig.url}/iqmal.png`,
      jobTitle: siteConfig.role,
      mainEntityOfPage: { "@id": profilePageId },
      address: {
        "@type": "PostalAddress",
        addressLocality: siteConfig.location.city,
        addressRegion: siteConfig.location.region,
        addressCountry: siteConfig.location.countryCode,
      },
      sameAs: Object.values(siteConfig.social),
      knowsAbout: [
        "Full-stack web development",
        "Next.js",
        "TypeScript",
        "Laravel",
        "PostgreSQL",
        "REST APIs",
      ],
    },
    {
      "@type": "WebSite",
      "@id": websiteId,
      url: siteConfig.url,
      name: "Iqmal Portfolio",
      description: siteConfig.description,
      inLanguage: siteConfig.language,
      publisher: { "@id": personId },
    },
    {
      "@type": "ProfilePage",
      "@id": profilePageId,
      url: siteConfig.url,
      name: siteConfig.title,
      description: siteConfig.description,
      inLanguage: siteConfig.language,
      isPartOf: { "@id": websiteId },
      mainEntity: { "@id": personId },
    },
  ],
};

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
  { label: "Resume", link: "/resume.pdf" },
  { label: "GitHub", link: "https://github.com/fthliqml" },
  { label: "LinkedIn", link: "https://linkedin.com/in/mfiqmal" },
  { label: "Instagram", link: "https://instagram.com/fthliqml" },
];

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
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
    </>
  );
}
