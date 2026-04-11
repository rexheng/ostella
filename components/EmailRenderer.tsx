// components/EmailRenderer.tsx
// Renders a single email in the style of a real inbox reading pane
// (Gmail-inspired): sender chip with avatar, from/to row, subject,
// body paragraphs, NHS-style confidentiality footer, and reply /
// forward action pills. Used in two places:
//   1. The patient inbox reading pane (/demo/patient).
//   2. The GP's "alert sent" confirmation modal (AlertPreviewModal).
// Kept presentational — no data fetching, no state. Callers pass a
// fully-rendered set of props.

import { CornerUpLeft, CornerUpRight, MoreVertical, Printer, Star } from "lucide-react";

export type SenderAccent = "sage" | "lavender" | "cream" | "ink";

export type EmailRendererProps = {
  from: {
    name: string;
    email: string;
    role?: string;
    accent?: SenderAccent;
  };
  to: {
    name: string;
    email: string;
  };
  subject: string;
  body: string;
  sentAt: string | Date;
  starred?: boolean;
  /**
   * Optional rich block rendered in place of the plain-text body.
   * Used by "digest" style emails in the patient inbox (e.g. library
   * recommendations, self-referral form) where the message body is
   * interactive rather than prose.
   */
  richBody?: React.ReactNode;
  /**
   * Optional tagline under the subject, e.g. "Inbox" breadcrumb.
   */
  labels?: string[];
};

const ACCENT_CLASSES: Record<SenderAccent, string> = {
  sage: "bg-sage-100 text-sage-700 ring-sage-200",
  lavender: "bg-lavender-100 text-lavender-700 ring-lavender-200",
  cream: "bg-[#f7f5ee] text-ink-700 ring-[#e5e3dc]",
  ink: "bg-[#1c1b18] text-cream-50 ring-[#1c1b18]",
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function formatLongDate(value: string | Date) {
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function EmailRenderer({
  from,
  to,
  subject,
  body,
  sentAt,
  starred = false,
  richBody,
  labels,
}: EmailRendererProps) {
  const paragraphs = body
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <article className="rounded-[14px] border border-[#e5e3dc] bg-white shadow-[0_1px_0_rgba(28,27,24,0.04)]">
      {/* Action toolbar — looks like a Gmail reading-pane toolbar */}
      <div className="flex items-center gap-1 border-b border-[#eceae2] px-4 py-2 text-ink-500">
        <ToolbarButton label="Back to inbox">
          <CornerUpLeft className="h-[15px] w-[15px]" strokeWidth={1.75} />
        </ToolbarButton>
        <div className="mx-1 h-4 w-px bg-[#ecebe3]" />
        <ToolbarButton label="Archive">
          <ArchiveIcon />
        </ToolbarButton>
        <ToolbarButton label="Report">
          <ReportIcon />
        </ToolbarButton>
        <ToolbarButton label="Delete">
          <TrashIcon />
        </ToolbarButton>
        <div className="mx-1 h-4 w-px bg-[#ecebe3]" />
        <ToolbarButton label="Print">
          <Printer className="h-[15px] w-[15px]" strokeWidth={1.75} />
        </ToolbarButton>
        <ToolbarButton label="More">
          <MoreVertical className="h-[15px] w-[15px]" strokeWidth={1.75} />
        </ToolbarButton>
      </div>

      {/* Subject row */}
      <div className="px-8 pt-7">
        <div className="flex items-start gap-4">
          <h1 className="flex-1 font-display text-[26px] font-medium leading-[1.2] text-ink-900">
            {subject}
          </h1>
          <button
            type="button"
            className="mt-1 text-ink-500 transition hover:text-lavender-600"
            aria-label={starred ? "Starred" : "Star this message"}
          >
            <Star
              className="h-[18px] w-[18px]"
              strokeWidth={1.5}
              fill={starred ? "#a087c5" : "none"}
              stroke={starred ? "#7251af" : "currentColor"}
            />
          </button>
        </div>
        {labels && labels.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {labels.map((l) => (
              <span
                key={l}
                className="inline-flex items-center rounded-md border border-[#e5e3dc] bg-[#f7f5ee] px-2 py-0.5 text-[11px] font-medium text-ink-500"
              >
                {l}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Sender row */}
      <div className="flex items-start gap-4 px-8 pt-6">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-medium ring-1 ring-inset ${
            ACCENT_CLASSES[from.accent ?? "sage"]
          }`}
        >
          {initials(from.name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span className="text-[14px] font-semibold text-ink-900">
              {from.name}
            </span>
            <span className="text-[13px] text-ink-500">
              &lt;{from.email}&gt;
            </span>
          </div>
          <div className="mt-0.5 flex items-center gap-1 text-[12px] text-ink-500">
            <span>to</span>
            <span className="text-ink-700">{to.name}</span>
            <svg
              width="10"
              height="10"
              viewBox="0 0 12 12"
              fill="none"
              className="mt-[1px]"
              aria-hidden
            >
              <path
                d="M2.5 4.5L6 8L9.5 4.5"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
        <time
          dateTime={
            typeof sentAt === "string" ? sentAt : sentAt.toISOString()
          }
          className="whitespace-nowrap text-[12px] text-ink-500"
        >
          {formatLongDate(sentAt)}
        </time>
      </div>

      {/* Body */}
      <div className="px-8 pb-4 pt-6">
        {richBody ? (
          <div className="text-[15px] leading-[1.75] text-ink-700">
            {richBody}
          </div>
        ) : (
          <div className="space-y-4 font-sans text-[15px] leading-[1.75] text-ink-700">
            {paragraphs.map((p, i) => (
              <p key={i} className="whitespace-pre-wrap">
                {p}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Reply / Forward */}
      <div className="px-8 pb-6 pt-2">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-[#e5e3dc] bg-white px-4 py-1.5 text-[13px] font-medium text-ink-700 transition hover:border-sage-300 hover:bg-sage-50 hover:text-sage-700"
          >
            <CornerUpLeft className="h-[14px] w-[14px]" strokeWidth={1.75} />
            Reply
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-[#e5e3dc] bg-white px-4 py-1.5 text-[13px] font-medium text-ink-700 transition hover:border-sage-300 hover:bg-sage-50 hover:text-sage-700"
          >
            <CornerUpRight className="h-[14px] w-[14px]" strokeWidth={1.75} />
            Forward
          </button>
        </div>
      </div>

      {/* NHS-style disclaimer footer — what makes it feel "real" */}
      <div className="border-t border-dashed border-[#eceae2] px-8 py-5">
        <p className="text-[11px] leading-relaxed text-ink-500">
          This email and any attachments are confidential and intended solely
          for {to.name.split(" ")[0]}. If you have received this in error,
          please notify the sender and delete the message. Regent&rsquo;s Park
          Medical Centre, 14 Park Crescent, London NW1 4QP. Part of NHS North
          Central London ICB. Do not reply with urgent medical concerns — for
          anything urgent call 111, or 999 in an emergency.
        </p>
      </div>
    </article>
  );
}

function ToolbarButton({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className="inline-flex h-7 w-7 items-center justify-center rounded-full text-ink-500 transition hover:bg-[#f1efe6] hover:text-ink-900"
    >
      {children}
    </button>
  );
}

function ArchiveIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect
        x="2"
        y="3"
        width="12"
        height="3"
        rx="0.8"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <path
        d="M3 6V12.5C3 12.7761 3.22386 13 3.5 13H12.5C12.7761 13 13 12.7761 13 12.5V6"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <path
        d="M6.5 9H9.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}
function ReportIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M8 1.5L14.5 13H1.5L8 1.5Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path
        d="M8 6V9"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <circle cx="8" cy="11" r="0.7" fill="currentColor" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M3 4.5H13"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path
        d="M6 4.5V3.5C6 3 6.3 2.5 7 2.5H9C9.7 2.5 10 3 10 3.5V4.5"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <path
        d="M4.5 4.5L5 13C5 13.3 5.3 13.5 5.5 13.5H10.5C10.7 13.5 11 13.3 11 13L11.5 4.5"
        stroke="currentColor"
        strokeWidth="1.3"
      />
    </svg>
  );
}
