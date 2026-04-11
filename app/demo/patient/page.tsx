// app/demo/patient/page.tsx
// Server component. Resolves the active patient (Sarah Chen by
// default, or ?as=<id> via a Server Action), scores her, builds
// the Gmail-style inbox data, and hands it to <PatientInbox>.
//
// The inbox is where every patient-side surface now lives: the GP
// alert, the risk profile, the education digest, and the self-
// referral form all appear as "messages" in the reading pane.
// This replaces the earlier hero-cards layout while preserving
// the demo flow described in the spec §12.

import { redirect } from "next/navigation";
import { getPatient, getAllPatients } from "@/lib/patients";
import { scorePatient } from "@/lib/risk-model";
import { setDemoState, getDemoState } from "@/lib/demo-state";
import { buildPatientInbox } from "@/lib/patient-inbox";
import { PatientInbox } from "@/components/patient/PatientInbox";
import type { SwitcherOption } from "@/components/patient/PatientSwitcher";

async function applyAs(formData: FormData) {
  "use server";
  const as = String(formData.get("as") ?? "");
  if (as && getPatient(as)) {
    setDemoState({ active_patient_id: as });
  }
  redirect("/demo/patient");
}

export default function PatientPortalHome({
  searchParams,
}: {
  searchParams: { as?: string };
}) {
  // If ?as= is set and resolves to a real patient, persist via a
  // Server Action. Server Actions are the only render-phase context
  // in Next 14 where cookies().set() is permitted.
  if (searchParams.as && getPatient(searchParams.as)) {
    return (
      <div className="mx-auto max-w-md py-24 text-center">
        <form id="ostella-apply-as" action={applyAs}>
          <input type="hidden" name="as" value={searchParams.as} />
          <p className="text-sm text-ink-500">Loading patient portal…</p>
          <noscript>
            <button
              type="submit"
              className="mt-6 rounded-full bg-sage-600 px-6 py-3 text-sm font-medium text-cream-50 transition hover:bg-sage-700"
            >
              Continue
            </button>
          </noscript>
        </form>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "document.getElementById('ostella-apply-as').requestSubmit();",
          }}
        />
      </div>
    );
  }

  const state = getDemoState();
  const patient =
    getPatient(state.active_patient_id) ??
    getPatient("p-001") ??
    getAllPatients()[0];
  const scored = scorePatient(patient);
  const messages = buildPatientInbox(scored);

  // Score every patient once for the switcher dropdown. Scoring is
  // pure arithmetic and the cohort is small (~14 patients), so this
  // is microseconds and keeps the switcher self-contained.
  const switcherOptions: SwitcherOption[] = getAllPatients().map((p) => {
    const s = scorePatient(p);
    return {
      id: p.id,
      name: p.name,
      email: p.contact.email,
      tier: s.tier,
    };
  });

  return (
    <PatientInbox
      scored={scored}
      messages={messages}
      switcherOptions={switcherOptions}
    />
  );
}
