# PersonalWebsite

Bhargav's personal website: [bhargavsairam.me](https://bhargavsairam.me). See [PLAN.md](PLAN.md) for the full design plan.

Next.js 16 (App Router) · Tailwind CSS v4 · Motion · Lenis · MDX · ONNX Runtime Web · MediaPipe · Transformers.js

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build (all pages are statically generated)
npm run lint
```

## Edit content

Almost everything lives in `content/`. There's no CMS: edit, commit, push.

| What | Where |
|---|---|
| Name, tagline, bio, "Now", links | `content/site.ts` |
| Experience timeline | `content/experience.ts` |
| Education, skills, publications | `content/profile.ts` (the Research section appears once `publications` is non-empty) |
| Project cards and metadata | `content/projects.ts` |
| Project case studies | `content/projects/<slug>.mdx` |
| Resume PDF | `public/resume.pdf` |
| Headshot | `public/images/headshot.jpg` |

To add a project, add an entry to `content/projects.ts` and create `content/projects/<slug>.mdx`. MDX files can use `<TLDR>`, `<Callout>`, `<Metrics items={[...]}/>`, `<EurosatDemo />` and `<FaceDemo />`.

Search for `TODO(Bhargav)` to find the spots that still need your input.

## ML demos (`/playground`)

All inference runs in the visitor's browser. Nothing is sent to a server.

- **Satellite land-cover classifier:** a ResNet-18 trained with `ml/eurosat/train.py`, int8 ONNX, and a Web Worker. The page shows a "model in training" placeholder until the model file exists.
- **Semantic search:** `Xenova/all-MiniLM-L6-v2` via Transformers.js, loaded from the Hugging Face Hub.
- **Face detection:** MediaPipe BlazeFace. Detection only, no identification.

### Training the satellite model

Requires [uv](https://docs.astral.sh/uv/) and ideally an NVIDIA GPU (the project pins CUDA 12.8 PyTorch wheels, which RTX 50-series cards need).

```bash
cd ml/eurosat
uv run train.py              # ~10 epochs; downloads EuroSAT (~90 MB) on first run
uv run train.py --epochs 1   # quick smoke test
```

It writes:

- `public/models/eurosat/model.int8.onnx` + `meta.json`: the model the browser loads
- `public/demos/eurosat/*.png` + `samples.json`: held-out test tiles for the demo
- `content/generated/eurosat-metrics.json`: the numbers shown on the case-study page

Commit those files and the demo goes live on the next deploy.

## Deploy

1. Push this repo to GitHub.
2. On [vercel.com/new](https://vercel.com/new), import the repo. The defaults work.
3. Under **Settings → Domains**, add `bhargavsairam.me` and `www.bhargavsairam.me`, then create the DNS records Vercel shows at your registrar.
4. Enable **Analytics** and **Speed Insights** in the Vercel dashboard. The components are already in `app/layout.tsx`.
