const STATS = [
  {
    value: "~6.4M",
    label:
      "UK women currently in the perimenopause window — the addressable cohort.",
    source: "ONS population estimates, 2023",
  },
  {
    value: "£4.4bn",
    label:
      "Annual NHS cost of conditions diagnosable years earlier in this cohort.",
    source: "RCP / NICE economic modelling",
  },
  {
    value: "< 1 in 3",
    label:
      "At-risk women receive any preventative screening before symptoms appear.",
    source: "Royal Osteoporosis Society audit, 2020",
  },
] as const;

export function StatCards() {
  return (
    <section className="bg-cream-50 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-xs font-medium uppercase tracking-[0.15em] text-lavender-600">
          The opportunity
        </p>
        <h2 className="mt-3 max-w-[20ch] font-display text-4xl font-light leading-[1.1] tracking-tight text-ink-900 md:text-5xl lg:text-6xl">
          A market the NHS has been told to fix.
        </h2>
        <p className="mt-4 max-w-[55ch] text-lg leading-relaxed text-ink-500 md:text-xl">
          The economics of preventative women&rsquo;s health are unusually
          clean. The cohort is large, the window is narrow, and the cost of
          missing it is well-documented.
        </p>
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {STATS.map((stat) => (
            <div key={stat.value} className="rounded-2xl bg-cream-100 p-10">
              <div className="font-display text-7xl font-light leading-none tracking-tight text-sage-700">
                {stat.value}
              </div>
              <p className="mt-4 max-w-[24ch] text-base leading-snug text-ink-700">
                {stat.label}
              </p>
              <p className="mt-5 text-xs italic text-ink-500">{stat.source}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
