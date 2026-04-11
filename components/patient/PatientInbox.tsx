// components/patient/PatientInbox.tsx
// Top-level Gmail-style inbox for /demo/patient. Owns the selected
// message state. The server passes in the scored patient and the
// list of messages; this component handles the rest.

"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import type { ScoredPatient } from "@/lib/types";
import type { InboxMessage } from "@/lib/patient-inbox";
import { InboxSidebar } from "@/components/patient/InboxSidebar";
import { InboxList } from "@/components/patient/InboxList";
import {
  PatientSwitcher,
  type SwitcherOption,
} from "@/components/patient/PatientSwitcher";
import { EmailRenderer } from "@/components/EmailRenderer";
import {
  RiskProfileBody,
  EducationDigestBody,
  SelfReferBody,
  WelcomeBody,
} from "@/components/patient/InboxBodies";

export function PatientInbox({
  scored,
  messages: initialMessages,
  switcherOptions,
}: {
  scored: ScoredPatient;
  messages: InboxMessage[];
  switcherOptions: SwitcherOption[];
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [selectedId, setSelectedId] = useState<string>(
    initialMessages[0]?.id ?? "",
  );

  const selected = messages.find((m) => m.id === selectedId) ?? messages[0];
  const firstName = scored.patient.name.split(" ")[0];

  function handleSelect(id: string) {
    setSelectedId(id);
    // Mark as read on open — feels like Gmail
    setMessages((current) =>
      current.map((m) => (m.id === id ? { ...m, unread: false } : m)),
    );
  }

  const counts = {
    inbox: messages.filter((m) => m.unread).length,
    starred: messages.filter((m) => m.starred).length,
  };

  return (
    <div className="-mx-6 -my-12 min-h-[calc(100vh-72px)] bg-[#f7f5ee]">
      {/* Mail chrome: search bar + account chip */}
      <div className="flex items-center gap-4 border-b border-[#ecebe3] bg-[#f7f5ee] px-6 py-3">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-[18px] font-medium text-ink-900">
            Ostella
          </span>
          <span className="text-[11px] uppercase tracking-[0.18em] text-ink-500">
            Mail
          </span>
        </div>
        <div className="flex flex-1 items-center gap-3 rounded-full bg-cream-50 px-5 py-2.5 ring-1 ring-[#e5e3dc] transition focus-within:ring-sage-300">
          <Search className="h-4 w-4 text-ink-500" strokeWidth={1.75} />
          <input
            type="text"
            placeholder="Search mail"
            className="flex-1 bg-transparent text-[13px] text-ink-900 placeholder:text-ink-500 focus:outline-none"
          />
          <span className="hidden text-[10px] text-ink-500 md:inline">
            ⌘K
          </span>
        </div>
        <PatientSwitcher
          current={{
            id: scored.patient.id,
            name: scored.patient.name,
            email: scored.patient.contact.email,
            tier: scored.tier,
          }}
          options={switcherOptions}
        />
      </div>

      <div className="flex min-h-[calc(100vh-72px-56px)]">
        <InboxSidebar counts={counts} />
        <InboxList
          messages={messages}
          selectedId={selected?.id ?? null}
          onSelect={handleSelect}
          patientFirstName={firstName}
        />

        {/* Reading pane */}
        <div className="flex-1 overflow-y-auto bg-[#f7f5ee] p-6">
          {selected ? (
            <EmailRenderer
              from={selected.from}
              to={{
                name: scored.patient.name,
                email: scored.patient.contact.email,
              }}
              subject={selected.subject}
              body={selected.body}
              sentAt={selected.sentAt}
              starred={selected.starred}
              labels={selected.labels}
              richBody={
                selected.bodyKind === "gp-alert"
                  ? undefined
                  : readingPaneBody(selected.bodyKind, scored)
              }
            />
          ) : (
            <div className="grid h-full place-items-center text-[13px] text-ink-500">
              Select a message to read
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function readingPaneBody(
  kind: InboxMessage["bodyKind"],
  scored: ScoredPatient,
) {
  switch (kind) {
    case "risk-profile":
      return <RiskProfileBody scored={scored} />;
    case "education-digest":
      return <EducationDigestBody />;
    case "self-refer":
      return <SelfReferBody />;
    case "welcome":
      return <WelcomeBody />;
    default:
      return null;
  }
}
