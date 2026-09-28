export type Experience = {
  org: string;
  role: string;
  location: string;
  start: string;
  end: string;
  highlight?: string;
  bullets: string[];
  stack: string[];
  project?: string;
};

// NOTE: CACI wording mirrors the resume. Confirm with your manager before launch (PLAN.md §12.1).
export const experience: Experience[] = [
  {
    org: "CACI International",
    role: "AI/ML Intern",
    location: "Colorado Springs, CO",
    start: "May 2026",
    end: "Present",
    highlight: "41,600 → 160 priority cells",
    bullets: [
      "Lead development of an end-to-end geospatial ML pipeline fusing five open-source signals into a composite risk score, narrowing a 41,600-cell search grid to 160 priority cells for satellite tasking.",
      "Engineered a 4-channel ResNet-50 classifier (RGB + near-infrared Sentinel-2 imagery) with transfer learning and class-imbalance loss weighting, validated with 5-fold spatial cross-validation to eliminate geographic leakage.",
      "Designed a geometry-based cascade filter (NDVI/NDWI spectral masking + shape descriptors) that cut false positives 95% downstream of the CNN.",
    ],
    stack: ["PyTorch", "GeoPandas", "rasterio", "Earth Engine", "Sentinel-2"],
  },
  {
    org: "Namo Cloud Solutions",
    role: "Software Engineering Intern, AI/ERP Integration",
    location: "Denver, CO",
    start: "May 2025",
    end: "Aug 2025",
    highlight: "−90% manual reporting",
    bullets: [
      "Built and deployed a data integration pipeline linking NetSuite ERP with Google Cloud SQL via RESTlet APIs and OAuth 1.0.",
      "Automated daily transactional sync with Python, MySQL and Cloud Scheduler, cutting manual reporting effort by 90%.",
      "Designed and optimized staging databases for faster ERP analysis and downstream AI/BI applications.",
    ],
    stack: ["Python", "MySQL", "GCP", "OAuth 1.0", "REST"],
    project: "netsuite-cloud-sql-sync",
  },
  {
    org: "Navjoy Inc",
    role: "Machine Learning & Research Intern",
    location: "Golden, CO",
    start: "Mar 2022",
    end: "Feb 2023",
    highlight: "Published research",
    bullets: [
      "Researched and implemented ML models to predict resident behaviors and health risks in assisted-living facilities.",
      "Prototyped an early-warning system that flags potential incidents (falls, deteriorating health) so caregivers can intervene proactively.",
      "Authored and published a research paper translating ML methods into practical healthcare applications, validated with caregivers and staff.",
    ],
    stack: ["scikit-learn", "Pandas", "NumPy"],
    project: "assisted-living-early-warning",
  },
];
