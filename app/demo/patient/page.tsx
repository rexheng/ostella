// app/demo/patient/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { Calendar, Heart, BookOpen, ArrowRight } from "lucide-react";
import { getPatient, getAllPatients } from "@/lib/patients";
import { scorePatient } from "@/lib/risk-model";
import { getDemoState, setDemoState } from "@/lib/demo-state";
import { RiskBadge } from "@/components/RiskBadge";
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

// Plain-language, vague/non-bone framing per copy guidance.
// One short paragraph per tier, tuned to the "your midlife health" register.
const RISK_EXPLANATIONS: Record<RiskTier, string> = {
  low: "Things look steady for now. The most useful thing you can do from here is keep the preventative habits in your life — movement, nourishing food, daylight, rest — quietly doing their work.",
  moderate:
    "A few things in your record put you in a middle group. Nothing urgent, but the next year or two is a window where small, deliberate changes tend to pay off over the decade that follows.",
  high: "Based on your history, we've asked your GP to have a preventative conversation with you. A few factors in your record put you in a slightly elevated group — nothing alarming, but worth acting on now rather than later.",
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
  // If the cookie points at a patient that no longer exists (e.g. after
  // regenerating the cohort), fall back to Sarah Chen explicitly rather
  // than silently showing whoever happens to be index 0.
  const patient =
    getPatient(state.active_patient_id) ??
    getPatient("p-001") ??
    getAllPatients()[0];
  const scored = scorePatient(patient);
  const firstName = patient.name.split(" ")[0];

  return (
    <div className="mx-auto max-w-5xl space-y-12">
      {/* Greeting */}
      <div className="pt-4">
        <p className="font-display text-3xl font-light text-ink-500">
          Hello,
        </p>
        <h1 className="font-display text-6xl font-light leading-[1.05] tracking-tight text-ink-900">
          {firstName}.
        </h1>
      </div>

      {/* Pre-baked alert from GP */}
      {patient.latest_alert && (
        <section className="rounded-2xl border border-cream-200 border-t-4 border-t-lavender-400 bg-cream-100 p-8">
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-lavender-700">
            A message from your GP ·{" "}
            {new Date(patient.latest_alert.sent_at).toLocaleDateString(
              "en-GB",
              {
                day: "numeric",
                month: "long",
                year: "numeric",
              },
            )}
          </p>
          <p className="mt-3 font-display text-2xl font-medium text-ink-900">
            {patient.latest_alert.sent_by}
          </p>
          <pre className="mt-5 whitespace-pre-wrap font-sans text-[15px] leading-relaxed text-ink-700">
            {patient.latest_alert.message}
          </pre>
        </section>
      )}

      {/* Risk summary */}
      <section className="rounded-2xl border border-cream-200 bg-cream-100 p-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-lavender-600">
              Where you stand
            </p>
            <h2 className="mt-2 font-display text-3xl font-light text-ink-900">
              Your health profile
            </h2>
          </div>
          <RiskBadge tier={scored.tier} className="shrink-0 px-4 py-1.5" />
        </div>
        <p className="mt-5 max-w-[60ch] text-[15px] leading-relaxed text-ink-700">
          {RISK_EXPLANATIONS[scored.tier]}
        </p>
      </section>

      {/* Action cards */}
      <section>
        <p className="text-xs font-medium uppercase tracking-[0.15em] text-lavender-600">
          What you can do
        </p>
        <h2 className="mt-2 font-display text-3xl font-light text-ink-900">
          A few gentle next steps
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <ActionCard
            icon={<Calendar className="h-5 w-5" strokeWidth={1.5} />}
            eyebrow="Talk to a clinician"
            title="Book a conversation"
            body="Request a short, preventative appointment with your GP — a conversation, not a crisis visit."
            href="/demo/patient/refer"
          />
          <ActionCard
            icon={<Heart className="h-5 w-5" strokeWidth={1.5} />}
            eyebrow="Lifestyle"
            title="Small changes, big effect"
            body="The handful of daily habits that quietly add up over the years — movement, food, light, rest."
            href="/demo/patient/education"
          />
          <ActionCard
            icon={<BookOpen className="h-5 w-5" strokeWidth={1.5} />}
            eyebrow="Learn"
            title="Understand your profile"
            body="Short, plain-language reads on perimenopause and what your preventative window actually means."
            href="/demo/patient/education"
          />
        </div>
      </section>
    </div>
  );
}

function ActionCard({
  icon,
  eyebrow,
  title,
  body,
  href,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  body: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group flex h-full flex-col rounded-2xl border border-cream-200 bg-cream-100 p-8 transition hover:-translate-y-0.5 hover:border-sage-200 hover:shadow-sm"
    >
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-sage-50 text-sage-700">
        {icon}
      </span>
      <p className="mt-6 text-xs font-medium uppercase tracking-[0.15em] text-lavender-600">
        {eyebrow}
      </p>
      <h3 className="mt-2 font-display text-2xl font-medium leading-snug text-ink-900">
        {title}
      </h3>
      <p className="mt-3 flex-1 text-[15px] leading-relaxed text-ink-500">
        {body}
      </p>
      <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-sage-700">
        Open
        <ArrowRight
          className="h-4 w-4 transition-transform group-hover:translate-x-1"
          strokeWidth={1.75}
        />
      </span>
    </Link>
  );
}
