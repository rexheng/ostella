// lib/email-templates.ts
// High-risk email template. Only high-risk tier has a template;
// moderate and low tiers render passive copy in the UI.

import type { Patient } from "@/lib/types";

export function highRiskAlert(
  patient: Patient,
  gp: { name: string; practice: string }
): { subject: string; body: string } {
  const firstName = patient.name.split(" ")[0];
  const subject = `From ${gp.practice} — a note about your health`;
  const body =
`Dear ${firstName},

I'm ${gp.name}, one of the GPs at ${gp.practice}.
I'm writing because we recently reviewed your records as part of a
new preventative health programme for women in perimenopause.

Based on several factors in your history, you've been identified
as someone who would benefit from a conversation about your
long-term health in the next few weeks. This is preventative, not
urgent — but the changes that happen in the years around menopause
are easier to act on early than later.

I'd like to invite you to:

  1. Book a 15-minute appointment with me to discuss next steps
  2. Read a short guide we've prepared on what's happening and
     what you can do about it — your patient portal has this
  3. Consider a baseline preventative health check, which I can
     arrange if it's appropriate after we've spoken

This isn't a diagnosis. It's an invitation to a conversation.
If you'd rather not take this up, no action is needed — just let
us know and we'll remove you from the programme.

Warm regards,
${gp.name}
${gp.practice}`;
  return { subject, body };
}
