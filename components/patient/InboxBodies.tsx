// components/patient/InboxBodies.tsx
// Rich "body" components for each InboxMessage bodyKind. These are
// rendered inside the EmailRenderer's richBody slot, so they sit in
// place of a plain-text email body. Keeping them co-located so the
// reading pane can switch on bodyKind in one place.

"use client";

import Link from "next/link";
import { ArrowRight, Calendar, Sparkles } from "lucide-react";
import type { ScoredPatient } from "@/lib/types";
import { RiskBadge } from "@/components/RiskBadge";
import { EducationCard, type EducationArticle } from "@/components/EducationCard";
import { SelfReferralForm } from "@/components/SelfReferralForm";

const RISK_EXPLANATIONS: Record<
  ScoredPatient["tier"],
  { headline: string; body: string }
> = {
  low: {
    headline: "Things look steady for now.",
    body: "The most useful thing you can do from here is keep the preventative habits in your life — movement, nourishing food, daylight, rest — quietly doing their work. We'll check in again in twelve months.",
  },
  moderate: {
    headline: "A few things put you in a middle group.",
    body: "Nothing urgent, but the next year or two is a window where small, deliberate changes tend to pay off over the decade that follows. Your GP will reach out if anything needs closer attention.",
  },
  high: {
    headline: "A few factors put you in a slightly elevated group.",
    body: "Nothing alarming — but worth acting on now rather than later. Your GP has already been in touch to invite you to a short, preventative conversation. The actions below are where to start.",
  },
};

export function RiskProfileBody({ scored }: { scored: ScoredPatient }) {
  const tier = scored.tier;
  const copy = RISK_EXPLANATIONS[tier];
  // Top 3 contributing factors (descending absolute contribution).
  const top = [...scored.contributions]
    .filter((c) => c.direction !== "neutral")
    .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution))
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <p className="text-[15px] leading-[1.75] text-ink-700">
        Hi {scored.patient.name.split(" ")[0]}, your preventative health
        profile is ready to view. This isn&rsquo;t a diagnosis — it&rsquo;s a
        one-page snapshot of how your current record compares to other women
        in your age group, and what&rsquo;s worth paying attention to.
      </p>

      {/* The inline card that summarises where they stand */}
      <div className="rounded-xl border border-cream-200 bg-[#fbf9f2] p-6">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-lavender-600">
              Where you stand
            </p>
            <h3 className="mt-1.5 font-display text-[22px] font-medium leading-tight text-ink-900">
              {copy.headline}
            </h3>
          </div>
          <RiskBadge tier={tier} className="shrink-0 px-3 py-1" />
        </div>
        <p className="mt-4 text-[14px] leading-relaxed text-ink-700">
          {copy.body}
        </p>

        {top.length > 0 && (
          <div className="mt-5 border-t border-cream-200 pt-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-ink-500">
              The factors doing the most work
            </p>
            <ul className="mt-3 space-y-2">
              {top.map((c) => (
                <li
                  key={c.feature_key}
                  className="flex items-start gap-3 text-[13px] leading-relaxed text-ink-700"
                >
                  <span
                    className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                      c.direction === "increases_risk"
                        ? "bg-clinical-high"
                        : "bg-sage-500"
                    }`}
                  />
                  <span>
                    <span className="font-medium text-ink-900">
                      {c.feature_label}
                    </span>{" "}
                    <span className="text-ink-500">
                      ·{" "}
                      {c.direction === "increases_risk"
                        ? "nudges risk up"
                        : "protective"}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <p className="text-[14px] text-ink-500">
        Reply to this email if anything here is unclear — a human on the
        Regent&rsquo;s Park Medical Centre programme team will get back to
        you within two working days.
      </p>
    </div>
  );
}

const LIBRARY: EducationArticle[] = [
  {
    slug: "what-is-perimenopause",
    category: "Primer",
    title: "What is perimenopause, exactly?",
    lede: "The five-to-eight-year window before your final period, when hormones start to fluctuate and the body begins to change.",
    body: "",
  },
  {
    slug: "bone-loss-accelerates",
    category: "The science",
    title: "What actually happens in the years around your last period",
    lede: "As estrogen drops, the body's internal scaffolding quietly changes. The most important years are the ones closest to your final period.",
    body: "",
  },
  {
    slug: "exercises-for-bones",
    category: "Movement",
    title: "Movement that protects your future self",
    lede: "Resistance training and impact-loading exercise — lifting, jumping, brisk walking — have the strongest evidence for keeping midlife women resilient.",
    body: "",
  },
  {
    slug: "calcium-and-vitamin-d",
    category: "Nutrition",
    title: "Calcium, vitamin D, and what your body actually needs",
    lede: "Most women don't need pills. But a surprising number fall short of the 700mg of dietary calcium a day that supports healthy bone turnover.",
    body: "",
  },
  {
    slug: "talking-to-your-gp",
    category: "Conversation",
    title: "How to have this conversation with your GP",
    lede: "What to ask, what to expect, and when to push for a deeper preventative check. A short, practical script.",
    body: "",
  },
  {
    slug: "what-frax-measures",
    category: "Your profile",
    title: "What your risk score actually measures",
    lede: "Your score is built from well-studied clinical factors: age, BMI, family history, lifestyle, and menopausal stage.",
    body: "",
  },
];

export function EducationDigestBody() {
  return (
    <div className="space-y-6">
      <p className="text-[15px] leading-[1.75] text-ink-700">
        Every week we pick a small handful of reads for the women in our
        preventative health programme — things worth knowing, in plain
        language, written for a busy evening rather than a medical journal.
        Here&rsquo;s this week&rsquo;s set.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        {LIBRARY.map((a) => (
          <div
            key={a.slug}
            className="rounded-xl border border-cream-200 bg-[#fbf9f2] p-5"
          >
            <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-lavender-600">
              {a.category}
            </p>
            <h3 className="mt-2 font-display text-[17px] font-medium leading-snug text-ink-900">
              {a.title}
            </h3>
            <p className="mt-2 text-[13px] leading-relaxed text-ink-500">
              {a.lede}
            </p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between rounded-xl border border-cream-200 bg-[#fbf9f2] px-5 py-4">
        <div className="flex items-center gap-3 text-[13px] text-ink-700">
          <Sparkles className="h-4 w-4 text-lavender-600" strokeWidth={1.75} />
          <span>
            The full library lives in your patient portal, indexed by topic.
          </span>
        </div>
        <Link
          href="/demo/patient/education"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-sage-700 hover:underline"
        >
          Open library
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
        </Link>
      </div>
    </div>
  );
}

export function SelfReferBody() {
  return (
    <div className="space-y-6">
      <p className="text-[15px] leading-[1.75] text-ink-700">
        A short, preventative appointment at Regent&rsquo;s Park Medical
        Centre — fifteen minutes, in person or by phone. This isn&rsquo;t an
        urgent-care route, and you don&rsquo;t need to have a symptom ready to
        talk about. A clinician will follow up within two working days.
      </p>
      <div className="flex items-center gap-3 rounded-xl border border-sage-200 bg-sage-50 px-5 py-4 text-[13px] text-ink-700">
        <Calendar className="h-4 w-4 text-sage-700" strokeWidth={1.75} />
        <span>
          Typical wait times this week: <strong>2&ndash;4 working days</strong>{" "}
          for preventative slots.
        </span>
      </div>
      <SelfReferralForm />
    </div>
  );
}

export function WelcomeBody() {
  return (
    <div className="space-y-4 text-[15px] leading-[1.75] text-ink-700">
      <p>
        Hello, and welcome to the <strong>NHS midlife preventative health
        programme</strong>. You&rsquo;re one of around 4,000 women in North
        Central London whose GP practice is taking part in this pilot.
      </p>
      <p>
        The idea is simple: the years around menopause are the single biggest
        preventative window in a woman&rsquo;s life, and historically we
        haven&rsquo;t used them well. Small, early changes compound over the
        decade that follows — but they rely on getting the right information
        to the right women, at the right time.
      </p>
      <p>
        Over the coming weeks you&rsquo;ll receive a short, personalised
        health profile from your GP surgery, a handful of plain-language
        reads from our library, and — if your record flags as high-priority
        — a direct invitation to a preventative conversation with your GP.
        Nothing in this programme is urgent. Nothing is a diagnosis.
      </p>
      <p>
        If you&rsquo;d rather not take part, just reply to this message and
        we&rsquo;ll remove you from the list. No follow-ups.
      </p>
      <p className="text-ink-500">
        Warm regards,
        <br />
        The NHS North Central London midlife health team
      </p>
    </div>
  );
}
