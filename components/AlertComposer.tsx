// components/AlertComposer.tsx
"use client";

import { useState } from "react";
import type { Patient, AlertResponse } from "@/lib/types";
import { highRiskAlert } from "@/lib/email-templates";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
      <Card className="p-6">
        <h2 className="text-lg font-semibold">Compose alert</h2>
        <p className="mb-4 text-sm text-slate-600">
          This patient is in the high-risk tier. The template below is pre-filled — review,
          edit, and send.
        </p>
        <div className="space-y-3">
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="body">Body</Label>
            <Textarea
              id="body"
              rows={14}
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={send} disabled={loading}>
              {loading ? "Sending…" : "Send alert"}
            </Button>
          </div>
        </div>
      </Card>
      {response && (
        <AlertPreviewModal
          open={true}
          onClose={() => setResponse(null)}
          response={response}
        />
      )}
    </>
  );
}
