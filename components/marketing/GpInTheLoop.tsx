export function GpInTheLoop() {
  return (
    <section className="bg-cream-50 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 items-start gap-12 md:grid-cols-[1fr_1.4fr]">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-lavender-600">
              Clinician-in-the-loop
            </p>
            <h2 className="mt-3 font-display text-4xl font-light leading-[1.1] tracking-tight text-ink-900 md:text-5xl">
              An assistant,{" "}
              <span className="italic font-medium text-lavender-600">
                not an autopilot
              </span>
              .
            </h2>
          </div>
          <div className="space-y-6">
            <p className="font-display text-2xl font-light leading-snug text-ink-900 md:text-3xl">
              Ostella never contacts a patient without a clinician&rsquo;s
              review.
            </p>
            <p className="text-lg leading-relaxed text-ink-700">
              Every outbound message is composed, edited, and sent by a named
              GP. The tool is an assistant, not an autopilot.
            </p>
            <p className="text-base leading-relaxed text-ink-500">
              The GP dashboard surfaces flagged patients and drafts an invite.
              The GP reads it, rewrites anything they want to change, and
              presses send. No auto-send queue. No background mail-merge. No
              patient ever hears from Ostella directly.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
