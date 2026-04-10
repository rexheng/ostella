// app/api/send-alert/route.ts
import { NextResponse } from "next/server";
import { getPatient } from "@/lib/patients";
import { DEMO_GP } from "@/lib/types";
import type { AlertRequest, AlertResponse } from "@/lib/types";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as AlertRequest | null;
  if (!body || typeof body.patient_id !== "string") {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }
  const patient = getPatient(body.patient_id);
  if (!patient) {
    return NextResponse.json({ error: "patient not found" }, { status: 404 });
  }
  const response: AlertResponse = {
    simulated: true,
    preview: {
      to: patient.contact.email,
      from: `${DEMO_GP.name} <${DEMO_GP.email}>`,
      subject: body.subject,
      body: body.body,
      rendered_at: new Date().toISOString(),
    },
  };
  return NextResponse.json(response);
}
