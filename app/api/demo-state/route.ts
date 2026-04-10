// app/api/demo-state/route.ts
import { NextResponse } from "next/server";
import { setDemoState } from "@/lib/demo-state";
import type { DemoRole } from "@/lib/types";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const partial: { role?: DemoRole; active_patient_id?: string } = {};
  if (body.role === "gp" || body.role === "patient") partial.role = body.role;
  if (typeof body.active_patient_id === "string") partial.active_patient_id = body.active_patient_id;
  setDemoState(partial);
  return NextResponse.json({ ok: true });
}
