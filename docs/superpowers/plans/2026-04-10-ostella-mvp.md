# Ostella MVP Implementation Plan

> **For agentic workers:** REQUIRED: Use `superpowers:subagent-driven-development` to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking. Spec this plan derives from: `docs/superpowers/specs/2026-04-10-ostella-mvp-design.md`.

**Goal:** Ship a Vercel-deployed Next.js MVP of a perimenopause bone-health risk triage tool with a transparent (stubbed) linear risk model, a synthetic GP practice cohort, a GP-in-the-loop alert flow, a patient portal, and a pitch-ready landing page.

**Architecture:** Next.js 14 App Router, TypeScript, Tailwind, shadcn/ui. No database, no auth, no real email. `data/patients.json` is the source of truth; a single cookie holds `DemoState`; the only mutating endpoint is a stubbed `/api/send-alert`. Phase 0 builds the frozen contract surface sequentially; Phase 1 forks three parallel subagents (GP view, Patient view, Marketing landing) against that frozen surface; Phase 2 integrates and deploys.

**Tech Stack:** Next.js 14, React 18, TypeScript 5, Tailwind CSS 3, shadcn/ui, Vitest, pnpm, Vercel.

**Conventions:**
- `pnpm` for all package operations. If `pnpm` is not installed: `npm i -g pnpm` first.
- Every task ends in a commit. Commit messages: `feat: ...`, `test: ...`, `chore: ...`, `docs: ...`, `fix: ...`.
- TDD is applied to pure-function and API-route code (`lib/risk-model.ts`, `lib/patients.ts`, `lib/demo-state.ts`, `lib/email-templates.ts`, `app/api/send-alert/route.ts`). UI components are verified by running the dev server and navigating to the route.
- Never skip Phase 0 tasks. The parallel fork in Phase 1 depends on Phase 0 delivering the frozen contract surface.

---

## Chunk 1: Phase 0 — Foundation (sequential)

Phase 0 builds the contract surface every Phase 1 subagent depends on. No parallelism here — each task unblocks the next. Do not start Phase 1 until every Phase 0 task is committed.

### Task 0.1: Scaffold Next.js 14 + TypeScript

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.mjs`, `next-env.d.ts`, `app/layout.tsx`, `app/page.tsx`, `.gitignore` (merge with existing)

- [ ] **Step 1: Scaffold the Next.js app in the current directory**

```bash
pnpm dlx create-next-app@14 . --ts --tailwind --app --src-dir=false --import-alias="@/*" --use-pnpm --no-eslint
```

When prompted about existing files, allow overwrite for `.gitignore` but keep existing files like `REPORT.md`, `datasets.json`, `CLAUDE.md`, and `docs/`.

- [ ] **Step 2: Verify the scaffold runs**

```bash
pnpm dev
```

Expected: "Ready in Xs" and a dev server on http://localhost:3000. Hit Ctrl+C to stop.

- [ ] **Step 3: Clean up default content we don't want**

Delete the default marketing content in `app/page.tsx` and leave it as a placeholder:

```tsx
export default function Home() {
  return <main>Ostella — landing page coming in Phase 1 Subagent C.</main>;
}
```

Delete `app/favicon.ico` only if `create-next-app` overwrote an existing one; otherwise leave it.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js 14 + TypeScript + Tailwind"
```

---

### Task 0.2: Install shadcn/ui + core primitives

**Files:**
- Create: `components.json`, `lib/utils.ts`, `components/ui/button.tsx`, `components/ui/card.tsx`, `components/ui/badge.tsx`, `components/ui/dialog.tsx`, `components/ui/input.tsx`, `components/ui/textarea.tsx`, `components/ui/label.tsx`, `components/ui/table.tsx`, `components/ui/select.tsx`, `components/ui/checkbox.tsx`, `components/ui/tooltip.tsx`

**Heads up:** `shadcn init` will overwrite `app/globals.css` and `tailwind.config.ts` that `create-next-app` generated. Accept the overwrite — Task 0.2b reinstates the brand tokens on top of the shadcn base.

- [ ] **Step 1: Initialize shadcn**

```bash
pnpm dlx shadcn@latest init
```

Answer prompts: Default style, Slate base color, CSS variables yes. Accept default paths.

- [ ] **Step 2: Install the primitives listed above**

```bash
pnpm dlx shadcn@latest add button card badge dialog input textarea label table select checkbox tooltip
```

- [ ] **Step 3: Sanity check — run dev, confirm app still loads**

```bash
pnpm dev
```

Expected: http://localhost:3000 still renders the placeholder. Ctrl+C to stop.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: install shadcn/ui primitives"
```

---

### Task 0.2b: Author Ostella brand tokens

**Files:**
- Modify: `tailwind.config.ts`

The frozen contract surface includes brand tokens so that all three Phase 1 subagents produce visually consistent output. This task adds a minimal brand accent on top of shadcn's slate base — nothing more. Subagents A/B/C must use these tokens for any accent colour.

- [ ] **Step 1: Extend `tailwind.config.ts` theme with Ostella brand accents**

Open the generated `tailwind.config.ts` and add the `ostella` colour ramp to `theme.extend.colors`:

```typescript
// inside theme.extend.colors, alongside whatever shadcn added:
ostella: {
  50:  "#f5f7fb",
  100: "#e8edf6",
  200: "#c9d6ec",
  300: "#9eb5d9",
  400: "#6d8cc0",
  500: "#486aa3",  // primary brand accent
  600: "#3a5488",
  700: "#31446e",
  800: "#2c3a59",
  900: "#28334d",
},
```

- [ ] **Step 2: Verify by using the token in the placeholder page**

Modify `app/page.tsx` to smoke-test the token:

```tsx
export default function Home() {
  return (
    <main className="bg-ostella-50 p-8">
      <p className="text-ostella-700">Ostella — landing page coming in Phase 1 Subagent C.</p>
    </main>
  );
}
```

- [ ] **Step 3: Run dev, confirm colours render**

```bash
pnpm dev
```

Expected: pale blue background, darker blue text. Ctrl+C to stop.

- [ ] **Step 4: Commit**

```bash
git add tailwind.config.ts app/page.tsx
git commit -m "chore: add Ostella brand token ramp to tailwind config"
```

---

### Task 0.3: Install Vitest + testing setup

**Files:**
- Create: `vitest.config.ts`, `vitest.setup.ts`
- Modify: `package.json` (add test script)

- [ ] **Step 1: Install Vitest and supporting packages**

```bash
pnpm add -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @types/node
```

- [ ] **Step 2: Create `vitest.config.ts`**

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
```

- [ ] **Step 3: Create `vitest.setup.ts`**

```typescript
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 4: Add `test` script to `package.json`**

Modify the `"scripts"` block to include:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: Write a trivial smoke test to prove the setup works**

Create `lib/__tests__/smoke.test.ts`:

```typescript
import { describe, it, expect } from "vitest";

describe("smoke", () => {
  it("runs vitest", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 6: Run the test**

```bash
pnpm test
```

Expected: `1 passed`.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: install and configure Vitest"
```

---

### Task 0.4: Define frozen TypeScript contract surface in `lib/types.ts`

**Files:**
- Create: `lib/types.ts`

This file becomes the single source of truth for every shared type in Phase 1. Do not add, remove, or rename fields after this task without re-syncing all three subagents.

- [ ] **Step 1: Create `lib/types.ts` with every type from spec §4.4**

```typescript
// lib/types.ts
// Frozen contract surface — do not modify without re-syncing all Phase 1 subagents.
// Canonical reference: docs/superpowers/specs/2026-04-10-ostella-mvp-design.md §4.4

export type Ethnicity =
  | "white"
  | "south_asian"
  | "east_asian"
  | "black_african"
  | "other";

export type MenopausalStage =
  | "premenopausal"
  | "early_perimenopausal"
  | "late_perimenopausal"
  | "postmenopausal_under_5yr"
  | "postmenopausal_5_10yr";

export type Patient = {
  id: string;
  name: string;
  date_of_birth: string;
  nhs_number: string;
  ethnicity: Ethnicity;
  gp_registered_date: string;
  contact: {
    email: string;
    phone: string;
  };
  clinical: {
    height_cm: number;
    weight_kg: number;
    bmi: number;
    menopausal_stage: MenopausalStage;
    age_at_fmp: number | null;
    prior_fragility_fracture: boolean;
    parent_hip_fracture: boolean;
    current_smoker: boolean;
    alcohol_units_per_day: number;
    glucocorticoid_use: boolean;
    rheumatoid_arthritis: boolean;
    current_hrt: boolean;
    dietary_calcium_mg_per_day: number;
  };
  latest_alert: PatientAlert | null;
};

export type PatientAlert = {
  sent_at: string;
  sent_by: string;
  risk_level_at_send: "high" | "moderate";
  message: string;
};

export type RiskTier = "low" | "moderate" | "high";

export type EvidenceFlag =
  | "CONTESTED"
  | "OLD_UNREPLICATED"
  | "UK_EXTRAPOLATED"
  | "DERIVED";

export type Confidence = "high" | "medium" | "low";

export type RiskContribution = {
  // --- Required fields, consumed by every chart rendering ---
  feature_key: string;
  feature_label: string;
  patient_value: string | number | boolean;
  hazard_ratio: number;
  beta: number;
  contribution: number;
  direction: "increases_risk" | "reduces_risk" | "neutral";
  citation: string;
  // --- Optional enrichment fields, populated from lib/model-weights.ts
  //     CoefficientEntry when available. The chart's hover tooltip
  //     renders whichever of these are present. Adding new optional
  //     fields here is allowed without breaking Phase 1 consumers. ---
  ci95?: readonly [number, number] | null;
  source?: string;                  // full citation incl. DOI/PMID
  population?: string;              // study cohort summary
  confidence?: Confidence;
  notes?: string;                   // caveats, contested / derived discussion
  flags?: readonly EvidenceFlag[];
  actionable?: boolean;
  actionable_rationale?: string;
};

export type ScoredPatient = {
  patient: Patient;
  score: number;
  relative_risk: number;
  tier: RiskTier;
  contributions: RiskContribution[];
};

export type AlertRequest = {
  patient_id: string;
  subject: string;
  body: string;
};

export type AlertPreview = {
  to: string;
  from: string;
  subject: string;
  body: string;
  rendered_at: string;
};

export type AlertResponse =
  | { simulated: true; preview: AlertPreview }
  | { simulated: false; preview: AlertPreview; provider_id: string };

export type DemoRole = "gp" | "patient";

export type DemoState = {
  role: DemoRole;
  active_patient_id: string;
};

export const DEFAULT_DEMO_STATE: DemoState = {
  role: "gp",
  active_patient_id: "p-001",
};

export const DEMO_PRACTICE = {
  name: "Regent's Park Medical Centre",
  icb: "NHS North Central London ICB",
  postcode: "NW1",
} as const;

export const DEMO_GP = {
  name: "Dr. Amira Hassan",
  email: "hassan@regentspark.nhs.uk",
} as const;
```

- [ ] **Step 2: Typecheck**

```bash
pnpm tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/types.ts
git commit -m "feat: freeze Phase 0 TypeScript contract surface in lib/types.ts"
```

---

### Task 0.5: Migrate the clinical team's `lib/model-weights.ts` to use `lib/types.ts`

**Files:**
- Modify: `lib/model-weights.ts` (the file already exists — delivered by a parallel clinical-team agent session on 2026-04-10; see `docs/model-calibration.md` and `docs/model-weights-rationale.md`)

**Context — IMPORTANT.** Unlike what the original plan anticipated, the clinical team has already delivered a fully literature-verified `lib/model-weights.ts`. It contains 14 features, every coefficient traced to a primary-source DOI with 95% CIs, evidence-quality flags (CONTESTED / UK_EXTRAPOLATED / DERIVED / OLD_UNREPLICATED), population summaries, and per-feature `actionable_rationale` strings. It uses a typed `WEIGHTS` discriminated-union object (`ContinuousFeature | BooleanFeature | CategoricalFeature<K>`), not flat arrays. The field naming already matches spec §4.4.

**This task does NOT rewrite that file.** It (a) reconciles the type duplication — the file currently re-declares `Ethnicity`, `MenopausalStage`, and `RiskTier` inline as a temporary convenience; Task 0.4 has now added them to `lib/types.ts`, so those inline declarations must be removed and imported from `@/lib/types` instead — and (b) typechecks the result.

Do NOT modify any `WEIGHTS` entry, any `hr` / `beta` / `citation` / `source` / `notes` value, or the `TIER_THRESHOLDS`, `STAGE_HRT_INTERACTION_RULE`, or `EARLY_MENOPAUSE_INTERACTION_RULE` constants. Those are the clinical team's deliverable and are frozen for Phase 0.

- [ ] **Step 1: Read the current state of `lib/model-weights.ts`**

Skim the file. Note these key exports that Task 0.6 will consume:

- `WEIGHTS` — the typed discriminated-union object
- `CoefficientEntry`, `ContinuousFeature`, `BooleanFeature`, `CategoricalFeature<K>`, `EvidenceFlag`, `Confidence`, `FeatureCategory` — the internal type vocabulary
- `TIER_THRESHOLDS` — `{ moderate: number, high: number }` as const
- `STAGE_HRT_INTERACTION_RULE` — used by Task 0.6 scoring logic
- `EARLY_MENOPAUSE_INTERACTION_RULE` — used by Task 0.6 scoring logic

- [ ] **Step 2: Remove the inline type duplication**

Near the top of the file you will see a block commented `TYPES — will migrate to lib/types.ts in spec Phase 0` containing inline declarations of `Ethnicity`, `MenopausalStage`, and `RiskTier`. Delete those three `export type` declarations. They are now owned by `lib/types.ts` as of Task 0.4.

- [ ] **Step 3: Add a single import from `@/lib/types` at the top of the file**

```typescript
import type { Ethnicity, MenopausalStage, RiskTier } from "@/lib/types";
```

The rest of the file (the `CoefficientEntry` interface, the `WEIGHTS` object, the interaction rules) references these types and should continue to compile unchanged.

- [ ] **Step 4: Typecheck**

```bash
pnpm tsc --noEmit
```

Expected: no errors. If there are errors reported inside `lib/model-weights.ts` after only these two edits, STOP and report — do not modify `WEIGHTS` values to get typecheck to pass.

- [ ] **Step 5: Commit**

```bash
git add lib/model-weights.ts
git commit -m "refactor: lift Ethnicity/MenopausalStage/RiskTier to lib/types.ts

Clinical-team deliverable lib/model-weights.ts re-declared these
three types inline as a temporary convenience. Now that
lib/types.ts is the canonical contract surface (Task 0.4), remove
the duplicates and import from @/lib/types. No coefficient values
changed."
```

---

### Task 0.6: Implement `lib/risk-model.ts` with TDD

**Files:**
- Create: `lib/risk-model.ts`, `lib/__tests__/risk-model.test.ts`

The tests exercise the interface and monotonicity only — they do not assert specific coefficient values, so the tests stay green when Task #8 swaps the weights.

- [ ] **Step 1: Write the failing test file `lib/__tests__/risk-model.test.ts`**

```typescript
import { describe, it, expect } from "vitest";
import { scorePatient } from "@/lib/risk-model";
import type { Patient } from "@/lib/types";

function makeReferencePatient(overrides: Partial<Patient["clinical"]> = {}): Patient {
  return {
    id: "ref",
    name: "Reference Patient",
    date_of_birth: "1976-01-01", // ~50 at 2026-01-01
    nhs_number: "000 000 0000",
    ethnicity: "white",
    gp_registered_date: "2020-01-01",
    contact: { email: "ref@example.com", phone: "+44 7700 900000" },
    clinical: {
      height_cm: 165,
      weight_kg: 60,
      bmi: 22,
      menopausal_stage: "early_perimenopausal",
      age_at_fmp: null,
      prior_fragility_fracture: false,
      parent_hip_fracture: false,
      current_smoker: false,
      alcohol_units_per_day: 0,
      glucocorticoid_use: false,
      rheumatoid_arthritis: false,
      current_hrt: false,
      dietary_calcium_mg_per_day: 1000,
      ...overrides,
    },
    latest_alert: null,
  };
}

describe("scorePatient", () => {
  it("returns a ScoredPatient with all required fields", () => {
    const result = scorePatient(makeReferencePatient());
    expect(result).toHaveProperty("patient");
    expect(result).toHaveProperty("score");
    expect(result).toHaveProperty("relative_risk");
    expect(result).toHaveProperty("tier");
    expect(result).toHaveProperty("contributions");
    expect(Array.isArray(result.contributions)).toBe(true);
  });

  it("reference patient scores near RR = 1.0 and tier = low", () => {
    const result = scorePatient(makeReferencePatient());
    expect(result.relative_risk).toBeGreaterThan(0.9);
    expect(result.relative_risk).toBeLessThan(1.2);
    expect(result.tier).toBe("low");
  });

  it("adding a positive risk factor monotonically increases the score", () => {
    const ref = scorePatient(makeReferencePatient());
    const withSmoking = scorePatient(makeReferencePatient({ current_smoker: true }));
    expect(withSmoking.score).toBeGreaterThan(ref.score);
    expect(withSmoking.relative_risk).toBeGreaterThan(ref.relative_risk);
  });

  it("adding a protective factor monotonically decreases the score", () => {
    const ref = scorePatient(makeReferencePatient());
    const withHrt = scorePatient(makeReferencePatient({ current_hrt: true }));
    expect(withHrt.score).toBeLessThan(ref.score);
  });

  it("tier 'high' is assigned when multiple strong risk factors stack", () => {
    const result = scorePatient(
      makeReferencePatient({
        bmi: 19,
        current_smoker: true,
        parent_hip_fracture: true,
        menopausal_stage: "postmenopausal_under_5yr",
      })
    );
    expect(result.tier).toBe("high");
  });

  it("contributions include the citation string for every non-zero feature", () => {
    const result = scorePatient(
      makeReferencePatient({ current_smoker: true, parent_hip_fracture: true })
    );
    const smoker = result.contributions.find((c) => c.feature_key === "current_smoker");
    const parent = result.contributions.find((c) => c.feature_key === "parent_hip_fracture");
    expect(smoker?.citation).toContain("Kanis");
    expect(parent?.citation).toContain("Kanis");
  });

  it("contributions are sorted by absolute magnitude descending", () => {
    const result = scorePatient(
      makeReferencePatient({
        bmi: 19,
        current_smoker: true,
        parent_hip_fracture: true,
      })
    );
    for (let i = 1; i < result.contributions.length; i++) {
      expect(Math.abs(result.contributions[i - 1].contribution))
        .toBeGreaterThanOrEqual(Math.abs(result.contributions[i].contribution));
    }
  });
});
```

- [ ] **Step 2: Add interaction-mitigation and enrichment tests to the same `describe` block**

Append the following tests inside the same `describe("scorePatient", …)` block, before its closing `});`. They enforce the clinical team's two required interaction mitigations (see `docs/model-calibration.md` §4.2 and §4.3) plus enrichment-field plumbing.

```typescript
  // --- HRT × menopausal-stage mitigation (calibration memo §4.2) ---
  //
  // A woman who is post_under_5yr AND on HRT should NOT be scored
  // (stage_HR × HRT_HR) — HRT suppresses the BMD loss that drives the
  // stage HR. Under the default rule
  // "collapse_stage_to_reference_when_on_hrt", her score should equal
  // that of an early_perimenopausal woman on HRT with all other fields
  // identical.
  it("collapses post-menopausal stage to reference when on HRT", () => {
    const a = scorePatient(
      makeReferencePatient({
        menopausal_stage: "postmenopausal_under_5yr",
        age_at_fmp: 48,
        current_hrt: true,
      })
    );
    const b = scorePatient(
      makeReferencePatient({
        menopausal_stage: "early_perimenopausal",
        age_at_fmp: null,
        current_hrt: true,
      })
    );
    // Stage contribution should be suppressed; HRT contribution applies to both.
    expect(a.score).toBeCloseTo(b.score, 3);
    const stageContribA = a.contributions.find((c) =>
      c.feature_key.startsWith("menopausal_stage")
    );
    expect(stageContribA).toBeUndefined(); // stage zeroed when collapsed
  });

  // --- Early menopause × menopausal-stage mitigation (calibration memo §4.3) ---
  //
  // Default rule "only_apply_when_peri_or_earlier": the early_menopause
  // coefficient is suppressed once the patient has advanced to
  // postmenopausal_under_5yr or later, because the estrogen-deficiency
  // effect is already reflected in the stage HR.
  it("suppresses early-menopause coefficient once postmenopausal", () => {
    const postWithEarlyFmp = scorePatient(
      makeReferencePatient({
        menopausal_stage: "postmenopausal_under_5yr",
        age_at_fmp: 43,
      })
    );
    const postWithNormalFmp = scorePatient(
      makeReferencePatient({
        menopausal_stage: "postmenopausal_under_5yr",
        age_at_fmp: 48,
      })
    );
    // Both patients should score identically — early_menopause does not fire.
    expect(postWithEarlyFmp.score).toBeCloseTo(postWithNormalFmp.score, 3);
    const earlyContrib = postWithEarlyFmp.contributions.find(
      (c) => c.feature_key === "early_menopause"
    );
    expect(earlyContrib).toBeUndefined();

    // But an early-meno woman still in the peri window DOES get the coefficient.
    const periWithEarlyFmp = scorePatient(
      makeReferencePatient({
        menopausal_stage: "late_perimenopausal",
        age_at_fmp: 43,
      })
    );
    const periEarlyContrib = periWithEarlyFmp.contributions.find(
      (c) => c.feature_key === "early_menopause"
    );
    expect(periEarlyContrib).toBeDefined();
  });

  // --- Enrichment-field plumbing (optional fields populated from WEIGHTS) ---
  it("populates enrichment fields on contributions when available", () => {
    const result = scorePatient(
      makeReferencePatient({ current_smoker: true, parent_hip_fracture: true })
    );
    const smoker = result.contributions.find((c) => c.feature_key === "current_smoker")!;
    expect(smoker.source).toBeDefined();          // full citation present
    expect(smoker.population).toBeDefined();      // cohort summary present
    expect(smoker.confidence).toBeDefined();      // confidence rating present
    expect(smoker.actionable).toBe(true);         // smoking is modifiable
    expect(smoker.actionable_rationale).toBeDefined();
  });
```

- [ ] **Step 3: Run the full test file to confirm all ten tests fail**

```bash
pnpm test
```

Expected: all tests fail — `scorePatient` is not yet defined.

- [ ] **Step 4: Implement `lib/risk-model.ts`**

This version consumes the clinical team's typed `WEIGHTS` discriminated-union object and applies both interaction mitigations using the exported rule constants.

```typescript
// lib/risk-model.ts
// Pure scoring function. Consumes the clinical team's typed WEIGHTS
// object from lib/model-weights.ts and applies the stage×HRT and
// early-menopause×stage interaction mitigations encoded there.
//
// See spec §7 and docs/model-calibration.md §4.2–§4.3 for the
// functional form and interaction rationale.

import type {
  Patient,
  ScoredPatient,
  RiskContribution,
  RiskTier,
  MenopausalStage,
  Ethnicity,
} from "@/lib/types";
import {
  WEIGHTS,
  TIER_THRESHOLDS,
  STAGE_HRT_INTERACTION_RULE,
  EARLY_MENOPAUSE_INTERACTION_RULE,
} from "@/lib/model-weights";

const REFERENCE_AGE = 50;

function ageFromDob(dob: string, today: Date = new Date()): number {
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

/** Build a RiskContribution from a CoefficientEntry, copying all enrichment fields. */
function contributionFrom(
  // Using the structural shape so this file doesn't import CoefficientEntry directly.
  entry: (typeof WEIGHTS.bmi_low)["coefficient"],
  patientValue: string | number | boolean,
  contribution: number
): RiskContribution {
  return {
    feature_key: entry.key,
    feature_label: entry.label,
    patient_value: patientValue,
    hazard_ratio: entry.hr,
    beta: entry.beta,
    contribution,
    direction:
      contribution > 0
        ? "increases_risk"
        : contribution < 0
        ? "reduces_risk"
        : "neutral",
    citation: entry.citation,
    // --- Enrichment fields (optional on RiskContribution) ---
    ci95: entry.ci95 ?? null,
    source: entry.source,
    population: entry.population,
    confidence: entry.confidence,
    notes: entry.notes,
    flags: entry.flags,
    actionable: entry.actionable,
    actionable_rationale: entry.actionable_rationale,
  };
}

/**
 * Resolve the effective menopausal stage for scoring, applying the
 * STAGE_HRT_INTERACTION_RULE. The clinical team's default rule
 * "collapse_stage_to_reference_when_on_hrt" means: if the patient is on
 * HRT AND their declared stage is postmenopausal_*, treat the stage as
 * early_perimenopausal (the reference level) so the stage contribution
 * does not double-count estrogen-deficiency with the HRT benefit.
 */
function effectiveMenopausalStage(
  declared: MenopausalStage,
  currentHrt: boolean
): MenopausalStage {
  if (!currentHrt) return declared;
  if (STAGE_HRT_INTERACTION_RULE === "collapse_stage_to_reference_when_on_hrt") {
    if (
      declared === "postmenopausal_under_5yr" ||
      declared === "postmenopausal_5_10yr"
    ) {
      return "early_perimenopausal";
    }
  }
  // Other rules ("zero_stage_beta_when_on_hrt", "half_stage_beta_when_on_hrt")
  // are not implemented — if a future clinical revision switches the rule,
  // extend this function and add tests for the new semantics.
  return declared;
}

/**
 * Should the early_menopause boolean coefficient fire?
 * Default rule "only_apply_when_peri_or_earlier": only if the patient is
 * still in pre / early-peri / late-peri. Once she has advanced to
 * postmenopausal_*, the effect is already captured by the stage HR.
 */
function shouldApplyEarlyMenopause(
  ageAtFmp: number | null,
  stage: MenopausalStage
): boolean {
  if (ageAtFmp === null || ageAtFmp >= 45) return false;
  if (EARLY_MENOPAUSE_INTERACTION_RULE === "only_apply_when_peri_or_earlier") {
    return (
      stage === "premenopausal" ||
      stage === "early_perimenopausal" ||
      stage === "late_perimenopausal"
    );
  }
  // Other rules not implemented yet.
  return true;
}

export function scorePatient(patient: Patient): ScoredPatient {
  const c = patient.clinical;
  const contributions: RiskContribution[] = [];
  let score = 0;

  const addContribution = (rc: RiskContribution) => {
    if (rc.contribution === 0) return;
    contributions.push(rc);
    score += rc.contribution;
  };

  // --- 1. Age above 50 (continuous, per year) ---
  const age = ageFromDob(patient.date_of_birth);
  const ageFeature = WEIGHTS.age_above_50;
  const ageBeta = ageFeature.coefficient.beta * (age - REFERENCE_AGE);
  addContribution(
    contributionFrom(
      { ...ageFeature.coefficient, label: `Age (${age})` },
      age,
      ageBeta
    )
  );

  // --- 2. BMI bands (boolean features) ---
  if (c.bmi < 20) {
    const e = WEIGHTS.bmi_low.coefficient;
    addContribution(contributionFrom(e, c.bmi, e.beta));
  } else if (c.bmi > 30) {
    const e = WEIGHTS.bmi_high.coefficient;
    addContribution(contributionFrom(e, c.bmi, e.beta));
  }

  // --- 3. Boolean FRAX features ---
  if (c.prior_fragility_fracture) {
    const e = WEIGHTS.prior_fracture.coefficient;
    addContribution(contributionFrom(e, true, e.beta));
  }
  if (c.parent_hip_fracture) {
    const e = WEIGHTS.parent_hip_fracture.coefficient;
    addContribution(contributionFrom(e, true, e.beta));
  }
  if (c.current_smoker) {
    const e = WEIGHTS.current_smoker.coefficient;
    addContribution(contributionFrom(e, true, e.beta));
  }
  if (c.alcohol_units_per_day >= 3) {
    const e = WEIGHTS.alcohol_high.coefficient;
    addContribution(contributionFrom(e, c.alcohol_units_per_day, e.beta));
  }
  if (c.glucocorticoid_use) {
    const e = WEIGHTS.glucocorticoid_use.coefficient;
    addContribution(contributionFrom(e, true, e.beta));
  }
  if (c.rheumatoid_arthritis) {
    const e = WEIGHTS.rheumatoid_arthritis.coefficient;
    addContribution(contributionFrom(e, true, e.beta));
  }

  // --- 4. Menopausal stage — with HRT interaction mitigation ---
  const effectiveStage = effectiveMenopausalStage(c.menopausal_stage, c.current_hrt);
  const stageEntry = WEIGHTS.menopausal_stage.levels[effectiveStage];
  if (stageEntry.beta !== 0) {
    addContribution(contributionFrom(stageEntry, effectiveStage, stageEntry.beta));
  }

  // --- 5. Early menopause — with stage interaction mitigation ---
  if (shouldApplyEarlyMenopause(c.age_at_fmp, c.menopausal_stage)) {
    const e = WEIGHTS.early_menopause.coefficient;
    addContribution(contributionFrom(e, c.age_at_fmp!, e.beta));
  }

  // --- 6. Current HRT (protective, always applies when on HRT) ---
  if (c.current_hrt) {
    const e = WEIGHTS.current_hrt.coefficient;
    addContribution(contributionFrom(e, true, e.beta));
  }

  // --- 7. Low dietary calcium ---
  if (c.dietary_calcium_mg_per_day < 700) {
    const e = WEIGHTS.low_calcium.coefficient;
    addContribution(contributionFrom(e, c.dietary_calcium_mg_per_day, e.beta));
  }

  // --- 8. Ethnicity baseline adjustment ---
  const ethnicityKey = patient.ethnicity as Ethnicity;
  const ethEntry = WEIGHTS.ethnicity_baseline.levels[ethnicityKey];
  if (ethEntry && ethEntry.beta !== 0) {
    addContribution(contributionFrom(ethEntry, ethnicityKey, ethEntry.beta));
  }

  // --- Sort contributions by absolute magnitude descending ---
  contributions.sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));

  const relative_risk = Math.exp(score);
  const tier: RiskTier =
    relative_risk >= TIER_THRESHOLDS.high
      ? "high"
      : relative_risk >= TIER_THRESHOLDS.moderate
      ? "moderate"
      : "low";

  return { patient, score, relative_risk, tier, contributions };
}
```

- [ ] **Step 5: Run the tests to confirm they pass**

```bash
pnpm test
```

Expected: all ten `scorePatient` tests pass (seven base + two interaction mitigations + one enrichment plumbing).

- [ ] **Step 6: Commit**

```bash
git add lib/risk-model.ts lib/__tests__/risk-model.test.ts
git commit -m "feat: add risk-model consuming clinical-team WEIGHTS

Implements the scoring function against the typed WEIGHTS
discriminated union in lib/model-weights.ts, applying both
interaction mitigations from docs/model-calibration.md §4.2
(stage × HRT) and §4.3 (early menopause × stage).

Tests exercise shape, monotonicity, tier boundaries, both
interaction rules, and enrichment-field plumbing — they stay
green when the clinical team revises coefficient values, as
long as the WEIGHTS interface and the interaction rule
constants don't change."
```

---

### Task 0.7: Implement `lib/patients.ts` loader

**Files:**
- Create: `lib/patients.ts`, `lib/__tests__/patients.test.ts`, `data/patients.json` (empty array placeholder for now)

- [ ] **Step 1: Create `data/patients.json` as an empty array placeholder**

```json
[]
```

- [ ] **Step 2: Write the failing test `lib/__tests__/patients.test.ts`**

```typescript
import { describe, it, expect } from "vitest";
import { getAllPatients, getPatient } from "@/lib/patients";

describe("patients loader", () => {
  it("getAllPatients returns an array", () => {
    const all = getAllPatients();
    expect(Array.isArray(all)).toBe(true);
  });

  it("getPatient returns null for a missing id", () => {
    const p = getPatient("non-existent-id");
    expect(p).toBeNull();
  });
});
```

- [ ] **Step 3: Run the test to confirm it fails**

```bash
pnpm test
```

Expected: fails with "getAllPatients is not defined".

- [ ] **Step 4: Implement `lib/patients.ts`**

```typescript
// lib/patients.ts
// JSON-backed patient loader. No database, no cache invalidation.
// Re-reads the file on every server-component render (microseconds).

import type { Patient } from "@/lib/types";
import patientsJson from "@/data/patients.json";

const patients = patientsJson as unknown as Patient[];

export function getAllPatients(): Patient[] {
  return patients;
}

export function getPatient(id: string): Patient | null {
  return patients.find((p) => p.id === id) ?? null;
}
```

- [ ] **Step 5: Ensure TypeScript allows JSON imports**

Add to `tsconfig.json` compiler options if not already present:

```json
"resolveJsonModule": true
```

- [ ] **Step 6: Run the test to confirm it passes**

```bash
pnpm test
```

Expected: all tests pass.

- [ ] **Step 7: Commit**

```bash
git add lib/patients.ts lib/__tests__/patients.test.ts data/patients.json tsconfig.json
git commit -m "feat: add patients JSON loader with placeholder empty cohort"
```

---

### Task 0.8: Write a synthetic data generator script

**Files:**
- Create: `scripts/generate-patients.ts`

This script runs once, writes `data/patients.json`, then the script itself is committed but never run again (unless we need to regenerate).

- [ ] **Step 1: Create `scripts/generate-patients.ts`**

```typescript
// scripts/generate-patients.ts
// One-shot generator for data/patients.json. Produces 82 synthetic patients
// aged 42–55 with a realistic distribution of menopausal stage and risk factors.
// Run with: pnpm tsx scripts/generate-patients.ts
//
// The generator deliberately HAND-AUTHORS p-001 (Sarah Chen) and a few others
// with latest_alert populated; the remaining 79 are procedurally generated
// but seeded so the file is reproducible.

import { writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Patient, MenopausalStage, Ethnicity, PatientAlert } from "../lib/types";

// --- Deterministic PRNG (Mulberry32) so generation is reproducible ---
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(42);
function pick<T>(arr: T[]): T { return arr[Math.floor(rand() * arr.length)]; }
function maybe(p: number): boolean { return rand() < p; }
function randInt(min: number, max: number) { return Math.floor(rand() * (max - min + 1)) + min; }
function round(n: number, d = 1) { return Math.round(n * 10 ** d) / 10 ** d; }

// --- Name pools ---
const FIRST_NAMES = [
  "Emma", "Olivia", "Sophie", "Charlotte", "Amelia", "Isla", "Grace", "Ava", "Mia",
  "Priya", "Aisha", "Fatima", "Mei", "Ling", "Yuki", "Zainab", "Anjali",
  "Adaeze", "Amara", "Chiamaka", "Folake", "Nia", "Zara",
  "Helen", "Sarah", "Joanne", "Laura", "Rachel", "Nicola", "Tracey", "Karen", "Deborah",
];
const LAST_NAMES = [
  "Smith", "Jones", "Williams", "Brown", "Taylor", "Davies", "Wilson", "Thomas", "Evans",
  "Khan", "Patel", "Ali", "Ahmed", "Hussain", "Shah",
  "Chen", "Wang", "Liu", "Singh", "Kim", "Park",
  "Okafor", "Adeyemi", "Mensah", "Nwosu",
];

function nhsNumber(): string {
  // 10 digits formatted — format check only, not modulo-11 valid
  const a = randInt(100, 999);
  const b = randInt(100, 999);
  const c = randInt(1000, 9999);
  return `${a} ${b} ${c}`;
}

function dobForAge(age: number): string {
  const today = new Date("2026-04-10");
  const year = today.getFullYear() - age;
  const month = randInt(1, 12);
  const day = randInt(1, 28);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function stageForAge(age: number): MenopausalStage {
  if (age < 45) return pick(["premenopausal", "early_perimenopausal"] as MenopausalStage[]);
  if (age < 48) return pick(["early_perimenopausal", "late_perimenopausal"] as MenopausalStage[]);
  if (age < 51) return pick(["late_perimenopausal", "postmenopausal_under_5yr"] as MenopausalStage[]);
  if (age < 54) return pick(["postmenopausal_under_5yr", "postmenopausal_5_10yr"] as MenopausalStage[]);
  return "postmenopausal_5_10yr";
}

function ageAtFmp(stage: MenopausalStage, age: number): number | null {
  if (stage === "premenopausal" || stage === "early_perimenopausal") return null;
  if (stage === "late_perimenopausal") return null;
  if (stage === "postmenopausal_under_5yr") return age - randInt(1, 4);
  return age - randInt(5, 9);
}

// --- Hand-authored hero: Sarah Chen, p-001 ---
// Sarah's alert is PRE-BAKED so the portal always shows a "GP flagged you"
// state regardless of whether the live demo just pressed "Send alert" —
// because the MVP does not persist sent alerts across requests (spec §2
// non-goal #3). The live composer in Subagent A still runs and shows the
// preview modal; the portal's alert card is the pre-baked one, not the
// one just sent.
const SARAH: Patient = {
  id: "p-001",
  name: "Sarah Chen",
  date_of_birth: "1976-11-14",
  nhs_number: "943 476 5919",
  ethnicity: "white",
  gp_registered_date: "2018-06-04",
  contact: { email: "sarah.chen@example.com", phone: "+44 7700 900123" },
  clinical: {
    height_cm: 163,
    weight_kg: 51.2,
    bmi: 19.3,
    menopausal_stage: "late_perimenopausal",
    age_at_fmp: null,
    prior_fragility_fracture: false,
    parent_hip_fracture: true,
    current_smoker: true,
    alcohol_units_per_day: 1,
    glucocorticoid_use: false,
    rheumatoid_arthritis: false,
    current_hrt: false,
    dietary_calcium_mg_per_day: 620,
  },
  latest_alert: {
    sent_at: "2026-04-08T11:15:00Z",
    sent_by: "Dr. Amira Hassan",
    risk_level_at_send: "high",
    message:
`Dear Sarah,

I'm Dr. Amira Hassan, one of the GPs at Regent's Park Medical Centre.
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
Dr. Amira Hassan
Regent's Park Medical Centre`,
  },
};

// Additional hand-authored pre-alerted patients (p-014, p-037)
function preAlert(gpName: string, message: string, when: string): PatientAlert {
  return {
    sent_at: when,
    sent_by: gpName,
    risk_level_at_send: "high",
    message,
  };
}

function generateProcedural(i: number): Patient {
  const id = `p-${String(i + 1).padStart(3, "0")}`;
  const first = pick(FIRST_NAMES);
  const last = pick(LAST_NAMES);
  const name = `${first} ${last}`;
  const age = randInt(42, 55);
  const stage = stageForAge(age);
  const ethnicity: Ethnicity = pick([
    "white", "white", "white", "white", "white",
    "south_asian", "south_asian",
    "east_asian",
    "black_african",
    "other",
  ]);
  const height_cm = round(160 + rand() * 15, 1);
  const weight_kg = round(55 + rand() * 30, 1);
  const bmi = round(weight_kg / ((height_cm / 100) ** 2), 1);
  return {
    id,
    name,
    date_of_birth: dobForAge(age),
    nhs_number: nhsNumber(),
    ethnicity,
    gp_registered_date: `${2016 + randInt(0, 8)}-${String(randInt(1, 12)).padStart(2, "0")}-${String(randInt(1, 28)).padStart(2, "0")}`,
    contact: {
      email: `${first.toLowerCase()}.${last.toLowerCase()}@example.com`,
      phone: `+44 7700 ${String(randInt(900000, 999999))}`,
    },
    clinical: {
      height_cm,
      weight_kg,
      bmi,
      menopausal_stage: stage,
      age_at_fmp: ageAtFmp(stage, age),
      prior_fragility_fracture: maybe(0.08),
      parent_hip_fracture: maybe(0.12),
      current_smoker: maybe(0.18),
      alcohol_units_per_day: maybe(0.25) ? randInt(1, 4) : 0,
      glucocorticoid_use: maybe(0.04),
      rheumatoid_arthritis: maybe(0.03),
      current_hrt: maybe(0.15),
      dietary_calcium_mg_per_day: randInt(400, 1200),
    },
    latest_alert: null,
  };
}

function main() {
  const all: Patient[] = [SARAH];
  for (let i = 1; i < 82; i++) {
    all.push(generateProcedural(i));
  }

  // Hand-pin two additional high-risk patients with pre-populated alerts
  const p014 = all[13];
  p014.clinical = {
    ...p014.clinical,
    bmi: 18.8,
    height_cm: 168,
    weight_kg: 53,
    current_smoker: true,
    parent_hip_fracture: true,
    menopausal_stage: "postmenopausal_under_5yr",
    age_at_fmp: 44,
    dietary_calcium_mg_per_day: 550,
  };
  p014.latest_alert = preAlert(
    "Dr. Amira Hassan",
    "I wanted to follow up on the note about bone health…",
    "2026-04-08T09:22:00Z"
  );

  const p037 = all[36];
  p037.clinical = {
    ...p037.clinical,
    bmi: 19.5,
    prior_fragility_fracture: true,
    menopausal_stage: "postmenopausal_5_10yr",
    age_at_fmp: 47,
    dietary_calcium_mg_per_day: 480,
    current_hrt: false,
  };
  p037.latest_alert = preAlert(
    "Dr. Amira Hassan",
    "Following up on your bone health review…",
    "2026-04-07T14:10:00Z"
  );

  const outPath = join(__dirname, "..", "data", "patients.json");
  writeFileSync(outPath, JSON.stringify(all, null, 2));
  console.log(`Wrote ${all.length} patients to ${outPath}`);
}

main();
```

- [ ] **Step 2: Install `tsx` for running the script**

```bash
pnpm add -D tsx
```

- [ ] **Step 3: Run the generator**

```bash
pnpm tsx scripts/generate-patients.ts
```

Expected: `Wrote 82 patients to .../data/patients.json`.

- [ ] **Step 4: Sanity check the output**

```bash
pnpm tsc --noEmit
pnpm test
```

Expected: typecheck passes, all tests still pass (now running against 82 real patients).

- [ ] **Step 5: Commit the generator and the generated data together**

```bash
git add scripts/generate-patients.ts data/patients.json package.json
git commit -m "feat: generate 82-patient synthetic cohort"
```

---

### Task 0.9: Verify generated cohort distribution and calibrate tier thresholds if needed

**Files:**
- Create: `scripts/check-cohort-distribution.ts`
- Possibly modify: `lib/model-weights.ts` (only the `TIER_THRESHOLDS` export — coefficients and WeightEntry arrays are frozen by this task)

**Retunable in Phase 0:** `TIER_THRESHOLDS.moderate_min_rr` and `TIER_THRESHOLDS.high_min_rr` only. **Not retunable in Phase 0:** any `beta` / `hr` / `citation` field on any weight entry — those are the stub values Task #8 will replace and must not drift from the committed Task 0.5 state.

- [ ] **Step 1: Create `scripts/check-cohort-distribution.ts`**

```typescript
import { getAllPatients } from "../lib/patients";
import { scorePatient } from "../lib/risk-model";

const all = getAllPatients();
const scored = all.map(scorePatient);

const counts = { low: 0, moderate: 0, high: 0 };
for (const s of scored) counts[s.tier]++;

const total = scored.length;
console.log(`Cohort size: ${total}`);
console.log(`Low:      ${counts.low}  (${((counts.low / total) * 100).toFixed(0)}%)`);
console.log(`Moderate: ${counts.moderate}  (${((counts.moderate / total) * 100).toFixed(0)}%)`);
console.log(`High:     ${counts.high}  (${((counts.high / total) * 100).toFixed(0)}%)`);
console.log();
console.log("Top 5 by relative risk:");
scored
  .sort((a, b) => b.relative_risk - a.relative_risk)
  .slice(0, 5)
  .forEach((s) => {
    console.log(`  ${s.patient.id}  ${s.patient.name.padEnd(24)}  RR=${s.relative_risk.toFixed(2)}  tier=${s.tier}`);
  });
```

- [ ] **Step 2: Run the distribution check**

```bash
pnpm tsx scripts/check-cohort-distribution.ts
```

Expected target: roughly 55% low / 30% moderate / 15% high. Sarah Chen (p-001) appears in the top 5 and her tier is `high`.

- [ ] **Step 3: If the distribution is significantly off (e.g. <10% high or >25% high), tweak `TIER_THRESHOLDS` in `lib/model-weights.ts` and re-run until the target distribution holds**

Acceptable ranges: low 45–65%, moderate 20–35%, high 10–20%. Sarah must remain `high`.

- [ ] **Step 4: Commit any threshold adjustment**

```bash
git add scripts/check-cohort-distribution.ts lib/model-weights.ts
git commit -m "chore: calibrate tier thresholds against generated cohort"
```

---

### Task 0.10: Implement `lib/demo-state.ts` cookie helpers

**Files:**
- Create: `lib/demo-state.ts`, `lib/__tests__/demo-state.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// lib/__tests__/demo-state.test.ts
import { describe, it, expect } from "vitest";
import { parseDemoState, serializeDemoState } from "@/lib/demo-state";
import { DEFAULT_DEMO_STATE } from "@/lib/types";

describe("demo-state serialization", () => {
  it("parses an empty cookie to the default state", () => {
    expect(parseDemoState(undefined)).toEqual(DEFAULT_DEMO_STATE);
    expect(parseDemoState("")).toEqual(DEFAULT_DEMO_STATE);
  });

  it("round-trips a valid state", () => {
    const state = { role: "patient" as const, active_patient_id: "p-014" };
    const serialized = serializeDemoState(state);
    expect(parseDemoState(serialized)).toEqual(state);
  });

  it("returns default on malformed JSON", () => {
    expect(parseDemoState("not-json")).toEqual(DEFAULT_DEMO_STATE);
  });

  it("returns default on missing fields", () => {
    expect(parseDemoState(JSON.stringify({ role: "gp" }))).toEqual(DEFAULT_DEMO_STATE);
  });
});
```

- [ ] **Step 2: Run the test to confirm it fails**

```bash
pnpm test
```

Expected: import errors.

- [ ] **Step 3: Implement `lib/demo-state.ts`**

```typescript
// lib/demo-state.ts
// Cookie-backed DemoState helpers. Server-side use via next/headers;
// the parse/serialize helpers are pure functions for easy testing.

import { cookies } from "next/headers";
import type { DemoState, DemoRole } from "@/lib/types";
import { DEFAULT_DEMO_STATE } from "@/lib/types";

const COOKIE_NAME = "ostella_demo";

function isValidRole(r: unknown): r is DemoRole {
  return r === "gp" || r === "patient";
}

export function parseDemoState(raw: string | undefined): DemoState {
  if (!raw) return DEFAULT_DEMO_STATE;
  try {
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === "object" &&
      isValidRole(parsed.role) &&
      typeof parsed.active_patient_id === "string"
    ) {
      return { role: parsed.role, active_patient_id: parsed.active_patient_id };
    }
  } catch {
    // fall through
  }
  return DEFAULT_DEMO_STATE;
}

export function serializeDemoState(state: DemoState): string {
  return JSON.stringify(state);
}

export function getDemoState(): DemoState {
  const store = cookies();
  return parseDemoState(store.get(COOKIE_NAME)?.value);
}

export function setDemoState(partial: Partial<DemoState>) {
  const current = getDemoState();
  const next: DemoState = { ...current, ...partial };
  cookies().set(COOKIE_NAME, serializeDemoState(next), {
    path: "/",
    sameSite: "lax",
    httpOnly: false,
  });
}

export const DEMO_COOKIE_NAME = COOKIE_NAME;
```

- [ ] **Step 4: Run the tests to confirm they pass**

```bash
pnpm test
```

Expected: all four `demo-state` tests pass.

- [ ] **Step 5: Commit**

```bash
git add lib/demo-state.ts lib/__tests__/demo-state.test.ts
git commit -m "feat: add cookie-backed DemoState helpers"
```

---

### Task 0.11: Author the high-risk email template

**Files:**
- Create: `lib/email-templates.ts`, `lib/__tests__/email-templates.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// lib/__tests__/email-templates.test.ts
import { describe, it, expect } from "vitest";
import { highRiskAlert } from "@/lib/email-templates";
import type { Patient } from "@/lib/types";

const patient: Patient = {
  id: "p-001",
  name: "Sarah Chen",
  date_of_birth: "1976-11-14",
  nhs_number: "943 476 5919",
  ethnicity: "white",
  gp_registered_date: "2018-06-04",
  contact: { email: "sarah.chen@example.com", phone: "+44 7700 900123" },
  clinical: {
    height_cm: 163, weight_kg: 51.2, bmi: 19.3,
    menopausal_stage: "late_perimenopausal",
    age_at_fmp: null,
    prior_fragility_fracture: false,
    parent_hip_fracture: true,
    current_smoker: true,
    alcohol_units_per_day: 1,
    glucocorticoid_use: false,
    rheumatoid_arthritis: false,
    current_hrt: false,
    dietary_calcium_mg_per_day: 620,
  },
  latest_alert: null,
};

describe("highRiskAlert", () => {
  it("renders the practice name in the subject", () => {
    const { subject } = highRiskAlert(patient, { name: "Dr. Amira Hassan", practice: "Regent's Park Medical Centre" });
    expect(subject).toContain("Regent's Park Medical Centre");
  });

  it("addresses the patient by first name", () => {
    const { body } = highRiskAlert(patient, { name: "Dr. Amira Hassan", practice: "Regent's Park Medical Centre" });
    expect(body.startsWith("Dear Sarah,")).toBe(true);
  });

  it("mentions the GP by name", () => {
    const { body } = highRiskAlert(patient, { name: "Dr. Amira Hassan", practice: "Regent's Park Medical Centre" });
    expect(body).toContain("Dr. Amira Hassan");
  });
});
```

- [ ] **Step 2: Run the test to confirm it fails**

```bash
pnpm test
```

- [ ] **Step 3: Implement `lib/email-templates.ts`**

```typescript
// lib/email-templates.ts
// High-risk email template. Only high-risk tier has a template;
// moderate and low tiers render passive copy in the UI.

import type { Patient } from "@/lib/types";

export function highRiskAlert(
  patient: Patient,
  gp: { name: string; practice: string }
): { subject: string; body: string } {
  const firstName = patient.name.split(" ")[0];
  const subject = `From ${gp.practice} — a note about your bone health`;
  const body =
`Dear ${firstName},

I'm ${gp.name}, one of the GPs at ${gp.practice}.
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
${gp.name}
${gp.practice}`;
  return { subject, body };
}
```

- [ ] **Step 4: Run the tests to confirm they pass**

```bash
pnpm test
```

- [ ] **Step 5: Commit**

```bash
git add lib/email-templates.ts lib/__tests__/email-templates.test.ts
git commit -m "feat: add high-risk alert email template"
```

---

### Task 0.12: Build shared UI components — RoleSwitcher, RiskBadge

**Files:**
- Create: `components/RoleSwitcher.tsx`, `components/RiskBadge.tsx`

- [ ] **Step 1: Create `components/RiskBadge.tsx`**

```tsx
// components/RiskBadge.tsx
import type { RiskTier } from "@/lib/types";
import { cn } from "@/lib/utils";

const STYLES: Record<RiskTier, string> = {
  low: "bg-emerald-50 text-emerald-700 border-emerald-200",
  moderate: "bg-amber-50 text-amber-800 border-amber-200",
  high: "bg-rose-50 text-rose-700 border-rose-200",
};

const LABELS: Record<RiskTier, string> = {
  low: "Low",
  moderate: "Moderate",
  high: "High",
};

export function RiskBadge({ tier, className }: { tier: RiskTier; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        STYLES[tier],
        className
      )}
    >
      {LABELS[tier]}
    </span>
  );
}
```

- [ ] **Step 2: Create `components/RoleSwitcher.tsx`**

```tsx
// components/RoleSwitcher.tsx
"use client";

import { useRouter, usePathname } from "next/navigation";
import { useTransition } from "react";
import type { DemoRole } from "@/lib/types";

export function RoleSwitcher({ currentRole }: { currentRole: DemoRole }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  async function switchTo(role: DemoRole) {
    await fetch("/api/demo-state", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ role }),
    });
    startTransition(() => {
      router.push(role === "gp" ? "/demo/gp" : "/demo/patient");
      router.refresh();
    });
  }

  return (
    <div className="inline-flex rounded-md border bg-white p-1 text-sm shadow-sm">
      <button
        type="button"
        onClick={() => switchTo("gp")}
        disabled={isPending}
        className={`rounded px-3 py-1 transition ${
          currentRole === "gp" ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
        }`}
      >
        GP view
      </button>
      <button
        type="button"
        onClick={() => switchTo("patient")}
        disabled={isPending}
        className={`rounded px-3 py-1 transition ${
          currentRole === "patient" ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
        }`}
      >
        Patient view
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/RoleSwitcher.tsx components/RiskBadge.tsx
git commit -m "feat: add shared RoleSwitcher and RiskBadge components"
```

---

### Task 0.13: Create `app/api/demo-state/route.ts` to support RoleSwitcher

**Files:**
- Create: `app/api/demo-state/route.ts`

- [ ] **Step 1: Create the route**

```typescript
// app/api/demo-state/route.ts
import { NextResponse } from "next/server";
import { setDemoState } from "@/lib/demo-state";
import type { DemoRole } from "@/lib/types";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const partial: { role?: DemoRole; active_patient_id?: string } = {};
  if (body.role === "gp" || body.role === "patient") partial.role = body.role;
  if (typeof body.active_patient_id === "string") partial.active_patient_id = body.active_patient_id;
  setDemoState(partial);
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/demo-state/route.ts
git commit -m "feat: add demo-state mutation route for RoleSwitcher"
```

---

### Task 0.14: Build `app/demo/layout.tsx` shared shell

**Files:**
- Create: `app/demo/layout.tsx`

- [ ] **Step 1: Create the layout**

```tsx
// app/demo/layout.tsx
import { getDemoState } from "@/lib/demo-state";
import { RoleSwitcher } from "@/components/RoleSwitcher";
import { DEMO_PRACTICE } from "@/lib/types";
import Link from "next/link";

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  const state = getDemoState();
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            Ostella
            <span className="ml-2 text-sm font-normal text-slate-500">
              {DEMO_PRACTICE.name}
            </span>
          </Link>
          <RoleSwitcher currentRole={state.role} />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
```

- [ ] **Step 2: Create placeholder pages for `/demo/gp` and `/demo/patient` so the layout compiles**

Create `app/demo/gp/page.tsx`:

```tsx
export default function GpPage() {
  return <p className="text-slate-600">GP view — Phase 1 Subagent A will replace this.</p>;
}
```

Create `app/demo/patient/page.tsx`:

```tsx
export default function PatientPage() {
  return <p className="text-slate-600">Patient view — Phase 1 Subagent B will replace this.</p>;
}
```

- [ ] **Step 3: Verify the layout renders**

```bash
pnpm dev
```

Navigate to http://localhost:3000/demo/gp and http://localhost:3000/demo/patient. Expected: layout shell renders with header, Ostella wordmark, practice name, and the role switcher toggles between the two routes.

- [ ] **Step 4: Commit**

```bash
git add app/demo/
git commit -m "feat: add shared demo layout shell with role switcher"
```

---

### Task 0.15: Phase 0 gate — run all checks

- [ ] **Step 1: Run all tests**

```bash
pnpm test
```

Expected: all tests pass.

- [ ] **Step 2: Typecheck**

```bash
pnpm tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Build**

```bash
pnpm build
```

Expected: build succeeds with no errors. Warnings about placeholder pages are OK.

- [ ] **Step 4: Manual sanity check**

```bash
pnpm dev
```

Verify:
- http://localhost:3000 — Ostella placeholder
- http://localhost:3000/demo/gp — GP layout with role switcher in header
- http://localhost:3000/demo/patient — Patient layout with role switcher
- Clicking role switcher navigates between the two routes and persists

- [ ] **Step 5: Commit anything outstanding, tag the foundation**

```bash
git status
# ensure clean working tree
git tag phase-0-complete
```

**Phase 0 is the only sequential chunk. Phase 1 starts in Chunk 2 and runs three subagents in parallel against the frozen contract surface.**

---

## Chunk 2: Phase 1 — Parallel fork (three subagents)

Phase 1 is dispatched via `superpowers:dispatching-parallel-agents`. The three subagents are launched in a **single message with three concurrent Agent tool calls**. Each subagent is given its section of this plan as its task prompt, plus the location of the spec file and the list of files it owns. None of the three subagents should touch any file outside its ownership list.

**Contract surface (frozen in Phase 0 — do not modify):**
- `lib/types.ts`
- `lib/risk-model.ts`
- `lib/model-weights.ts`
- `lib/patients.ts`
- `lib/email-templates.ts`
- `lib/demo-state.ts`
- `data/patients.json`
- `components/ui/*`
- `components/RoleSwitcher.tsx`
- `components/RiskBadge.tsx`
- `app/demo/layout.tsx`
- `app/api/demo-state/route.ts`
- `tailwind.config.ts` (theme tokens)

If a subagent believes the contract surface must change to complete its task, it must stop and surface the need to the orchestrator rather than editing the contract unilaterally.

---

### Subagent A — GP-in-the-loop view

**Ownership (exclusive):**
- `app/demo/gp/page.tsx` (replaces Phase 0 placeholder)
- `app/demo/gp/patients/[id]/page.tsx`
- `app/api/send-alert/route.ts`
- `components/FeatureContributionChart.tsx`
- `components/AlertComposer.tsx`
- `components/AlertPreviewModal.tsx`
- `components/gp/*` (any supporting components private to Subagent A)

#### Task 1A.1: GP dashboard with sorted patient table

**Files:**
- Modify: `app/demo/gp/page.tsx`

- [ ] **Step 1: Rewrite the page as a server component**

```tsx
// app/demo/gp/page.tsx
import Link from "next/link";
import { getAllPatients } from "@/lib/patients";
import { scorePatient } from "@/lib/risk-model";
import { RiskBadge } from "@/components/RiskBadge";
import { Card } from "@/components/ui/card";

function ageFromDob(dob: string) {
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  if (today < new Date(birth.setFullYear(today.getFullYear()))) age--;
  return age;
}

export default function GpDashboardPage() {
  const scored = getAllPatients()
    .map(scorePatient)
    .sort((a, b) => b.relative_risk - a.relative_risk);

  const counts = { high: 0, moderate: 0, low: 0 };
  for (const s of scored) counts[s.tier]++;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Patient worklist</h1>
        <p className="text-sm text-slate-600">
          82 women aged 42–55 registered to Regent's Park Medical Centre, sorted by relative risk.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <SummaryCard label="High risk"     count={counts.high}     tier="high" />
        <SummaryCard label="Moderate risk" count={counts.moderate} tier="moderate" />
        <SummaryCard label="Low risk"      count={counts.low}      tier="low" />
      </div>

      <Card className="overflow-hidden">
        <table className="w-full">
          <thead className="border-b bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Age</th>
              <th className="px-4 py-3">Stage</th>
              <th className="px-4 py-3">Risk</th>
              <th className="px-4 py-3 text-right">Relative risk</th>
            </tr>
          </thead>
          <tbody>
            {scored.map((s) => (
              <tr key={s.patient.id} className="border-b last:border-0 hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link href={`/demo/gp/patients/${s.patient.id}`} className="font-medium text-slate-900 hover:underline">
                    {s.patient.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600">{ageFromDob(s.patient.date_of_birth)}</td>
                <td className="px-4 py-3 text-slate-600">{s.patient.clinical.menopausal_stage.replace(/_/g, " ")}</td>
                <td className="px-4 py-3"><RiskBadge tier={s.tier} /></td>
                <td className="px-4 py-3 text-right font-mono text-slate-700">{s.relative_risk.toFixed(2)}×</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function SummaryCard({ label, count, tier }: { label: string; count: number; tier: "high" | "moderate" | "low" }) {
  return (
    <Card className="flex items-center justify-between p-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
        <p className="mt-1 text-3xl font-semibold">{count}</p>
      </div>
      <RiskBadge tier={tier} />
    </Card>
  );
}
```

- [ ] **Step 2: Verify in browser**

```bash
pnpm dev
```

Navigate to http://localhost:3000/demo/gp. Expected: summary cards at top, Sarah Chen at the top of the table, risk badges colored correctly, clicking her row navigates (will 404 until next task).

- [ ] **Step 3: Commit**

```bash
git add app/demo/gp/page.tsx
git commit -m "feat(gp): GP dashboard with sorted risk table + summary cards"
```

#### Task 1A.2: Patient detail page with feature contribution chart

**Files:**
- Create: `app/demo/gp/patients/[id]/page.tsx`, `components/FeatureContributionChart.tsx`

Per spec §7.5 the chart MUST render *every* non-zero contribution — never truncate. For Sarah that's ~6–8 bars; for a very complex patient it could be ~12. The chart scrolls vertically if needed, but never caps the count.

- [ ] **Step 1: Create the `FeatureContributionChart` component**

```tsx
// components/FeatureContributionChart.tsx
"use client";

import type { RiskContribution } from "@/lib/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function FeatureContributionChart({ contributions }: { contributions: RiskContribution[] }) {
  if (contributions.length === 0) {
    return <p className="text-sm text-slate-500">No contributing features — patient matches the reference profile.</p>;
  }
  const maxAbs = Math.max(...contributions.map((c) => Math.abs(c.contribution)));
  return (
    <TooltipProvider>
      <div className="space-y-2">
        {contributions.map((c) => {
          const widthPct = (Math.abs(c.contribution) / maxAbs) * 50; // up to 50% of row
          const isPositive = c.contribution > 0;
          return (
            <Tooltip key={c.feature_key}>
              <TooltipTrigger asChild>
                <div className="group flex items-center text-sm">
                  <div className="w-48 shrink-0 truncate text-right pr-3 text-slate-700">
                    {c.feature_label}
                  </div>
                  <div className="relative flex-1 h-6">
                    <div className="absolute left-1/2 top-0 h-full w-px bg-slate-300" />
                    <div
                      className={`absolute top-0 h-full rounded ${
                        isPositive ? "bg-rose-400/70 left-1/2" : "bg-emerald-400/70 right-1/2"
                      }`}
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                  <div className="w-20 pl-3 text-right font-mono text-xs text-slate-600">
                    {c.contribution > 0 ? "+" : ""}
                    {c.contribution.toFixed(3)}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-sm">
                <div className="space-y-1.5 text-xs">
                  <p className="font-semibold">{c.feature_label}</p>
                  <p>
                    HR <span className="font-mono">{c.hazard_ratio}</span>
                    {c.ci95 && (
                      <span className="text-slate-500">
                        {" "}
                        (95% CI {c.ci95[0]}–{c.ci95[1]})
                      </span>
                    )}
                  </p>
                  <p>
                    β = log(HR) ={" "}
                    <span className="font-mono">{c.beta.toFixed(3)}</span>
                  </p>
                  <p>
                    Patient value:{" "}
                    <span className="font-mono">{String(c.patient_value)}</span>
                  </p>
                  {c.flags && c.flags.length > 0 && (
                    <p className="flex flex-wrap gap-1 pt-0.5">
                      {c.flags.map((f) => (
                        <span
                          key={f}
                          className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-800"
                        >
                          {f}
                        </span>
                      ))}
                    </p>
                  )}
                  {c.population && (
                    <p className="text-slate-600">
                      <span className="font-medium">Cohort:</span> {c.population}
                    </p>
                  )}
                  <p className="pt-1 italic text-slate-500">{c.citation}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
```

- [ ] **Step 2: Create the patient detail page**

```tsx
// app/demo/gp/patients/[id]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPatient } from "@/lib/patients";
import { scorePatient } from "@/lib/risk-model";
import { RiskBadge } from "@/components/RiskBadge";
import { FeatureContributionChart } from "@/components/FeatureContributionChart";
import { AlertComposer } from "@/components/AlertComposer";
import { Card } from "@/components/ui/card";
import { DEMO_GP, DEMO_PRACTICE } from "@/lib/types";

export default function PatientDetailPage({ params }: { params: { id: string } }) {
  const patient = getPatient(params.id);
  if (!patient) notFound();
  const scored = scorePatient(patient);

  return (
    <div className="space-y-6">
      <Link href="/demo/gp" className="text-sm text-slate-600 hover:underline">
        ← Back to worklist
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{patient.name}</h1>
          <p className="text-sm text-slate-600">
            NHS {patient.nhs_number} · DOB {patient.date_of_birth} · {patient.ethnicity.replace(/_/g, " ")}
          </p>
        </div>
        <RiskBadge tier={scored.tier} className="text-base px-3 py-1" />
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Risk model contributions</h2>
            <p className="text-sm text-slate-600">
              Relative risk <span className="font-mono">{scored.relative_risk.toFixed(2)}×</span> vs reference woman.
            </p>
          </div>
          <span className="rounded border border-amber-300 bg-amber-50 px-2 py-1 text-xs text-amber-800">
            Literature-verified weights — cohort calibration in progress
          </span>
        </div>
        <div className="mt-6">
          <FeatureContributionChart contributions={scored.contributions} />
        </div>
      </Card>

      {scored.tier === "high" ? (
        <AlertComposer
          patient={patient}
          gp={{ name: DEMO_GP.name, practice: DEMO_PRACTICE.name }}
        />
      ) : scored.tier === "moderate" ? (
        <Card className="p-6 text-sm text-slate-600">
          Monitor — review at next routine appointment in 6 months.
        </Card>
      ) : (
        <Card className="p-6 text-sm text-slate-600">
          No action required — patient can self-access education materials via their portal.
        </Card>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create a minimal `components/AlertComposer.tsx` stub so the page compiles independently**

Task 1A.3 will replace this with the real implementation. For now:

```tsx
// components/AlertComposer.tsx
// TEMPORARY STUB — replaced by the real implementation in Task 1A.3.
import type { Patient } from "@/lib/types";
import { Card } from "@/components/ui/card";

export function AlertComposer({
  patient,
  gp,
}: {
  patient: Patient;
  gp: { name: string; practice: string };
}) {
  return (
    <Card className="p-6 text-sm text-slate-500">
      Alert composer — Task 1A.3 will implement this for {patient.name}.
    </Card>
  );
}
```

- [ ] **Step 4: Run dev, confirm patient detail page renders for Sarah**

```bash
pnpm dev
```

Navigate to http://localhost:3000/demo/gp/patients/p-001. Expected: patient card, feature contribution chart with hoverable bars, and the stubbed AlertComposer placeholder for high-risk tier.

- [ ] **Step 5: Commit**

```bash
git add app/demo/gp/patients components/FeatureContributionChart.tsx components/AlertComposer.tsx
git commit -m "feat(gp): patient detail page with feature contribution chart"
```

#### Task 1A.3: Replace AlertComposer stub with real implementation + AlertPreviewModal

**Files:**
- Replace: `components/AlertComposer.tsx` (the Task 1A.2 stub)
- Create: `components/AlertPreviewModal.tsx`

- [ ] **Step 1: Replace `components/AlertComposer.tsx` with the real implementation**

```tsx
// components/AlertComposer.tsx
"use client";

import { useState } from "react";
import type { Patient, AlertResponse } from "@/lib/types";
import { highRiskAlert } from "@/lib/email-templates";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertPreviewModal } from "@/components/AlertPreviewModal";

export function AlertComposer({
  patient,
  gp,
}: {
  patient: Patient;
  gp: { name: string; practice: string };
}) {
  const initial = highRiskAlert(patient, gp);
  const [subject, setSubject] = useState(initial.subject);
  const [body, setBody] = useState(initial.body);
  const [response, setResponse] = useState<AlertResponse | null>(null);
  const [loading, setLoading] = useState(false);

  async function send() {
    setLoading(true);
    const res = await fetch("/api/send-alert", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ patient_id: patient.id, subject, body }),
    });
    const json = (await res.json()) as AlertResponse;
    setResponse(json);
    setLoading(false);
  }

  return (
    <>
      <Card className="p-6">
        <h2 className="text-lg font-semibold">Compose alert</h2>
        <p className="mb-4 text-sm text-slate-600">
          This patient is in the high-risk tier. The template below is pre-filled — review, edit, and send.
        </p>
        <div className="space-y-3">
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="body">Body</Label>
            <Textarea id="body" rows={14} value={body} onChange={(e) => setBody(e.target.value)} />
          </div>
          <div className="flex justify-end">
            <Button onClick={send} disabled={loading}>
              {loading ? "Sending…" : "Send alert"}
            </Button>
          </div>
        </div>
      </Card>
      {response && (
        <AlertPreviewModal
          open={true}
          onClose={() => setResponse(null)}
          response={response}
        />
      )}
    </>
  );
}
```

- [ ] **Step 2: Create `AlertPreviewModal.tsx`**

```tsx
// components/AlertPreviewModal.tsx
"use client";

import type { AlertResponse } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function AlertPreviewModal({
  open,
  onClose,
  response,
}: {
  open: boolean;
  onClose: () => void;
  response: AlertResponse;
}) {
  const { preview } = response;
  const deliveryLabel = response.simulated ? "Delivered (simulated)" : "Delivered";
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Alert sent</DialogTitle>
          <DialogDescription>
            {deliveryLabel} at {new Date(preview.rendered_at).toLocaleString()}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 rounded border bg-slate-50 p-4 text-sm">
          <p><span className="font-medium">To:</span> {preview.to}</p>
          <p><span className="font-medium">From:</span> {preview.from}</p>
          <p><span className="font-medium">Subject:</span> {preview.subject}</p>
          <pre className="mt-3 whitespace-pre-wrap font-sans text-slate-700">{preview.body}</pre>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/AlertComposer.tsx components/AlertPreviewModal.tsx
git commit -m "feat(gp): AlertComposer + AlertPreviewModal (replaces Task 1A.2 stub)"
```

#### Task 1A.4: `/api/send-alert` stubbed route

**Files:**
- Create: `app/api/send-alert/route.ts`, `app/api/send-alert/__tests__/route.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// app/api/send-alert/__tests__/route.test.ts
import { describe, it, expect } from "vitest";
import { POST } from "@/app/api/send-alert/route";

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/send-alert", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("/api/send-alert", () => {
  it("returns simulated:true for a valid patient id", async () => {
    const res = await POST(makeRequest({ patient_id: "p-001", subject: "x", body: "y" }));
    const json = await res.json();
    expect(json.simulated).toBe(true);
    expect(json.preview.subject).toBe("x");
    expect(json.preview.body).toBe("y");
    expect(json.preview.to).toContain("@");
  });

  it("returns 404 for an unknown patient id", async () => {
    const res = await POST(makeRequest({ patient_id: "nope", subject: "x", body: "y" }));
    expect(res.status).toBe(404);
  });
});
```

- [ ] **Step 2: Run the test — expect failure**

```bash
pnpm test
```

- [ ] **Step 3: Implement the route**

```typescript
// app/api/send-alert/route.ts
import { NextResponse } from "next/server";
import { getPatient } from "@/lib/patients";
import { DEMO_GP } from "@/lib/types";
import type { AlertRequest, AlertResponse } from "@/lib/types";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as AlertRequest | null;
  if (!body || typeof body.patient_id !== "string") {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }
  const patient = getPatient(body.patient_id);
  if (!patient) {
    return NextResponse.json({ error: "patient not found" }, { status: 404 });
  }
  const response: AlertResponse = {
    simulated: true,
    preview: {
      to: patient.contact.email,
      from: `${DEMO_GP.name} <${DEMO_GP.email}>`,
      subject: body.subject,
      body: body.body,
      rendered_at: new Date().toISOString(),
    },
  };
  return NextResponse.json(response);
}
```

- [ ] **Step 4: Run tests — expect pass**

```bash
pnpm test
```

- [ ] **Step 5: Commit**

```bash
git add app/api/send-alert
git commit -m "feat(gp): stubbed /api/send-alert route returning simulated preview"
```

#### Task 1A.5: End-to-end check of Subagent A output

- [ ] **Step 1: Run dev server and walk the GP flow**

```bash
pnpm dev
```

Navigate http://localhost:3000/demo/gp → click Sarah Chen → feature chart renders → Send alert → preview modal shows → close modal. Report any broken step.

- [ ] **Step 2: Run tests + typecheck + build**

```bash
pnpm test && pnpm tsc --noEmit && pnpm build
```

- [ ] **Step 3: Subagent A reports done**

---

### Subagent B — Patient portal view

**Ownership (exclusive):**
- `app/demo/patient/page.tsx` (replaces Phase 0 placeholder)
- `app/demo/patient/education/page.tsx`
- `app/demo/patient/refer/page.tsx`
- `components/patient/*`
- `components/EducationCard.tsx`
- `components/SelfReferralForm.tsx`

#### Task 1B.1: Patient portal home

**Files:**
- Modify: `app/demo/patient/page.tsx`

- [ ] **Step 1: Rewrite the page**

```tsx
// app/demo/patient/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { getPatient, getAllPatients } from "@/lib/patients";
import { scorePatient } from "@/lib/risk-model";
import { getDemoState, setDemoState } from "@/lib/demo-state";
import { RiskBadge } from "@/components/RiskBadge";
import { Card } from "@/components/ui/card";

const RISK_EXPLANATIONS: Record<"low" | "moderate" | "high", string> = {
  low: "Your current bone-health risk is assessed as low. The focus is on preventative habits that keep it that way.",
  moderate: "You have a moderate risk profile. A few changes now can meaningfully reduce your risk over the next decade.",
  high: "Your bone-health risk is assessed as high. Your GP has asked to have a conversation with you in the next few weeks.",
};

export default function PatientPortalHome({
  searchParams,
}: {
  searchParams: { as?: string };
}) {
  // If ?as= is set, mutate cookie and strip the param
  if (searchParams.as && getPatient(searchParams.as)) {
    setDemoState({ active_patient_id: searchParams.as });
    redirect("/demo/patient");
  }

  const state = getDemoState();
  // If the cookie points at a patient that no longer exists (e.g. after
  // regenerating the cohort), fall back to Sarah Chen explicitly rather
  // than silently showing whoever happens to be index 0.
  const patient =
    getPatient(state.active_patient_id) ?? getPatient("p-001") ?? getAllPatients()[0];
  const scored = scorePatient(patient);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-slate-500">Hello,</p>
        <h1 className="text-2xl font-semibold tracking-tight">{patient.name}</h1>
      </div>

      {patient.latest_alert && (
        <Card className="border-rose-200 bg-rose-50 p-6">
          <p className="text-xs font-medium uppercase tracking-wide text-rose-700">
            Message from your GP · {new Date(patient.latest_alert.sent_at).toLocaleDateString()}
          </p>
          <p className="mt-1 text-sm font-medium text-rose-900">
            {patient.latest_alert.sent_by}
          </p>
          <pre className="mt-4 whitespace-pre-wrap font-sans text-sm text-slate-700">
            {patient.latest_alert.message}
          </pre>
        </Card>
      )}

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Your bone-health risk</h2>
          <RiskBadge tier={scored.tier} className="text-sm px-3 py-1" />
        </div>
        <p className="mt-2 text-sm text-slate-700">{RISK_EXPLANATIONS[scored.tier]}</p>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <ActionCard
          title="Book an appointment"
          body="Speak to your GP about next steps, including the option of a bone density scan."
          cta="Request appointment"
          href="/demo/patient/refer"
        />
        <ActionCard
          title="Lifestyle changes"
          body="Small, high-leverage changes to diet, exercise, and habits that protect bone density."
          cta="Read the guide"
          href="/demo/patient/education"
        />
        <ActionCard
          title="Learn more"
          body="A short library of evidence-based articles on perimenopause and bone health."
          cta="Open library"
          href="/demo/patient/education"
        />
      </div>
    </div>
  );
}

function ActionCard({ title, body, cta, href }: { title: string; body: string; cta: string; href: string }) {
  return (
    <Card className="flex flex-col p-5">
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-2 flex-1 text-sm text-slate-600">{body}</p>
      <Link href={href} className="mt-4 text-sm font-medium text-slate-900 hover:underline">
        {cta} →
      </Link>
    </Card>
  );
}
```

- [ ] **Step 2: Verify in browser**

Navigate to http://localhost:3000/demo/patient. Expected: Sarah (p-001) renders with her pre-baked `latest_alert` card from Dr. Amira Hassan visible at the top of the page, followed by the risk summary card and the three action cards. Visit http://localhost:3000/demo/patient?as=p-040 (or any `latest_alert: null` patient id — see the cohort distribution script output for a low-risk id). Expected: redirects to /demo/patient, shows the low-risk patient with no alert card, risk summary reads "Low", and action cards still render.

- [ ] **Step 3: Commit**

```bash
git add app/demo/patient/page.tsx
git commit -m "feat(patient): portal home with risk summary and action cards"
```

#### Task 1B.2: Education library

**Files:**
- Create: `app/demo/patient/education/page.tsx`, `components/EducationCard.tsx`

- [ ] **Step 1: Create `components/EducationCard.tsx`**

```tsx
// components/EducationCard.tsx
import { Card } from "@/components/ui/card";
import Link from "next/link";

export type EducationArticle = {
  slug: string;
  title: string;
  lede: string;
  body: string;
};

export function EducationCard({ article }: { article: EducationArticle }) {
  return (
    <Card className="p-5">
      <h3 className="text-base font-semibold">{article.title}</h3>
      <p className="mt-2 text-sm text-slate-600">{article.lede}</p>
    </Card>
  );
}
```

- [ ] **Step 2: Create `app/demo/patient/education/page.tsx` with 6 hand-authored articles**

```tsx
// app/demo/patient/education/page.tsx
import { EducationCard, type EducationArticle } from "@/components/EducationCard";

const ARTICLES: EducationArticle[] = [
  {
    slug: "what-is-perimenopause",
    title: "What is perimenopause, exactly?",
    lede: "The five-to-eight-year window before your final period, during which hormones fluctuate and bones start to change.",
    body: "",
  },
  {
    slug: "bone-loss-accelerates",
    title: "Why bone loss accelerates around menopause",
    lede: "Bone density can drop up to 2% per year in the years around your final period — faster than at any other time in adult life.",
    body: "",
  },
  {
    slug: "exercises-for-bones",
    title: "Exercises that protect bone density",
    lede: "Resistance and impact-loading exercise are the only interventions with strong evidence for building bone in postmenopausal women.",
    body: "",
  },
  {
    slug: "calcium-and-vitamin-d",
    title: "Calcium, vitamin D, and what your body actually needs",
    lede: "Most women don't need supplements — but a surprising number fall short of the basic dietary intake that supports bone turnover.",
    body: "",
  },
  {
    slug: "talking-to-your-gp",
    title: "How to have the bone-health conversation with your GP",
    lede: "What to ask, what to expect, and when a DEXA bone density scan is worth requesting.",
    body: "",
  },
  {
    slug: "what-frax-measures",
    title: "What your risk score actually measures",
    lede: "Your score is built from well-studied clinical risk factors. Here's what they are, and why each one matters.",
    body: "",
  },
];

export default function EducationLibraryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Education library</h1>
        <p className="text-sm text-slate-600">
          Six short reads on perimenopause, bone health, and what you can do.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {ARTICLES.map((a) => (
          <EducationCard key={a.slug} article={a} />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify in browser**

Navigate to http://localhost:3000/demo/patient/education. Expected: six cards in a 2-column grid.

- [ ] **Step 4: Commit**

```bash
git add app/demo/patient/education components/EducationCard.tsx
git commit -m "feat(patient): education library with 6 article cards"
```

#### Task 1B.3: Self-referral form

**Files:**
- Create: `app/demo/patient/refer/page.tsx`, `components/SelfReferralForm.tsx`

- [ ] **Step 1: Create `components/SelfReferralForm.tsx`**

```tsx
// components/SelfReferralForm.tsx
"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const SYMPTOMS = [
  "Hot flushes",
  "Sleep disturbance",
  "Bone or joint pain",
  "Unexpected weight change",
  "Mood changes",
  "Heavy or irregular periods",
];

export function SelfReferralForm() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <Card className="p-6 text-center">
        <h2 className="text-lg font-semibold">Request received</h2>
        <p className="mt-2 text-sm text-slate-600">
          Your request has been sent to Regent's Park Medical Centre. A member of the team
          will contact you within two working days.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
        }}
        className="space-y-5"
      >
        <div>
          <Label>Which of these are you experiencing?</Label>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {SYMPTOMS.map((s) => (
              <label key={s} className="flex items-center gap-2 text-sm">
                <Checkbox />
                {s}
              </label>
            ))}
          </div>
        </div>
        <div>
          <Label htmlFor="preferred">Preferred time</Label>
          <Input id="preferred" placeholder="e.g. Weekday mornings" />
        </div>
        <div>
          <Label htmlFor="message">Anything else to share?</Label>
          <Textarea id="message" rows={4} placeholder="Optional" />
        </div>
        <div className="flex justify-end">
          <Button type="submit">Submit request</Button>
        </div>
      </form>
    </Card>
  );
}
```

- [ ] **Step 2: Create `app/demo/patient/refer/page.tsx`**

```tsx
// app/demo/patient/refer/page.tsx
import { SelfReferralForm } from "@/components/SelfReferralForm";

export default function ReferPage() {
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Request an appointment</h1>
        <p className="text-sm text-slate-600">
          Send a short message to Regent's Park Medical Centre to talk about bone health.
        </p>
      </div>
      <SelfReferralForm />
    </div>
  );
}
```

- [ ] **Step 3: Verify in browser**

Navigate to http://localhost:3000/demo/patient/refer. Fill form, submit, verify success state renders.

- [ ] **Step 4: Commit**

```bash
git add app/demo/patient/refer components/SelfReferralForm.tsx
git commit -m "feat(patient): self-referral form with local success state"
```

#### Task 1B.4: End-to-end check of Subagent B output

- [ ] **Step 1: Walk the patient flow in the browser**

Navigate / → (via role switcher or direct URL) → /demo/patient → /demo/patient/education → /demo/patient/refer → submit. Also test /demo/patient?as=p-014 and /demo/patient?as=p-040.

- [ ] **Step 2: Run tests + typecheck + build**

```bash
pnpm test && pnpm tsc --noEmit && pnpm build
```

- [ ] **Step 3: Subagent B reports done**

---

### Subagent C — Marketing landing page

**Ownership (exclusive):**
- `app/page.tsx` (replaces the Phase 0 placeholder; the root route IS the landing page — no route group is created, deviating from spec §4.1 because there's no competing root route to protect)
- `components/marketing/*`

#### Task 1C.1: Research the three hero statistics

Subagent C must gather real, citable numbers before writing any copy. Use `WebSearch` and `WebFetch` to confirm each stat.

- [ ] **Step 1: Find current source for "1 in 2 women over 50 will break a bone due to osteoporosis"**

Search for: `"lifetime fracture risk" women osteoporosis IOF site:osteoporosis.foundation OR site:iofbonehealth.org`. Verify the number and the source.

- [ ] **Step 2: Find current hip fracture 30-day or 1-year mortality for UK**

Search for: `National Hip Fracture Database annual report mortality` (NHFD, the Falls and Fragility Fracture Audit Programme). Record the most recent year's headline mortality figure.

- [ ] **Step 3: Find NICE NG226 or equivalent data on osteoporosis screening gap / DEXA under-utilisation**

Search for: `NICE NG226 osteoporosis assessment DEXA underdiagnosis`. Alternative: search for "women at risk of osteoporosis never receive DEXA UK".

- [ ] **Step 4: Record findings**

Create `docs/marketing-sources.md` with the three verified stats, each with: the number, the source organisation, the report title, the year, and the URL. This file is authoritative for the landing page stat cards.

- [ ] **Step 5: Commit**

```bash
git add docs/marketing-sources.md
git commit -m "docs: verified sources for landing page hero statistics"
```

#### Task 1C.2: Build the landing page

**Files:**
- Modify: `app/page.tsx`
- Create: `components/marketing/Hero.tsx`, `components/marketing/StatCards.tsx`, `components/marketing/WhyPerimenopause.tsx`, `components/marketing/HowItWorks.tsx`, `components/marketing/ModelTransparency.tsx`, `components/marketing/GpInTheLoop.tsx`, `components/marketing/AboutFooter.tsx`

- [ ] **Step 1: Create each marketing section as its own component**

Each of the seven component files is a pure server component. Wire them together in `app/page.tsx`. Copy for each section should be drawn from spec §10 and `docs/marketing-sources.md`. Keep files short (<80 lines each).

Example `app/page.tsx`:

```tsx
import { Hero } from "@/components/marketing/Hero";
import { StatCards } from "@/components/marketing/StatCards";
import { WhyPerimenopause } from "@/components/marketing/WhyPerimenopause";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { ModelTransparency } from "@/components/marketing/ModelTransparency";
import { GpInTheLoop } from "@/components/marketing/GpInTheLoop";
import { AboutFooter } from "@/components/marketing/AboutFooter";

export default function Home() {
  return (
    <div className="bg-white">
      <Hero />
      <StatCards />
      <WhyPerimenopause />
      <HowItWorks />
      <ModelTransparency />
      <GpInTheLoop />
      <AboutFooter />
    </div>
  );
}
```

Hero must have two CTAs:
- `/demo/gp` — "See the GP view"
- `/demo/patient` — "See the patient view"

ModelTransparency must include the visible banner: "Literature-verified weights — cohort calibration in progress." The copy should explain that every coefficient traces to a primary-source DOI (point at `docs/model-calibration.md` for the interested reader) and that tier thresholds are still being tuned against the synthetic cohort.

GpInTheLoop must make explicit: "Every outbound message is composed, edited, and sent by a named GP. The tool is an assistant, not an autopilot."

AboutFooter must include: "Ostella is an early-stage research prototype. Not for clinical use."

- [ ] **Step 2: Verify in browser**

Navigate to http://localhost:3000. Expected: full landing page renders with all seven sections, hero CTAs navigate correctly, and stat cards display the verified numbers with visible source attributions.

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx components/marketing
git commit -m "feat(marketing): landing page with 7 sections and verified stats"
```

#### Task 1C.3: End-to-end check of Subagent C output

- [ ] **Step 1: Walk the marketing → demo handoff in the browser**

Navigate to /, click each CTA, confirm it lands on the correct demo view.

- [ ] **Step 2: Run tests + typecheck + build**

```bash
pnpm test && pnpm tsc --noEmit && pnpm build
```

- [ ] **Step 3: Subagent C reports done**

---

## Chunk 3: Phase 2 — Integration and deploy (sequential)

After all three Phase 1 subagents report done, the orchestrator runs Phase 2 in the main session.

### Task 2.1: Definition of Done walkthrough

- [ ] **Step 1: Run the full DoD flow from spec §12 in a freshly-incognito browser**

Start `pnpm dev` and execute every step of spec §12:
1. Land on `/`.
2. Click *See the GP view*.
3. Dashboard shows Sarah at top, flagged red.
4. Click Sarah.
5. FeatureContributionChart renders, hoverable with citations.
6. Click *Send alert*.
7. AlertComposer opens pre-filled.
8. Click *Send*.
9. AlertPreviewModal shows rendered email with "Delivered (simulated)" tag.
10. Flip to *Patient view* via header.
11. Portal renders with `active_patient_id = p-001` still (Sarah).
12. Navigate to `/demo/patient/education`, see 6 cards.
13. Navigate to `/demo/patient/refer`, submit, see success.
14. Visit `/demo/patient?as=p-040` — low-risk state renders, URL strips the query.

- [ ] **Step 2: Fix any failure**

Any failing step is a blocker. Do not deploy.

- [ ] **Step 3: Commit any fixes**

```bash
git add -A
git commit -m "fix: integration seams after Phase 1 parallel fork"
```

### Task 2.2: Final checks

- [ ] **Step 1: Run the full test suite**

```bash
pnpm test
```

- [ ] **Step 2: Typecheck**

```bash
pnpm tsc --noEmit
```

- [ ] **Step 3: Production build**

```bash
pnpm build
```

Expected: build succeeds, no errors, no warnings about unused imports from Phase 1 components.

### Task 2.3: Deploy to Vercel

- [ ] **Step 1: Push to GitHub**

```bash
git push origin main
```

- [ ] **Step 2: Deploy via Vercel CLI or dashboard**

```bash
pnpm dlx vercel --prod
```

Accept defaults. No env vars required.

- [ ] **Step 3: Verify live URL**

Visit the Vercel URL returned by the CLI. Re-run the DoD walkthrough from Task 2.1 against the live URL.

- [ ] **Step 4: Tag and commit the deploy**

```bash
git tag v0.1.0-mvp
git push --tags
```

### Task 2.4: Post-deploy handoff notes

- [ ] **Step 1: Update `CLAUDE.md` with the deployed URL**

Add a `## Deploy` section at the bottom with the live Vercel URL so future sessions know where to check.

- [ ] **Step 2: Confirm session tasks reflect reality**

Use `TaskUpdate` explicitly (not prose) to mark session tasks:
- #7 (Stub risk model with placeholder weights) → `completed`
- #9 (Mark placeholder status visibly in the UI) → `completed`
- #11 (Stub email delivery with in-app preview modal) → `completed`

Leave #8 (`HANDOFF: swap stub weights`) and #12 (`HANDOFF: swap stub email`) as `pending` — they are dependent on external decisions (teammate weight delivery + pitch-readiness), not on this implementation run.

- [ ] **Step 3: Final commit**

```bash
git add CLAUDE.md
git commit -m "docs: record deployed URL"
git push
```

---

**Plan complete.**
