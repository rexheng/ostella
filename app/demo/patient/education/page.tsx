// app/demo/patient/education/page.tsx
// Server component. Six hand-authored articles on perimenopause and
// bone health. Copy is evidence-informed (see docs/model-calibration.md
// for clinical grounding) but written for a lay reader.

import { EducationCard, type EducationArticle } from "@/components/EducationCard";

const ARTICLES: EducationArticle[] = [
  {
    slug: "what-is-perimenopause",
    title: "What is perimenopause, exactly?",
    lede: "The five-to-eight-year window before your final period, when hormones start to fluctuate and the body begins to change. It ends twelve months after your last period.",
    body: "",
  },
  {
    slug: "bone-loss-accelerates",
    title: "Why bone loss accelerates around menopause",
    lede: "As estrogen drops, bone density can fall by up to 2% per year — faster than at any other time in adult life. Most of the loss happens in the years immediately around your final period.",
    body: "",
  },
  {
    slug: "exercises-for-bones",
    title: "Exercises that actually protect bone density",
    lede: "Resistance training and impact-loading exercise — lifting weights, jumping, brisk walking — are the interventions with the strongest evidence for preserving and rebuilding bone in midlife women.",
    body: "",
  },
  {
    slug: "calcium-and-vitamin-d",
    title: "Calcium, vitamin D, and what your body actually needs",
    lede: "Most women don't need pills. But a surprising number fall short of the 700mg of dietary calcium a day that supports healthy bone turnover. Food first, supplements only if food isn't enough.",
    body: "",
  },
  {
    slug: "talking-to-your-gp",
    title: "How to have the bone-health conversation with your GP",
    lede: "What to ask, what to expect, and when a DEXA bone density scan is worth requesting. A short, practical script for the ten minutes you'll have in the room.",
    body: "",
  },
  {
    slug: "what-frax-measures",
    title: "What your risk score actually measures",
    lede: "Your score is built from well-studied clinical factors: age, BMI, family history, lifestyle, and menopausal stage. Here's what each one is, and why it matters for bones.",
    body: "",
  },
];

export default function EducationLibraryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Education library
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Six short reads on perimenopause, bone health, and the things you
          can actually do about it.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {ARTICLES.map((a) => (
          <EducationCard key={a.slug} article={a} />
        ))}
      </div>
    </div>
  );
}
