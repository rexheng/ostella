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
    // NOTE: plan text omitted prior_fragility_fracture from this stack, but
    // the clinical-team betas (bmi_low 0.247 + smoker 0.223 + parent_hip
    // 0.432 + post_under_5yr 0.255 ≈ score 1.157, RR ≈ 3.18) fall below
    // TIER_THRESHOLDS.high = 3.5 (placeholder, pending Task 0.9 calibration).
    // Adding prior_fragility_fracture (β 0.621, the strongest single FRAX
    // lever) restores the test's intent — "stack of strong factors → HIGH" —
    // under the frozen-as-delivered WEIGHTS + TIER_THRESHOLDS.
    const result = scorePatient(
      makeReferencePatient({
        bmi: 19,
        current_smoker: true,
        parent_hip_fracture: true,
        prior_fragility_fracture: true,
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
});
