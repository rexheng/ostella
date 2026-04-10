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
5. **No clinical validation against real patient outcomes in v1.** The `lib/model-weights.ts` file ships with **literature-verified** coefficients (traced to primary sources with DOIs — see §7 and `docs/model-weights-rationale.md`), but the model has not been validated against real-patient outcomes in a prospective UK primary-care cohort. It remains a research prototype pending that validation.
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
| Risk model | Linear log-hazard score, 14 features, literature-verified coefficients (Kanis FRAX series, SWAN, WHI, Curtis CPRD) | Interface is production-shaped; values trace to primary sources with DOIs; contested / derived / UK-extrapolated values flagged in code. Auditability is the core pitch asset. |
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
├── model-weights.ts                # Literature-verified coefficients (delivered 2026-04-10)
├── patients.ts                     # JSON loader + typed helpers (Phase 0)
├── email-templates.ts              # high-risk template, Phase 0 — frozen before fork
├── demo-state.ts                   # role + active-patient cookie helpers (Phase 0)
└── types.ts                        # Patient, ScoredPatient, RiskContribution, AlertRequest/Response, DemoState (Phase 0)

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

`POST /api/send-alert` accepts an `AlertRequest` and returns an `AlertResponse`. Both types are defined in §4.4. The v1 handler always returns `{ simulated: true, ... }` regardless of input. No state is written. The GP-side client receives the response and opens an `AlertPreviewModal` that displays the rendered email with a "Delivered (simulated)" badge.

### 4.4 Shared type contracts (frozen in Phase 0)

Every type listed below must exist in `lib/types.ts` before Phase 1 begins. Subagents A, B, and C import exclusively from this file for any shared data shape. Adding, renaming, or changing fields in these types during Phase 1 is forbidden without re-syncing all three subagents.

```typescript
// lib/types.ts

// --- Patient record (see §8.2 for full field semantics) ---
export type Ethnicity = "white" | "south_asian" | "east_asian" | "black_african" | "other"

export type MenopausalStage =
  | "premenopausal"
  | "early_perimenopausal"
  | "late_perimenopausal"
  | "postmenopausal_under_5yr"
  | "postmenopausal_5_10yr"

export type Patient = {
  id: string
  name: string
  date_of_birth: string
  nhs_number: string
  ethnicity: Ethnicity
  gp_registered_date: string
  contact: { email: string; phone: string }
  clinical: {
    height_cm: number
    weight_kg: number
    bmi: number
    menopausal_stage: MenopausalStage
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
  latest_alert: PatientAlert | null
}

export type PatientAlert = {
  sent_at: string                  // ISO timestamp
  sent_by: string                  // "Dr. Amira Hassan"
  risk_level_at_send: "high" | "moderate"
  message: string                  // full email body
}

// --- Model output ---
export type RiskTier = "low" | "moderate" | "high"

export type RiskContribution = {
  feature_key: string              // stable machine key, e.g. "parent_hip_fracture"
  feature_label: string            // human label, e.g. "Parent hip fracture"
  patient_value: string | number | boolean  // as presented to the UI
  hazard_ratio: number             // raw HR from source literature
  beta: number                     // log(HR), signed
  contribution: number             // β × xᵢ, signed — the bar length
  direction: "increases_risk" | "reduces_risk" | "neutral"
  citation: string                 // short citation string, e.g. "Kanis et al. 2007, Osteoporos Int"
}

export type ScoredPatient = {
  patient: Patient
  score: number                    // Σ βᵢ · xᵢ
  relative_risk: number            // exp(score)
  tier: RiskTier
  contributions: RiskContribution[]  // every non-zero contributing feature, sorted by |contribution| desc
}

// --- Alert API contract ---
export type AlertRequest = {
  patient_id: string
  subject: string
  body: string
}

export type AlertPreview = {
  to: string
  from: string                     // "Dr. Amira Hassan <hassan@regentspark.nhs.uk>"
  subject: string
  body: string
  rendered_at: string              // ISO timestamp
}

export type AlertResponse =
  | { simulated: true;  preview: AlertPreview }
  | { simulated: false; preview: AlertPreview; provider_id: string }  // shape for future Resend swap (task #12)

// --- Demo session state (cookie-backed) ---
export type DemoRole = "gp" | "patient"

export type DemoState = {
  role: DemoRole
  active_patient_id: string        // which patient the /demo/patient view renders; defaults to "p-001" (Sarah Chen)
}
```

`DemoState` is persisted in a single cookie (`ostella_demo`) as a JSON-encoded string. `lib/demo-state.ts` exposes `getDemoState()` and `setDemoState(partial)` helpers. On first visit to any `/demo/*` route, `DemoState` initializes to `{ role: "gp", active_patient_id: "p-001" }`. The role switcher mutates `role`; navigating to `/demo/patient?as=<id>` mutates `active_patient_id` to the given id and strips the query param via redirect.

## 5. Parallel subagent strategy

Phase 0 is strictly sequential; Phase 1 runs three subagents in parallel; Phase 2 is strictly sequential.

### Phase 0 — Foundation (sequential)

Produces the entire contract surface before any view-building begins.

- Next.js + TypeScript + Tailwind + shadcn scaffold.
- `lib/types.ts` — every type in §4.4. This file is the single source of truth for all cross-subagent contracts.
- `lib/model-weights.ts` — literature-verified coefficients (already delivered by the clinical team on 2026-04-10; Task 0.5 migrates it to import types from `lib/types.ts`). See §7.
- `lib/risk-model.ts` — pure function `scorePatient(patient: Patient): ScoredPatient`.
- Unit tests for `risk-model.ts` — interface-level only: shape of output, monotonicity, tier-boundary behaviour. No test asserts specific coefficient values.
- `lib/patients.ts` — loader + typed helpers.
- `lib/email-templates.ts` — `highRiskAlert(patient, gp)` pure function, canonical wording frozen (see §9.3). Removed from Subagent A's ownership list — Phase 0 delivers this so Subagent A consumes a stable template.
- `lib/demo-state.ts` — `getDemoState()` / `setDemoState()` cookie helpers.
- `data/patients.json` — 82 synthetic records (see §8).
- `components/RoleSwitcher.tsx` + `RiskBadge.tsx`.
- `app/demo/layout.tsx` — the shared shell both view-subtrees render into, reading `DemoState` and rendering the role switcher header.
- Tailwind theme + design tokens (one file).
- After `patients.json` is generated, **iterate tier thresholds** (§7.4) against the actual cohort distribution so that the 55/30/15 split holds. Thresholds may move away from 1.5 / 3.5 if the generator distribution demands it — the values in §7.4 are the target, not a contract.
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
  - Subagent A **consumes** `lib/email-templates.ts` (delivered by Phase 0) but does not own it.

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
| 9 | `/demo/patient?as=<patient_id>` (unalerted state) | Low-risk patient portal | B | For a non-flagged patient — shows education library and "your risk is currently low, here's how to keep it that way." Reached by explicit query param on the portal URL; see §4.4 for how `?as=` mutates `DemoState.active_patient_id`. Without the query param, the portal always defaults to Sarah Chen (`p-001`). |

The **feature contribution chart on Screen #3 is the primary pitch asset**. Every other screen is scaffolding around this one moment of transparency.

## 7. Risk model

### 7.1 Status: VERIFIED (v0.1)

`lib/model-weights.ts` ships with **literature-verified** coefficients as of 2026-04-10, produced by a dedicated research pass that traces every HR to a primary source with DOI or PMID. This replaces the placeholder/STUB status originally planned in this section — task #8 in §11 is now addressable in-session rather than by external teammates.

Tier thresholds (`TIER_THRESHOLDS.moderate` and `.high`) remain placeholder until calibrated against the synthetic cohort — that step is blocked until `data/patients.json` exists (see §7.4).

`lib/model-weights.ts` opens with:

```typescript
/**
 * Ostella Perimenopause Osteoporosis Risk Model — Coefficient Weights
 *
 * STATUS: Literature-verified (this file replaces the pre-verification
 * stub referenced by task #8). Values below trace to primary sources
 * with DOIs. Threshold calibration and synthetic-cohort sanity checks
 * remain blocked on data/patients.json and lib/risk-model.ts per
 * docs/model-calibration.md §7.
 *
 * See docs/model-weights-rationale.md for per-coefficient decision
 * history and docs/model-calibration.md for the calibration memo.
 */
```

The GP patient detail page and the landing page continue to carry a "Research prototype — not for clinical use" tag (task #9) since clinical validation against real-patient data is still out of scope for v1, but the "placeholder weights" framing is retired.

Full per-coefficient rationale — why each HR was picked, which alternatives were rejected, confidence ratings, contested-value handling — lives in `docs/model-weights-rationale.md`. Short calibration memo (reference patient, interaction warnings, sanity-check results, worked examples) lives in `docs/model-calibration.md`. Both are read-once documents the clinical reviewer can use to audit the model.

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

Each entry in `lib/model-weights.ts` conforms to a `CoefficientEntry` shape carrying the contract fields `{ key, label, hr, beta, citation }` (consumed by the GP patient detail chart in §7.5) plus rich metadata fields for clinical audit: `ci95`, `source` (full citation with DOI), `population`, `confidence`, `notes`, `actionable`, `actionable_rationale`, `flags`, `category`, and `age_interaction_note`. The `key` matches `feature_key` in `RiskContribution` (§4.4).

Four evidence flags may be attached to any coefficient:
- **CONTESTED** — primary literature disagrees by more than 30% on the point estimate (2 features: `bmi_high`, `low_calcium`)
- **DERIVED** — no paper reports the HR directly; computed from a surrogate such as BMD trajectory × BMD→fracture gradient (5 features: all `menopausal_stage` levels)
- **UK_EXTRAPOLATED** — HR comes from a non-UK cohort and requires extrapolation to UK primary care (3 features: the three non-White `ethnicity_baseline` levels)
- **OLD_UNREPLICATED** — primary source >15 years old with no post-2015 replication (no coefficient carries this flag — every Kanis 2004–2005 paper has been replicated in modern meta-analyses)

**Core FRAX features** — nine coefficients sourced from the Kanis FRAX-derivation series (2004–2007) and Van Staa 2006 (UK GPRD) for RA. Every one replicated in a 2015+ meta-analysis.

| Key | Label | Type | Verified HR | Verified β | CI95 | Citation |
|---|---|---|---|---|---|---|
| `age_above_50` | Age above 50 | continuous (per year) | 1.043 | +0.042 | — | Kanis et al. 2007, Osteoporos Int |
| `bmi_low` | BMI < 20 | boolean | 1.28 | +0.247 | [1.15, 1.42] | De Laet et al. 2005, Osteoporos Int |
| `bmi_high` | BMI > 30 | boolean | 0.95 | −0.051 | [0.83, 1.08] | De Laet 2005 / Compston 2011 GLOW (**CONTESTED**) |
| `prior_fracture` | Prior fragility fracture | boolean | 1.86 | +0.621 | [1.58, 2.17] | Kanis et al. 2004, Bone |
| `parent_hip_fracture` | Parent hip fracture | boolean | 1.54 | +0.432 | [1.25, 1.88] | Kanis et al. 2004, Bone |
| `current_smoker` | Current smoker | boolean | 1.25 | +0.223 | [1.15, 1.36] | Kanis et al. 2005, Osteoporos Int |
| `alcohol_high` | Alcohol ≥ 3 units/day | boolean | 1.38 | +0.322 | [1.16, 1.65] | Kanis et al. 2005, Osteoporos Int |
| `glucocorticoid_use` | Glucocorticoid use (ever) | boolean | 1.66 | +0.507 | [1.42, 1.92] | Kanis et al. 2004, JBMR |
| `rheumatoid_arthritis` | Rheumatoid arthritis | boolean | 1.56 | +0.445 | [1.20, 2.02] | Van Staa et al. 2006, Arthritis Rheum |

**Perimenopause-specific features** — four coefficients sourced from SWAN (menopausal stage), Svejme 2012 (early menopause), the WHI HT arm (HRT), and Bolland 2015 BMJ systematic review (calcium).

| Key | Label | Type | Verified HR | Verified β | Citation |
|---|---|---|---|---|---|
| `menopausal_stage` | Menopausal stage | 5-level categorical | 0.98 / 1.00 / 1.04 / 1.29 / 1.48 | −0.020 / 0 / +0.039 / +0.255 / +0.392 | Greendale et al. 2012 (SWAN) × Johnell 2005 (BMD→fracture) — **DERIVED** |
| `early_menopause` | Early menopause (FMP < 45) | boolean | 1.83 | +0.604 | Svejme et al. 2012, BJOG |
| `current_hrt` | Current HRT use | boolean | 0.66 | −0.416 | Cauley et al. 2003, JAMA (WHI E+P arm, RCT) |
| `low_calcium` | Low dietary calcium (<700 mg/day) | boolean | 1.05 | +0.049 | Bolland et al. 2015, BMJ (**CONTESTED**) |

Menopausal stage levels, in order: `premenopausal` / `early_perimenopausal` (reference) / `late_perimenopausal` / `postmenopausal_under_5yr` / `postmenopausal_5_10yr`. All five carry the `DERIVED` flag because no primary source reports MOF HRs stratified by STRAW+10 stage in the 42–55 band; they are computed from SWAN BMD trajectories × the Johnell BMD→fracture gradient of HR ≈ 1.6 per SD. See `docs/model-weights-rationale.md` §6.10 for the full derivation.

**Ethnicity baseline adjustment** — one 5-level categorical (four published levels + `other` fallback), UK-calibrated where possible.

| Key | Label | Type | Verified HR | Verified β | Citation | Flag |
|---|---|---|---|---|---|---|
| `ethnicity_baseline: white` | White (reference) | — | 1.00 | 0.000 | Curtis et al. 2016, Bone (CPRD) | — |
| `ethnicity_baseline: south_asian` | South Asian | — | 0.70 | −0.357 | Curtis et al. 2016, Bone (CPRD) | UK_EXTRAPOLATED (age band) |
| `ethnicity_baseline: east_asian` | East Asian | — | 0.75 | −0.288 | Cauley et al. 2007, JBMR (WHI) | UK_EXTRAPOLATED |
| `ethnicity_baseline: black_african` | Black African | — | 0.50 | −0.693 | Cauley et al. 2005, JAMA | UK_EXTRAPOLATED |
| `ethnicity_baseline: other` | Other / not recorded | — | 1.00 | 0.000 | Defaults to reference | — |

The `other` fallback defaults to the White reference HR (1.00). This is the conservative choice — it never incorrectly reduces a patient's predicted risk based on uncertain ancestry coding, surfaces as a zero-length bar in the feature contribution chart (visibly acknowledged rather than silently assumed), and the accompanying `actionable_rationale` explicitly prompts for a more specific category if one is available.

#### 7.3.1 Interaction rules (consumed by `lib/risk-model.ts`)

The linear log-hazard form assumes features combine independently. Two interactions violate that assumption strongly enough to need explicit handling in the scoring function, not just in the weights. Both rules are exported as constants from `lib/model-weights.ts` so the scoring function reads them rather than hardcoding.

1. **`STAGE_HRT_INTERACTION_RULE`** — default `"collapse_stage_to_reference_when_on_hrt"`. When `current_hrt === true`, the scoring function substitutes `menopausal_stage = early_perimenopausal` (reference) before applying the stage coefficient, then applies the HRT coefficient normally. Reasoning: the stage HRs are driven by transmenopause BMD loss; HRT suppresses that loss; scoring both independently double-counts the protective effect. See `docs/model-weights-rationale.md` §9.1.
2. **`EARLY_MENOPAUSE_INTERACTION_RULE`** — default `"only_apply_when_peri_or_earlier"`. The scoring function applies the `early_menopause` coefficient only when `menopausal_stage` is `premenopausal`, `early_perimenopausal`, or `late_perimenopausal`. Once the patient is postmenopausal, the stage coefficient already captures the relevant physiology, so applying both would double-count. See `docs/model-weights-rationale.md` §9.2.

Both rules are defaults, not commitments — alternative values for each constant are documented in the type definitions. The spec team can pick different defaults without touching the scoring function.

### 7.4 Tier thresholds

`TIER_THRESHOLDS` in `lib/model-weights.ts` ships as a placeholder: `{ moderate: 1.5, high: 3.5 }`. These are relative-risk cutoffs — the score for a patient with RR ≥ 3.5 is "high", RR ≥ 1.5 is "moderate", otherwise "low". Thresholds are explicitly disclosed in-app as *not* FRAX-probabilities; a production deployment would swap these for FRAX-API 10-year probabilities with NOGG cutoffs.

**These placeholders must be calibrated against the synthetic cohort before deployment.** The target distribution is ~55% low / ~30% moderate / ~15% high, matching UK perimenopausal primary-care populations. Calibration is a sequential Phase 0 step performed after `data/patients.json` is generated:

1. Run `scorePatient()` across all 82 synthetic patients.
2. Sweep candidate `(moderate, high)` pairs against the target distribution.
3. Pick the pair that produces the closest match.
4. Document the final thresholds and the resulting histogram in `docs/model-calibration.md` §7.
5. Hand-verify that "Sarah Chen" (p-001) remains tier `high` under the calibrated thresholds — if not, either re-author Sarah's clinical profile or flag that the calibration target is incompatible with the hero demo.

If the calibrated distribution is materially off (e.g. the model produces 70% high), that's a signal the synthetic cohort distribution needs rebalancing — the weights are literature-derived and defensible, so the cohort generator is the place to adjust.

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
- **The `/demo/patient` route defaults to `p-001` (Sarah) unconditionally.** On first visit, `DemoState.active_patient_id` is initialized to `"p-001"`. Any other patient portal state is only reachable via the explicit `?as=<patient_id>` query param, after which the query param is stripped via redirect and the cookie carries the new value forward. This guarantees the live-demo flow always lands on Sarah's portal when the presenter switches roles mid-pitch.
- **Three patients with `latest_alert` pre-populated**: `p-001` (Sarah, high), `p-014` (moderate-high), `p-037` (high). This ensures the default patient portal always shows a non-empty "your GP has flagged you" state.
- **Screen #9 (low-risk state)** is reached via `/demo/patient?as=p-040` (or any `latest_alert: null` patient id). This is documented in the README so the presenter can show the low-risk flow on demand.
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

Only the **high-risk template** is authored for MVP. It lives in `lib/email-templates.ts` as a pure function:

```typescript
export function highRiskAlert(
  patient: Patient,
  gp: { name: string; practice: string }
): { subject: string; body: string }
```

The canonical wording, frozen in Phase 0 and consumed unchanged by Subagent A's `AlertComposer`:

**Subject:** `From {practice} — a note about your bone health`

**Body:**

```
Dear {first_name},

I'm {gp_name}, one of the GPs at {practice}.
I'm writing because we recently reviewed your records as part of a
new preventative screening programme for women in perimenopause.

Based on several factors in your history, you've been identified
as someone who would benefit from a conversation about bone health
in the next few weeks. This is preventative, not urgent — but the
changes that happen to bones in the years around menopause are
easier to address early than later.

I'd like to invite you to:

  1. Book a 15-minute appointment with me to discuss next steps
  2. Read a short guide we've prepared on what's happening and
     what you can do about it — your patient portal has this
  3. Consider requesting a DEXA bone density scan, which I can
     arrange if it's appropriate after we've spoken

This isn't a diagnosis. It's an invitation to a conversation.
If you'd rather not take this up, no action is needed — just let
us know and we'll remove you from the programme.

Warm regards,
{gp_name}
{practice}
```

Token substitutions are literal string replacements — no templating engine required. `AlertComposer` loads this pre-filled text into an editable textarea so the GP can tweak wording before hitting send; the edited version (not the original) is what flows to `/api/send-alert`.

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

Tracked in the in-session task list. Task IDs #1–#6 are brainstorming-workflow tasks (clarifying questions, design presentation, spec write, spec review, user review, plan transition) and do not represent project deliverables. Implementation-relevant tasks begin at #7.

| Task | Status | Blocker |
|---|---|---|
| #7 — Stub risk model with verified weights | complete (v0.1) | `lib/model-weights.ts` delivered 2026-04-10; see `docs/model-weights-rationale.md` and `docs/model-calibration.md` |
| #8 — HANDOFF: swap stub weights for teammate-verified values | superseded by #7 | N/A |
| #8a — Calibrate `TIER_THRESHOLDS` against 82-patient synthetic cohort | pending | `data/patients.json` + `lib/risk-model.ts` |
| #8b — Implement `STAGE_HRT_INTERACTION_RULE` and `EARLY_MENOPAUSE_INTERACTION_RULE` in `lib/risk-model.ts` | pending | Phase 0 |
| #9 — Mark "research prototype" status visibly in UI | pending | Phase 1 Subagent A + C |
| #10 — Write project CLAUDE.md after spec approval | pending | Spec approval |
| #11 — Stub email delivery with in-app preview modal | pending | Phase 1 Subagent A |
| #12 — HANDOFF: swap stub email for real Resend delivery | pending | Future pitch-readiness decision |

## 12. Definition of done

- `pnpm dev` runs the app locally with zero configuration (no env vars required).
- `pnpm test` runs unit tests on `lib/risk-model.ts` and passes.
- `vercel deploy` produces a live URL.
- On the live URL, the following end-to-end flow succeeds without error in a freshly-incognito browser:
  1. Land on `/`.
  2. Click *See the GP view*. Landing on `/demo/gp` initializes `DemoState` to `{ role: "gp", active_patient_id: "p-001" }`.
  3. The dashboard shows Sarah Chen (`p-001`) at the top of the sort-by-risk-descending ordering, flagged red.
  4. Click her row — navigates to `/demo/gp/patients/p-001`.
  5. The `FeatureContributionChart` renders every non-zero `RiskContribution` as a horizontal bar sorted by absolute magnitude; hovering any bar reveals the stored `citation` string and the raw `hazard_ratio`.
  6. Click *Send alert*. The `AlertComposer` opens pre-filled from `highRiskAlert(patient, gp)`.
  7. Click *Send* in the composer — the client POSTs an `AlertRequest` to `/api/send-alert`.
  8. The handler returns `{ simulated: true, preview: AlertPreview }`; the `AlertPreviewModal` opens showing the rendered email with a "Delivered (simulated)" tag and the `rendered_at` timestamp.
  9. Close the modal. Use the header role switcher to flip to *Patient view*. This mutates `DemoState.role` to `"patient"` and navigates to `/demo/patient` with `active_patient_id` unchanged (still `p-001`).
  10. The patient portal renders Sarah's pre-baked `latest_alert` from Dr. Amira Hassan at the top of the page.
  11. Navigate to `/demo/patient/education` and see 4–6 content cards.
  12. Navigate to `/demo/patient/refer`, fill the form, submit, see the success state.
  13. Visit `/demo/patient?as=p-040` directly; the low-risk portal state renders (education library + "your risk is currently low" copy), and the query param is stripped via redirect so the URL reads `/demo/patient`.

No extras. No cleverness. The above flow is the definition of done.
