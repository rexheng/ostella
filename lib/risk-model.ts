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
