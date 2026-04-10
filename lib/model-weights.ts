/**
 * Ostella Perimenopause Osteoporosis Risk Model — Coefficient Weights
 *
 * Transparent linear log-hazard model for 10-year major osteoporotic fracture
 * (MOF = hip + clinical vertebral + distal forearm + proximal humerus, FRAX
 * definition) in women aged roughly 42–55 (perimenopausal).
 *
 * STATUS: Literature-verified (this file replaces the pre-verification stub
 * referenced by task #8 in the spec). Values below trace to primary sources
 * with DOIs. Threshold calibration and synthetic-cohort sanity checks remain
 * blocked on infrastructure (lib/score.ts and data/patients.json) per
 * docs/model-calibration.md §7.
 *
 * MODEL FORM
 *   score(patient)  = Σᵢ βᵢ · xᵢ
 *   relative_risk   = exp(score)
 *   tier            = "high"     if relative_risk ≥ TIER_THRESHOLDS.high
 *                   = "moderate" if relative_risk ≥ TIER_THRESHOLDS.moderate
 *                   = "low"      otherwise
 *
 * REFERENCE PATIENT (score = 0, relative_risk = 1.00):
 *   - 50 years old
 *   - Early perimenopausal (STRAW+10 stage -2)
 *   - BMI 22
 *   - White European ancestry
 *   - Non-smoker
 *   - No prior fragility fracture
 *   - No parent hip fracture
 *   - No glucocorticoid exposure
 *   - No rheumatoid arthritis
 *   - Adequate dietary calcium (≥700 mg/day)
 *   - Not on HRT
 *   - Alcohol < 3 units/day
 *
 * All hazard ratios below are expressed relative to this reference patient.
 *
 * CONVENTIONS
 * - `key` is the stable machine identifier also used in `RiskContribution.feature_key`
 * - `label` is the short human-readable name rendered by FeatureContributionChart
 * - `hr` is the raw hazard ratio from primary literature
 * - `beta` is ln(hr), rounded to 3 dp; signed (positive = risk-increasing)
 * - `citation` is the short form shown in chart tooltips; `source` is the full form
 * - `ci95` is null when the primary source does not report an interval
 *
 * See docs/model-weights-rationale.md for per-coefficient decision history
 * and docs/model-calibration.md for the calibration memo.
 *
 * NOTE ON TYPES: Ethnicity and MenopausalStage are duplicated here as a
 * convenience for the research-only deliverable. When lib/types.ts is created
 * in spec Phase 0, these should be removed from this file and imported from
 * lib/types.ts instead. Field names and level strings already match the spec
 * (§4.4) so no data changes are required at that point.
 */

// ===========================================================================
// TYPES — will migrate to lib/types.ts in spec Phase 0
// ===========================================================================

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

export type RiskTier = "low" | "moderate" | "high";

export type Confidence = "high" | "medium" | "low";

/**
 * Evidence-quality flags attached to individual coefficients.
 * - CONTESTED: primary literature disagrees by >30% on the point estimate
 * - OLD_UNREPLICATED: primary source >15 years old with no post-2015 replication
 * - UK_EXTRAPOLATED: HR derived from non-UK cohort and extrapolated to UK primary care
 * - DERIVED: HR not reported directly; computed from a surrogate (e.g. BMD trajectory × BMD→fracture gradient)
 */
export type EvidenceFlag =
  | "CONTESTED"
  | "OLD_UNREPLICATED"
  | "UK_EXTRAPOLATED"
  | "DERIVED";

export type FeatureCategory = "frax_core" | "perimenopause" | "ancestry";

/**
 * Core coefficient entry. Every coefficient in this file conforms to this
 * shape, whether it's a single boolean, a single continuous feature, or one
 * level of a categorical feature.
 */
export interface CoefficientEntry {
  /** Stable machine key, also used in RiskContribution.feature_key */
  readonly key: string;
  /** Short human-readable label for the feature contribution chart */
  readonly label: string;
  /** Hazard ratio vs reference */
  readonly hr: number;
  /** 95% confidence interval for the HR, if reported in the primary source */
  readonly ci95: readonly [number, number] | null;
  /** Natural log of HR, rounded to 3 dp, signed */
  readonly beta: number;
  /** Short citation string rendered in tooltips, e.g. "Kanis et al. 2007" */
  readonly citation: string;
  /** Full primary-source citation including DOI/PMID */
  readonly source: string;
  /** Cohort / study population summary */
  readonly population: string;
  /** Confidence rating for this coefficient in the perimenopausal (42–55) context */
  readonly confidence: Confidence;
  /** Limitations, caveats, replication status, contested/derived notes */
  readonly notes: string;
  /** Whether the risk factor is modifiable by patient-facing action */
  readonly actionable: boolean;
  /**
   * Education rationale consumed by the downstream LLM to generate
   * patient-facing advice. Phrased in a "what can this patient do" framing.
   * Even unactionable factors (age, ancestry, parent history) have rationales
   * that reframe them as screening triggers rather than fatalism.
   */
  readonly actionable_rationale: string;
  /** Evidence-quality flags; empty array means no flags */
  readonly flags: readonly EvidenceFlag[];
  /** Taxonomic grouping */
  readonly category: FeatureCategory;
  /** Notes on age × HR interaction if relevant to the 42–55 band */
  readonly age_interaction_note?: string;
}

export interface ContinuousFeature {
  readonly type: "continuous";
  /** Human-readable unit description, e.g. "per year above 50" */
  readonly unit: string;
  /** Reference anchor the feature is centred on */
  readonly reference_value: number;
  readonly coefficient: CoefficientEntry;
}

export interface BooleanFeature {
  readonly type: "boolean";
  readonly coefficient: CoefficientEntry;
}

export interface CategoricalFeature<K extends string> {
  readonly type: "categorical";
  readonly reference_level: K;
  readonly levels: Readonly<Record<K, CoefficientEntry>>;
}

// ===========================================================================
// WEIGHTS
// ===========================================================================

export const WEIGHTS = {
  // -------------------------------------------------------------------------
  // 1. AGE above 50 — continuous, per year
  // -------------------------------------------------------------------------
  age_above_50: {
    type: "continuous",
    unit: "years_above_50",
    reference_value: 50,
    coefficient: {
      key: "age_above_50",
      label: "Age above 50",
      hr: 1.043,
      ci95: null,
      beta: 0.042,
      citation: "Kanis et al. 2007, Osteoporos Int",
      source:
        "Kanis JA, Oden A, Johnell O, Johansson H, De Laet C, Brown J, et al. The use of clinical risk factors enhances the performance of BMD in the prediction of hip and osteoporotic fractures in men and women. Osteoporos Int 2007;18(8):1033–1046. DOI: 10.1007/s00198-007-0343-y. PMID: 17323110.",
      population:
        "~60,000 men and women pooled across 9 prospective FRAX-derivation cohorts (EVOS/EPOS, CaMos, DOES, Rotterdam, Sheffield, EPIDOS, OFELY, Gothenburg, Hiroshima). ~250,000 person-years.",
      confidence: "high",
      notes:
        "FRAX fits age by spline; the per-year gradient is shallowest in midlife (42–55) and steepens at older ages. 0.042 is a log-linear approximation valid across 42–55 only — do not extrapolate past 60 without re-fitting. Replicated directionally by Leslie 2014 JBMR and GBD fracture epidemiology (Wu 2021 Lancet Healthy Longev).",
      actionable: false,
      actionable_rationale:
        "Age itself is fixed, but perimenopause is the inflection point where bone loss accelerates — so the message is that the levers available now (weight-bearing exercise, calcium + vitamin D, baseline DXA, smoking and alcohol moderation) have their largest return when used before and during the transmenopause window, not after.",
      flags: [],
      category: "frax_core",
      age_interaction_note:
        "At age 50, per-year log-hazard increment ≈ 0.042; by age 75 ≈ 0.06–0.08. FRAX uses a spline, not log-linear.",
    },
  } as const satisfies ContinuousFeature,

  // -------------------------------------------------------------------------
  // 2. BMI < 20 (underweight)
  // -------------------------------------------------------------------------
  bmi_low: {
    type: "boolean",
    coefficient: {
      key: "bmi_low",
      label: "BMI < 20",
      hr: 1.28,
      ci95: [1.15, 1.42],
      beta: 0.247,
      citation: "De Laet et al. 2005, Osteoporos Int",
      source:
        "De Laet C, Kanis JA, Oden A, Johanson H, Johnell O, Delmas P, et al. Body mass index as a predictor of fracture risk: a meta-analysis. Osteoporos Int 2005;16(11):1330–1338. DOI: 10.1007/s00198-005-1863-y. PMID: 15928804.",
      population:
        "398,610 men and women from 12 prospective cohorts, ~2.1 million person-years, mean age ~63.",
      confidence: "high",
      notes:
        "De Laet reports a smooth spline; the BMI 20 vs BMI 22 incremental HR for MOF is ~1.25–1.35, central 1.28. Effect is partially mediated by BMD (attenuates ~60% after BMD adjustment). Replicated in Johansson 2014 JBMR and Compston 2011 GLOW.",
      actionable: true,
      actionable_rationale:
        "Low BMI at 50 often signals low lean mass and inadequate protein/caloric intake. Target protein 1.0–1.2 g/kg/day, resistance training 2×/week to build muscle (which loads bone), and screen for underlying causes of low weight (disordered eating, malabsorption, hyperthyroidism). Raising BMI to ≥20 measurably lowers fracture risk.",
      flags: [],
      category: "frax_core",
    },
  } as const satisfies BooleanFeature,

  // -------------------------------------------------------------------------
  // 3. BMI > 30 (obese) — CONTESTED
  // -------------------------------------------------------------------------
  bmi_high: {
    type: "boolean",
    coefficient: {
      key: "bmi_high",
      label: "BMI > 30",
      hr: 0.95,
      ci95: [0.83, 1.08],
      beta: -0.051,
      citation: "De Laet 2005 / Compston 2011 (CONTESTED)",
      source:
        "De Laet C et al. Osteoporos Int 2005;16(11):1330–1338 (DOI: 10.1007/s00198-005-1863-y) AND Compston JE, Watts NB, Chapurlat R, et al. Obesity is not protective against fracture in postmenopausal women: GLOW. Am J Med 2011;124(11):1043–1050. DOI: 10.1016/j.amjmed.2011.06.013.",
      population:
        "De Laet: as above. GLOW: 60,393 postmenopausal women ≥55 across 10 countries, 2-year follow-up. Prieto-Alhambra 2012 JBMR replicated the site-specific pattern in Spanish primary care.",
      confidence: "medium",
      notes:
        "CONTESTED. FRAX assigns ~0.83 (weakly protective) driven mainly by reduced hip fracture. GLOW and Johansson 2014 JBMR argue ~1.00 (neutral) because obesity is protective at hip but raises fracture at humerus, forearm, and ankle via fall mechanics. For a 50-year-old perimenopausal woman where hip fracture is rare and upper-extremity fractures dominate MOF composition, the compromise point estimate 0.95 is conservative. If the downstream model ever splits MOF into hip vs non-hip sites, use site-specific HRs instead.",
      actionable: true,
      actionable_rationale:
        "Obesity is not a weight-loss-for-fractures target at your age — it's essentially neutral for overall fracture risk and slightly protective at the hip. The real actionable lever is fall prevention (balance training, home hazard audit) plus cardiometabolic health, because obese women fall more often and absorb impact differently on their arms and shoulders.",
      flags: ["CONTESTED"],
      category: "frax_core",
    },
  } as const satisfies BooleanFeature,

  // -------------------------------------------------------------------------
  // 4. PRIOR FRAGILITY FRACTURE
  // -------------------------------------------------------------------------
  prior_fracture: {
    type: "boolean",
    coefficient: {
      key: "prior_fracture",
      label: "Prior fragility fracture",
      hr: 1.86,
      ci95: [1.58, 2.17],
      beta: 0.621,
      citation: "Kanis et al. 2004, Bone",
      source:
        "Kanis JA, Johnell O, De Laet C, Johansson H, Oden A, Delmas P, et al. A meta-analysis of previous fracture and subsequent fracture risk. Bone 2004;35(2):375–382. DOI: 10.1016/j.bone.2004.03.024. PMID: 15268886.",
      population:
        "15,259 men and women from 11 prospective cohorts, ~60,000 person-years, age range 20–100.",
      confidence: "high",
      notes:
        "RR is highest at younger ages and diminishes with age — at age 50 the effective HR is ~2.0, at 80 it's ~1.5. The pooled 1.86 is used here. Johansson 2017 Osteoporos Int showed the RR is especially high (2–3×) in the first 1–2 years after an index fracture ('imminent risk' window). Replicated in Balasubramanian 2019 (US claims).",
      actionable: true,
      actionable_rationale:
        "A prior fragility fracture is one of the strongest and most actionable risk signals — it triggers immediate secondary prevention: DXA, likely pharmacologic therapy (bisphosphonate, denosumab, or anabolic if severe), a fall-prevention assessment, and enrolment in a Fracture Liaison Service. The 1–2 years after a fracture is the highest-risk window, so urgency matters.",
      flags: [],
      category: "frax_core",
      age_interaction_note:
        "At age 50 the effective HR is toward the upper bound (~2.0). Consider using 2.0 if the downstream model is calibrated specifically for perimenopausal women.",
    },
  } as const satisfies BooleanFeature,

  // -------------------------------------------------------------------------
  // 5. PARENT HIP FRACTURE
  // -------------------------------------------------------------------------
  parent_hip_fracture: {
    type: "boolean",
    coefficient: {
      key: "parent_hip_fracture",
      label: "Parent hip fracture",
      hr: 1.54,
      ci95: [1.25, 1.88],
      beta: 0.432,
      citation: "Kanis et al. 2004, Bone",
      source:
        "Kanis JA, Johnell O, Oden A, Johansson H, De Laet C, Eisman JA, et al. A family history of fracture and fracture risk: a meta-analysis. Bone 2004;35(5):1029–1037. DOI: 10.1016/j.bone.2004.06.017. PMID: 15542027.",
      population:
        "34,928 men and women from 7 prospective cohorts. 134,374 person-years. Mean age 63.",
      confidence: "high",
      notes:
        "FRAX uses 'parent hip fracture' specifically — not 'any parental fracture' and not sibling history. Pooled HR 1.54 for MOF and 2.27 for hip fracture alone. We use the MOF value (1.54) not the hip-only value. Age-stratified: ~1.8 at age 50, ~1.3 at 80. BMD adjustment barely changes it (most familial risk is non-BMD-mediated).",
      actionable: false,
      actionable_rationale:
        "Parental hip fracture history is fixed, but it's a strong signal to screen earlier and more aggressively. A 50-year-old with a parent hip fracture should get a baseline DXA now (not wait until 65) and double down on modifiable factors (calcium, vitamin D, exercise, smoking, alcohol) — her genetic baseline is lower, so the levers she can pull matter more.",
      flags: [],
      category: "frax_core",
      age_interaction_note:
        "At age 50 the effective HR is ~1.8 (above the pooled 1.54). Strongest at young ages, attenuates with age.",
    },
  } as const satisfies BooleanFeature,

  // -------------------------------------------------------------------------
  // 6. CURRENT SMOKER
  // -------------------------------------------------------------------------
  current_smoker: {
    type: "boolean",
    coefficient: {
      key: "current_smoker",
      label: "Current smoker",
      hr: 1.25,
      ci95: [1.15, 1.36],
      beta: 0.223,
      citation: "Kanis et al. 2005, Osteoporos Int",
      source:
        "Kanis JA, Johnell O, Oden A, Johansson H, De Laet C, Eisman JA, et al. Smoking and fracture risk: a meta-analysis. Osteoporos Int 2005;16(2):155–162. DOI: 10.1007/s00198-004-1640-3. PMID: 15175845.",
      population:
        "59,232 men and women from 10 prospective cohorts, ~250,000 person-years, mean age 63.",
      confidence: "high",
      notes:
        "MOF HR 1.25 unadjusted, 1.13 after BMD adjustment. Age-interaction minimal. Replicated by Thorin 2016 Osteoporos Int, which showed smoking cessation >10 years returns fracture risk to near never-smoker baseline. Mechanism is part BMD-mediated, part fall-related (COPD, deconditioning), part direct effects on osteoblasts and sex-hormone metabolism.",
      actionable: true,
      actionable_rationale:
        "Smoking cessation is one of the highest-impact modifiable levers at perimenopause — fracture risk begins to fall within a few years of quitting and approaches never-smoker baseline after about 10 years. Quitting now captures most of the benefit before the postmenopausal bone-loss acceleration. Combine with nicotine replacement, varenicline, or behavioural support.",
      flags: [],
      category: "frax_core",
    },
  } as const satisfies BooleanFeature,

  // -------------------------------------------------------------------------
  // 7. ALCOHOL ≥ 3 UNITS/DAY
  // -------------------------------------------------------------------------
  alcohol_high: {
    type: "boolean",
    coefficient: {
      key: "alcohol_high",
      label: "Alcohol ≥ 3 units/day",
      hr: 1.38,
      ci95: [1.16, 1.65],
      beta: 0.322,
      citation: "Kanis et al. 2005, Osteoporos Int",
      source:
        "Kanis JA, Johansson H, Johnell O, Oden A, De Laet C, Eisman JA, et al. Alcohol intake as a risk factor for fracture. Osteoporos Int 2005;16(7):737–742. DOI: 10.1007/s00198-004-1734-y. PMID: 15455194.",
      population:
        "5,939 men and 11,032 women pooled across prospective cohorts (CaMos, DOES, EPIDOS, Rotterdam, Sheffield), ~75,000 person-years.",
      confidence: "high",
      notes:
        "FRAX threshold is ≥3 units/day (~24 g ethanol; 1 UK unit = 8–10 g). Below this, the dose–response is flat or slightly J-shaped. Above this, risk rises steeply. Minimal BMD mediation — effect is part direct osteoblast toxicity, part fall-risk. Replicated in Berg 2008 Am J Med and Cawthon 2006.",
      actionable: true,
      actionable_rationale:
        "Alcohol is directly modifiable — cutting from ≥3 units/day to below 3 units/day moves the patient under the FRAX threshold and reduces fall risk within weeks. The cutoff that matters for fracture risk is roughly 3 standard drinks per day, and staying under that removes the risk factor entirely.",
      flags: [],
      category: "frax_core",
    },
  } as const satisfies BooleanFeature,

  // -------------------------------------------------------------------------
  // 8. GLUCOCORTICOID USE (≥5 mg prednisolone-equiv/day for ≥3 months)
  // -------------------------------------------------------------------------
  glucocorticoid_use: {
    type: "boolean",
    coefficient: {
      key: "glucocorticoid_use",
      label: "Glucocorticoid use",
      hr: 1.66,
      ci95: [1.42, 1.92],
      beta: 0.507,
      citation: "Kanis et al. 2004, JBMR",
      source:
        "Kanis JA, Johansson H, Oden A, Johnell O, de Laet C, Melton LJ 3rd, et al. A meta-analysis of prior corticosteroid use and fracture risk. J Bone Miner Res 2004;19(6):893–899. DOI: 10.1359/JBMR.040134. PMID: 15125788.",
      population:
        "42,500 men and women from 7 prospective cohorts, ~176,000 person-years, mean age 63.",
      confidence: "high",
      notes:
        "This is the 'ever-exposed' HR used by FRAX. Effect is strongly DOSE-DEPENDENT and reversible: Van Staa 2000 JBMR (N=244,235 GPRD) showed RR 1.55 at <2.5 mg/day, 2.59 at 2.5–7.5 mg/day, and 5.18 at ≥7.5 mg/day. For a patient currently on ≥5 mg/day, effective MOF HR ≈ 2.0–2.2. Risk rises within 3–6 months of starting and falls toward baseline within 6–12 months of stopping. Age-interaction: RR is higher at 50 (~2.6) than at 85 (~1.7). Replicated in Amiche 2016 Bayesian meta-regression.",
      actionable: true,
      actionable_rationale:
        "Glucocorticoid fracture risk is dose-dependent and partially reversible — work with the prescribing clinician to use the lowest effective dose, transition to steroid-sparing agents where possible (e.g. biologics for inflammatory disease), and start concurrent bone protection (bisphosphonate) if ≥5 mg/day is expected for ≥3 months. This is one of the few risk factors where parallel bone-protective medication is standard of care.",
      flags: [],
      category: "frax_core",
      age_interaction_note:
        "Effective HR at age 50 is toward 2.0–2.2 for CURRENT use at ≥5 mg/day; the 1.66 pooled value reflects 'ever-use'. If the patient schema distinguishes current vs past exposure, use the higher value for current users.",
    },
  } as const satisfies BooleanFeature,

  // -------------------------------------------------------------------------
  // 9. RHEUMATOID ARTHRITIS
  // -------------------------------------------------------------------------
  rheumatoid_arthritis: {
    type: "boolean",
    coefficient: {
      key: "rheumatoid_arthritis",
      label: "Rheumatoid arthritis",
      hr: 1.56,
      ci95: [1.20, 2.02],
      beta: 0.445,
      citation: "Van Staa et al. 2006, Arthritis Rheum",
      source:
        "Van Staa TP, Geusens P, Bijlsma JW, Leufkens HG, Cooper C. Clinical assessment of the long-term risk of fracture in patients with rheumatoid arthritis. Arthritis Rheum 2006;54(10):3104–3112. DOI: 10.1002/art.22117. PMID: 17009229. Incorporated into FRAX via Kanis 2007 Osteoporos Int 18:1033–1046.",
      population:
        "30,262 RA patients and 122,763 matched controls from the UK GPRD; mean follow-up ~3 years.",
      confidence: "high",
      notes:
        "RA is independent of glucocorticoid use in FRAX (they add together). Other inflammatory arthropathies (ankylosing spondylitis, psoriatic arthritis, IBD, lupus, coeliac) carry similar risk but are NOT captured by this coefficient. Replicated in Kim 2020 Osteoporos Int. Mechanisms: systemic inflammation (TNF, IL-6 → RANKL), reduced mobility/falls, concurrent GC exposure.",
      actionable: true,
      actionable_rationale:
        "Controlling your RA is itself controlling your bone health — effective disease control with methotrexate, biologics, or JAK inhibitors progressively normalises fracture risk toward the general population, independent of any osteoporosis medication. Adherence to DMARDs and achieving low disease activity is bone protection.",
      flags: [],
      category: "frax_core",
    },
  } as const satisfies BooleanFeature,

  // -------------------------------------------------------------------------
  // 10. MENOPAUSAL STAGE (STRAW+10) — categorical, 5 levels
  // -------------------------------------------------------------------------
  menopausal_stage: {
    type: "categorical",
    reference_level: "early_perimenopausal",
    levels: {
      premenopausal: {
        key: "menopausal_stage_premenopausal",
        label: "Premenopausal",
        hr: 0.98,
        ci95: [0.90, 1.07],
        beta: -0.020,
        citation: "Greendale et al. 2012 (SWAN)",
        source:
          "Greendale GA, Sowers M, Han W, Huang MH, Finkelstein JS, Crandall CJ, Lee JS, Karlamangla AS. Bone mineral density loss in relation to the final menstrual period in a multiethnic cohort: results from the Study of Women's Health Across the Nation (SWAN). J Bone Miner Res 2012;27(1):111–118. DOI: 10.1002/jbmr.534. PMID: 21976317. Converted to MOF HR via the BMD→fracture gradient in Johnell O et al. J Bone Miner Res 2005;20(7):1185–1194. DOI: 10.1359/JBMR.050304.",
        population:
          "SWAN bone substudy, n=1,902 multi-ethnic women, baseline age 42–52, longitudinal DXA spanning the final menstrual period.",
        confidence: "medium",
        notes:
          "DERIVED. No direct MOF HR by STRAW stage exists in the literature. Computed from SWAN femoral-neck BMD trajectories × Johnell 2005 HR≈1.6 per SD. CIs propagate only the Johnell gradient uncertainty, not the SWAN trajectory SEs, so true uncertainty is wider.",
        actionable: false,
        actionable_rationale:
          "Being premenopausal is the bone-preservation window — peak bone mass is still intact, so lifestyle levers (weight-bearing exercise, protein, calcium/vitamin D, not smoking) have their maximum return here. Lock these in before the transmenopause acceleration.",
        flags: ["DERIVED"],
        category: "perimenopause",
      },
      early_perimenopausal: {
        key: "menopausal_stage_early_perimenopausal",
        label: "Early perimenopausal (reference)",
        hr: 1.0,
        ci95: null,
        beta: 0.0,
        citation: "Reference level",
        source: "Reference level.",
        population: "Reference — 50-year-old STRAW stage -2.",
        confidence: "high",
        notes: "Reference level for the menopausal-stage categorical feature.",
        actionable: false,
        actionable_rationale:
          "Early perimenopause is your inflection point — bone loss has not yet accelerated, but it is imminent. This is when baseline DXA, lifestyle intensification, and an HRT conversation pay the highest dividends.",
        flags: [],
        category: "perimenopause",
      },
      late_perimenopausal: {
        key: "menopausal_stage_late_perimenopausal",
        label: "Late perimenopausal",
        hr: 1.04,
        ci95: [0.95, 1.14],
        beta: 0.039,
        citation: "Greendale et al. 2012 (SWAN)",
        source:
          "Greendale GA et al. J Bone Miner Res 2012;27(1):111–118. DOI: 10.1002/jbmr.534. Converted via Johnell O et al. J Bone Miner Res 2005;20(7):1185–1194. DOI: 10.1359/JBMR.050304.",
        population: "SWAN bone substudy (as above).",
        confidence: "medium",
        notes:
          "DERIVED. Late peri is STRAW -1: bone loss begins to accelerate (~1.0%/yr lumbar spine). Cumulative BMD deficit vs early-peri is still modest (~1%), so HR is only marginally above 1.0.",
        actionable: false,
        actionable_rationale:
          "You're now in the window where bone loss begins to accelerate. Baseline DXA (if not done), HRT discussion, resistance training, and vitamin D / calcium optimisation become urgent.",
        flags: ["DERIVED"],
        category: "perimenopause",
      },
      postmenopausal_under_5yr: {
        key: "menopausal_stage_postmenopausal_under_5yr",
        label: "Postmenopausal (<5 years)",
        hr: 1.29,
        ci95: [1.12, 1.48],
        beta: 0.255,
        citation: "Greendale et al. 2012 (SWAN)",
        source:
          "Greendale GA et al. J Bone Miner Res 2012;27(1):111–118. DOI: 10.1002/jbmr.534. Converted via Johnell O et al. J Bone Miner Res 2005;20(7):1185–1194. DOI: 10.1359/JBMR.050304. Sanity-checked against Cauley JA et al. Menopause 2012;19(11):1200–1207. DOI: 10.1097/gme.0b013e31825ae17e.",
        population: "SWAN bone substudy (as above).",
        confidence: "medium",
        notes:
          "DERIVED. This is the transmenopause steep-loss window (STRAW +1a/b/c). BMD loss peaks at ~2.0%/yr lumbar spine and ~1.4%/yr femoral neck. Cumulative femoral-neck loss ≈ 6%. SWAN empirical fracture data (Cauley 2012) suggest this HR may UNDERESTIMATE risk — true HR could be 1.5–1.8 in the first 2 years post-FMP.",
        actionable: false,
        actionable_rationale:
          "You're in the steep-loss window — the first five years after your final period is when bone loss is fastest. Every modifiable lever matters now: HRT (if not contraindicated) is the single most effective intervention in this window; add resistance training, protein, and vitamin D.",
        flags: ["DERIVED"],
        category: "perimenopause",
      },
      postmenopausal_5_10yr: {
        key: "menopausal_stage_postmenopausal_5_10yr",
        label: "Postmenopausal (5–10 years)",
        hr: 1.48,
        ci95: [1.26, 1.74],
        beta: 0.392,
        citation: "Greendale et al. 2012 (SWAN)",
        source:
          "Greendale GA et al. J Bone Miner Res 2012;27(1):111–118. DOI: 10.1002/jbmr.534. Converted via Johnell O et al. J Bone Miner Res 2005;20(7):1185–1194. DOI: 10.1359/JBMR.050304.",
        population: "SWAN bone substudy (as above).",
        confidence: "medium",
        notes:
          "DERIVED. 5–10 years post-FMP is the plateau phase — loss continues at ~0.7%/yr femoral neck. Cumulative deficit ≈ 9–10%. Past this window the risk continues to rise but age-dominated; past 10y post-FMP the model should be re-anchored.",
        actionable: false,
        actionable_rationale:
          "You're past the steep-loss phase but bone loss continues. Screening DXA, bone-protective medications if indicated, falls prevention, and continued lifestyle intensification are the priorities.",
        flags: ["DERIVED"],
        category: "perimenopause",
      },
    },
  } as const satisfies CategoricalFeature<MenopausalStage>,

  // -------------------------------------------------------------------------
  // 11. EARLY MENOPAUSE (FMP < age 45)
  // -------------------------------------------------------------------------
  early_menopause: {
    type: "boolean",
    coefficient: {
      key: "early_menopause",
      label: "Early menopause (FMP < 45)",
      hr: 1.83,
      ci95: [1.22, 2.74],
      beta: 0.604,
      citation: "Svejme et al. 2012, BJOG",
      source:
        "Svejme O, Ahlborg HG, Nilsson JÅ, Karlsson MK. Early menopause and risk of osteoporosis, fracture and mortality: a 34-year prospective observational study. BJOG 2012;119(7):810–816. DOI: 10.1111/j.1471-0528.2012.03324.x. PMID: 22531050.",
      population:
        "390 Swedish women, all aged 48 at baseline, followed 34 years.",
      confidence: "medium",
      notes:
        "Svejme uses FMP <47; the InterLACE pooled analysis (Mishra 2017, Zhu 2019) gives HR ~1.36 for the stricter <45 cutoff. Natural FMP <45 likely sits in the 1.5–1.9 range. Svejme's 1.83 is retained as the central estimate. NOT flagged CONTESTED — direction and magnitude consistent across sources (spread <40%). Replicated by Anagnostis 2019 Endocrine meta-analysis.",
      actionable: false,
      actionable_rationale:
        "Early menopause itself can't be undone, but knowing about it changes what you should do now: it's a strong signal to start bone density screening earlier than the standard age 65, to have a serious HRT conversation with your doctor (the benefit is largest when started close to menopause), and to be more deliberate about weight-bearing exercise, protein, and vitamin D.",
      flags: [],
      category: "perimenopause",
    },
  } as const satisfies BooleanFeature,

  // -------------------------------------------------------------------------
  // 12. CURRENT HRT
  // -------------------------------------------------------------------------
  current_hrt: {
    type: "boolean",
    coefficient: {
      key: "current_hrt",
      label: "Current HRT use",
      hr: 0.66,
      ci95: [0.55, 0.78],
      beta: -0.416,
      citation: "Cauley et al. 2003, JAMA (WHI)",
      source:
        "Cauley JA, Robbins J, Chen Z, Cummings SR, Jackson RD, LaCroix AZ, et al; Women's Health Initiative Investigators. Effects of estrogen plus progestin on risk of fracture and bone mineral density: the Women's Health Initiative randomized trial. JAMA 2003;290(13):1729–1738. DOI: 10.1001/jama.290.13.1729. PMID: 14519707. Reinforced by Jackson 2006 JBMR (WHI E-alone) and the NAMS 2022 Hormone Therapy Position Statement (Menopause 29(7):767–794, DOI: 10.1097/GME.0000000000002028).",
      population:
        "WHI E+P RCT: 16,608 postmenopausal women aged 50–79 (mean 63.3), mean follow-up 5.6 years. Intention-to-treat.",
      confidence: "high",
      notes:
        "Highest-quality bone-outcome estimate in the whole model — an RCT. Hip fracture HR 0.67 (0.47–0.96), clinical vertebral HR 0.65 (0.46–0.92), total fracture HR 0.76 (0.69–0.83); MOF-like composite ≈ 0.66. IMPORTANT INTERACTION: HRT should be treated as an effect modifier on menopausal_stage rather than an independent multiplier — a woman who is simultaneously post_under_5yr and on HRT should NOT be scored as stage_HR × HRT_HR because HRT suppresses the BMD loss that drives the stage HR. See docs/model-calibration.md §4.2 for three mitigation options. The scoring function should implement one of them.",
      actionable: true,
      actionable_rationale:
        "If you're not on hormone therapy, it's worth a conversation with your doctor — in women your age around menopause, HRT reduces hip and spine fracture risk by about a third, and the cardiovascular and breast cancer concerns from the original WHI results are much smaller when HRT is started before age 60 or within 10 years of menopause. If you are on HRT, you're already getting this benefit.",
      flags: [],
      category: "perimenopause",
    },
  } as const satisfies BooleanFeature,

  // -------------------------------------------------------------------------
  // 13. LOW DIETARY CALCIUM (<700 mg/day) — CONTESTED / near-null
  // -------------------------------------------------------------------------
  low_calcium: {
    type: "boolean",
    coefficient: {
      key: "low_calcium",
      label: "Low dietary calcium",
      hr: 1.05,
      ci95: [0.92, 1.20],
      beta: 0.049,
      citation: "Bolland et al. 2015, BMJ (CONTESTED)",
      source:
        "Bolland MJ, Leung W, Tai V, Bastin S, Gamble GD, Grey A, Reid IR. Calcium intake and risk of fracture: systematic review. BMJ 2015;351:h4580. DOI: 10.1136/bmj.h4580. PMID: 26420387.",
      population:
        "Systematic review: 44 cohort studies and 26 RCTs of calcium intake/supplementation and fracture outcomes.",
      confidence: "low",
      notes:
        "CONTESTED. Bolland 2015 finds dietary calcium NOT associated with fracture risk and only a small, methodologically-fragile supplementation effect on total fracture (RR 0.89, null for hip). Warensjö 2011 BMJ (Swedish Mammography Cohort, N=61,433 over 19 yr) found a U-shaped relationship with lowest quintile hip-fracture HR 1.18 (1.04–1.34). FRAX explicitly omits dietary calcium. Central estimate 1.05 with CI spanning null is a compromise. Consider dropping this feature entirely if the UX adds no value from asking about calcium — risk contribution is barely measurable.",
      actionable: true,
      actionable_rationale:
        "Getting ~1,000–1,200 mg/day of calcium from food (dairy, leafy greens, sardines, fortified foods) is a reasonable goal, but don't panic about moderately low intake — the evidence that calcium supplements prevent fractures in healthy women is surprisingly weak. Fix through diet first, add a supplement only if you genuinely can't reach the target through food. Vitamin D status and weight-bearing exercise probably matter more for your bones than squeezing calcium from 800 up to 1,200 mg.",
      flags: ["CONTESTED"],
      category: "perimenopause",
    },
  } as const satisfies BooleanFeature,

  // -------------------------------------------------------------------------
  // 14. ETHNICITY BASELINE — categorical, UK-calibrated
  // -------------------------------------------------------------------------
  ethnicity_baseline: {
    type: "categorical",
    reference_level: "white",
    levels: {
      white: {
        key: "ethnicity_white",
        label: "White (reference)",
        hr: 1.0,
        ci95: null,
        beta: 0.0,
        citation: "Curtis et al. 2016, Bone (CPRD)",
        source:
          "Curtis EM, van der Velde R, Moon RJ, et al. Epidemiology of fractures in the United Kingdom 1988-2012: variation with age, sex, geography, ethnicity and socioeconomic status. Bone 2016;87:19–26. DOI: 10.1016/j.bone.2016.03.006. PMID: 26968752.",
        population:
          "CPRD linked UK primary-care cohort, ~2.4 million adults 1988–2012. White UK baseline is ~86% of the denominator and anchors QFracture / FRAX-UK calibration.",
        confidence: "high",
        notes:
          "Reference level. Direct UK primary-care-derived baseline, matching the target NHS deployment setting.",
        actionable: false,
        actionable_rationale:
          "Reference category — no ancestry adjustment. Focus on modifiable risk factors.",
        flags: [],
        category: "ancestry",
      },
      south_asian: {
        key: "ethnicity_south_asian",
        label: "South Asian",
        hr: 0.70,
        ci95: [0.55, 0.90],
        beta: -0.357,
        citation: "Curtis et al. 2016, Bone (CPRD)",
        source:
          "Curtis EM et al. Bone 2016;87:19–26. DOI: 10.1016/j.bone.2016.03.006. Supported by Roy DK et al. Bone 2005;37(2):267–273 and Darling AL et al. Osteoporos Int 2013;24(2):477–488 for UK South Asian BMD and vitamin D context.",
        population:
          "CPRD UK ethnicity-coded subset. MOF rate ratios vs White UK baseline, all-age pooled.",
        confidence: "medium",
        notes:
          "UK_EXTRAPOLATED to the 42–55 age band (Curtis 2016 pools ages). South Asian women have lower aBMD at hip/spine than White Europeans but smaller hip axis length and body size partly offset this. Vitamin D deficiency is markedly more common in UK South Asian women but observed fracture rates remain lower. MOF HR weaker than hip-only HR (~0.55) because forearm/humerus fractures show smaller ethnic gradients.",
        actionable: false,
        actionable_rationale:
          "South Asian ancestry is associated with lower BMD but also smaller, more compact hip geometry, yielding a modestly lower 10-year MOF risk than White European women at the same age and BMI. This is not a reason for complacency: vitamin D deficiency is highly prevalent in UK South Asian women and is independently modifiable. The ancestry adjustment contextualises baseline risk; it does not override the need to check vitamin D, calcium intake, and activity.",
        flags: ["UK_EXTRAPOLATED"],
        category: "ancestry",
      },
      east_asian: {
        key: "ethnicity_east_asian",
        label: "East Asian",
        hr: 0.75,
        ci95: [0.60, 0.95],
        beta: -0.288,
        citation: "Cauley et al. 2007, JBMR (WHI)",
        source:
          "Cauley JA, Wu L, Wampler NS, et al. Clinical risk factors for fractures in multi-ethnic women: the Women's Health Initiative. J Bone Miner Res 2007;22(11):1816–1826. DOI: 10.1359/jbmr.070713. PMID: 17649997. Corroborated by Kanis JA et al. Osteoporos Int 2012;23(9):2239–2256. DOI: 10.1007/s00198-012-1964-3.",
        population:
          "WHI Observational + Clinical Trials, ~2,700 Asian American women (predominantly Chinese, Japanese, Filipino), age 50–79, mean follow-up 7.6 years.",
        confidence: "medium",
        notes:
          "UK_EXTRAPOLATED — US WHI pools Chinese/Japanese/Filipino, older than target band, and US residents differ from UK Chinese population. Hip fracture HR alone is much lower (~0.26–0.55) but MOF composite is less extreme because vertebral fracture incidence in East Asian women may exceed White Europeans — the classic 'BMD–fracture paradox' driven by favourable hip geometry (shorter hip axis length) and smaller body size.",
        actionable: false,
        actionable_rationale:
          "East Asian ancestry is associated with lower peak bone mineral density but favourable hip geometry, yielding lower hip fracture risk than White European women. Vertebral fracture risk may not share this advantage — communicate the hip benefit without implying all fracture sites are equally protected. T-score thresholds may misclassify East Asian women; fracture-risk calculators that integrate clinical factors perform better than BMD alone.",
        flags: ["UK_EXTRAPOLATED"],
        category: "ancestry",
      },
      black_african: {
        key: "ethnicity_black_african",
        label: "Black African",
        hr: 0.50,
        ci95: [0.35, 0.70],
        beta: -0.693,
        citation: "Cauley et al. 2005, JAMA",
        source:
          "Cauley JA, Lui LY, Ensrud KE, et al. Bone mineral density and the risk of incident nonspinal fractures in black and white women. JAMA 2005;293(17):2102–2108. DOI: 10.1001/jama.293.17.2102. PMID: 15870413. UK direction and magnitude corroborated by Curtis EM et al. Bone 2016;87:19–26.",
        population:
          "Pooled WHI Observational + SOF, ~8,000 Black (predominantly African-American) postmenopausal women, age 50–79, mean follow-up 7.6 years.",
        confidence: "medium",
        notes:
          "UK_EXTRAPOLATED — primary data are African-American women (~20% European admixture on average, distinct SES/dietary profile from UK Black Africans who are predominantly first/second-generation West African). Protective effect persists even after BMD adjustment — reflects additional protection from cortical thickness, hip geometry, and microarchitecture (Putman 2013 JBMR).",
        actionable: false,
        actionable_rationale:
          "Black African ancestry is associated with higher peak bone mineral density, thicker cortical bone, and favourable hip geometry, together yielding roughly half the baseline MOF risk of White European women at the same age and BMI. This does not eliminate the need for screening — vitamin D deficiency is common in UK Black African women and should be checked independently. Ancestry adjusts the baseline; it does not remove the importance of modifiable risk factors.",
        flags: ["UK_EXTRAPOLATED"],
        category: "ancestry",
      },
      other: {
        key: "ethnicity_other",
        label: "Other / not recorded",
        hr: 1.0,
        ci95: null,
        beta: 0.0,
        citation: "Defaults to reference",
        source:
          "No published HR. Defaults to the White European reference (HR 1.00) because the synthetic model cannot justify an adjustment without evidence. This is the conservative choice — it never incorrectly reduces a patient's predicted risk based on uncertain ancestry coding.",
        population: "Not applicable — fallback level.",
        confidence: "low",
        notes:
          "Fallback for mixed ancestry, self-reported 'other', or missing data. Applies HR 1.00 (reference) — does not penalise or benefit the patient, surfaces as a neutral entry in the feature contribution chart. Downstream UX should prompt for a more specific category if possible.",
        actionable: false,
        actionable_rationale:
          "Ancestry data were not available or did not fit one of the four recorded categories, so no ancestry adjustment has been applied. Accuracy improves if a more specific category is recorded in the record.",
        flags: [],
        category: "ancestry",
      },
    },
  } as const satisfies CategoricalFeature<Ethnicity>,
} as const;

export type WeightsShape = typeof WEIGHTS;

// ===========================================================================
// TIER THRESHOLDS
//
// ⚠️  NOT YET CALIBRATED AGAINST THE SYNTHETIC COHORT.
//
// These are the user-supplied starting placeholders. Calibration requires
// running the 82-patient synthetic cohort through lib/risk-model.ts and
// tuning (moderate, high) to produce the target ~55% low / ~30% moderate /
// ~15% high distribution. This is blocked on the existence of
// data/patients.json and lib/risk-model.ts (spec Phase 0).
//
// Do not deploy to patients until calibration has been run and documented
// in docs/model-calibration.md §7.1.
// ===========================================================================

export const TIER_THRESHOLDS = {
  moderate: 1.5,
  high: 3.5,
} as const;

// ===========================================================================
// STAGE × HRT INTERACTION RULE (for the scoring function to consume)
//
// The menopausal_stage HRs are driven by transmenopause BMD loss. HRT
// suppresses that loss, so a woman who is both post_under_5yr and on HRT
// should not be scored as (stage_HR × HRT_HR) — that double-counts the
// protective effect. The scoring function in lib/risk-model.ts should apply
// one of the rules encoded below. See docs/model-calibration.md §4.2 for
// the full rationale.
// ===========================================================================

export type StageHrtInteractionRule =
  /** Collapse menopausal_stage to early_perimenopausal when current_hrt is true. Simplest. */
  | "collapse_stage_to_reference_when_on_hrt"
  /** Zero-out the stage coefficient when current_hrt is true; apply only HRT beta. */
  | "zero_stage_beta_when_on_hrt"
  /** Retain both but halve the stage coefficient when current_hrt is true. */
  | "half_stage_beta_when_on_hrt";

/** Default interaction rule for the scoring function — simplest, most defensible. */
export const STAGE_HRT_INTERACTION_RULE: StageHrtInteractionRule =
  "collapse_stage_to_reference_when_on_hrt";

// ===========================================================================
// EARLY MENOPAUSE × STAGE INTERACTION RULE
//
// Early menopause and menopausal_stage are also entangled. A woman whose FMP
// was at 44 will reach post_under_5yr much earlier than the reference, and
// scoring her as both early_menopause (+0.604) AND post_under_5yr (+0.255)
// double-counts the estrogen-deficiency effect.
// ===========================================================================

export type EarlyMenopauseInteractionRule =
  /** Only apply early_menopause beta when stage is pre/early_peri/late_peri. */
  | "only_apply_when_peri_or_earlier"
  /** Always apply but reduce the early_menopause beta once postmenopausal. */
  | "reduced_when_postmenopausal"
  /** Apply in full regardless of stage. Over-scores; not recommended. */
  | "always_apply";

/** Default rule — avoids double-counting once the patient is already postmenopausal. */
export const EARLY_MENOPAUSE_INTERACTION_RULE: EarlyMenopauseInteractionRule =
  "only_apply_when_peri_or_earlier";
