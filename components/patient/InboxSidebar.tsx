// components/patient/InboxSidebar.tsx
// Left rail of the Gmail-style patient inbox. The Compose button
// is decorative (the whole demo is one-way); folder counts are
// derived from the current message list so they stay honest.

"use client";

import {
  Inbox,
  Star,
  Send,
  FileText,
  BookOpen,
  Calendar,
  ShieldCheck,
  Trash2,
  Pencil,
} from "lucide-react";

export type SidebarCounts = {
  inbox: number;
  starred: number;
};

export function InboxSidebar({ counts }: { counts: SidebarCounts }) {
  return (
    <aside className="w-[216px] shrink-0 border-r border-[#ecebe3] bg-[#f7f5ee] pl-4 pr-3 pt-5">
      <button
        type="button"
        className="group inline-flex items-center gap-3 rounded-2xl bg-cream-50 px-5 py-3.5 text-[14px] font-medium text-ink-900 shadow-[0_1px_0_rgba(28,27,24,0.05),0_8px_22px_-14px_rgba(28,27,24,0.2)] ring-1 ring-[#e5e3dc] transition hover:shadow-[0_1px_0_rgba(28,27,24,0.05),0_12px_28px_-14px_rgba(28,27,24,0.25)]"
      >
        <Pencil
          className="h-[15px] w-[15px] text-sage-700"
          strokeWidth={1.75}
        />
        Compose
      </button>

      <nav className="mt-6 space-y-[2px]">
        <SidebarItem
          icon={<Inbox className="h-[15px] w-[15px]" strokeWidth={1.75} />}
          label="Inbox"
          count={counts.inbox}
          active
        />
        <SidebarItem
          icon={<Star className="h-[15px] w-[15px]" strokeWidth={1.75} />}
          label="Starred"
          count={counts.starred}
        />
        <SidebarItem
          icon={<Send className="h-[15px] w-[15px]" strokeWidth={1.75} />}
          label="Sent"
        />
        <SidebarItem
          icon={<FileText className="h-[15px] w-[15px]" strokeWidth={1.75} />}
          label="Drafts"
        />
      </nav>

      <div className="mt-6 border-t border-[#ecebe3] pt-4">
        <p className="px-3 text-[10px] font-medium uppercase tracking-[0.18em] text-ink-500">
          Labels
        </p>
        <nav className="mt-2 space-y-[2px]">
          <SidebarItem
            icon={<ShieldCheck className="h-[15px] w-[15px]" strokeWidth={1.75} />}
            label="Programme"
            accentDot="lavender"
          />
          <SidebarItem
            icon={<BookOpen className="h-[15px] w-[15px]" strokeWidth={1.75} />}
            label="Library"
            accentDot="cream"
          />
          <SidebarItem
            icon={<Calendar className="h-[15px] w-[15px]" strokeWidth={1.75} />}
            label="Bookings"
            accentDot="sage"
          />
        </nav>
      </div>

      <div className="mt-6 border-t border-[#ecebe3] pt-4">
        <nav className="space-y-[2px]">
          <SidebarItem
            icon={<Trash2 className="h-[15px] w-[15px]" strokeWidth={1.75} />}
            label="Trash"
          />
        </nav>
      </div>

      <div className="mt-8 rounded-xl bg-[#efe9d9] px-4 py-3 text-[11px] leading-relaxed text-ink-500">
        <p className="font-medium text-ink-700">Demo inbox</p>
        <p className="mt-1">
          A simulated view of the mail your GP surgery would send you through
          this programme.
        </p>
      </div>
    </aside>
  );
}

function SidebarItem({
  icon,
  label,
  count,
  active,
  accentDot,
}: {
  icon: React.ReactNode;
  label: string;
  count?: number;
  active?: boolean;
  accentDot?: "sage" | "lavender" | "cream";
}) {
  const dotColor: Record<NonNullable<typeof accentDot>, string> = {
    sage: "bg-sage-500",
    lavender: "bg-lavender-500",
    cream: "bg-cream-300",
  };
  return (
    <button
      type="button"
      className={`flex w-full items-center justify-between gap-3 rounded-full px-3 py-1.5 text-left text-[13px] transition ${
        active
          ? "bg-lavender-100 font-semibold text-lavender-800"
          : "text-ink-700 hover:bg-[#efe9d9]"
      }`}
    >
      <span className="flex items-center gap-3">
        {accentDot ? (
          <span
            className={`h-2 w-2 rounded-full ${dotColor[accentDot]}`}
          />
        ) : (
          icon
        )}
        <span>{label}</span>
      </span>
      {typeof count === "number" && count > 0 && (
        <span className="text-[11px] font-medium tabular-nums">{count}</span>
      )}
    </button>
  );
}
