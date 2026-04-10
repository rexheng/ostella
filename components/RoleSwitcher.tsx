// components/RoleSwitcher.tsx
"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { DemoRole } from "@/lib/types";
import { cn } from "@/lib/utils";

export function RoleSwitcher({ currentRole }: { currentRole: DemoRole }) {
  const router = useRouter();
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
    <div className="inline-flex rounded-full border border-cream-200 bg-cream-100 p-1 text-sm">
      <button
        type="button"
        onClick={() => switchTo("gp")}
        disabled={isPending}
        className={cn(
          "rounded-full px-4 py-1.5 font-medium transition",
          currentRole === "gp"
            ? "bg-ink-900 text-cream-50 shadow-sm"
            : "text-ink-500 hover:text-ink-700"
        )}
      >
        GP view
      </button>
      <button
        type="button"
        onClick={() => switchTo("patient")}
        disabled={isPending}
        className={cn(
          "rounded-full px-4 py-1.5 font-medium transition",
          currentRole === "patient"
            ? "bg-ink-900 text-cream-50 shadow-sm"
            : "text-ink-500 hover:text-ink-700"
        )}
      >
        Patient view
      </button>
    </div>
  );
}
