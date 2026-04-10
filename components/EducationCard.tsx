// components/EducationCard.tsx
// Pure presentational card for one education library article.
// Articles are hand-authored in app/demo/patient/education/page.tsx
// and passed in as props. Body text is reserved for a future article
// detail view — the MVP only renders title + lede on the grid.

import { ArrowRight } from "lucide-react";

export type EducationArticle = {
  slug: string;
  title: string;
  lede: string;
  body: string;
  category: string;
};

export function EducationCard({ article }: { article: EducationArticle }) {
  return (
    <article className="group flex h-full flex-col rounded-2xl border border-cream-200 bg-cream-100 p-8 transition hover:-translate-y-0.5 hover:border-sage-200 hover:shadow-sm">
      <p className="text-xs font-medium uppercase tracking-[0.15em] text-lavender-600">
        {article.category}
      </p>
      <h3 className="mt-3 font-display text-2xl font-medium leading-[1.2] text-ink-900">
        {article.title}
      </h3>
      <p className="mt-4 flex-1 text-[15px] leading-relaxed text-ink-500">
        {article.lede}
      </p>
      <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-sage-700">
        Read
        <ArrowRight
          className="h-4 w-4 transition-transform group-hover:translate-x-1"
          strokeWidth={1.75}
        />
      </span>
    </article>
  );
}
