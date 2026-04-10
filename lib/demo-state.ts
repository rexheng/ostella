// lib/demo-state.ts
// Cookie-backed DemoState helpers. Server-side use via next/headers;
// the parse/serialize helpers are pure functions for easy testing.

import { cookies } from "next/headers";
import type { DemoState, DemoRole } from "@/lib/types";
import { DEFAULT_DEMO_STATE } from "@/lib/types";

const COOKIE_NAME = "ostella_demo";

function isValidRole(r: unknown): r is DemoRole {
  return r === "gp" || r === "patient";
}

export function parseDemoState(raw: string | undefined): DemoState {
  if (!raw) return DEFAULT_DEMO_STATE;
  try {
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === "object" &&
      isValidRole(parsed.role) &&
      typeof parsed.active_patient_id === "string"
    ) {
      return { role: parsed.role, active_patient_id: parsed.active_patient_id };
    }
  } catch {
    // fall through
  }
  return DEFAULT_DEMO_STATE;
}

export function serializeDemoState(state: DemoState): string {
  return JSON.stringify(state);
}

export function getDemoState(): DemoState {
  const store = cookies();
  return parseDemoState(store.get(COOKIE_NAME)?.value);
}

export function setDemoState(partial: Partial<DemoState>) {
  const current = getDemoState();
  const next: DemoState = { ...current, ...partial };
  cookies().set(COOKIE_NAME, serializeDemoState(next), {
    path: "/",
    sameSite: "lax",
    httpOnly: false,
  });
}

export const DEMO_COOKIE_NAME = COOKIE_NAME;
