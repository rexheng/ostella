// components/RoleSwitcher.tsx
"use client";

import { useRouter, usePathname } from "next/navigation";
import { useTransition } from "react";
import type { DemoRole } from "@/lib/types";

export function RoleSwitcher({ currentRole }: { currentRole: DemoRole }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  async function switchTo(role: DemoRole) {
    await fetch("/api/demo-state", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ role }),
    });
    startTransition(() => {
      router.push(role === "gp" ? "/demo/gp" : "/demo/patient");
      router.refresh();
    });
  }

  return (
    <div className="inline-flex rounded-md border bg-white p-1 text-sm shadow-sm">
      <button
        type="button"
        onClick={() => switchTo("gp")}
        disabled={isPending}
        className={`rounded px-3 py-1 transition ${
          currentRole === "gp" ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
        }`}
      >
        GP view
      </button>
      <button
        type="button"
        onClick={() => switchTo("patient")}
        disabled={isPending}
        className={`rounded px-3 py-1 transition ${
          currentRole === "patient" ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
        }`}
      >
        Patient view
      </button>
    </div>
  );
}
