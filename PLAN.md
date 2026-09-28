# Personal Website — Build Plan

**Owner:** Bhargav Sairam, B.S. Computer Science at CU Boulder (expected May 2028), AI/ML Intern at CACI
**Domain:** `bhargavsairam.me` · **GitHub:** [SairamBhargav](https://github.com/SairamBhargav) · **LinkedIn:** [bhargavsairam](https://www.linkedin.com/in/bhargavsairam/)
**Goal:** A professional portfolio that makes recruiters and engineers think "this person ships real ML work," with a small, professional "what I'm working on" section.
**Deadline:** MVP live in about 7 days, fully polished by day 14.

---

## 1. Decisions at a glance

| Area | Decision | Why |
|---|---|---|
| Framework | **Next.js (App Router) + TypeScript** | Industry standard (a resume signal in itself). React fits in-browser ML demos. First-class support for MDX, OG images and Vercel. |
| Styling | **Tailwind CSS v4** + CSS variables for theme tokens | Fast to build. Tokens make dark/light theming easy. |
| Animation | **Motion** (formerly Framer Motion) + **Lenis** smooth scroll | Motion handles reveals, the cursor and magnetic buttons. Lenis gives the inertial scroll. |
| Page transitions | **View Transitions API** (via `next-view-transitions`) | Native, cheap, and works with the App Router. |
| Content | **MDX + JSON/YAML in the repo**, type-checked with **Velite** (or Content Collections) | Free and version-controlled. Edit a file, push, and it deploys. |
| ML demos | **Transformers.js** (ONNX Runtime Web under the hood, WebGPU when available, WASM fallback) | Runs fully client-side: no backend and no API costs. |
| Hosting | **Vercel (free Hobby tier)** | Zero-config Next.js hosting, preview deploys per branch. |
| Domain | **bhargavsairam.me** (free for year 1 via the GitHub Student Pack) | See §2. |
| Analytics | **Vercel Web Analytics + Speed Insights** | Privacy-friendly, free tier, one line of code. |
| Theme | Dark by default via system preference + manual toggle (`next-themes`) | You asked for dark/light. |

---

## 2. Domain: can you get it for free?

**Decision: `bhargavsairam.me`**, free for the first year through the GitHub Student Developer Pack (Namecheap offer).

- Availability checked on 2026-09-27: `bhargavsairam.me` ✅ unregistered. `bhargavsairam.com` ✅ also unregistered. (`.tech` couldn't be checked automatically.)
- `.me` is the better free option: it's short, it reads as a personal site, and "about me" is a natural fit. `.tech` renewals are also expensive (~$40+/yr) compared with `.me` (~$20/yr).
- **Steps:**
  1. Apply for the Student Pack at education.github.com/pack with your `@colorado.edu` email (approval can take a few days, so **do this first**).
  2. Claim `bhargavsairam.me` through the Namecheap offer.
  3. In Vercel → Project → Domains, add `bhargavsairam.me` and `www.bhargavsairam.me`, then set the DNS records Vercel shows (A `76.76.21.21` for the apex, CNAME `cname.vercel-dns.com` for `www`) in Namecheap.
- Until then, the site lives at `bhargavsairam.vercel.app`, which is fine for the MVP.
- **Optional later:** grab `bhargavsairam.com` (~$10/yr at Cloudflare) and redirect it to the `.me` so nobody else takes it. Set a calendar reminder for the `.me` renewal about 11 months from now.

---

## 3. Information architecture

A **single long home page** that tells the whole story in one scroll (recruiters skim), plus **deep pages** for people who want detail (engineers).

```
/                       Home (long-scroll narrative)
  ├─ Hero               name, one-line positioning, CTA buttons, animated violet background
  ├─ About              headshot (4:5 portrait) + a short 3–4 sentence bio
  ├─ Now                "Currently building…" (2–3 lines + date stamp)
  ├─ Featured Projects  3 large cards → case-study pages
  ├─ Experience         vertical timeline (internship(s), research, TA, etc.)
  ├─ Research           publications/posters/write-ups (hidden if empty)
  ├─ Skills             grouped stack (ML / Languages / Infra / Web)
  ├─ Education          university, major, grad date, coursework, awards
  └─ Contact            email, GitHub, LinkedIn, Scholar, resume button
/projects               All projects (4–6), filterable by tag (ML · Research · Web · Systems)
/projects/[slug]        Case study (MDX) + optional embedded live demo
/playground             All in-browser ML demos in one place
/research               Full publications list (only if there are ≥2 items; otherwise it stays on Home)
/resume                 Web-rendered resume + "Download PDF" (/resume.pdf)
/404                    Custom, on-brand
```

**Navigation:** a minimal sticky top bar: monogram "BS" on the left, and `Projects · Playground · Resume · ◐ theme` on the right. On mobile it collapses into a full-screen menu with a staggered link reveal.

---

## 4. Visual design system

### 4.1 Aesthetic
Minimal and editorial: generous whitespace, a strong type hierarchy and a restrained palette. Violet is the *only* accent. It appears on links, focus rings, the hero background, the timeline dots and the cursor. It never fills big blocks. Think of a well-typeset magazine for an ML engineer.

### 4.2 Color tokens
| Token | Dark (default) | Light |
|---|---|---|
| `--bg` | `#0A0A0B` (near-black) | `#FAFAF9` (warm off-white) |
| `--bg-elevated` | `#131316` | `#FFFFFF` |
| `--fg` | `#EDEDEF` | `#0A0A0B` |
| `--fg-muted` | `#8B8B94` | `#5B5B66` |
| `--border` | `#23232A` | `#E6E6EA` |
| `--accent` | `#A78BFA` (violet-400) | `#6D28D9` (violet-700) |
| `--accent-strong` | `#8B5CF6` | `#5B21B6` |
| `--accent-glow` | `rgba(139,92,246,0.35)` | `rgba(109,40,217,0.15)` |

- All text/background pairs must pass **WCAG AA** (violet-400 on black ≈ 7:1, violet-700 on off-white ≈ 7:1). ✅
- Light mode swaps the violet darker so it stays readable.

### 4.3 Typography
- **Headings:** serif. First choice **Instrument Serif** (elegant, high contrast, free on Google Fonts). Alternatives: *Fraunces* or *Newsreader*.
- **Body:** **Inter** or **Geist Sans**.
- **Mono accents** (dates, tags, code, metrics): **Geist Mono** or **JetBrains Mono**.
- Load everything with `next/font` (self-hosted, no layout shift).
- Fluid type scale with `clamp()`: hero name ~`clamp(3rem, 8vw, 7rem)`, H2 ~`clamp(2rem, 4vw, 3rem)`, body 17–18px, line-height 1.6, max line length ~68ch.
- Editorial touches: italic serif for key phrases in the hero ("building *models that ship*"), small-caps mono section labels such as `01 — PROJECTS`.

### 4.4 Layout
- 12-column grid, 1200px max content width, section spacing 128–160px on desktop and 80px on mobile.
- Numbered section labels (`01`, `02` …) in mono. This is an editorial motif that also helps skimming.
- Thin 1px `--border` rules divide sections instead of boxes.

### 4.5 Components (build list)
`Nav`, `ThemeToggle`, `Hero`, `HeroBackground`, `SectionHeader`, `NowCard`, `ProjectCard` (large/featured and compact variants), `TagFilter`, `Timeline`/`TimelineItem`, `SkillGroup`, `PublicationItem`, `EducationBlock`, `ContactLinks`, `MagneticButton`, `CustomCursor`, `Reveal` (scroll-reveal wrapper), `MDX components` (Callout, Figure, Metric, CodeBlock, DemoEmbed), `Footer`.

---

## 5. Motion and interaction spec (medium intensity)

Ground rule: **every animation respects `prefers-reduced-motion`**. With reduced motion on, reveals become instant, Lenis is disabled, the cursor falls back to the native one and the hero background is a static gradient.

| Effect | Spec |
|---|---|
| **Hero background** | A slowly drifting **violet gradient mesh** rendered in a tiny WebGL fragment shader (or a CSS/canvas fallback), with a faint **neural-network node field**: dots that link with thin lines near the cursor and a subtle ML nod. Target <1ms/frame. Pauses when off-screen (IntersectionObserver) or when the tab is hidden. Lazy-loaded after first paint. |
| **Hero text intro** | Name reveals line by line (masked slide-up, 60ms stagger, ~700ms total, `cubic-bezier(0.22, 1, 0.36, 1)`), then the tagline and CTAs fade in. |
| **Scroll reveals** | Sections fade up 24px with opacity 0→1, triggered once at 15% visibility. Cards in grids stagger by 80ms. Timeline items draw the vertical line progressively as you scroll (`useScroll` + `scaleY`). |
| **Page transitions** | View Transitions: a cross-fade by default, plus a **shared-element morph** from a project card's image/title into the case-study header. |
| **Custom cursor** | Small violet dot plus a larger trailing ring (spring-smoothed). The ring grows over links/cards and shows a label ("View", "Open demo") on project cards. **Desktop pointer only**, hidden on touch devices. |
| **Magnetic buttons** | Primary CTAs and social icons pull toward the cursor within ~80px (max 10px displacement, spring back on leave). |
| **Smooth scroll** | Lenis, `lerp: 0.1`, synced with Motion's scroll hooks. Anchor links scroll smoothly with an offset for the sticky nav. |
| **Hovers** | Project cards: image scales 1.03, border brightens to violet, arrow slides 4px. Links: an animated underline draws left→right. |
| **Theme toggle** | Icon morph, plus a View-Transition circular reveal from the toggle's position when switching themes. |

Animation budget: no layout-thrashing properties (only `transform`/`opacity`), and no animation should block interaction.

---

## 6. Interactive ML demos (in-browser)

**Principles:** 100% client-side, lazy-loaded only when the user clicks "Load demo" (so models never slow down the page), with a visible loading/progress bar and a WebGPU → WASM fallback. Each demo shows **latency and the model name/size**, which is a nice engineering touch for technical visitors.

**Where they live:** each demo is embedded in its related project page when there is a matching project, *and* collected on `/playground`.

**Demos for v1** (chosen to match your resume):

1. ⭐ **Satellite tile classifier (flagship)**: a public, open-data version of the skills from your CACI work, with **nothing from CACI in it**.
   - Train a small CNN yourself (ResNet-18 or MobileNetV3, transfer learning) on **EuroSAT** (a public Sentinel-2 land-cover dataset with 10 classes), export it to ONNX, and quantize it (~5–15MB).
   - Visitors pick a sample tile or upload one, then see class probabilities, latency, and an **NDVI / false-color toggle** that shows you understand multispectral data.
   - Stretch: a **Grad-CAM heatmap** overlay showing where the model is "looking."
   - This becomes its own project with its own case-study page: *"Land-cover classification from Sentinel-2 in the browser."* It fills the gap between 2 resume projects and the target of 4–6.
2. **Live face detection** for the Facial Recognition Attendance project: a webcam demo in the browser (MediaPipe Face Detector, ~1–3MB) that draws boxes and landmarks. Show a clear notice: "Runs 100% on your device. No video leaves your browser."
3. **"Search my work" semantic search** (stretch/post-launch): embed project and experience text at build time, embed the query in-browser (MiniLM, ~23MB) and rank the results.

Not demoed: the CACI airstrip model or any of its data (see §12).

**Implementation:**
- Run inference in a **Web Worker** so the UI never freezes.
- Host model files on the Hugging Face Hub (Transformers.js fetches and caches them in the browser Cache API) or in `/public/models` for tiny custom models.
- Put a shared `<DemoShell>` component around every demo: title, model card (name, params, size, runtime), a Load button, progress, and error/fallback states.

---

## 7. Content model (MDX/JSON in repo)

```
content/
  projects/
    <slug>.mdx          # frontmatter + case-study body
  experience.json       # or .yaml
  education.json
  skills.json
  publications.json
  now.md                # the "Now" blurb + updated date
  site.json             # name, tagline, socials, email, resume path
public/
  resume.pdf
  images/projects/<slug>/cover.webp
  me.jpg, logo.svg
```

**Project frontmatter:**
```yaml
title: "Project Name"
slug: project-name
summary: "One sentence: what it is and the result."
role: "Solo / Team of 4 — ML lead"
date: 2026-03
tags: [ML, NLP, Research]
stack: [PyTorch, FastAPI, Next.js]
featured: true
order: 1
cover: /images/projects/project-name/cover.webp
metrics:                      # shown as big stat callouts
  - { label: "Accuracy", value: "94.2%" }
  - { label: "Latency", value: "38 ms" }
links: { github: "...", demo: "...", paper: "..." }
demo: sketch-classifier       # optional: id of an in-browser demo
```

**Case-study body template** (consistent for all projects):
1. TL;DR (3 bullets)
2. Problem / motivation
3. Approach (architecture diagram and key decisions)
4. Results (metrics, charts, before/after)
5. Challenges and what I learned
6. Live demo (if any)
7. Links

**Experience entry:** `company, role, location, start, end, logo, bullets[] (impact-first, quantified), stack[]`.

---

## 8. Technical architecture

```
app/
  layout.tsx            fonts, ThemeProvider, Lenis provider, Cursor, Analytics
  page.tsx              home (composes section components)
  projects/page.tsx
  projects/[slug]/page.tsx   generateStaticParams + generateMetadata
  playground/page.tsx
  resume/page.tsx
  opengraph-image.tsx   dynamic OG image (next/og)
  sitemap.ts, robots.ts
  not-found.tsx
components/             (see §4.5)
components/demos/       one folder per demo + DemoShell + worker files
lib/                    content loaders, utils, motion presets (easings/durations)
content/                (see §7)
styles/globals.css      Tailwind + theme tokens
```

- **Fully static generation (SSG)**: every page prerendered, so it's fast and costs nothing to host.
- **Server Components by default.** Only interactive pieces (`"use client"`) ship JS: the cursor, reveals, demos and theme toggle.
- **Images:** `next/image`, WebP/AVIF, blur placeholders.
- **Tooling:** ESLint, Prettier, TypeScript strict mode, pnpm. Optionally a GitHub Actions check (lint + typecheck + build) on PRs.

---

## 9. SEO, sharing and discoverability
- `generateMetadata` per page: title template `%s — Bhargav Sairam`, description, canonical URL.
- **Dynamic OG images** (violet on black, serif name, page title) so links look great on LinkedIn and Slack.
- **JSON-LD `Person` schema** (name, jobTitle, alumniOf, sameAs → GitHub/LinkedIn).
- `sitemap.xml`, `robots.txt`, favicon set built from the monogram.
- Target search: ranking #1 for "Bhargav Sairam" (this happens naturally with the `.com` and the schema).

## 10. Quality bars (definition of done)
- **Lighthouse ≥ 95** on Performance, Accessibility, Best Practices and SEO (home page, mobile).
- **LCP < 2.0s**, **CLS < 0.05**, home-page JS < ~150KB gzipped (demos excluded because they're lazy-loaded).
- Keyboard navigable, with visible violet focus rings, skip-to-content link, alt text and correct heading order.
- Reduced-motion mode fully works.
- Tested at 360px, 768px, 1280px and 1920px, in Chrome, Safari (including iOS) and Firefox.
- Works fine without WebGL/WebGPU (graceful fallbacks).

---

## 11. Two-week schedule

### Phase 0: Content gathering (Days 1–2, runs in parallel with setup) ← *your homework*
- [x] Resume content (source for §13)
- [x] Headshot → `public/images/headshot.jpg` (resized to 1600px, 268KB)
- [x] GitHub / LinkedIn / email
- [ ] Apply for the GitHub Student Pack (it gates the domain)
- [ ] Put `Resume_BhargavSairam.pdf` in `public/` (as `resume.pdf`). Fix its LinkedIn link first (see §12)
- [ ] Pick a hero tagline (options in §13)
- [ ] Get CACI's OK on what you can say publicly (see §12)
- [ ] Navjoy paper: title, venue, year, link/PDF
- [ ] MatchFlix: repo link, live URL (if any), 2–4 screenshots or a short screen recording
- [ ] Facial Recognition: repo link and a photo/GIF of it running (blur other people's faces)
- [ ] Your logo file, if you have one (otherwise a "BS" serif monogram gets designed)

### Phase 1: Foundation (Days 1–2)
- Scaffold Next.js + TS + Tailwind v4, ESLint/Prettier
- Theme tokens, fonts, dark/light toggle
- Velite content schemas plus sample content
- Base layout: Nav, Footer, SectionHeader
- **Deploy to Vercel on day 1** (preview URL), buy the domain and connect DNS

### Phase 2: MVP pages (Days 3–6)
- Home: Hero (static background for now), Now, Featured Projects, Experience timeline, Skills, Education, Contact
- `/projects` with tag filter, `/projects/[slug]` case-study template with MDX components
- `/resume` plus PDF download
- SEO basics: metadata, sitemap, robots, OG image
- Responsive pass at every breakpoint
- 🚀 **Milestone (Day 7): MVP live at bhargavsairam.com** with real content. This version is already good enough to send to recruiters.

### Phase 3: Motion and polish (Days 7–10)
- Lenis + scroll reveals + timeline line-draw
- Hero intro animation plus the WebGL gradient/neural-field background
- View Transitions (cross-fade + card→header morph)
- Custom cursor + magnetic buttons (desktop only)
- Reduced-motion fallbacks everywhere

### Phase 4: ML demos (Days 10–13)
- **Start training earlier (Days 3–8, in the background):** fine-tune the EuroSAT model in a Colab/Kaggle notebook, export it to ONNX and quantize it to int8. Commit the notebook to a separate public repo (`SairamBhargav/sentinel-landcover`) so the project has real code behind it.
- `DemoShell` + Web Worker inference harness
- Demo #1: satellite tile classifier (+ NDVI toggle, Grad-CAM if time allows)
- Demo #2: webcam face detection on the Facial Recognition project page
- `/playground` page, and demos embedded in their project pages

### Phase 5: QA and launch (Day 14)
- Lighthouse/a11y audit and fixes, cross-browser/device testing
- Vercel Analytics + Speed Insights on
- Proofread everything, check all links
- Update LinkedIn, GitHub profile README and resume header with the URL

### Post-launch (ongoing)
- Update the "Now" section monthly (the date stamp shows it's alive)
- Add each new project as an MDX file
- Stretch ideas: a short-notes/blog section, a live GitHub activity widget, a Cmd+K palette, a semantic "search my work" bar using demo #3

---

## 12. Things to sort out before launch

1. **⚠️ CACI content: check with your manager before publishing.**
   - CACI is a defense/intelligence contractor, and your work involves OSINT on cartel activity and prioritizing areas for satellite tasking.
   - A resume bullet is one thing. A public web page (indexed by Google, permanent) that goes deeper is another.
   - **Default in this plan:** CACI appears **only in the Experience timeline**, using wording at or below the level of your resume. It gets no case-study page, and no images, maps, figures or model artifacts from it are used.
   - Ask your manager or the program's public release process whether the current resume wording is OK to publish, or whether it should be made more generic (e.g. "geospatial ML pipeline fusing multi-source OSINT signals for area prioritization").
   - The EuroSAT project (§6) lets you show the same skills publicly without any of that risk.
2. **Resume LinkedIn link typo:** your PDF shows `linkedin.com/bhargavsairam`, which doesn't work. The correct URL is `linkedin.com/in/bhargavsairam`. Fix it in the PDF (and check where the hyperlink actually points).
3. **Phone number:** keep it **off the web pages** (spam and scraping). The downloadable PDF can keep it, since that's normal. Email uses a **click-to-copy button** plus a `mailto:` link.
4. **Navjoy paper:** needs its title, venue and a link to fill the Research section. Without them, it becomes a line in the Navjoy experience entry and the Research section stays hidden.
5. **Faces in media:** blur other KTP members' faces in any Facial Recognition screenshots, unless you have their OK.

---

## 13. Your content (drafted from your resume)

### 13.1 Hero: tagline options (pick one or edit)
- **A (recommended):** *Bhargav Sairam.* CS at CU Boulder · AI/ML Intern at CACI. I build machine-learning systems that hold up *in the real world*, from satellite imagery to production data pipelines.
- **B:** *Bhargav Sairam.* I turn messy real-world data into *models that work*: geospatial ML, computer vision and the pipelines around them.
- **C:** *Bhargav Sairam.* ML engineer in training. Computer vision, geospatial data, and *shipping things*.

CTAs: `View projects` (primary, magnetic) · `Resume ↓` · GitHub · LinkedIn icons.

### 13.2 About (with headshot)
- **Photo:** the Flatirons background is a great local detail, so the caption reads "Boulder, CO". It's shown in natural color at a 4:5 crop, focused on the face.
  - In dark mode, a soft bottom/edge vignette keeps the bright sky from glaring against the black page.
  - It's also used, cropped square, in the OG share image and the JSON-LD `image`.
- **Bio draft:** "I'm a Computer Science student at the University of Colorado Boulder (Dean's List, 3.78 GPA) and an AI/ML intern at CACI, where I work on geospatial machine learning with satellite imagery. I've been doing applied ML since high school, starting with a published research project on predicting health incidents in assisted living. I like problems where the hard part isn't the model, but making it useful in the real world."

### 13.3 Now (draft, dated September 2026)
> Interning on the AI/ML team at CACI (geospatial ML with Sentinel-2 imagery) · Junior year at CU Boulder: Neural Networks, Operating Systems · Building a land-cover classifier that runs entirely in your browser (see Playground).

### 13.4 Experience timeline
| When | Role | Site treatment |
|---|---|---|
| May 2026 – Present | **CACI International**, AI/ML Intern, Colorado Springs | Timeline only, with wording cleared per §12.1. Tags: PyTorch · GeoPandas · rasterio · Earth Engine · Sentinel-2 |
| May – Aug 2025 | **Namo Cloud Solutions**, SWE Intern (AI/ERP Integration), Denver | Timeline with the headline metric "−90% manual reporting". Tags: Python · MySQL · GCP · OAuth |
| Mar 2022 – Feb 2023 | **Navjoy Inc**, ML & Research Intern, Golden | Timeline plus a link to the paper and case study #4 |

### 13.5 Projects (target 5)
| # | Project | Featured? | Page | Demo |
|---|---|---|---|---|
| 1 | **Sentinel-2 Land-Cover Classifier** *(new, built for this site)* | ⭐ yes | Case study | Satellite tile classifier |
| 2 | **MatchFlix**: swipe-based movie matching with group "Swipe Sessions" + LLM recommendations | ⭐ yes | Case study with screenshots/GIF | — |
| 3 | **Facial Recognition Attendance System** (KTP), "−80% attendance overhead" | ⭐ yes | Case study | Webcam face detection |
| 4 | **Early-Warning System for Assisted Living** (Navjoy research + paper) | no | Case study | — |
| 5 | **NetSuite → Cloud SQL Sync Pipeline** (Namo) | no | Short write-up or card only (check that client details are OK to share) | — |

Tag filters: `ML` · `Computer Vision` · `Geospatial` · `Full-Stack` · `Data Eng` · `Research`.

### 13.6 Skills (regrouped for the site; less of a keyword list than the resume)
- **ML & Data:** PyTorch, TensorFlow, scikit-learn, XGBoost, NumPy, Pandas, OpenCV
- **Geospatial:** GeoPandas, rasterio, Google Earth Engine, Sentinel-2, NDVI/NDWI
- **Languages:** Python, C++, C, C#, Java, JavaScript, SQL
- **Backend & Infra:** Node.js, Express, PostgreSQL, MySQL, Docker, GCP, REST APIs, CI/CD

### 13.7 Education
**University of Colorado Boulder**: B.S. Computer Science, expected May 2028 · GPA 3.78 · Dean's List.
Coursework chips: Neural Networks · Data Science · Algorithms · Data Structures · Operating Systems · Computer Systems · Database Systems · Linear Algebra · Discrete Structures · Software Development.

### 13.8 Contact
Email (click-to-copy): `bhargav_sairam@outlook.com` · GitHub `SairamBhargav` · LinkedIn `in/bhargavsairam` · Resume PDF. **No phone number on the site.**
