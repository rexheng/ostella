import { describe, it, expect } from "vitest";
import { getAllPatients, getPatient } from "@/lib/patients";

describe("patients loader", () => {
  it("getAllPatients returns an array", () => {
    const all = getAllPatients();
    expect(Array.isArray(all)).toBe(true);
  });

  it("getPatient returns null for a missing id", () => {
    const p = getPatient("non-existent-id");
    expect(p).toBeNull();
  });
});
