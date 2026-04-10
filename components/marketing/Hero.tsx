import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-cream-50 to-cream-100">
      <div className="mx-auto max-w-6xl px-6 py-32">
        <span className="mb-6 inline-flex items-center rounded-full border border-sage-200 bg-sage-50 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.12em] text-sage-700">
          Preventative care · Built for the NHS
        </span>
        <h1 className="mb-6 max-w-[18ch] font-display text-5xl font-light leading-[1.05] tracking-tight text-ink-900 md:text-6xl lg:text-7xl">
          The most preventable
          <br />
          women&rsquo;s health crisis,{" "}
          <span className="italic font-medium text-lavender-600">
            caught while it still is.
          </span>
        </h1>
        <p className="mb-10 max-w-[55ch] text-lg leading-relaxed text-ink-500 md:text-xl">
          Ostella helps NHS GPs identify the women in their practice quietly
          walking into a preventable decade &mdash; and routes them into a
          preventative pathway the system already has, but rarely uses in time.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/demo/gp"
            className="group inline-flex items-center gap-2 rounded-full bg-sage-600 px-7 py-3.5 text-[15px] font-medium text-cream-50 transition hover:-translate-y-0.5 hover:bg-sage-700 hover:shadow-lg"
          >
            See the GP view
            <span
              aria-hidden
              className="transition-transform group-hover:translate-x-1"
            >
              &rarr;
            </span>
          </Link>
          <Link
            href="/demo/patient"
            className="group inline-flex items-center gap-2 rounded-full border border-sage-300 bg-transparent px-7 py-3.5 text-[15px] font-medium text-sage-700 transition hover:bg-sage-50"
          >
            See the patient view
            <span
              aria-hidden
              className="transition-transform group-hover:translate-x-1"
            >
              &rarr;
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
