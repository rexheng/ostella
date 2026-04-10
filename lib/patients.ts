// lib/patients.ts
// JSON-backed patient loader. No database, no cache invalidation.
// Re-reads the file on every server-component render (microseconds).

import type { Patient } from "@/lib/types";
import patientsJson from "@/data/patients.json";

const patients = patientsJson as unknown as Patient[];

export function getAllPatients(): Patient[] {
  return patients;
}

export function getPatient(id: string): Patient | null {
  return patients.find((p) => p.id === id) ?? null;
}
