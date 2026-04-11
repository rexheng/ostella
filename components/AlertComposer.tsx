// components/AlertComposer.tsx
"use client";

import { useState } from "react";
import type { Patient, AlertResponse } from "@/lib/types";
import { highRiskAlert } from "@/lib/email-templates";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertPreviewModal } from "@/components/AlertPreviewModal";

export function AlertComposer({
  patient,
  gp,
}: {
  patient: Patient;
  gp: { name: string; practice: string };
}) {
  const initial = highRiskAlert(patient, gp);
  const [subject, setSubject] = useState(initial.subject);
  const [body, setBody] = useState(initial.body);
  const [response, setResponse] = useState<AlertResponse | null>(null);
  const [loading, setLoading] = useState(false);

  async function send() {
    setLoading(true);
    try {
      const res = await fetch("/api/send-alert", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ patient_id: patient.id, subject, body }),
      });
      const json = (await res.json()) as AlertResponse;
      setResponse(json);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section className="rounded-2xl border border-cream-200 bg-cream-50 p-8">
        <div className="mb-6">
          <h2 className="font-display text-[26px] font-medium leading-tight text-ink-900">
            Compose alert
          </h2>
          <p className="mt-2 text-sm text-ink-500">
            This patient is in the high-risk tier. The template below is pre-filled —
            review, edit, and send.
          </p>
        </div>
        <div className="space-y-5">
          <div className="space-y-2">
            <Label
              htmlFor="subject"
              className="text-[11px] uppercase tracking-[0.08em] text-ink-500"
            >
              Subject
            </Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="border-cream-200 bg-white text-ink-900 focus:border-sage-400 focus-visible:ring-sage-200"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="body"
              className="text-[11px] uppercase tracking-[0.08em] text-ink-500"
            >
              Body
            </Label>
            <Textarea
              id="body"
              rows={14}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="border-cream-200 bg-white text-ink-900 focus:border-sage-400 focus-visible:ring-sage-200"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={send}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full bg-sage-600 px-6 py-2.5 text-sm font-medium text-cream-50 transition-all hover:bg-sage-700 hover:-translate-y-0.5 hover:shadow-[0_6px_24px_-8px_rgba(58,110,75,0.35)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              {loading ? "Sending…" : "Send alert"}
              {!loading && <span aria-hidden>→</span>}
            </button>
          </div>
        </div>
      </section>
      {response && (
        <AlertPreviewModal
          open={true}
          onClose={() => setResponse(null)}
          response={response}
          patient={patient}
        />
      )}
    </>
  );
}
