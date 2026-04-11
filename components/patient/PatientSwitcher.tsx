// components/patient/PatientSwitcher.tsx
// Dropdown in the patient inbox top-bar that lets the presenter
// swap which patient the portal is rendering for. Lists every
// patient in the cohort with her risk tier. Clicking an entry
// hard-navigates to /demo/patient?as=<id>, which hits the server
// action that persists active_patient_id to the demo cookie.

"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown } from "lucide-react";
import type { RiskTier } from "@/lib/types";

export type SwitcherOption = {
  id: string;
  name: string;
  email: string;
  tier: RiskTier;
};

const TIER_STYLES: Record<RiskTier, string> = {
  high: "bg-clinical-high-bg text-clinical-high",
  moderate: "bg-clinical-moderate-bg text-clinical-moderate",
  low: "bg-clinical-low-bg text-sage-700",
};

const TIER_LABELS: Record<RiskTier, string> = {
  high: "High",
  moderate: "Moderate",
  low: "Low",
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function PatientSwitcher({
  current,
  options,
}: {
  current: SwitcherOption;
  options: SwitcherOption[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function select(id: string) {
    setOpen(false);
    if (id === current.id) return;
    router.push(`/demo/patient?as=${id}`);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2.5 rounded-full border border-[#e5e3dc] bg-cream-50 py-1 pl-1 pr-3 text-left transition hover:border-sage-300 hover:shadow-sm"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-lavender-100 text-[12px] font-semibold text-lavender-700 ring-1 ring-inset ring-lavender-200">
          {initials(current.name)}
        </span>
        <span className="hidden text-left sm:block">
          <span className="block text-[12px] font-medium leading-tight text-ink-900">
            {current.name}
          </span>
          <span className="block text-[10px] leading-tight text-ink-500">
            {current.email}
          </span>
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-ink-500 transition-transform ${
            open ? "rotate-180" : ""
          }`}
          strokeWidth={2}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 z-40 mt-2 w-[320px] overflow-hidden rounded-2xl border border-[#e5e3dc] bg-cream-50 shadow-[0_20px_50px_-20px_rgba(28,27,24,0.3)]"
        >
          <div className="border-b border-[#ecebe3] px-4 py-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-500">
              Viewing as
            </p>
            <p className="mt-0.5 text-[12px] text-ink-700">
              This is a demo — switch to any patient in the Regent&rsquo;s
              Park cohort.
            </p>
          </div>
          <ul className="max-h-[60vh] overflow-y-auto py-1">
            {options.map((o) => {
              const active = o.id === current.id;
              return (
                <li key={o.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => select(o.id)}
                    className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition ${
                      active ? "bg-lavender-50" : "hover:bg-[#f7f5ee]"
                    }`}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#efe9d9] text-[11px] font-semibold text-ink-700 ring-1 ring-inset ring-[#e5e3dc]">
                      {initials(o.name)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium text-ink-900">
                        {o.name}
                      </span>
                      <span className="block truncate text-[11px] text-ink-500">
                        {o.email}
                      </span>
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        TIER_STYLES[o.tier]
                      }`}
                    >
                      {TIER_LABELS[o.tier]}
                    </span>
                    {active && (
                      <Check
                        className="h-3.5 w-3.5 text-sage-700"
                        strokeWidth={2.5}
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
