// app/demo/gp/page.tsx
import Link from "next/link";
import { getAllPatients } from "@/lib/patients";
import { scorePatient } from "@/lib/risk-model";
import { RiskBadge } from "@/components/RiskBadge";
import { PatientCard } from "@/components/gp/PatientCard";
import type { RiskTier, ScoredPatient } from "@/lib/types";

function ageFromDob(dob: string) {
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export default function GpDashboardPage() {
  const scored = getAllPatients()
    .map(scorePatient)
    .sort((a, b) => b.relative_risk - a.relative_risk);

  const counts = { high: 0, moderate: 0, low: 0 };
  for (const s of scored) counts[s.tier]++;

  const highRisk = scored.filter((s) => s.tier === "high");
  const others = scored.filter((s) => s.tier !== "high");

  return (
    <div className="space-y-12">
      {/* header */}
      <header>
        <p className="text-xs uppercase tracking-[0.1em] text-lavender-600">
          The GP view
        </p>
        <h1 className="mt-3 font-display text-5xl font-light leading-[1.05] tracking-tight text-ink-900">
          Patient worklist
        </h1>
        <p className="mt-4 max-w-[60ch] text-base text-ink-500">
          82 women aged 42–55 registered to Regent&apos;s Park Medical Centre, sorted
          by relative risk.
        </p>
      </header>

      {/* summary cards */}
      <section className="grid gap-6 md:grid-cols-3">
        <SummaryCard label="High risk" count={counts.high} tier="high" />
        <SummaryCard label="Moderate risk" count={counts.moderate} tier="moderate" />
        <SummaryCard label="Low risk" count={counts.low} tier="low" />
      </section>

      {/* Needs attention — high-risk pinned section */}
      {highRisk.length > 0 && (
        <section>
          <div className="mb-6 flex items-baseline justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.1em] text-lavender-600">
                Priority
              </p>
              <h2 className="mt-2 font-display text-3xl font-medium text-ink-900">
                Needs attention
                <span className="ml-3 text-ink-500">·</span>
                <span className="ml-3 text-ink-500">
                  {highRisk.length} {highRisk.length === 1 ? "patient" : "patients"}
                </span>
              </h2>
            </div>
            <p className="hidden max-w-[32ch] text-sm text-ink-500 md:block">
              These women are in the top tier of relative risk. Review their model
              contributions and initiate a preventative conversation.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {highRisk.map((s) => (
              <PatientCard key={s.patient.id} scored={s} />
            ))}
          </div>
        </section>
      )}

      {/* Monitoring — moderate + low compact table */}
      {others.length > 0 && (
        <section>
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.1em] text-ink-500">
              Monitoring
            </p>
            <h2 className="mt-2 font-display text-2xl font-medium text-ink-900">
              Rest of the cohort
              <span className="ml-3 text-ink-500">·</span>
              <span className="ml-3 text-ink-500">{others.length}</span>
            </h2>
          </div>
          <div className="overflow-hidden rounded-2xl border border-cream-200 bg-cream-50">
            <table className="w-full">
              <thead>
                <tr className="border-b border-cream-200 text-left text-[11px] uppercase tracking-[0.08em] text-ink-500">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Age</th>
                  <th className="px-5 py-3 font-medium">Stage</th>
                  <th className="px-5 py-3 font-medium">Risk</th>
                  <th className="px-5 py-3 text-right font-medium">Relative risk</th>
                </tr>
              </thead>
              <tbody>
                {others.map((s, i) => (
                  <CompactRow
                    key={s.patient.id}
                    scored={s}
                    last={i === others.length - 1}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  count,
  tier,
}: {
  label: string;
  count: number;
  tier: RiskTier;
}) {
  return (
    <div className="flex items-start justify-between rounded-2xl bg-cream-100 p-6 transition-colors hover:bg-cream-200/60">
      <div>
        <p className="text-[11px] uppercase tracking-[0.1em] text-ink-500">{label}</p>
        <p className="mt-3 font-display text-6xl font-light leading-none tracking-tight text-sage-700">
          {count}
        </p>
      </div>
      <RiskBadge tier={tier} />
    </div>
  );
}

function CompactRow({ scored, last }: { scored: ScoredPatient; last: boolean }) {
  return (
    <tr
      className={`text-sm text-ink-700 transition-colors hover:bg-cream-100 ${
        last ? "" : "border-b border-cream-100"
      }`}
    >
      <td className="px-5 py-4">
        <Link
          href={`/demo/gp/patients/${scored.patient.id}`}
          className="font-medium text-ink-900 hover:underline"
        >
          {scored.patient.name}
        </Link>
      </td>
      <td className="px-5 py-4 text-ink-500">
        {ageFromDob(scored.patient.date_of_birth)}
      </td>
      <td className="px-5 py-4 text-ink-500">
        {scored.patient.clinical.menopausal_stage.replace(/_/g, " ")}
      </td>
      <td className="px-5 py-4">
        <RiskBadge tier={scored.tier} />
      </td>
      <td className="px-5 py-4 text-right font-display text-base font-medium text-sage-700">
        {scored.relative_risk.toFixed(2)}
        <span className="text-ink-500">×</span>
      </td>
    </tr>
  );
}
