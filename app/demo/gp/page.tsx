// app/demo/gp/page.tsx
import Link from "next/link";
import { getAllPatients } from "@/lib/patients";
import { scorePatient } from "@/lib/risk-model";
import { RiskBadge } from "@/components/RiskBadge";
import { Card } from "@/components/ui/card";
import type { RiskTier } from "@/lib/types";

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Patient worklist</h1>
        <p className="text-sm text-slate-600">
          82 women aged 42–55 registered to Regent&apos;s Park Medical Centre, sorted by relative risk.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <SummaryCard label="High risk" count={counts.high} tier="high" />
        <SummaryCard label="Moderate risk" count={counts.moderate} tier="moderate" />
        <SummaryCard label="Low risk" count={counts.low} tier="low" />
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
                  <Link
                    href={`/demo/gp/patients/${s.patient.id}`}
                    className="font-medium text-slate-900 hover:underline"
                  >
                    {s.patient.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600">{ageFromDob(s.patient.date_of_birth)}</td>
                <td className="px-4 py-3 text-slate-600">
                  {s.patient.clinical.menopausal_stage.replace(/_/g, " ")}
                </td>
                <td className="px-4 py-3">
                  <RiskBadge tier={s.tier} />
                </td>
                <td className="px-4 py-3 text-right font-mono text-slate-700">
                  {s.relative_risk.toFixed(2)}×
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
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
    <Card className="flex items-center justify-between p-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
        <p className="mt-1 text-3xl font-semibold">{count}</p>
      </div>
      <RiskBadge tier={tier} />
    </Card>
  );
}
