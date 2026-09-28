export const education = {
  school: "University of Colorado Boulder",
  degree: "B.S. Computer Science",
  location: "Boulder, CO",
  graduation: "Expected May 2028",
  gpa: "3.78 / 4.00",
  honors: ["Dean's List"],
  coursework: [
    "Neural Networks",
    "Data Science",
    "Algorithms",
    "Data Structures",
    "Operating Systems",
    "Computer Systems",
    "Database Systems",
    "Linear Algebra",
    "Discrete Structures",
    "Software Development",
    "Calculus I & II",
  ],
};

export const skills: { group: string; items: string[] }[] = [
  {
    group: "ML & Data",
    items: ["PyTorch", "TensorFlow", "scikit-learn", "XGBoost", "NumPy", "Pandas", "OpenCV"],
  },
  {
    group: "Geospatial",
    items: ["GeoPandas", "rasterio", "Google Earth Engine", "Sentinel-2", "NDVI / NDWI"],
  },
  {
    group: "Languages",
    items: ["Python", "C++", "C", "C#", "Java", "JavaScript", "TypeScript", "SQL"],
  },
  {
    group: "Backend & Infra",
    items: ["Node.js", "Express", "PostgreSQL", "MySQL", "Docker", "GCP", "REST APIs", "CI/CD"],
  },
];

export type Publication = {
  title: string;
  venue: string;
  year: string;
  href?: string;
  note?: string;
};

// TODO: add the Navjoy paper (title, venue, year, link). The Research section stays hidden while this is empty.
export const publications: Publication[] = [];
