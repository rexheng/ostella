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
