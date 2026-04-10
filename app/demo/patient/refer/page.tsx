// app/demo/patient/refer/page.tsx
// Server component shell around the SelfReferralForm client component.

import { SelfReferralForm } from "@/components/SelfReferralForm";

export default function ReferPage() {
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Request an appointment
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Send a short message to Regent&apos;s Park Medical Centre to talk
          about bone health. A clinician will follow up within two working
          days.
        </p>
      </div>
      <SelfReferralForm />
    </div>
  );
}
