// app/demo/gp/patients/[id]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getPatient } from "@/lib/patients";
import { scorePatient } from "@/lib/risk-model";
import { RiskBadge } from "@/components/RiskBadge";
import { FeatureContributionChart } from "@/components/FeatureContributionChart";
import { AlertComposer } from "@/components/AlertComposer";
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
    <div className="space-y-10">
      {/* back link */}
      <Link
        href="/demo/gp"
        className="inline-flex items-center gap-1.5 text-sm text-ink-500 transition-colors hover:text-ink-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to worklist
      </Link>

      {/* patient header */}
      <header className="flex items-start justify-between gap-6">
        <div>
          <h1 className="font-display text-[44px] font-medium leading-[1.1] tracking-tight text-ink-900">
            {patient.name}
          </h1>
          <p className="mt-3 text-sm text-ink-500">
            NHS {patient.nhs_number} · DOB {patient.date_of_birth} ·{" "}
            {patient.ethnicity.replace(/_/g, " ")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/demo/patient?as=${patient.id}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-cream-200 bg-cream-50 px-4 py-2 text-[12px] font-medium text-ink-700 transition hover:-translate-y-0.5 hover:border-sage-300 hover:text-sage-700 hover:shadow-sm"
          >
            Open {patient.name.split(" ")[0]}&rsquo;s inbox
            <ExternalLink className="h-3 w-3" strokeWidth={2} />
          </Link>
          <RiskBadge tier={scored.tier} className="px-5 py-2 text-sm" />
        </div>
      </header>

      {/* Risk model contributions card — the money shot */}
      <section className="rounded-2xl border border-cream-200 bg-cream-50 p-8 md:p-10">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-[28px] font-medium leading-tight text-ink-900">
              Risk model contributions
            </h2>
            <p className="mt-2 text-base text-ink-500">
              Relative risk{" "}
              <span className="font-display font-medium text-ink-900">
                {scored.relative_risk.toFixed(2)}×
              </span>{" "}
              vs reference woman.
            </p>
          </div>
          <span className="inline-flex items-center rounded-full border border-lavender-200 bg-lavender-50 px-3 py-1 text-[11px] font-medium text-lavender-700">
            Literature-verified weights · cohort calibration in progress
          </span>
        </div>

        <FeatureContributionChart contributions={scored.contributions} />
      </section>

      {/* Action region */}
      {scored.tier === "high" ? (
        <AlertComposer
          patient={patient}
          gp={{ name: DEMO_GP.name, practice: DEMO_PRACTICE.name }}
        />
      ) : scored.tier === "moderate" ? (
        <PassiveCard
          heading="Monitor"
          body="Review at next routine appointment in 6 months. No alert required now."
        />
      ) : (
        <PassiveCard
          heading="No action required"
          body="Patient can self-access education materials via their portal."
        />
      )}
    </div>
  );
}

function PassiveCard({ heading, body }: { heading: string; body: string }) {
  return (
    <div className="rounded-2xl border border-cream-200 bg-cream-50 p-8">
      <h3 className="font-display text-xl font-medium text-ink-900">{heading}</h3>
      <p className="mt-2 text-sm text-ink-500">{body}</p>
    </div>
  );
}
