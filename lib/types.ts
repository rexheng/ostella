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
