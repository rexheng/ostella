import { Stethoscope } from "lucide-react";

export function GpInTheLoop() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-4xl px-6">
        <span className="text-sm font-medium uppercase tracking-wide text-ostella-600">
          The GP remains in the loop
        </span>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ostella-900">
          No message leaves without a named clinician behind it.
        </h2>

        <div className="mt-8 flex flex-col gap-5 rounded-lg border border-ostella-200 bg-ostella-50/50 p-8 sm:flex-row sm:items-start">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ostella-600 text-white">
            <Stethoscope className="h-6 w-6" />
          </div>
          <div className="space-y-4 text-base leading-relaxed text-ostella-900">
            <p className="text-lg font-medium text-ostella-900">
              Ostella never contacts a patient without a clinician&rsquo;s
              review.
            </p>
            <p>
              Every outbound message is composed, edited, and sent by a named
              GP. The tool is an assistant, not an autopilot.
            </p>
            <p className="text-sm text-ostella-900/80">
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
