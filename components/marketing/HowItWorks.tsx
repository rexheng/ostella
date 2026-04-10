const STEPS = [
  {
    num: "01",
    title: "Score the cohort",
    body: "Every woman on a GP's list is scored against a transparent linear model built on published clinical evidence.",
  },
  {
    num: "02",
    title: "Clinician reviews",
    body: "A named GP sees the model's reasoning per patient and decides whether to initiate a preventative conversation.",
  },
  {
    num: "03",
    title: "Patient acts",
    body: "Books an appointment, reads the education library, or self-refers — from a portal designed for trust, not engagement metrics.",
  },
] as const;

export function HowItWorks() {
  return (
    <section className="bg-cream-100 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-xs font-medium uppercase tracking-[0.15em] text-lavender-600">
          How it works
        </p>
        <h2 className="mt-3 max-w-[20ch] font-display text-4xl font-light leading-[1.1] tracking-tight text-ink-900 md:text-5xl lg:text-6xl">
          Three steps from screening to action.
        </h2>
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.num} className="rounded-2xl bg-cream-50 p-8">
              <div className="font-display text-6xl font-light leading-none text-lavender-500">
                {step.num}
              </div>
              <h3 className="mt-4 text-2xl font-medium tracking-tight text-ink-900">
                {step.title}
              </h3>
              <p className="mt-3 text-base leading-relaxed text-ink-500">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
