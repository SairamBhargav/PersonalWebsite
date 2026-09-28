export type ProjectTag = "ML" | "Computer Vision" | "Geospatial" | "Full-Stack" | "Data Eng" | "Research";

export type Glyph = "tiles" | "swipe" | "face" | "pulse" | "flow";

export type Project = {
  slug: string;
  title: string;
  summary: string;
  role: string;
  date: string;
  status?: "in-progress";
  tags: ProjectTag[];
  stack: string[];
  featured: boolean;
  glyph: Glyph;
  metrics?: { label: string; value: string }[];
  links?: { github?: string; demo?: string; paper?: string };
  demo?: "eurosat" | "face";
};

export const projects: Project[] = [
  {
    slug: "sentinel-landcover",
    title: "Land-Cover Classification from Sentinel-2",
    summary:
      "A ResNet-18 fine-tuned on satellite imagery, quantized to int8 and running entirely in your browser, with class-activation heatmaps that show where the model looks.",
    role: "Solo",
    date: "2026",
    status: "in-progress",
    tags: ["ML", "Computer Vision", "Geospatial"],
    stack: ["PyTorch", "ONNX Runtime Web", "Sentinel-2", "Web Workers"],
    featured: true,
    glyph: "tiles",
    links: { github: "https://github.com/SairamBhargav/PersonalWebsite/tree/main/ml/eurosat" },
    demo: "eurosat",
  },
  {
    slug: "matchflix",
    title: "MatchFlix",
    summary:
      "A swipe-based movie discovery app where groups match on what to watch together, with LLM-powered recommendations from swipe behavior.",
    role: "Full-stack developer",
    date: "2025",
    tags: ["Full-Stack", "ML"],
    stack: ["Node.js", "Express", "PostgreSQL", "Docker", "TMDB API", "Gemini", "OpenAI"],
    featured: true,
    glyph: "swipe",
    // TODO: add repo / live links and screenshots.
  },
  {
    slug: "facial-recognition-attendance",
    title: "Facial Recognition Attendance",
    summary:
      "Replaced manual sign-in at KTP meetings with face detection and identity verification, making attendance up to 80% faster and more accurate.",
    role: "Solo",
    date: "2025",
    tags: ["Computer Vision", "ML"],
    stack: ["Python", "OpenCV", "face-recognition", "NumPy", "Pandas"],
    featured: true,
    glyph: "face",
    metrics: [{ label: "Faster attendance", value: "up to 80%" }],
    links: { github: "https://github.com/SairamBhargav/FacialRecognitionSystem-" },
    demo: "face",
  },
  {
    slug: "assisted-living-early-warning",
    title: "Early-Warning System for Assisted Living",
    summary:
      "Research at Navjoy: ML models that predict resident health risks and flag incidents like falls early, validated with caregivers, and a published paper.",
    role: "ML & research intern",
    date: "2022–23",
    tags: ["ML", "Research"],
    stack: ["scikit-learn", "Pandas", "NumPy"],
    featured: false,
    glyph: "pulse",
    // TODO: add paper link.
  },
  {
    slug: "netsuite-cloud-sql-sync",
    title: "NetSuite → Cloud SQL Sync Pipeline",
    summary:
      "An automated daily pipeline moving ERP transactions into Google Cloud SQL for analytics, cutting manual reporting effort by 90%.",
    role: "SWE intern, Namo Cloud Solutions",
    date: "2025",
    tags: ["Data Eng"],
    stack: ["Python", "MySQL", "Google Cloud SQL", "Cloud Scheduler", "OAuth 1.0"],
    featured: false,
    glyph: "flow",
    metrics: [{ label: "Manual reporting", value: "−90%" }],
  },
];

export const allTags: ProjectTag[] = ["ML", "Computer Vision", "Geospatial", "Full-Stack", "Data Eng", "Research"];

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}
