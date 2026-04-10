// app/demo/patient/education/page.tsx
// Server component. Six hand-authored articles on perimenopause and
// the midlife preventative window. Copy is evidence-informed (see
// docs/model-calibration.md for clinical grounding) but written for
// a lay reader. Card-level framing softens the bone-specific register;
// article bodies (future) can be more clinically explicit.

import {
  EducationCard,
  type EducationArticle,
} from "@/components/EducationCard";

const ARTICLES: EducationArticle[] = [
  {
    slug: "what-is-perimenopause",
    category: "Primer",
    title: "What is perimenopause, exactly?",
    lede: "The five-to-eight-year window before your final period, when hormones start to fluctuate and the body begins to change. It ends twelve months after your last period.",
    body: "",
  },
  {
    slug: "bone-loss-accelerates",
    category: "The science",
    title: "What actually happens in the years around your last period",
    lede: "As estrogen drops, the body's internal scaffolding quietly changes. Understanding the shift is the first step to working with it — and the most important years are the ones closest to your final period.",
    body: "",
  },
  {
    slug: "exercises-for-bones",
    category: "Movement",
    title: "Movement that protects your future self",
    lede: "Resistance training and impact-loading exercise — lifting, jumping, brisk walking — are the interventions with the strongest evidence for keeping midlife women strong and resilient for the decades ahead.",
    body: "",
  },
  {
    slug: "calcium-and-vitamin-d",
    category: "Nutrition",
    title: "Calcium, vitamin D, and what your body actually needs",
    lede: "Most women don't need pills. But a surprising number fall short of the 700mg of dietary calcium a day that supports healthy bone turnover. Food first, supplements only if food isn't enough.",
    body: "",
  },
  {
    slug: "talking-to-your-gp",
    category: "Conversation",
    title: "How to have this conversation with your GP",
    lede: "What to ask, what to expect, and when a DEXA scan is worth requesting. A short, practical script for the ten minutes you'll have in the room.",
    body: "",
  },
  {
    slug: "what-frax-measures",
    category: "Your profile",
    title: "What your risk score actually measures",
    lede: "Your score is built from well-studied clinical factors: age, BMI, family history, lifestyle, and menopausal stage. Here's what each one is, and why it matters.",
    body: "",
  },
];

export default function EducationLibraryPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-12">
      <div className="pt-4">
        <p className="text-xs font-medium uppercase tracking-[0.15em] text-lavender-600">
          The library
        </p>
        <h1 className="mt-3 font-display text-5xl font-light leading-[1.05] tracking-tight text-ink-900 md:text-6xl">
          Things worth knowing
        </h1>
        <p className="mt-5 max-w-[60ch] text-lg leading-relaxed text-ink-500">
          Six short reads on perimenopause, your midlife trajectory, and what
          you can do.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {ARTICLES.map((a) => (
          <EducationCard key={a.slug} article={a} />
        ))}
      </div>
    </div>
  );
}
