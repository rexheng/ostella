// components/gp/PatientCard.tsx
// Rich "needs attention" card used on the GP worklist for high-risk patients.
// Server-rendered. Click target navigates to the patient detail page.
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { RiskBadge } from "@/components/RiskBadge";
import type { ScoredPatient } from "@/lib/types";

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

function formatStage(stage: string) {
  return stage.replace(/_/g, " ");
}

export function PatientCard({ scored }: { scored: ScoredPatient }) {
  const age = ageFromDob(scored.patient.date_of_birth);
  return (
    <Link
      href={`/demo/gp/patients/${scored.patient.id}`}
      className="group relative flex flex-col justify-between gap-6 rounded-2xl border border-cream-200 bg-cream-50 p-6 transition-all hover:-translate-y-0.5 hover:border-clinical-high-border hover:shadow-[0_12px_32px_-20px_rgba(194,85,78,0.35)]"
    >
      {/* subtle left-edge accent in clinical-high — warm, not alarmist */}
      <span
        aria-hidden
        className="pointer-events-none absolute left-0 top-6 bottom-6 w-[3px] rounded-full bg-clinical-high/70"
      />

      <div className="flex items-start justify-between gap-4 pl-3">
        <div className="min-w-0">
          <h3 className="truncate font-display text-2xl font-medium text-ink-900">
            {scored.patient.name}
          </h3>
          <p className="mt-1 text-[11px] uppercase tracking-[0.08em] text-ink-500">
            {age} years · {formatStage(scored.patient.clinical.menopausal_stage)}
          </p>
        </div>
        <RiskBadge tier={scored.tier} />
      </div>

      <div className="flex items-end justify-between pl-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.08em] text-ink-500">
            Relative risk
          </p>
          <p className="mt-1 font-display text-3xl font-medium text-ink-900">
            {scored.relative_risk.toFixed(2)}
            <span className="ml-0.5 text-ink-500">×</span>
          </p>
        </div>
        <span className="inline-flex items-center gap-1 text-sm font-medium text-sage-700 transition-transform group-hover:translate-x-0.5">
          View
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}
