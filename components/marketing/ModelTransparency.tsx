const CONTRIBUTIONS = [
  { label: "Parent hip fracture", value: "+0.432", width: "36%" },
  { label: "Current smoker", value: "+0.223", width: "19%" },
  { label: "BMI < 20", value: "+0.247", width: "21%" },
  { label: "Late perimenopausal", value: "+0.039", width: "3%" },
  { label: "Low dietary calcium", value: "+0.049", width: "4%" },
] as const;

export function ModelTransparency() {
  return (
    <section className="bg-cream-50 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-xs font-medium uppercase tracking-[0.15em] text-lavender-600">
          Not a black box
        </p>
        <h2 className="mt-3 max-w-[24ch] font-display text-4xl font-light leading-[1.1] tracking-tight text-ink-900 md:text-5xl lg:text-6xl">
          A model a clinician can audit in ten minutes.
        </h2>
        <p className="mt-4 max-w-[60ch] text-lg leading-relaxed text-ink-500 md:text-xl">
          Every weight traces to a primary-source paper. Every contribution is
          visible per patient. No neural network, no LLM &mdash; a transparent
          linear model, delivered by clinicians, verifiable by anyone.
        </p>

        <div className="mt-12 overflow-hidden rounded-2xl border border-cream-200 bg-white shadow-sm">
          <div className="flex items-start justify-between gap-6 border-b border-cream-200 px-8 py-7">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.15em] text-ink-500">
                Risk model contributions
              </p>
              <p className="mt-3 font-display text-3xl font-medium leading-tight text-ink-900">
                Sarah Chen
              </p>
              <p className="mt-1 text-sm text-ink-500">
                Relative risk{" "}
                <span className="font-display font-medium text-ink-900">
                  2.58&times;
                </span>{" "}
                vs reference woman.
              </p>
            </div>
            <span className="inline-flex items-center rounded-full border border-lavender-200 bg-lavender-50 px-3 py-1 text-xs font-medium text-lavender-700">
              Literature-verified weights
            </span>
          </div>

          <div className="space-y-3 px-8 py-7">
            {CONTRIBUTIONS.map((row) => (
              <div
                key={row.label}
                className="grid grid-cols-[180px_1fr_72px] items-center gap-4 text-sm"
              >
                <div className="text-right text-ink-700">{row.label}</div>
                <div className="relative h-6">
                  <div className="absolute inset-y-0 left-1/2 w-px bg-cream-200" />
                  <div
                    className="absolute inset-y-0 left-1/2 rounded-md bg-clinical-high/75"
                    style={{ width: row.width }}
                  />
                </div>
                <div className="text-right font-display text-sm text-clinical-high">
                  {row.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
