import { describe, it, expect } from "vitest";
import { parseDemoState, serializeDemoState } from "@/lib/demo-state";
import { DEFAULT_DEMO_STATE } from "@/lib/types";

describe("demo-state serialization", () => {
  it("parses an empty cookie to the default state", () => {
    expect(parseDemoState(undefined)).toEqual(DEFAULT_DEMO_STATE);
    expect(parseDemoState("")).toEqual(DEFAULT_DEMO_STATE);
  });

  it("round-trips a valid state", () => {
    const state = { role: "patient" as const, active_patient_id: "p-014" };
    const serialized = serializeDemoState(state);
    expect(parseDemoState(serialized)).toEqual(state);
  });

  it("returns default on malformed JSON", () => {
    expect(parseDemoState("not-json")).toEqual(DEFAULT_DEMO_STATE);
  });

  it("returns default on missing fields", () => {
    expect(parseDemoState(JSON.stringify({ role: "gp" }))).toEqual(DEFAULT_DEMO_STATE);
  });
});
