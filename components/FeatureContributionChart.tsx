// components/FeatureContributionChart.tsx
"use client";

import type { RiskContribution } from "@/lib/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function FeatureContributionChart({
  contributions,
}: {
  contributions: RiskContribution[];
}) {
  if (contributions.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        No contributing features — patient matches the reference profile.
      </p>
    );
  }
  const maxAbs = Math.max(...contributions.map((c) => Math.abs(c.contribution)));
  return (
    <TooltipProvider>
      <div className="space-y-2">
        {contributions.map((c) => {
          const widthPct = (Math.abs(c.contribution) / maxAbs) * 50; // up to 50% of row
          const isPositive = c.contribution > 0;
          return (
            <Tooltip key={c.feature_key}>
              <TooltipTrigger asChild>
                <div className="group flex items-center text-sm">
                  <div className="w-48 shrink-0 truncate pr-3 text-right text-slate-700">
                    {c.feature_label}
                  </div>
                  <div className="relative h-6 flex-1">
                    <div className="absolute left-1/2 top-0 h-full w-px bg-slate-300" />
                    <div
                      className={`absolute top-0 h-full rounded ${
                        isPositive
                          ? "left-1/2 bg-rose-400/70"
                          : "right-1/2 bg-emerald-400/70"
                      }`}
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                  <div className="w-20 pl-3 text-right font-mono text-xs text-slate-600">
                    {c.contribution > 0 ? "+" : ""}
                    {c.contribution.toFixed(3)}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-sm">
                <div className="space-y-1.5 text-xs">
                  <p className="font-semibold">{c.feature_label}</p>
                  <p>
                    HR <span className="font-mono">{c.hazard_ratio}</span>
                    {c.ci95 && (
                      <span className="text-slate-500">
                        {" "}
                        (95% CI {c.ci95[0]}–{c.ci95[1]})
                      </span>
                    )}
                  </p>
                  <p>
                    β = log(HR) ={" "}
                    <span className="font-mono">{c.beta.toFixed(3)}</span>
                  </p>
                  <p>
                    Patient value:{" "}
                    <span className="font-mono">{String(c.patient_value)}</span>
                  </p>
                  {c.flags && c.flags.length > 0 && (
                    <p className="flex flex-wrap gap-1 pt-0.5">
                      {c.flags.map((f) => (
                        <span
                          key={f}
                          className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-800"
                        >
                          {f}
                        </span>
                      ))}
                    </p>
                  )}
                  {c.population && (
                    <p className="text-slate-600">
                      <span className="font-medium">Cohort:</span> {c.population}
                    </p>
                  )}
                  <p className="pt-1 italic text-slate-500">{c.citation}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
