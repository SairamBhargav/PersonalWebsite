export const site = {
  name: "Bhargav Sairam",
  shortName: "BS",
  url: "https://bhargavsairam.me",
  role: "AI/ML Engineer",
  location: "Boulder, CO",
  email: "bhargav_sairam@outlook.com",
  current: { label: "AI/ML Intern", org: "CACI" },
  description:
    "Bhargav Sairam: Computer Science student at CU Boulder and AI/ML intern at CACI, building machine-learning systems for satellite imagery, computer vision and data pipelines.",
  hero: {
    intro: "CS at CU Boulder · AI/ML Intern at CACI.",
    // `*…*` renders in italic serif.
    statement:
      "I build machine-learning systems that hold up *in the real world*, from satellite imagery to production data pipelines.",
  },
  about: [
    "I'm a Computer Science student at the University of Colorado Boulder (Dean's List, 3.78 GPA) and an AI/ML intern at CACI, where I work on geospatial machine learning with satellite imagery.",
    "I've been doing applied ML since high school, starting with a published research project on predicting health incidents in assisted-living facilities. Since then I've built data pipelines, full-stack apps and computer-vision systems.",
    "I like problems where the hard part isn't the model. It's making the model useful in the real world.",
  ],
  now: {
    updated: "2026-09",
    items: [
      "Interning on the AI/ML team at CACI: geospatial ML with Sentinel-2 imagery.",
      "Junior year at CU Boulder: Neural Networks, Operating Systems.",
      "Building a land-cover classifier that runs entirely in your browser.",
    ],
  },
  links: {
    github: "https://github.com/SairamBhargav",
    linkedin: "https://www.linkedin.com/in/bhargavsairam/",
    resume: "/resume.pdf",
  },
} as const;

export type Site = typeof site;
