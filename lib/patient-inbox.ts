// lib/patient-inbox.ts
// Builds the list of Gmail-style "messages" for a given patient.
// Pure data — no React. The reading pane switches on `bodyKind`
// to decide what rich body to render (risk profile, education
// digest, self-referral form, etc.).
//
// Dates are computed relative to the patient's latest_alert sent_at
// when present, so the inbox always feels coherent with the rest of
// the demo. Falls back to the spec's "today" (2026-04-11) otherwise.

import { DEMO_GP, DEMO_PRACTICE } from "@/lib/types";
import type { Patient, ScoredPatient } from "@/lib/types";
import { highRiskAlert } from "@/lib/email-templates";

export type InboxBodyKind =
  | "gp-alert"
  | "risk-profile"
  | "education-digest"
  | "self-refer"
  | "welcome";

export type InboxMessage = {
  id: string;
  from: {
    name: string;
    email: string;
    accent: "sage" | "lavender" | "cream" | "ink";
  };
  subject: string;
  preview: string;
  body: string; // plain-text body, used for bodyKind === "gp-alert"
  sentAt: string; // ISO
  labels: string[];
  unread: boolean;
  starred: boolean;
  hasAttachment?: boolean;
  bodyKind: InboxBodyKind;
};

const DEMO_TODAY = "2026-04-11T09:00:00Z";

function daysBefore(iso: string, days: number, hour = 9, minute = 0) {
  const d = new Date(iso);
  d.setUTCDate(d.getUTCDate() - days);
  d.setUTCHours(hour, minute, 0, 0);
  return d.toISOString();
}

export function buildPatientInbox(scored: ScoredPatient): InboxMessage[] {
  const { patient, tier } = scored;
  // Anchor: for high-risk patients we use the latest_alert sent_at so
  // the inbox matches their baked-in alert. For everyone else, anchor
  // to the demo "today".
  const anchor =
    patient.latest_alert?.sent_at ?? DEMO_TODAY;

  const messages: InboxMessage[] = [];

  // 1. The GP alert — only high-risk patients get this message.
  //    Body is regenerated from the current template so it stays in
  //    sync with lib/email-templates.ts rather than diverging from
  //    data/patients.json.
  if (tier === "high") {
    const alert = highRiskAlert(patient, {
      name: DEMO_GP.name,
      practice: DEMO_PRACTICE.name,
    });
    messages.push({
      id: "m-gp-alert",
      from: {
        name: DEMO_GP.name,
        email: DEMO_GP.email,
        accent: "sage",
      },
      subject: alert.subject,
      preview:
        "I'm writing because we recently reviewed your records as part of a new preventative health programme for women in perimenopause…",
      body: alert.body,
      sentAt: anchor,
      labels: ["Inbox", "GP"],
      unread: true,
      starred: true,
      bodyKind: "gp-alert",
    });
  }

  // 2. Your midlife health profile — always present, tier-aware
  //    phrasing in the preview.
  const profilePreview: Record<typeof tier, string> = {
    low: "Your preventative health profile is ready to view. Things look steady — here's what to keep doing…",
    moderate:
      "Your preventative health profile is ready to view. A few things in your record put you in a middle group…",
    high: "Your preventative health profile is ready to view. A few factors put you in a slightly elevated group — worth a read when you have five minutes…",
  };
  messages.push({
    id: "m-profile",
    from: {
      name: DEMO_PRACTICE.name,
      email: "programme@regentspark.nhs.uk",
      accent: "lavender",
    },
    subject: "Your midlife health profile is ready",
    preview: profilePreview[tier],
    body: "",
    sentAt: daysBefore(anchor, 1, 14, 30),
    labels: ["Inbox", "Programme"],
    unread: true,
    starred: false,
    bodyKind: "risk-profile",
  });

  // 3. Education digest
  messages.push({
    id: "m-library",
    from: {
      name: "Ostella Library",
      email: "library@ostella.health",
      accent: "cream",
    },
    subject: "Six short reads worth your time",
    preview:
      "Perimenopause, movement, nutrition, and what your risk score actually measures — hand-picked for you this week.",
    body: "",
    sentAt: daysBefore(anchor, 3, 7, 15),
    labels: ["Inbox", "Library"],
    unread: false,
    starred: false,
    bodyKind: "education-digest",
  });

  // 4. Self-referral nudge
  messages.push({
    id: "m-refer",
    from: {
      name: DEMO_PRACTICE.name,
      email: "bookings@regentspark.nhs.uk",
      accent: "lavender",
    },
    subject: "Book a preventative conversation — it's quicker than you'd think",
    preview:
      "A short, preventative appointment with your GP. Reply with a few times that work, or use the form inside.",
    body: "",
    sentAt: daysBefore(anchor, 5, 16, 10),
    labels: ["Inbox", "Bookings"],
    unread: false,
    starred: false,
    bodyKind: "self-refer",
  });

  // 5. Welcome — the oldest message, sets context
  messages.push({
    id: "m-welcome",
    from: {
      name: "NHS England",
      email: "noreply@nhs.uk",
      accent: "ink",
    },
    subject: "Welcome to your midlife preventative health programme",
    preview:
      "You're one of around 4,000 women in North Central London who's been invited to this preventative health pilot…",
    body: "",
    sentAt: daysBefore(anchor, 12, 9, 0),
    labels: ["Inbox", "NHS"],
    unread: false,
    starred: false,
    bodyKind: "welcome",
  });

  return messages;
}

/** Pretty relative timestamp for the list row, Gmail-style. */
export function formatListTime(iso: string, now: Date = new Date(DEMO_TODAY)): string {
  const d = new Date(iso);
  const sameDay =
    d.getUTCFullYear() === now.getUTCFullYear() &&
    d.getUTCMonth() === now.getUTCMonth() &&
    d.getUTCDate() === now.getUTCDate();
  if (sameDay) {
    return d.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  const sameYear = d.getUTCFullYear() === now.getUTCFullYear();
  if (sameYear) {
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  }
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
