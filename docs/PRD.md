# Product Requirements Document

| | |
|---|---|
| **Product** | Ostella |
| **Author** | Rex Heng |
| **Date** | 2026-04-10 |
| **Status** | Draft v0.1 |
| **Repository** | `aaHSIL` |

---

## 1. TL;DR

Ostella is a preventative healthcare web application that predicts 10-year osteoporotic fracture risk in premenopausal women and routes high-risk individuals into NHS clinical pathways *before symptoms emerge*. It pairs a consumer-facing risk assessment (target: women 30–50) with a clinician-facing triage dashboard and a researcher-facing registry of 160+ curated clinical datasets relevant to menopause and bone health prediction. The consumer product is parameterized from — and transparently cites — the research registry, making scientific provenance a visible, clickable part of the user experience.

---

## 2. Problem & Opportunity

Osteoporosis is the most common disease women face during and after menopause. The clinical reality:

- **1 in 2 women** will suffer an osteoporotic fracture in their lifetime
- **One osteoporotic fracture occurs every 3 seconds** globally
- Bone loss accelerates sharply at perimenopause due to declining oestrogen
- **There is no diagnostic tool for menopause itself** — it is defined retrospectively, after 12 months of amenorrhea
- NHS intervention typically begins *after* a first fracture — roughly a decade after the underlying decline began

### The opportunity

Clinically validated predictive tools (notably the WHO FRAX algorithm) exist and are widely used by GPs, but **they are not deployed preventatively on women in their 30s and 40s**, before symptoms or first fractures. A dedicated product that runs this prediction early, communicates risk clearly, and routes the patient into NHS care can close a decade-wide gap in preventative women's health.

### The parallel opportunity

The research ecosystem for menopause and bone health spans 160+ biobanks, imaging datasets, genomics resources, and longitudinal cohorts — but there is **no curated, filterable index** of these datasets scored on menopause relevance and suitability for specific predictive tasks. Ostella addresses this with a second product surface targeted at clinical researchers and health ML teams, and uses the same index to ground its own consumer predictions in real published science.

---

## 3. Target Users

### Primary — Consumer (at-risk individual)
**Sarah, 38.** Healthy, exercises, no symptoms, family history of osteoporosis through her mother. Uses wellness apps and a period tracker. Has never discussed bone health with her GP because no one has told her it's something she should be thinking about yet.

- **Goal:** understand her hidden risk before symptoms emerge
- **Pain point:** "No one has ever told me this was something I should be thinking about."

### Secondary — Clinician (NHS GP)
**Dr. Chen.** NHS GP in a large practice, 15-minute appointments, overloaded. Does not have time to proactively screen asymptomatic women in their 30s for fracture risk.

- **Goal:** identify and action preventative cases without manual screening overhead
- **Pain point:** receives no signal until patients present with first fractures

### Secondary — Researcher / Clinical ML team
**Dr. Patel.** Postdoc in a clinical ML group studying menopause transitions. Spending weeks evaluating which datasets to use for a fracture prediction project.

- **Goal:** identify the right dataset for a specific predictive task (fracture prediction, menopause timing, BMD trajectory, HRT response)
- **Pain point:** dataset discovery is fragmented across dozens of institutional portals; access terms are opaque; suitability is hard to judge without running pilots

---

## 4. Product Vision

A single product with two faces, bound together by transparent scientific provenance.

1. **Patient + clinician surface** — a preventative risk assessment tool that gives at-risk women a transparent, clinically grounded fracture risk score and routes them into NHS care via a shared clinician dashboard
2. **Research surface** — a curated, filterable index of 160+ clinical datasets scored on menopause relevance and suitability for specific predictive tasks

The two surfaces are connected: every prediction on the patient side **transparently cites** the datasets that informed it, and each citation deep-links into the research surface. This is the product's signature move — scientific provenance is not a hidden footnote but a visible, clickable first-class element of the user experience. Patients trust the product because the science is in plain sight; researchers discover the catalog because the consumer product showcases it.

---

## 5. Core Use Cases

### 5.1 Patient: Self-assessment and handoff
1. A woman visits Ostella (arriving via search, referral, or clinician recommendation)
2. She completes a ~12-question assessment in under 2 minutes and optionally uploads her NHS record to skip the medical history section
3. The risk engine returns a composite "Menopause Preparedness Score" (0–100) with a risk tier (LOW / MODERATE / HIGH)
4. If HIGH risk, she sees a personalized action plan driven by which sub-model flagged her (e.g., HRT consult if FRAX is the driver, DEXA scan if BMD trajectory is the driver)
5. She shares her profile with her GP via a single tap
6. She receives a notification when her GP actions the referral

### 5.2 NHS clinician: Triage and action
1. Clinician opens the NHS dashboard (separate URL; in future versions, practice-scoped)
2. Sees a queue of flagged patients who have shared their profile
3. Opens a patient's detail view: full risk profile, sub-model breakdown, evidence citations, action plan
4. Triggers a clinical action — refer for DEXA scan, book HRT consultation, prescribe Vitamin D, mark reviewed
5. The patient receives a notification on her end, closing the loop

### 5.3 Researcher: Dataset discovery
1. Researcher visits the research surface
2. Filters by category (biobank, imaging, genomics, cohort, EHR), region, population size, access type, cost, menopause variables, bone variables, and suitability for a specific predictive task
3. Reviews candidate datasets in the result list and adds up to three to a comparison tray
4. Opens a dataset detail view with the full schema: access info, variables, outcome labels, predictive use cases, strengths, limitations, menopause relevance

---

## 6. MVP Scope

### In scope

- Public landing page (dual-audience)
- Patient questionnaire (~12 questions covering FRAX inputs + perimenopause signals)
- Mock NHS record upload (file ignored, profile pre-filled with plausible content)
- Risk engine with three sub-models and one composite score:
  - FRAX-style 10-year fracture risk — direct implementation of published WHO FRAX coefficients
  - Rules-based perimenopause timing estimate
  - Parameterized BMD trajectory projection
- Patient dashboard: hero score, sub-model breakdown, action plan, evidence panel, share-with-GP button, notifications feed
- NHS clinician dashboard: flagged-patient queue, patient detail view, clinical action menu
- Research catalog browser: filters, full-text search, result list, comparison tray, dataset detail view
- Real-time patient ↔ clinician updates via Server-Sent Events
- Hardcoded single-patient persona ("Sarah") — no authentication

### Out of scope (explicitly deferred)

- User accounts, authentication, multi-patient support
- Real NHS integration (HL7, FHIR, patient record parsing, clinician authentication)
- Real clinical actions (prescriptions, bookings, referral letters)
- Longitudinal tracking and compliance monitoring
- Wearable device integration (Apple Health, Fitbit, Oura)
- Native mobile apps
- Mobile-optimized responsive design beyond baseline "doesn't break on a phone"
- Saved searches, bookmarks, BibTeX export on the research surface
- Dataset suitability wizard (describe-your-task → get-recommendations)

---

## 7. Feature Specifications

### 7.1 Patient surface

**`/app` — Questionnaire intake**
A wizard-style form with six sections completed in a single route: About you, Family history, Lifestyle, Medical history, Cycle, and a Shortcut step that accepts a mock NHS record upload. Progress bar at top; sections advance in place. Submission calls the risk engine and redirects to the dashboard.

**`/app/dashboard` — Patient dashboard**
Carries the majority of the consumer experience. From top to bottom:
- **Hero score card** — large circular gauge, numeric composite score, risk tier, subcopy contextualizing against the user's demographic peer group
- **Sub-model breakdown** — three horizontal bars (10-year fracture risk, perimenopause timing, BMD trajectory) with values, thresholds, and plain-language explanations; the primary-driver bar is visually highlighted
- **Action plan** — three ranked recommendations driven by whichever sub-model is the primary risk driver, each card with a one-line rationale
- **Evidence panel** — scientific citations for the current prediction (e.g., *"UK Biobank • FinnGen • FRAX (Kanis 2008) • GEFOS"*), each citation a chip that deep-links to `/research/[id]`
- **Share-with-GP CTA** — primary button; on click, writes the profile to shared state and fans out a real-time event to the NHS dashboard
- **Notifications feed** — inline activity feed below the CTA, receives real-time events from clinician actions on the NHS side

### 7.2 NHS clinician surface

**`/nhs` — Clinician dashboard queue**
Simple queue view listing flagged patients: name, age, composite score, primary risk driver, time since flag. Empty state until a patient shares. New rows animate in via SSE as shares arrive. Rows link to patient detail.

**`/nhs/patient/[id]` — Patient detail**
Mirrors the patient dashboard structure from a clinician's point of view:
- Patient banner (name, age, DOB, mock NHS number)
- Same three sub-model breakdown bars the patient sees
- Same action plan the patient sees
- Same evidence panel linking out to the research catalog
- **Clinical action menu** (unique to clinician view): buttons for *Refer for DEXA scan*, *Book HRT consult*, *Prescribe Vitamin D*, *Mark as reviewed*. Each action writes a `ClinicalAction` row and fans out to the patient's notifications feed.

### 7.3 Research surface

**`/research` — Catalog browser**
Three-pane layout:
- **Left rail — filter panel:** category, region, population size, menopause variables, bone variables, access type, cost, suitability for predictive task
- **Center — result list:** card per dataset (name, category, region, population, menopause relevance blurb, suitability badge); full-text search, sort by relevance / population / access turnaround; filtered/total counter
- **Right rail — comparison tray:** collapsible, holds up to 3 datasets for side-by-side comparison

**`/research/[id]` — Dataset detail**
Full schema laid out in readable sections: header block (name, category, region, population), access block (type, url, cost, turnaround, notes), variables (menopause, bone, outcome labels), predictive use cases, strengths, limitations, menopause relevance paragraph, suitability score breakdown. Footer cross-reference: *"Cited by our risk engine for: [list of sub-models]"* — closes the hairpin back to the patient flow.

### 7.4 Public landing

**`/` — Dual-audience landing page**
Single scrolling page: hero (dual-audience framing, primary CTA to patient assessment, secondary CTA to research catalog), problem section (headline stats), two product-face cards (consumer and researcher), science and credibility section (FRAX + catalog), final CTA, footer with NHS portal link.

---

## 8. Technical Approach

### 8.1 Architecture

Single Next.js 15 application with three UI surfaces (patient, NHS clinician, research) and a shared backend. SQLite via Prisma for persistent state. Server-Sent Events for real-time updates between patient and clinician surfaces. No external websocket service, no authentication infrastructure.

```
┌─────────────────────────────────────────────┐
│  Next.js 15 app (single deploy)             │
│                                              │
│   ┌─────────┐  ┌─────────┐  ┌──────────┐    │
│   │ Patient │  │  NHS    │  │ Research │    │
│   │ /app/*  │  │ /nhs/*  │  │ /research│    │
│   └────┬────┘  └────┬────┘  └────┬─────┘    │
│        └────────────┼────────────┘          │
│                     ▼                        │
│      ┌────────────────────────────┐         │
│      │  API routes / actions      │         │
│      │  /api/score                │         │
│      │  /api/share-with-gp        │         │
│      │  /api/gp-action            │         │
│      │  /api/events (SSE)         │         │
│      └─────────────┬──────────────┘         │
│                    ▼                         │
│      ┌────────────────────────────┐         │
│      │  src/lib/ services         │         │
│      │  - risk-engine             │         │
│      │    (FRAX + PM + BMD)       │         │
│      │  - ehr-parser (mock)       │         │
│      │  - catalog (loads          │         │
│      │    datasets.json at boot)  │         │
│      │  - event-bus (in-process)  │         │
│      └─────────────┬──────────────┘         │
│                    ▼                         │
│      ┌────────────────────────────┐         │
│      │  Prisma + SQLite           │         │
│      └────────────────────────────┘         │
└─────────────────────────────────────────────┘
```

### 8.2 Stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | Next.js 15 (app router, TypeScript, server actions) | Single repo, single deploy, no CORS, server actions minimize boilerplate |
| UI | Tailwind CSS + shadcn/ui | Production-grade components without bespoke design work |
| Database | Prisma + SQLite | Committable `.db` file, zero setup, matches existing team experience |
| Real-time | Server-Sent Events (native) | Unidirectional server-to-client is sufficient; no external services or API keys |
| Charts | Recharts | Score breakdown and sub-model visualization |
| Validation | Zod | Questionnaire schema and mock EHR parse |
| Deploy | Vercel | Zero-config deploy for Next.js |

### 8.3 Risk engine methodology

The engine is implemented as a set of pure TypeScript functions. No ML inference, no training pipelines. All coefficients are sourced from published literature and cited in the data catalog.

- **FRAX-style 10-year fracture risk** — direct implementation of the WHO FRAX algorithm (Kanis 2008 and subsequent updates). Inputs: age, sex, BMI, prior fracture, parental hip fracture, smoking, alcohol, steroid use, rheumatoid arthritis, secondary osteoporosis. Output: probability of major osteoporotic fracture in the next 10 years.
- **Perimenopause timing estimate** — rules-based. Inputs: current age, maternal menopause age, cycle regularity change over the last 12 months, BMI, smoking. Output: estimated years to menopause onset.
- **BMD trajectory** — parameterized linear decline model. Inputs: age, ethnicity, BMI, exercise frequency, calcium intake proxy. Output: projected BMD T-score at menopause onset and 10 years post-menopause.
- **Composite score** — weighted aggregate of the three sub-models, mapped to a 0–100 scale with published clinical thresholds for LOW / MODERATE / HIGH tiering.

### 8.4 Data catalog

Stored in `datasets.json` at the project root, loaded into memory at server boot, indexed for fast filter and full-text search. Current compilation: ~45 of a targeted ~160 datasets across seven categories:

- **Biobanks & national surveys** (~14 entries) — UK Biobank, All of Us, FinnGen, China Kadoorie, Estonian Biobank, BioBank Japan, Million Veteran Program, Mexico City Prospective Study, Taiwan Biobank, Qatar Biobank, H3Africa/AWI-Gen, CLSA, NHANES, KNHANES
- **Imaging** (~19 entries) — VerSe, CTSpine1K, TotalSegmentator v2, CTPelvic1K, RSNA Cervical Spine 2022, DeepLesion, RadImageNet, MURA, GRAZPEDWRI-DX, FracAtlas, Knee X-ray Osteoporosis, Hip Osteoporosis X-ray, fastMRI+, MyoSegmenTUM Spine, xVertSeg, SpineWeb Hub, OSTEODENT, HR-pQCT (BoMIC), OAI
- **Genomics** (~12 entries) — GEFOS, UKB eBMD GWAS (Morris 2019), deCODE fracture, ReproGen ANM, PGS Catalog, IEU OpenGWAS, GWAS Catalog, GTEx, Bone scRNA Atlases, DNAmMenoAge, 23andMe Research, TOPMed
- **EHR / claims / registries** (~26 targeted)
- **Comorbidity cohorts** (~23 targeted)
- **Lifestyle / wearables** (~33 targeted)
- **Trials & fracture registries** (~30 targeted)

Unified schema per entry: `id`, `name`, `full_name`, `category`, `subcategory`, `region`, `population`, `modalities`, `menopause_variables`, `bone_variables`, `outcome_labels`, `predictive_use_cases`, `access` (type / url / cost / turnaround / notes), `strengths`, `limitations`, `menopause_relevance`, `suitability`.

---

## 9. Success Metrics

### MVP
- End-to-end demo completes in under 3 minutes without user intervention or error
- All three risk sub-models produce defensible outputs grounded in published literature
- Research catalog surfaces 100+ datasets with filter response time under 100ms
- Patient → clinician real-time handoff demonstrably closes the loop on screen during demo
- Evidence panel citations deep-link correctly into the research surface

### Post-MVP (directional)
- Time from risk flag to first clinical action (target: under 48 hours)
- Fraction of HIGH-risk flagged patients who share with their GP (target: >60%)
- Researcher engagement with catalog (sessions, dataset detail views, comparison tray usage)
- Scientific citations of the catalog in published work
- NHS advisory or pilot conversations initiated

---

## 10. Risks & Open Questions

| Risk | Impact | Mitigation |
|---|---|---|
| Regulatory: tool could be classified as a medical device by MHRA / CE | Blocks distribution | Position as a wellness/education tool; prominent non-diagnostic disclaimer; do not make diagnostic claims |
| Clinical defensibility of sub-models beyond FRAX | Reviewers dismiss novel layers | Stay faithful to published methodology; cite every parameter; keep perimenopause timing explicitly rules-based, not "ML" |
| Dataset catalog accuracy — human-curated content may contain errors | Reputational | Source every entry; include "last verified" date; open to community correction post-MVP |
| Scope creep between two audiences | Dilutes product | Enforce explicit MVP scope boundary; defer researcher-side advanced features (wizards, exports) |
| NHS integration path is unclear | Limits real-world deployment | MVP is explicitly a mock; real FHIR integration is a v1+ conversation with NHS Digital |
| Catalog licensing and citation compliance | Legal exposure | Review dataset terms of use; only cite publicly documented access information |

### Open questions

- Final product name and brand direction
- Is the catalog released as open data post-MVP, or kept proprietary?
- Is the researcher surface a revenue stream (paid access), a lead-generation surface for the consumer product, or a pure credibility layer?
- How does the product earn clinician trust at scale — pilot studies, RCP endorsement, peer-reviewed publication?

---

## 11. Roadmap (directional)

- **MVP (current work):** The scope defined in Section 6. Single persona, mock integrations, SSE handoff, catalog at 160 entries.
- **v0.2:** Real authentication, multi-patient support, basic GP account system, catalog versioning, citation export
- **v0.3:** Wearable integration (Apple Health, Fitbit) for dynamic scoring; longitudinal tracking; dataset suitability wizard on the research surface
- **v1.0:** NHS Digital integration (real FHIR ingest for record pre-fill, real clinician authentication); clinical advisory board; first validation study

---

## 12. Appendix A — Engine Math *(to be finalized before build)*

- FRAX implementation notes and published coefficient source
- Perimenopause timing rule set and thresholds
- BMD trajectory parameters by ethnicity and age band
- Composite score weighting methodology and clinical threshold justification

## 13. Appendix B — Catalog Schema

See `datasets.json` at the project root. Schema fields enumerated in Section 8.4.

---

*This document is a draft brought forward from the brainstorming phase. Sections 6, 7, and 8 reflect locked product decisions. Sections 9, 10, 11, and the appendices are directional and will be refined as MVP build proceeds.*
