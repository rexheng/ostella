// components/AlertComposer.tsx
// TEMPORARY STUB — replaced by the real implementation in Task 1A.3.
import type { Patient } from "@/lib/types";
import { Card } from "@/components/ui/card";

export function AlertComposer({
  patient,
  gp,
}: {
  patient: Patient;
  gp: { name: string; practice: string };
}) {
  // gp is consumed by the real implementation in Task 1A.3.
  void gp;
  return (
    <Card className="p-6 text-sm text-slate-500">
      Alert composer — Task 1A.3 will implement this for {patient.name}.
    </Card>
  );
}
