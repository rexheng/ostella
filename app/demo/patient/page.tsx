// app/demo/patient/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { getPatient, getAllPatients } from "@/lib/patients";
import { scorePatient } from "@/lib/risk-model";
import { getDemoState, setDemoState } from "@/lib/demo-state";
import { RiskBadge } from "@/components/RiskBadge";
import { Card } from "@/components/ui/card";
import type { RiskTier } from "@/lib/types";

// Server Action: persist the ?as= selection and strip the query param.
// Server Actions are the only render-phase context in Next 14 where
// cookies().set() is permitted, so the page component delegates the
// cookie mutation to this function via a <form action>.
async function applyAs(formData: FormData) {
  "use server";
  const as = String(formData.get("as") ?? "");
  if (as && getPatient(as)) {
    setDemoState({ active_patient_id: as });
  }
  redirect("/demo/patient");
}

const RISK_EXPLANATIONS: Record<RiskTier, string> = {
  low: "Your current bone-health risk is assessed as low. The focus now is on the preventative habits — strength training, calcium-rich food, daylight — that keep it that way.",
  moderate:
    "You have a moderate risk profile. A few changes over the next year can meaningfully reduce your risk over the next decade.",
  high: "Your bone-health risk is assessed as high. Your GP has asked to talk with you soon — you'll see their message above if one has been sent.",
};

export default function PatientPortalHome({
  searchParams,
}: {
  searchParams: { as?: string };
}) {
  // If ?as= is set and resolves to a real patient, render an
  // auto-submitting form that invokes the applyAs server action.
  // Server Actions are the only render-phase context in Next 14 where
  // cookies().set() is permitted. The action sets the cookie and
  // redirects to /demo/patient (stripping the query param). No-JS
  // fallback: the same form renders a visible "Continue" button.
  if (searchParams.as && getPatient(searchParams.as)) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <form id="ostella-apply-as" action={applyAs}>
          <input type="hidden" name="as" value={searchParams.as} />
          <p className="text-sm text-slate-500">Loading patient portal…</p>
          <noscript>
            <button
              type="submit"
              className="mt-4 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
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
  // If the cookie points at a patient that no longer exists (e.g. after
  // regenerating the cohort), fall back to Sarah Chen explicitly rather
  // than silently showing whoever happens to be index 0.
  const patient =
    getPatient(state.active_patient_id) ??
    getPatient("p-001") ??
    getAllPatients()[0];
  const scored = scorePatient(patient);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-slate-500">Hello,</p>
        <h1 className="text-2xl font-semibold tracking-tight">{patient.name}</h1>
      </div>

      {patient.latest_alert && (
        <Card className="border-rose-200 bg-rose-50 p-6">
          <p className="text-xs font-medium uppercase tracking-wide text-rose-700">
            Message from your GP ·{" "}
            {new Date(patient.latest_alert.sent_at).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          <p className="mt-1 text-sm font-medium text-rose-900">
            {patient.latest_alert.sent_by}
          </p>
          <pre className="mt-4 whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-800">
            {patient.latest_alert.message}
          </pre>
        </Card>
      )}

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Your bone-health risk</h2>
          <RiskBadge tier={scored.tier} className="px-3 py-1 text-sm" />
        </div>
        <p className="mt-2 text-sm text-slate-700">
          {RISK_EXPLANATIONS[scored.tier]}
        </p>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <ActionCard
          title="Book an appointment"
          body="Speak to your GP about next steps, including the option of a bone density scan."
          cta="Request appointment"
          href="/demo/patient/refer"
        />
        <ActionCard
          title="Lifestyle changes"
          body="Small, high-leverage changes to diet, exercise, and daily habits that protect bone density."
          cta="Read the guide"
          href="/demo/patient/education"
        />
        <ActionCard
          title="Learn more"
          body="A short library of evidence-based articles on perimenopause and bone health."
          cta="Open library"
          href="/demo/patient/education"
        />
      </div>
    </div>
  );
}

function ActionCard({
  title,
  body,
  cta,
  href,
}: {
  title: string;
  body: string;
  cta: string;
  href: string;
}) {
  return (
    <Card className="flex flex-col p-5">
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-2 flex-1 text-sm text-slate-600">{body}</p>
      <Link
        href={href}
        className="mt-4 text-sm font-medium text-slate-900 hover:underline"
      >
        {cta} →
      </Link>
    </Card>
  );
}
