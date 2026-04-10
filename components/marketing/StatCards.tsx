import { Card, CardContent } from "@/components/ui/card";

type Stat = {
  headline: string;
  label: string;
  source: string;
};

const STATS: Stat[] = [
  {
    headline: "1 in 2",
    label:
      "UK women over 50 will break a bone because of osteoporosis in their lifetime.",
    source: "International Osteoporosis Foundation, 2024",
  },
  {
    headline: "1 in 16",
    label:
      "People admitted with a hip fracture die within 30 days of admission.",
    source: "National Hip Fracture Database, 2019",
  },
  {
    headline: "< 1 in 3",
    label:
      "At-risk women receive a DEXA scan before their first fragility fracture.",
    source: "Royal Osteoporosis Society primary-care audit, 2020",
  },
];

export function StatCards() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-10 max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight text-ostella-900">
            The scale of the gap
          </h2>
          <p className="mt-3 text-base text-ostella-800/70">
            Three numbers the current pathway cannot argue with.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {STATS.map((stat) => (
            <Card
              key={stat.headline}
              className="border-ostella-100 bg-ostella-50/40 shadow-none"
            >
              <CardContent className="flex h-full flex-col gap-4 p-8 pt-8">
                <p className="text-5xl font-semibold tracking-tight text-ostella-700">
                  {stat.headline}
                </p>
                <p className="text-base leading-relaxed text-ostella-900">
                  {stat.label}
                </p>
                <p className="mt-auto pt-4 text-xs italic text-ostella-700/70">
                  Source: {stat.source}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
