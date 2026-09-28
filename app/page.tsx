import { Hero } from "@/components/hero";
import { PageTransition } from "@/components/page-transition";
import { About } from "@/components/sections/about";
import { Education, Research, Skills } from "@/components/sections/background";
import { Contact } from "@/components/sections/contact";
import { ExperienceTimeline } from "@/components/sections/experience";
import { Work } from "@/components/sections/work";
import { education } from "@/content/profile";
import { site } from "@/content/site";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  url: site.url,
  image: `${site.url}/images/headshot.jpg`,
  jobTitle: `${site.current.label}, ${site.current.org}`,
  email: `mailto:${site.email}`,
  address: { "@type": "PostalAddress", addressLocality: "Boulder", addressRegion: "CO", addressCountry: "US" },
  alumniOf: { "@type": "CollegeOrUniversity", name: education.school },
  knowsAbout: ["Machine Learning", "Computer Vision", "Geospatial ML", "Data Engineering", "Full-Stack Development"],
  sameAs: [site.links.github, site.links.linkedin],
};

export default function Home() {
  return (
    <PageTransition>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <Hero />
      <About />
      <Work />
      <ExperienceTimeline />
      <Research />
      <Skills />
      <Education />
      <Contact />
    </PageTransition>
  );
}
