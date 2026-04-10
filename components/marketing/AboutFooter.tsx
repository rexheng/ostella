export function AboutFooter() {
  return (
    <footer className="border-t border-ostella-100 bg-ostella-50 py-12">
      <div className="mx-auto max-w-4xl px-6">
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-ostella-700">
            About Ostella
          </p>
          <p className="text-sm leading-relaxed text-ostella-900/80">
            Ostella is an early-stage research prototype built for the NHS
            preventative-care pathway.{" "}
            <span className="font-medium text-ostella-900">
              Not for clinical use.
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
