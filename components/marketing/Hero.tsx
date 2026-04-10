import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-ostella-50 via-white to-white">
      <div className="mx-auto max-w-5xl px-6 py-24 sm:py-32">
        <div className="flex flex-col items-start gap-8">
          <span className="inline-flex items-center rounded-full border border-ostella-200 bg-white px-3 py-1 text-xs font-medium uppercase tracking-wide text-ostella-700">
            Research prototype — NHS preventative-care pathway
          </span>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-ostella-900 sm:text-5xl">
            Osteoporosis is preventable.
            <br />
            <span className="text-ostella-600">
              By the time it&rsquo;s diagnosed, it usually isn&rsquo;t.
            </span>
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-ostella-800/80">
            Perimenopause is the 5&ndash;8 year window when bone density falls
            fastest. Ostella helps GPs find the women on their list who are
            quietly losing that bone &mdash; while there is still time to act.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="bg-ostella-600 text-white hover:bg-ostella-700">
              <Link href="/demo/gp">
                See the GP view
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-ostella-300 text-ostella-700 hover:bg-ostella-50">
              <Link href="/demo/patient">
                See the patient view
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
