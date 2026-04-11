// lib/email-templates.ts
// High-risk email template. Only high-risk tier has a template;
// moderate and low tiers render passive copy in the UI.
//
// Body is plain text with blank-line-separated paragraphs. The
// EmailRenderer component splits on \n\n and renders each block as
// a <p>. Keep paragraphs short — real NHS GP emails are terse.

import type { Patient } from "@/lib/types";

export function highRiskAlert(
  patient: Patient,
  gp: { name: string; practice: string }
): { subject: string; body: string } {
  const firstName = patient.name.split(" ")[0];
  const subject = `A note from ${gp.practice}`;
  const body =
`Dear ${firstName},

I'm ${gp.name}, one of the GPs at ${gp.practice}. I'm writing because we recently reviewed your records as part of a new preventative health programme for women in perimenopause, and I wanted to reach out to you directly.

Based on a handful of factors in your history, you've been flagged as someone who would benefit from a short, preventative conversation in the next few weeks. I want to be clear up front: this isn't urgent, and it isn't a diagnosis. The years around menopause are a window where small, early changes tend to pay off over the decade that follows — and that's really what this is about.

There are three things I'd like to invite you to do, in whatever order suits you:

1.  Book a 15-minute appointment with me. I've asked reception to keep a slot open next week — you can reply to this email or use the link in your patient portal.

2.  Have a read through the short guide we've put together on what's happening in perimenopause and the handful of things that actually make a difference. It's in your portal under "Things worth knowing".

3.  If it feels right after we've spoken, I can arrange a baseline preventative health check — nothing invasive, and nothing you need to decide about now.

If none of this feels useful to you, that's completely fine. Just reply and let me know, and I'll take you off the programme list — no follow-ups, no awkwardness.

Warm regards,

${gp.name}
GP Partner, ${gp.practice}
Regent's Park Medical Centre, 14 Park Crescent, London NW1 4QP`;
  return { subject, body };
}
