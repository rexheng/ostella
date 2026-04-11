// components/patient/InboxList.tsx
// Middle pane: the list of messages in the inbox. Each row is a
// clickable button that tells the parent which message to open in
// the reading pane. Styling follows Gmail's density cues — unread
// rows have bolder sender + subject, read rows are muted.

"use client";

import { Star } from "lucide-react";
import type { InboxMessage } from "@/lib/patient-inbox";
import { formatListTime } from "@/lib/patient-inbox";

export function InboxList({
  messages,
  selectedId,
  onSelect,
  patientFirstName,
}: {
  messages: InboxMessage[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  patientFirstName: string;
}) {
  const unreadCount = messages.filter((m) => m.unread).length;
  return (
    <div className="flex w-[360px] shrink-0 flex-col border-r border-[#ecebe3] bg-cream-50">
      {/* List header */}
      <div className="flex items-center justify-between border-b border-[#ecebe3] px-5 py-3">
        <div>
          <p className="font-display text-[17px] font-medium text-ink-900">
            Inbox
          </p>
          <p className="text-[11px] text-ink-500">
            {unreadCount} unread · {messages.length} total
          </p>
        </div>
        <span className="inline-flex items-center rounded-full border border-[#e5e3dc] bg-[#f7f5ee] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-ink-500">
          Primary
        </span>
      </div>

      {/* Rows */}
      <ol className="flex-1 overflow-y-auto">
        {messages.map((m) => {
          const selected = m.id === selectedId;
          return (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => onSelect(m.id)}
                className={`group relative flex w-full items-start gap-3 border-b border-[#ecebe3] px-5 py-4 text-left transition ${
                  selected
                    ? "bg-lavender-50"
                    : "bg-transparent hover:bg-[#f7f5ee]"
                }`}
              >
                {/* Unread indicator rail */}
                {m.unread && !selected && (
                  <span className="absolute inset-y-0 left-0 w-[3px] bg-lavender-500" />
                )}

                <Star
                  className="mt-0.5 h-[14px] w-[14px] shrink-0 text-ink-500"
                  strokeWidth={1.5}
                  fill={m.starred ? "#a087c5" : "none"}
                  stroke={m.starred ? "#7251af" : "currentColor"}
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <span
                      className={`truncate text-[13px] ${
                        m.unread
                          ? "font-semibold text-ink-900"
                          : "text-ink-700"
                      }`}
                    >
                      {m.from.name}
                    </span>
                    <span className="shrink-0 whitespace-nowrap text-[11px] text-ink-500">
                      {formatListTime(m.sentAt)}
                    </span>
                  </div>
                  <p
                    className={`mt-1 truncate text-[13px] ${
                      m.unread
                        ? "font-semibold text-ink-900"
                        : "text-ink-700"
                    }`}
                  >
                    {m.subject}
                  </p>
                  <p className="mt-1 line-clamp-2 text-[12px] leading-snug text-ink-500">
                    {m.preview}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {m.labels
                      .filter((l) => l !== "Inbox")
                      .map((l) => (
                        <span
                          key={l}
                          className="inline-flex items-center rounded-md border border-[#e5e3dc] bg-cream-50 px-1.5 py-0.5 text-[10px] font-medium text-ink-500"
                        >
                          {l}
                        </span>
                      ))}
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="border-t border-[#ecebe3] px-5 py-3 text-[11px] text-ink-500">
        Signed in as{" "}
        <span className="font-medium text-ink-700">
          {patientFirstName.toLowerCase()}@example.com
        </span>
      </div>
    </div>
  );
}
