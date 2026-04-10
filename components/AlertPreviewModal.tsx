// components/AlertPreviewModal.tsx
"use client";

import type { AlertResponse } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function AlertPreviewModal({
  open,
  onClose,
  response,
}: {
  open: boolean;
  onClose: () => void;
  response: AlertResponse;
}) {
  const { preview } = response;
  const deliveryLabel = response.simulated ? "Delivered (simulated)" : "Delivered";
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl border-cream-200 bg-cream-50">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-3">
            <DialogTitle className="font-display text-2xl font-medium text-ink-900">
              Alert sent
            </DialogTitle>
            <span className="inline-flex items-center rounded-full border border-sage-200 bg-sage-50 px-2.5 py-0.5 text-[11px] font-medium text-sage-700">
              {deliveryLabel}
            </span>
          </div>
          <DialogDescription className="text-sm text-ink-500">
            {new Date(preview.rendered_at).toLocaleString()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 rounded-xl border border-cream-200 bg-white p-5 text-sm text-ink-700">
          <p>
            <span className="font-medium text-ink-900">To:</span> {preview.to}
          </p>
          <p>
            <span className="font-medium text-ink-900">From:</span> {preview.from}
          </p>
          <p>
            <span className="font-medium text-ink-900">Subject:</span>{" "}
            {preview.subject}
          </p>
          <pre className="mt-3 whitespace-pre-wrap font-mono text-[13px] leading-relaxed text-ink-700">
            {preview.body}
          </pre>
        </div>

        <DialogFooter>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded-full bg-sage-600 px-6 py-2.5 text-sm font-medium text-cream-50 transition-all hover:bg-sage-700 hover:-translate-y-0.5 hover:shadow-[0_6px_24px_-8px_rgba(58,110,75,0.35)]"
          >
            Close
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
