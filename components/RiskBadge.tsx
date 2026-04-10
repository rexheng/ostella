// components/RiskBadge.tsx
import type { RiskTier } from "@/lib/types";
import { cn } from "@/lib/utils";

const STYLES: Record<RiskTier, string> = {
  low: "bg-clinical-low-bg text-sage-700 border-clinical-low-border",
  moderate: "bg-clinical-moderate-bg text-clinical-moderate border-clinical-moderate-border",
  high: "bg-clinical-high-bg text-clinical-high border-clinical-high-border",
};

const LABELS: Record<RiskTier, string> = {
  low: "Low",
  moderate: "Moderate",
  high: "High",
};

export function RiskBadge({
  tier,
  className,
}: {
  tier: RiskTier;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium tracking-wide",
        STYLES[tier],
        className
      )}
    >
      {LABELS[tier]}
    </span>
  );
}
