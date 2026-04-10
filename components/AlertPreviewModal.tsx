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
import { Button } from "@/components/ui/button";

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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Alert sent</DialogTitle>
          <DialogDescription>
            {deliveryLabel} at {new Date(preview.rendered_at).toLocaleString()}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 rounded border bg-slate-50 p-4 text-sm">
          <p>
            <span className="font-medium">To:</span> {preview.to}
          </p>
          <p>
            <span className="font-medium">From:</span> {preview.from}
          </p>
          <p>
            <span className="font-medium">Subject:</span> {preview.subject}
          </p>
          <pre className="mt-3 whitespace-pre-wrap font-sans text-slate-700">
            {preview.body}
          </pre>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
