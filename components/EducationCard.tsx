// components/EducationCard.tsx
// Pure presentational card for one education library article.
// Articles are hand-authored in app/demo/patient/education/page.tsx
// and passed in as props. Body text is reserved for a future article
// detail view — the MVP only renders title + lede on the grid.

import { Card } from "@/components/ui/card";

export type EducationArticle = {
  slug: string;
  title: string;
  lede: string;
  body: string;
};

export function EducationCard({ article }: { article: EducationArticle }) {
  return (
    <Card className="flex h-full flex-col p-5">
      <h3 className="text-base font-semibold leading-snug">{article.title}</h3>
      <p className="mt-2 text-sm text-slate-600">{article.lede}</p>
    </Card>
  );
}
