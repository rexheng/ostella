// components/AlertPreviewModal.tsx
"use client";

import { Check } from "lucide-react";
import type { AlertResponse, Patient } from "@/lib/types";
import { DEMO_GP } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmailRenderer } from "@/components/EmailRenderer";

export function AlertPreviewModal({
  open,
  onClose,
  response,
  patient,
}: {
  open: boolean;
  onClose: () => void;
  response: AlertResponse;
  patient: Patient;
}) {
  const { preview } = response;
  const deliveryLabel = response.simulated ? "Delivered (simulated)" : "Delivered";
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      {/* max-h caps the dialog at the viewport. flex flex-col + the
          inner overflow-y-auto region means long emails scroll inside
          the dialog rather than pushing the close button off-screen.
          grid-rows-[auto_minmax(0,1fr)] overrides shadcn's default
          grid template (which grows with content). */}
      <DialogContent className="flex h-[min(720px,90vh)] max-w-3xl flex-col gap-0 overflow-hidden border-0 bg-[#f7f5ee] p-0 sm:rounded-2xl">
        <DialogTitle className="sr-only">Alert sent</DialogTitle>
        <DialogDescription className="sr-only">
          Preview of the email delivered to {patient.name.split(" ")[0]} in
          her inbox.
        </DialogDescription>

        {/* Chrome strip — fixed at the top of the dialog. pr-12 leaves
            room for the Radix close (X) button which is absolute-
            positioned at top-4 right-4 by the shadcn DialogContent. */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[#ecebe3] bg-[#f7f5ee] px-6 py-4 pr-12">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sage-600 text-cream-50">
              <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold text-ink-900">
                {deliveryLabel}
              </p>
              <p className="truncate text-[11px] text-ink-500">
                Preview of what {patient.name.split(" ")[0]} will see in her
                inbox
              </p>
            </div>
          </div>
        </div>

        {/* Scroll region — the email sits inside, so tall emails
            don't push the dialog past the viewport. */}
        <div className="min-h-0 flex-1 overflow-y-auto bg-[#f7f5ee] p-6">
          <EmailRenderer
            from={{
              name: DEMO_GP.name,
              email: DEMO_GP.email,
              role: "GP Partner",
            }}
            to={{
              name: patient.name,
              email: preview.to,
            }}
            subject={preview.subject}
            body={preview.body}
            sentAt={preview.rendered_at}
            labels={["Inbox", "Regent's Park MC"]}
            starred
          />
        </div>

        {/* Footer — stays pinned at the bottom of the dialog. */}
        <div className="flex shrink-0 items-center justify-end border-t border-[#ecebe3] bg-[#f7f5ee] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded-full bg-sage-600 px-5 py-2 text-[13px] font-medium text-cream-50 transition-all hover:-translate-y-0.5 hover:bg-sage-700 hover:shadow-[0_6px_24px_-8px_rgba(58,110,75,0.35)]"
          >
            Back to worklist
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
