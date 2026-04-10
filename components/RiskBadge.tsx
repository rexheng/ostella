// components/RiskBadge.tsx
import type { RiskTier } from "@/lib/types";
import { cn } from "@/lib/utils";

const STYLES: Record<RiskTier, string> = {
  low: "bg-emerald-50 text-emerald-700 border-emerald-200",
  moderate: "bg-amber-50 text-amber-800 border-amber-200",
  high: "bg-rose-50 text-rose-700 border-rose-200",
};

const LABELS: Record<RiskTier, string> = {
  low: "Low",
  moderate: "Moderate",
  high: "High",
};

export function RiskBadge({ tier, className }: { tier: RiskTier; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        STYLES[tier],
        className
      )}
    >
      {LABELS[tier]}
    </span>
  );
}
