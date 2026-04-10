// components/SelfReferralForm.tsx
// Client component. Local-only form: no network call, no persistence.
// On submit, flips to a success Card. This is the demo's "patient
// requests an appointment" moment — sufficient for MVP storytelling.

"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const SYMPTOMS = [
  "Hot flushes",
  "Sleep disturbance",
  "Bone or joint pain",
  "Unexpected weight change",
  "Mood changes",
  "Heavy or irregular periods",
] as const;

export function SelfReferralForm() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <Card className="border-emerald-200 bg-emerald-50 p-6 text-center">
        <h2 className="text-lg font-semibold text-emerald-900">
          Request received
        </h2>
        <p className="mt-2 text-sm text-emerald-800">
          Your request has been sent to Regent&apos;s Park Medical Centre. A
          member of the team will contact you within two working days.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
        }}
        className="space-y-5"
      >
        <div>
          <Label className="text-sm font-medium">
            Which of these are you experiencing?
          </Label>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {SYMPTOMS.map((s) => (
              <label
                key={s}
                className="flex cursor-pointer items-center gap-2 text-sm text-slate-700"
              >
                <Checkbox />
                <span>{s}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <Label htmlFor="preferred" className="text-sm font-medium">
            Preferred time
          </Label>
          <Input
            id="preferred"
            className="mt-2"
            placeholder="e.g. Weekday mornings"
          />
        </div>
        <div>
          <Label htmlFor="message" className="text-sm font-medium">
            Anything else to share?
          </Label>
          <Textarea
            id="message"
            rows={4}
            className="mt-2"
            placeholder="Optional"
          />
        </div>
        <div className="flex justify-end">
          <Button type="submit">Submit request</Button>
        </div>
      </form>
    </Card>
  );
}
