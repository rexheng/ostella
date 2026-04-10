// scripts/generate-patients.ts
// One-shot generator for data/patients.json. Produces 82 synthetic patients
// aged 42–55 with a realistic distribution of menopausal stage and risk factors.
// Run with: pnpm tsx scripts/generate-patients.ts
//
// The generator deliberately HAND-AUTHORS p-001 (Sarah Chen) and a few others
// with latest_alert populated; the remaining 79 are procedurally generated
// but seeded so the file is reproducible.

import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
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
function pick<T>(arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}
function maybe(p: number): boolean {
  return rand() < p;
}
function randInt(min: number, max: number) {
  return Math.floor(rand() * (max - min + 1)) + min;
}
function round(n: number, d = 1) {
  return Math.round(n * 10 ** d) / 10 ** d;
}

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

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const outPath = join(__dirname, "..", "data", "patients.json");
  writeFileSync(outPath, JSON.stringify(all, null, 2));
  console.log(`Wrote ${all.length} patients to ${outPath}`);
}

main();
