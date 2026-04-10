const MARKS = [
  "NICE",
  "NHS England",
  "Royal Osteoporosis Society",
  "British Menopause Society",
  "FRAX",
  "NOGG Guidelines",
  "Faculty of Sexual & Reproductive Healthcare",
  "National Hip Fracture Database",
  "International Osteoporosis Foundation",
  "NHS North Central London ICB",
] as const;

export function StandardsMarquee() {
  return (
    <section className="border-y border-cream-200 bg-cream-50 py-12">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-center text-xs uppercase tracking-[0.15em] text-ink-500">
          Built against the NHS preventative-care ecosystem
        </p>
      </div>
      <div className="mask-fade-x mt-6 overflow-hidden">
        <div className="flex w-max animate-marquee items-center gap-10 whitespace-nowrap pr-10">
          {[...MARKS, ...MARKS].map((mark, i) => (
            <span
              key={`${mark}-${i}`}
              className="flex shrink-0 items-center gap-10"
            >
              <span className="font-display text-2xl font-medium tracking-tight text-ink-700/80">
                {mark}
              </span>
              <span className="text-2xl text-sage-500">&middot;</span>
            </span>
          ))}
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-6">
        <p className="mt-4 text-center text-xs italic text-ink-500">
          Names shown represent the standards, audit, and commissioning
          landscape Ostella is designed against. They do not constitute
          endorsements.
        </p>
      </div>
    </section>
  );
}
