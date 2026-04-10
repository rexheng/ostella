// app/demo/patient/refer/page.tsx
// Server component shell around the SelfReferralForm client component.

import { SelfReferralForm } from "@/components/SelfReferralForm";

export default function ReferPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <div className="pt-4">
        <p className="text-xs font-medium uppercase tracking-[0.15em] text-lavender-600">
          Request a conversation
        </p>
        <h1 className="mt-3 font-display text-5xl font-light leading-[1.05] tracking-tight text-ink-900">
          Book time with your GP
        </h1>
        <p className="mt-5 max-w-[55ch] text-lg leading-relaxed text-ink-500">
          A short, preventative appointment at Regent&rsquo;s Park Medical
          Centre. A clinician will follow up within two working days — this
          isn&rsquo;t an urgent-care route.
        </p>
      </div>
      <SelfReferralForm />
    </div>
  );
}
