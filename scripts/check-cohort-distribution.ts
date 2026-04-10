// scripts/check-cohort-distribution.ts
// Reads the generated cohort, scores every patient, and prints the tier
// distribution + the top 5 highest-risk patients. Used during Task 0.9 to
// calibrate TIER_THRESHOLDS in lib/model-weights.ts against the actual
// synthetic cohort. Run with: pnpm tsx scripts/check-cohort-distribution.ts

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
    console.log(
      `  ${s.patient.id}  ${s.patient.name.padEnd(24)}  RR=${s.relative_risk.toFixed(2)}  tier=${s.tier}`
    );
  });

// Sarah Chen sanity check — she must always be in the high tier.
const sarah = scored.find((s) => s.patient.id === "p-001");
if (sarah) {
  const sortedAll = [...scored].sort((a, b) => b.relative_risk - a.relative_risk);
  const sarahRank = sortedAll.findIndex((s) => s.patient.id === "p-001") + 1;
  console.log();
  console.log(
    `Sarah Chen (p-001): RR=${sarah.relative_risk.toFixed(2)}  tier=${sarah.tier}  rank=${sarahRank}/${total}`
  );
}
