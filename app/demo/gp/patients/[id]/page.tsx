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

export default function PatientDetailPage({
  params,
}: {
  params: { id: string };
}) {
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
            NHS {patient.nhs_number} · DOB {patient.date_of_birth} ·{" "}
            {patient.ethnicity.replace(/_/g, " ")}
          </p>
        </div>
        <RiskBadge tier={scored.tier} className="px-3 py-1 text-base" />
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Risk model contributions</h2>
            <p className="text-sm text-slate-600">
              Relative risk{" "}
              <span className="font-mono">{scored.relative_risk.toFixed(2)}×</span> vs
              reference woman.
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
          No action required — patient can self-access education materials via their
          portal.
        </Card>
      )}
    </div>
  );
}
