export function WhyPerimenopause() {
  return (
    <section className="bg-cream-50 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-lavender-600">
              Why the window matters
            </p>
            <h2 className="mt-3 font-display text-4xl font-light leading-[1.1] tracking-tight text-ink-900 md:text-5xl lg:text-6xl">
              A five-year window the NHS{" "}
              <span className="italic font-medium text-lavender-600">
                can&rsquo;t currently see
              </span>
              .
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-ink-700 md:text-xl">
              Perimenopause &mdash; roughly ages 42 to 55 &mdash; is when
              women&rsquo;s long-run health trajectories are set. The
              interventions that change them are cheap, behavioural, and
              well-understood. The problem is timing: by the time the symptoms
              force a conversation, the window has usually closed.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-ink-500 md:text-xl">
              Ostella is calibrated for exactly this cohort. It reads the
              clinical history a GP already has, scores it against a
              transparent model built on published evidence, and surfaces the
              minority of women who need a preventative conversation now.
            </p>
          </div>
          <div className="rounded-2xl bg-lavender-50 p-8 md:p-10">
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-lavender-700">
              Why this window, not later
            </p>
            <div className="mt-6 flex items-end gap-6">
              <div className="flex-1">
                <div className="font-display text-5xl font-light leading-none text-ink-900">
                  ~1&times;
                </div>
                <div className="mt-2 text-sm font-medium text-ink-500">
                  Pre
                </div>
              </div>
              <div className="flex-1">
                <div className="font-display text-5xl font-light leading-none text-lavender-600">
                  4&times;
                </div>
                <div className="mt-2 text-sm font-medium text-ink-500">
                  Peri
                </div>
              </div>
              <div className="flex-1">
                <div className="font-display text-5xl font-light leading-none text-ink-700">
                  2&times;
                </div>
                <div className="mt-2 text-sm font-medium text-ink-500">
                  Post
                </div>
              </div>
            </div>
            <p className="mt-5 text-sm leading-relaxed text-ink-700">
              Relative rate of change in core midlife health markers across the
              transition. Peri is when modifiable factors move fastest &mdash;
              and when most screening pathways aren&rsquo;t triggered yet.
            </p>
            <p className="mt-3 text-xs italic text-ink-500">
              Indicative, drawn from SWAN longitudinal cohort.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
