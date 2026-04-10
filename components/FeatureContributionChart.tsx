// components/FeatureContributionChart.tsx
"use client";

import type { EvidenceFlag, RiskContribution } from "@/lib/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const FLAG_STYLES: Record<EvidenceFlag, string> = {
  CONTESTED: "bg-clinical-moderate-bg text-clinical-moderate border-clinical-moderate-border",
  OLD_UNREPLICATED:
    "bg-clinical-moderate-bg text-clinical-moderate border-clinical-moderate-border",
  UK_EXTRAPOLATED: "bg-cream-100 text-ink-700 border-cream-200",
  DERIVED: "bg-lavender-50 text-lavender-700 border-lavender-200",
};

export function FeatureContributionChart({
  contributions,
}: {
  contributions: RiskContribution[];
}) {
  if (contributions.length === 0) {
    return (
      <p className="text-sm text-ink-500">
        No contributing features — patient matches the reference profile.
      </p>
    );
  }
  const maxAbs = Math.max(...contributions.map((c) => Math.abs(c.contribution)));
  return (
    <TooltipProvider delayDuration={120}>
      <div className="mt-6 flex flex-col gap-3">
        {contributions.map((c) => {
          const widthPct = (Math.abs(c.contribution) / maxAbs) * 50; // up to 50% of track
          const isPositive = c.contribution > 0;
          return (
            <Tooltip key={c.feature_key}>
              <TooltipTrigger asChild>
                <div
                  className="group grid cursor-default items-center gap-4 rounded-lg px-2 py-1 transition-colors hover:bg-cream-100"
                  style={{ gridTemplateColumns: "200px 1fr 80px" }}
                >
                  <div className="truncate pr-1 text-right text-sm text-ink-700">
                    {c.feature_label}
                  </div>
                  <div className="relative h-7">
                    <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-cream-200" />
                    <div
                      className={`absolute top-0 h-full rounded-md transition-opacity group-hover:opacity-90 ${
                        isPositive
                          ? "left-1/2 bg-clinical-high/75"
                          : "right-1/2 bg-sage-500/75"
                      }`}
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                  <div
                    className={`pl-2 text-right font-display text-sm ${
                      isPositive ? "text-clinical-high" : "text-sage-700"
                    }`}
                  >
                    {isPositive ? "+" : ""}
                    {c.contribution.toFixed(3)}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                align="center"
                className="max-w-sm border-cream-200 bg-cream-50 p-4 text-ink-700 shadow-lg"
              >
                <div className="space-y-2 text-xs">
                  <p className="font-display text-sm font-medium text-ink-900">
                    {c.feature_label}
                  </p>
                  <p className="text-ink-700">
                    HR{" "}
                    <span className="font-display text-ink-900">{c.hazard_ratio}</span>
                    {c.ci95 && (
                      <span className="text-ink-500">
                        {" "}
                        (95% CI {c.ci95[0]}–{c.ci95[1]})
                      </span>
                    )}
                  </p>
                  <p className="text-ink-700">
                    β = log(HR) ={" "}
                    <span className="font-display text-ink-900">
                      {c.beta.toFixed(3)}
                    </span>
                  </p>
                  <p className="text-ink-700">
                    Patient value:{" "}
                    <span className="font-medium text-ink-900">
                      {String(c.patient_value)}
                    </span>
                  </p>
                  {c.flags && c.flags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {c.flags.map((f) => (
                        <span
                          key={f}
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium tracking-wide ${
                            FLAG_STYLES[f] ?? "bg-cream-100 text-ink-700 border-cream-200"
                          }`}
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  )}
                  {c.population && (
                    <p className="text-ink-500">
                      <span className="font-medium text-ink-700">Cohort:</span>{" "}
                      {c.population}
                    </p>
                  )}
                  <p className="pt-1 text-[11px] italic text-ink-500">{c.citation}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
