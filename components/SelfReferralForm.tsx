// components/SelfReferralForm.tsx
// Client component. Local-only form: no network call, no persistence.
// On submit, flips to a success Card. This is the demo's "patient
// requests an appointment" moment — sufficient for MVP storytelling.

"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const SYMPTOMS = [
  "Hot flushes",
  "Sleep disturbance",
  "Joint or muscle aches",
  "Unexpected weight change",
  "Mood changes",
  "Heavy or irregular periods",
] as const;

export function SelfReferralForm() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="rounded-2xl border border-cream-200 bg-cream-50 p-12 text-center">
        <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-sage-50 text-sage-700">
          <CheckCircle2 className="h-7 w-7" strokeWidth={1.5} />
        </div>
        <h2 className="mt-6 font-display text-3xl font-medium text-ink-900">
          Request received
        </h2>
        <p className="mx-auto mt-4 max-w-[42ch] text-[15px] leading-relaxed text-ink-500">
          Your request has been sent to Regent&rsquo;s Park Medical Centre. A
          member of the team will be in touch within two working days.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-cream-200 bg-cream-100 p-10">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
        }}
        className="space-y-8"
      >
        <div>
          <Label className="text-sm font-medium text-ink-700">
            Which of these are you experiencing?
          </Label>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {SYMPTOMS.map((s) => (
              <label
                key={s}
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-cream-200 bg-cream-50 px-4 py-3 text-[14px] text-ink-700 transition hover:border-sage-200"
              >
                <Checkbox className="border-cream-300 data-[state=checked]:bg-sage-600 data-[state=checked]:border-sage-600" />
                <span>{s}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <Label
            htmlFor="preferred"
            className="text-sm font-medium text-ink-700"
          >
            Preferred time
          </Label>
          <Input
            id="preferred"
            className="mt-3 rounded-xl border-cream-200 bg-cream-50 text-ink-900 placeholder:text-ink-500 focus-visible:border-sage-400 focus-visible:ring-sage-400"
            placeholder="e.g. Weekday mornings"
          />
        </div>
        <div>
          <Label
            htmlFor="message"
            className="text-sm font-medium text-ink-700"
          >
            Anything else you&rsquo;d like your GP to know?
          </Label>
          <Textarea
            id="message"
            rows={4}
            className="mt-3 rounded-xl border-cream-200 bg-cream-50 text-ink-900 placeholder:text-ink-500 focus-visible:border-sage-400 focus-visible:ring-sage-400"
            placeholder="Optional — a sentence or two is plenty."
          />
        </div>
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full bg-sage-600 px-7 py-3 text-[15px] font-medium text-cream-50 transition hover:-translate-y-0.5 hover:bg-sage-700 hover:shadow-sm"
          >
            Send request
            <span aria-hidden className="transition-transform">
              &rarr;
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
