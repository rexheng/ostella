import { ShieldCheck } from "lucide-react";

export function ModelTransparency() {
  return (
    <section className="bg-ostella-50 py-20">
      <div className="mx-auto max-w-4xl px-6">
        <span className="text-sm font-medium uppercase tracking-wide text-ostella-600">
          The model is not a black box
        </span>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ostella-900">
          Every coefficient has a citation.
        </h2>

        <div className="mt-6 flex items-start gap-3 rounded-md border border-ostella-300 bg-white p-4">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-ostella-700" />
          <p className="text-sm font-medium text-ostella-900">
            Literature-verified weights &mdash; cohort calibration in progress.
          </p>
        </div>

        <div className="mt-6 space-y-4 text-base leading-relaxed text-ostella-900/90">
          <p>
            Ostella&rsquo;s risk score is a transparent linear model over 14
            features: age, BMI, parental hip fracture history, menopause
            stage, HRT exposure, smoking, alcohol, glucocorticoid use, prior
            fracture, and others. Each coefficient is a log-hazard ratio
            traced to a primary-source DOI &mdash; the clinical team has
            delivered the verified weights, and the risk engine can be
            audited feature by feature.
          </p>
          <p>
            Tier thresholds (low / moderate / high) have been calibrated
            against an 82-patient synthetic cohort so that the demo sort
            order is reproducible. Ongoing calibration work replaces the
            synthetic cohort with prospective real-patient data before any
            clinical pilot.
          </p>
          <p>
            <span className="font-medium text-ostella-700 underline decoration-ostella-300 decoration-dotted underline-offset-4">
              Read the methodology
            </span>{" "}
            <span className="text-sm text-ostella-700/70">
              (docs/model-calibration.md)
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
