# 🧵 Fabric Forge — DP-700 Academy

An interactive, step-by-step learning app for the **DP-700: Microsoft Certified — Fabric Data Engineer Associate** exam. Runs entirely in the browser (React + Vite + TypeScript, no backend), with all progress stored locally.

## Run it

```bash
cd dp700-academy
npm install
npm run dev        # http://localhost:5175
npm run build      # type-check + production build
```

## What's inside

- **9 modules · 26 lessons** grounded in the official Microsoft *Skills measured* study guide (3 domains, each 30–35%):
  1. Fabric Architecture & Analytics Solutions
  2. Implement a Lakehouse
  3. Ingesting Data into Fabric
  4. Transforming & Processing Data
  5. Implement a Data Warehouse
  6. Implement Real-Time Intelligence
  7. Orchestrate Processes
  8. Manage a Microsoft Fabric Environment
  9. Monitoring, Optimization & Error Handling
- **Step-by-step hands-on labs** with portal breadcrumbs and runnable PySpark / T-SQL / KQL snippets.
- **12 hand-built SVG diagrams** (architecture, OneLake, medallion, star schema, CI/CD, RTI flow…) — theme-aware, no copyrighted screenshots.
- **Per-module quizzes** with instant grading, explanations, and weak-topic tracking.
- **Adaptive recommendation engine** — analyzes lessons completed + quiz scores to tell you exactly what to study next.
- **Exam-readiness dashboard** with per-domain rings, day-streak, and a goal-date planner.
- **Reference hub** — a searchable 80-term glossary (filter by category, exam notes per term) and 7 quick-reference cheat sheets (decision guide, security, PySpark, KQL, T-SQL, optimization symptom→fix, exam-day facts).
- **96 flashcards with true spaced repetition** (SM-2-lite: Again/Good/Easy, 1→3→7→14→30→60-day ladder, due-count badges).
- **Timed practice exam** — ~150-question bank covering every sub-skill in the exam blueprint, balanced across the three skill areas. Three formats (Quick 15 / Standard 30 / Full 60) plus single-domain drills, countdown scaled to length, flag-for-review, per-domain score report, attempt history.
- **7 guided scenario labs** — Fabrikam's project end-to-end (lakehouse foundation, nightly incremental load, real-time monitoring, secure & ship, data warehouse + star schema, low-code mirroring + Dataflow Gen2, monitoring & optimization) with gated checkpoints — 41 steps.
- **AI tutor** (optional) — per-lesson Claude tutor with explain-simpler / analogy / quiz-me actions. Run `node tutor-server.cjs` with `ANTHROPIC_API_KEY` set; without it the app falls back to an offline tutor built from lesson key points.

## Deploying online

The app is a **static SPA** — build it and drop the `dist/` folder on any static host.

```bash
npm run build          # outputs dist/ with host-agnostic relative paths
```

- **Netlify Drop** (no account): drag `dist/` onto https://app.netlify.com/drop
- **GitHub Pages**: push to GitHub; `.github/workflows/deploy.yml` auto-builds and deploys (set Settings → Pages → Source = "GitHub Actions").
- **Vercel / Cloudflare Pages / Netlify**: import the repo — configs (`vercel.json`, `netlify.toml`) are included.

**Live AI tutor (optional):** the static app runs the tutor in offline mode by default. To enable the real Claude tutor on a deployed site, host `tutor-server.cjs` (Render/Railway/Azure Web App with `ANTHROPIC_API_KEY` set), then set `VITE_TUTOR_URL` to that backend’s URL and rebuild. See `.env.example`.
- Calm sea-glass light / dark theme.

## Structure

```
src/
  data/         domains.ts + mod-*.ts (one per module) → curriculum.ts
  lib/          progress.ts (localStorage), recommend.ts (adaptive engine)
  components/   Dashboard, LessonView, QuizView, Flashcards, Sidebar, Blocks, Diagrams
```

To add a lesson/module, edit the relevant `src/data/mod-*.ts`; to add a whole module, create a new `mod-*.ts` and import it into the `MODULES` array in `curriculum.ts`.

> Content is for exam study. Always validate hands-on steps against the live Microsoft Fabric portal, which evolves quickly.
