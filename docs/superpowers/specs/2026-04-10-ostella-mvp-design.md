---
title: Ostella MVP — Design Spec
date: 2026-04-10
status: draft
author: Rex Heng
reviewers: [spec-document-reviewer]
---

# Ostella MVP — Design Spec

A functional-MVP pitch build of an NHS-facing perimenopause bone-health risk triage tool. A synthetic cohort of women aged 42–55 registered to a single demo GP practice is scored by a transparent linear model; high-risk patients are flagged to a GP, who reviews the case and sends an invitation email to the patient; the patient accesses a portal with educational content and a self-referral path.

This spec defines what gets built. It does not define how the build is sequenced — that belongs to the implementation plan produced by the `writing-plans` skill as the next step after this spec is approved.

---

## 1. Goals

1. A web app deployable to Vercel that a stakeholder can open in a browser and experience end-to-end in under two minutes without logging in.
2. A demonstrable GP-in-the-loop workflow: GP dashboard → patient detail with model explainer → compose & send alert → switch into patient view → patient sees the alert.
3. A visibly transparent linear risk model with a feature contribution chart per patient. The coefficient file is auditable in under ten minutes by a non-engineer.
4. A landing page that frames the problem (perimenopause bone loss window), explains how the tool works, and addresses the two most likely objections (black-box AI, AI contacting patients) above the fold of the CTA loop.
5. A stub-based substrate that is swappable: the risk model and the email sender are both placeholder implementations behind stable interfaces, so that production-grade replacements can drop in with single-file edits.

## 2. Non-goals

1. **No database.** No Postgres, no Prisma, no Supabase, no KV store. `patients.json` is the source of truth.
2. **No authentication.** No NextAuth, no Clerk, no login screens. A role switcher cookie distinguishes GP view from Patient view; neither view is gated.
3. **No persistence of "sent alerts" or any mutating state.** Clicking *Send alert* shows an in-app confirmation; refreshing the page loses it. Alert state that must survive a refresh is pre-baked into `patients.json`.
4. **No real email delivery in v1.** The `/api/send-alert` endpoint always returns a simulated payload. Real Resend integration is deferred to task #12.
5. **No verified clinical model weights in v1.** The `lib/model-weights.ts` file ships with FRAX-literature-derived placeholder values behind a visible STUB banner. Verified weights are delivered by Rex's teammates and integrated via task #8.
6. **No search, no pagination, no history, no analytics.** 82 patients fit on one screen with sort + filter; anything beyond that is out of scope.
7. **No moderate-risk or low-risk email templates.** Only the high-risk template is authored and only high-risk patients expose a *Send alert* button. Lower-risk tiers display passive "monitor" / "no action" copy.
8. **No clinical use.** An "early-stage research prototype, not for clinical use" disclaimer appears in the landing page footer.

## 3. Scope decisions

Choices made during brainstorming with their rationale attached. Future deviations from this list must be flagged and re-approved.

| Decision | Choice | Rationale |
|---|---|---|
| Deployment target | Vercel | User preference; matches Next.js App Router natively. |
| Framework | Next.js 14 (App Router) + TypeScript + Tailwind + shadcn/ui | Vercel-native; server components read JSON without API calls; `shadcn` gives production-grade primitives without lock-in. |
| Data source | `data/patients.json`, 82 synthetic records | Rex specified synthetic JSON for a single practice in one region. No ORM or schema migrations. |
| Authentication | None; cookie-based role switcher | Pitch velocity. Adding auth only adds surface area for the live demo to break on. |
| Risk model | Linear log-hazard score, 14 features, placeholder FRAX-derived coefficients behind STUB banner | Interface is production-shaped; values are literature-plausible so the demo is credible; teammates swap values later without touching UI. |
| Email delivery | Simulated in-app modal, no external dependency | Zero pre-flight setup for the pitch. Architecture leaves a single clean swap-point for real Resend integration. |
| Pitch flow | Role switcher in demo header (`GP view` / `Patient view`) | Fastest live-demo path; matches the two-subagent build plan. |
| Demo determinism | "Sarah Chen" is hand-authored, always top of GP dashboard, always the hero page | Pitch demos cannot have random surprises. |

## 4. Architecture

### 4.1 Repo layout

```
app/
├── (marketing)/
│   └── page.tsx                    # landing page (Subagent C)
├── demo/
│   ├── layout.tsx                  # shared shell with RoleSwitcher header
│   ├── gp/
│   │   ├── page.tsx                # GP dashboard        (Subagent A)
│   │   └── patients/[id]/page.tsx  # GP patient detail    (Subagent A)
│   └── patient/
│       ├── page.tsx                # patient portal home  (Subagent B)
│       ├── education/page.tsx      # education library    (Subagent B)
│       └── refer/page.tsx          # self-referral form   (Subagent B)
└── api/
    └── send-alert/
        └── route.ts                # stubbed email sender (Subagent A)

lib/
├── risk-model.ts                   # pure scoring function (Phase 0)
├── model-weights.ts                # STUB — placeholder coefficients (Phase 0)
├── patients.ts                     # JSON loader + typed helpers (Phase 0)
├── email-templates.ts              # high-risk template only (Phase 0 or A)
└── types.ts                        # Patient, RiskContribution, etc. (Phase 0)

data/
└── patients.json                   # 82 synthetic records (Phase 0)

components/
├── RoleSwitcher.tsx                # Phase 0
├── RiskBadge.tsx                   # Phase 0
├── FeatureContributionChart.tsx    # Subagent A
├── AlertComposer.tsx               # Subagent A
├── AlertPreviewModal.tsx           # Subagent A
├── EducationCard.tsx               # Subagent B
├── SelfReferralForm.tsx            # Subagent B
└── marketing/                      # Subagent C
    ├── Hero.tsx
    ├── StatCards.tsx
    ├── HowItWorks.tsx
    └── ModelTransparency.tsx

docs/
└── superpowers/
    └── specs/
        └── 2026-04-10-ostella-mvp-design.md   # this file
```

### 4.2 Data flow

1. Server component in each demo screen imports `getAllPatients()` or `getPatient(id)` from `lib/patients.ts`.
2. The loader reads `data/patients.json` synchronously at request time and returns typed `Patient[]` / `Patient`.
3. The server component calls `scorePatient(patient)` from `lib/risk-model.ts`, which returns `{ score, relative_risk, tier, contributions[] }`.
4. The component renders the result. Risk scoring happens on every request; the linear model is microseconds, and this lets coefficient edits take effect on reload without rebuild.
5. No client-side data fetching except the `/api/send-alert` POST from the GP alert composer.

### 4.3 The only mutating endpoint

`POST /api/send-alert` accepts `{ patient_id, subject, body }` and always returns:

```json
{
  "simulated": true,
  "preview": {
    "to": "sarah.chen@example.com",
    "from": "Dr. Amira Hassan <hassan@regentspark.nhs.uk>",
    "subject": "...",
    "body": "...",
    "rendered_at": "2026-04-10T14:23:00Z"
  }
}
```

No state is written. The GP-side client receives the preview and opens an `AlertPreviewModal` that displays the rendered email with a "Delivered (simulated)" badge.

## 5. Parallel subagent strategy

Phase 0 is strictly sequential; Phase 1 runs three subagents in parallel; Phase 2 is strictly sequential.

### Phase 0 — Foundation (sequential)

Produces the entire contract surface before any view-building begins.

- Next.js + TypeScript + Tailwind + shadcn scaffold.
- `lib/types.ts` — `Patient`, `RiskTier`, `RiskContribution`, `ScoredPatient`, `AlertPayload`.
- `lib/model-weights.ts` — STUB coefficient file (see §7).
- `lib/risk-model.ts` — pure function `scorePatient(patient: Patient): ScoredPatient`.
- Unit tests for `risk-model.ts` — interface-level only: shape of output, monotonicity, tier-boundary behaviour. No test asserts specific coefficient values.
- `lib/patients.ts` — loader + typed helpers.
- `data/patients.json` — 82 synthetic records (see §8).
- `components/RoleSwitcher.tsx` + `RiskBadge.tsx`.
- `app/demo/layout.tsx` — the shared shell both view-subtrees render into.
- Tailwind theme + design tokens (one file).
- Landing page copy brief in the spec — Subagent C reads this spec and works from §10 directly.

### Phase 1 — Parallel fork (three subagents)

Independent file trees. Contract surface is frozen as of Phase 0.

- **Subagent A — "GP-in-the-loop view"** owns:
  - `app/demo/gp/page.tsx`
  - `app/demo/gp/patients/[id]/page.tsx`
  - `app/api/send-alert/route.ts`
  - `components/FeatureContributionChart.tsx`
  - `components/AlertComposer.tsx`
  - `components/AlertPreviewModal.tsx`
  - `lib/email-templates.ts` (high-risk template only)

- **Subagent B — "Patient portal view"** owns:
  - `app/demo/patient/page.tsx`
  - `app/demo/patient/education/page.tsx`
  - `app/demo/patient/refer/page.tsx`
  - `components/EducationCard.tsx`
  - `components/SelfReferralForm.tsx`
  - Hand-authored content for 4–6 education articles

- **Subagent C — "Marketing landing page"** owns:
  - `app/(marketing)/page.tsx`
  - `components/marketing/*`
  - Research and citation of the three hero statistics (NHFD 2023, NICE NG226, IOF 2021 or successor sources)

### Phase 2 — Integration (sequential)

- End-to-end sanity check: open `/`, click *See the GP view*, sort by risk, click Sarah Chen, open the feature chart, click *Send alert*, see the preview modal, switch to *Patient view* header dropdown, confirm Sarah's portal shows her pre-baked alert.
- Fix any seam issues between subagent outputs.
- Commit, push, deploy to Vercel, verify the live URL.

## 6. Screens inventory

Nine screen states total across seven routes.

| # | Route | Screen | Owner | Purpose |
|---|---|---|---|---|
| 1 | `/` | Landing | C | Problem framing, stats, how-it-works, model transparency teaser, GP-in-the-loop reassurance, dual CTA. |
| 2 | `/demo/gp` | GP dashboard | A | Sortable/filterable patient table, risk badges, summary counts by tier at top. |
| 3 | `/demo/gp/patients/[id]` | GP patient detail | A | Patient card + feature contribution chart + hover citations + Send alert composer (only when tier = high). |
| 4 | `/demo/patient` | Patient portal home | B | Risk explanation in plain language, three action cards, GP's most recent message if present. |
| 5 | `/demo/patient/education` | Education library | B | 4–6 short in-app articles on perimenopause, bone loss, exercise, calcium/D, speaking to GP, what the FRAX inputs mean. |
| 6 | `/demo/patient/refer` | Self-referral form | B | Symptoms checklist + preferred time + message; submits to local success state, no persistence. |
| 7 | `/demo/gp/patients/[id]` (modal overlay) | Alert preview modal | A | Post-send overlay showing rendered email with "Delivered (simulated)" tag + timestamp. |
| 8 | `/demo/gp` (empty state) | Empty filter result | A | Handled inline; not a separate route. |
| 9 | `/demo/patient` (unalerted state) | Low-risk patient portal | B | For a non-flagged patient — shows education library and "your risk is currently low, here's how to keep it that way." |

The **feature contribution chart on Screen #3 is the primary pitch asset**. Every other screen is scaffolding around this one moment of transparency.

## 7. Risk model

### 7.1 Status: STUB

Ships in v1 as a **placeholder**. Behaviour is architecturally correct and literature-plausible; coefficient values are pending clinical-team verification. See §11 for the handoff.

`lib/model-weights.ts` opens with:

```typescript
/**
 * ⚠️  PLACEHOLDER WEIGHTS — PENDING TEAMMATE VERIFICATION
 *
 * These values are FRAX-literature approximations used to unblock
 * the UI build. DO NOT cite these in any clinical or stakeholder
 * context. Replace with verified values before v1.0.
 *
 * Owner: Ostella clinical team
 * Tracking: task #8
 */
```

The GP patient detail page and the landing page both carry a visible "Placeholder weights — clinical validation in progress" tag (task #9), removable in one edit when the handoff lands.

### 7.2 Functional form

```
score(patient)  = Σᵢ βᵢ · xᵢ
relative_risk   = exp(score)
tier            = "high"     if relative_risk ≥ 3.5
                = "moderate" if 1.5 ≤ relative_risk < 3.5
                = "low"      otherwise
```

Reference patient (where `score = 0`, `relative_risk = 1.0`): a 50-year-old, early-perimenopausal, BMI 22, European-ancestry woman with no prior fracture, no family history, non-smoker, no secondary risk factors.

The score is read as *"how many times more likely than the reference woman is this patient to have a major osteoporotic fracture in the next 10 years."* This is a relative-risk framing, not a calibrated 10-year probability — the landing page and the patient detail page both disclose this explicitly.

### 7.3 Feature set (14 features)

**Core FRAX features** — coefficients from Kanis et al. 2007/2008 FRAX derivation papers:

| Feature | Type | Placeholder HR | Placeholder β |
|---|---|---|---|
| Age above 50 | continuous (per year) | ~1.08 | +0.077 |
| BMI < 20 | boolean | 1.95 | +0.668 |
| BMI > 30 | boolean | 0.75 | −0.288 |
| Prior fragility fracture | boolean | 1.85 | +0.615 |
| Parent hip fracture | boolean | 2.28 | +0.824 |
| Current smoker | boolean | 1.29 | +0.255 |
| Alcohol ≥ 3 units/day | boolean | 1.38 | +0.322 |
| Glucocorticoid use (current/recent) | boolean | 2.31 | +0.837 |
| Rheumatoid arthritis | boolean | 1.95 | +0.668 |

**Perimenopause-specific features** — from SWAN bone substudy, WHI:

| Feature | Type | Placeholder HR | Placeholder β |
|---|---|---|---|
| Menopausal stage | 5-level ordinal (premeno → post 5–10yr) | 0.70 / 1.00 / 1.25 / 1.80 / 2.20 | −0.357 / 0 / +0.223 / +0.588 / +0.788 |
| Early menopause (FMP age < 45) | boolean | 1.75 | +0.560 |
| Current HRT use | boolean | 0.60 | −0.511 |
| Low dietary calcium (<700 mg/day) | boolean | 1.15 | +0.140 |

**Ethnicity baseline adjustment** — one coefficient, UK-calibrated:

| Feature | Type | Placeholder HR | Placeholder β |
|---|---|---|---|
| Ethnicity | 4-level categorical (white / S.Asian / E.Asian / Black African) | 1.00 / 0.95 / 0.80 / 0.50 | 0 / −0.051 / −0.223 / −0.693 |

Exact values and per-coefficient DOI citations will be pinned in `lib/model-weights.ts`. Verified values from the clinical team may change magnitudes and may add or remove features — the interface is the contract, not the individual values.

### 7.4 Tier thresholds

Hand-calibrated to produce a realistic distribution on the synthetic cohort: roughly **~55% low / ~30% moderate / ~15% high**, matching UK perimenopausal primary-care populations. Thresholds are relative-risk cutoffs, explicitly disclosed in-app as not-FRAX-probabilities. A production deployment would swap these for FRAX-API 10-year probabilities with NOGG cutoffs.

### 7.5 Model explainer UX

For every patient rendered on Screen #3, the `FeatureContributionChart` shows one horizontal bar per contributing feature. Bars point right (red) for risk-increasing contributions and left (green) for protective contributions. Bar length is `|βᵢ · xᵢ|`. Hover reveals the raw hazard ratio, the literature citation, and the patient's input value. The chart is sorted by absolute contribution magnitude.

This chart is the money shot of the pitch. It is the single UI element that earns the most design attention during Phase 1 Subagent A's work.

## 8. Synthetic data

### 8.1 Framing

```
Ostella Demo Practice
Regent's Park Medical Centre, NW1 — NHS North Central London ICB
List size: 82 female patients aged 42–55
Clinicians: Dr. Amira Hassan (GP Partner), Dr. James Okafor (Salaried GP)
```

One practice, one region, 82 patients. All synthetic. The ICB name is real (NCL ICB exists); the practice name is fictional.

### 8.2 Schema

```typescript
type Patient = {
  id: string                        // "p-001" ... "p-082"
  name: string                      // "Sarah Chen"
  date_of_birth: string             // "1975-03-12"
  nhs_number: string                // "943 476 5919" — synthetic, passes format check only
  ethnicity: "white" | "south_asian" | "east_asian" | "black_african" | "other"
  gp_registered_date: string        // "2019-06-04"
  contact: {
    email: string                   // "sarah.chen@example.com"
    phone: string                   // "+44 7700 900123"
  }
  clinical: {
    height_cm: number
    weight_kg: number
    bmi: number
    menopausal_stage:
      | "premenopausal"
      | "early_perimenopausal"
      | "late_perimenopausal"
      | "postmenopausal_under_5yr"
      | "postmenopausal_5_10yr"
    age_at_fmp: number | null
    prior_fragility_fracture: boolean
    parent_hip_fracture: boolean
    current_smoker: boolean
    alcohol_units_per_day: number
    glucocorticoid_use: boolean
    rheumatoid_arthritis: boolean
    current_hrt: boolean
    dietary_calcium_mg_per_day: number
  }
  latest_alert: {
    sent_at: string                 // ISO timestamp
    sent_by: string                 // "Dr. Amira Hassan"
    risk_level_at_send: "high" | "moderate"
    message: string
  } | null
}
```

All 14 model features are present in every record, even when values will never affect the model output (e.g. a premenopausal woman still has `age_at_fmp = null`). Data is complete so that teammate-verified weights can reuse every existing field.

### 8.3 Cohort composition

Hand-curated to produce:

| Tier after scoring | Count | % | Shape |
|---|---|---|---|
| High | ~12 | 15% | Multiple combined risk factors |
| Moderate | ~24 | 29% | One or two notable risk factors |
| Low | ~46 | 56% | Normal BMI, no family history, mild menopausal stage, no lifestyle red flags |

### 8.4 Demo determinism

- **Sarah Chen (p-001)** — hand-authored, high-risk, coherent biography (age 49, BMI 19.2, late perimenopausal, current smoker, paternal hip fracture, low dietary calcium, European ancestry). Always top of the GP dashboard when sorted by risk score descending. Her detail page is the hero of the live demo.
- **Three patients with `latest_alert` pre-populated**: `p-001` (Sarah, high), `p-014` (moderate-high), `p-037` (high). The patient-portal view defaults to one of these so the portal shows a non-empty state immediately.
- The remaining 79 patients are procedurally generated by a one-off Node script (realistic name pools, realistic BMI and menopausal-stage distributions) and then manually sanity-checked before commit. The generator script is disposable; only `patients.json` is committed.

## 9. Email flow (stubbed)

### 9.1 Architecture

`POST /api/send-alert` is the only mutating endpoint in the app. It receives `{ patient_id, subject, body }`, validates the patient exists, renders the email, and returns a simulated preview. No external service calls, no state writes.

```
GP clicks "Send alert"
   ↓
AlertComposer collects subject + body (pre-filled from high-risk template)
   ↓
POST /api/send-alert { patient_id, subject, body }
   ↓
route.ts returns { simulated: true, preview: { to, from, subject, body, rendered_at } }
   ↓
AlertPreviewModal opens with the rendered email + "Delivered (simulated)" tag
```

### 9.2 Swap point

When task #12 activates, the single change required is inside `app/api/send-alert/route.ts`:

```typescript
// v1 (stub)
return { simulated: true, preview: renderedEmail };

// v1.1 (Resend)
if (process.env.RESEND_API_KEY) {
  const result = await resend.emails.send(renderedEmail);
  return { simulated: false, id: result.id, preview: renderedEmail };
}
return { simulated: true, preview: renderedEmail };
```

No other files change. The UI already handles the `simulated: boolean` flag.

### 9.3 Templates

Only the **high-risk template** is authored for MVP. It lives in `lib/email-templates.ts` as a pure function `highRiskAlert(patient: Patient, gp: { name, practice }) => { subject, body }`. See the brainstorming transcript for the canonical wording; final copy is committed to the template file in Phase 0 or early Phase 1.

Moderate- and low-risk patient detail pages do not render the *Send alert* button at all — they show passive "Monitor — review in 6 months" (moderate) or "No action required — patient can self-access education materials" (low) copy instead. This matches the clinical reality: the tool targets intervention, not noise.

## 10. Landing page narrative

### 10.1 Structure

Seven sections, in this exact order. Each earns its place.

1. **Hero** — one-line problem framing, dual CTA (`See the GP view`, `See the patient view`).
2. **The problem** — three stat cards with real NHS / IOF / NICE sources (researched at implementation time).
3. **Why perimenopause is the window** — the distinguishing clinical framing: bone density drops fastest in the 5–8 years bracketing the final menstrual period, up to 2% per year; post-menopausal diagnosis is already late.
4. **How it works** — three-step visual: *score → review → act*.
5. **The model is not a black box** — transparent-linear-model explanation, preview of the feature contribution chart, explicit placeholder-weights disclaimer.
6. **The GP remains in the loop** — reassures that no outbound message leaves without a named clinician composing, editing, and sending it.
7. **About** — "Ostella is an early-stage research prototype. Not for clinical use." No team names for v1.

Sections 5 and 6 are deliberately defensive — they preempt the two objections most likely to kill a pitch conversation ("is this ML hype?" and "are you letting AI email my patients?"), and they appear above the footer so a skeptical reader meets them before disengaging.

### 10.2 Copy ownership

Subagent C owns all copy. Hero headline, stat card wording, how-it-works labels, and the model-transparency copy are all authored during the parallel fork phase. The implementation plan should include a single instruction for Subagent C to actively research and cite the three stat-card sources (NHFD 2023 for mortality, NICE NG226 for screening gaps, IOF 2021 for lifetime fracture risk) rather than leaving placeholder numbers.

## 11. Open items and follow-up tasks

All tracked in the in-session task list.

| Task | Status | Blocker |
|---|---|---|
| #7 — Stub risk model with placeholder weights | pending | Phase 0 |
| #8 — HANDOFF: swap stub weights for teammate-verified values | pending | Teammates delivering values |
| #9 — Mark placeholder status visibly in UI | pending | Phase 1 Subagent A + C |
| #10 — Write project CLAUDE.md after spec approval | pending | Spec approval |
| #11 — Stub email delivery with in-app preview modal | pending | Phase 1 Subagent A |
| #12 — HANDOFF: swap stub email for real Resend delivery | pending | Future pitch-readiness decision |

## 12. Definition of done

- `pnpm dev` runs the app locally with zero configuration.
- `pnpm test` runs unit tests on `lib/risk-model.ts` and passes.
- `vercel deploy` produces a live URL.
- On the live URL, the following end-to-end flow succeeds without error:
  1. Land on `/`.
  2. Click *See the GP view*.
  3. The dashboard shows Sarah Chen at the top, flagged red.
  4. Click her row.
  5. The feature contribution chart renders with all non-zero terms visible, each bar hoverable for citation info.
  6. Click *Send alert*.
  7. The alert composer opens pre-filled with the high-risk template.
  8. Click *Send*.
  9. The AlertPreviewModal displays the rendered email with a "Delivered (simulated)" tag.
  10. Switch role to *Patient view* from the header dropdown.
  11. The patient portal shows Sarah's pre-baked alert from Dr. Hassan.
  12. Navigate to the education library and see 4–6 content cards.
  13. Navigate to self-referral, fill the form, submit, see the success state.

No extras. No cleverness. The above flow is the definition of done.
