import { Activity, ClipboardList, HeartPulse } from "lucide-react";

type Step = {
  icon: typeof Activity;
  title: string;
  body: string;
};

const STEPS: Step[] = [
  {
    icon: Activity,
    title: "We score every woman on the GP's list",
    body: "A transparent 14-feature model ranks the practice's perimenopausal and post-menopausal women by 10-year fragility-fracture risk, updated whenever the EHR changes.",
  },
  {
    icon: ClipboardList,
    title: "The GP reviews flagged cases and sends an invite",
    body: "Flagged patients surface in a triage dashboard with per-feature contributions and literature citations. The GP approves, edits, and sends each outbound message.",
  },
  {
    icon: HeartPulse,
    title: "The patient acts",
    body: "A low-friction patient portal lets her book a DEXA, self-refer for HRT review, or work through the bone-health education library &mdash; whichever is the right next step.",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 max-w-2xl">
          <span className="text-sm font-medium uppercase tracking-wide text-ostella-600">
            How it works
          </span>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ostella-900">
            Score. Review. Act.
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className="flex flex-col gap-4 rounded-lg border border-ostella-100 bg-ostella-50/30 p-6"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ostella-600 text-sm font-semibold text-white">
                    {i + 1}
                  </div>
                  <Icon className="h-5 w-5 text-ostella-700" />
                </div>
                <h3 className="text-lg font-semibold text-ostella-900">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-ostella-900/80">
                  {step.body}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
