const COLUMNS = [
  {
    title: "Product",
    items: ["GP worklist", "Patient portal", "Transparent model"],
  },
  {
    title: "Evidence",
    items: ["Methodology", "Model weights", "Calibration notes"],
  },
  {
    title: "About",
    items: ["Research prototype", "LSE 2026", "Contact"],
  },
] as const;

export function AboutFooter() {
  return (
    <footer className="bg-ink-900 px-6 py-20 text-cream-100">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <div className="font-display text-4xl font-medium tracking-tight text-cream-50">
              Ostella
            </div>
            <p className="mt-4 max-w-[40ch] text-sm leading-relaxed text-cream-200">
              Preventative women&rsquo;s health, inside the NHS primary-care
              workflow. Built for the window that closes too quickly.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="text-xs font-medium uppercase tracking-[0.15em] text-cream-300">
                {col.title}
              </p>
              <ul className="mt-4 space-y-2.5 text-sm text-cream-200">
                {col.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-14 flex flex-col justify-between gap-3 border-t border-white/10 pt-6 text-xs text-cream-300 sm:flex-row">
          <span>
            Ostella &middot; An early-stage research prototype. Not for
            clinical use.
          </span>
          <span>v0.1.0 &middot; 2026</span>
        </div>
      </div>
    </footer>
  );
}
