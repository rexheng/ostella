// app/demo/layout.tsx
import { getDemoState } from "@/lib/demo-state";
import { RoleSwitcher } from "@/components/RoleSwitcher";
import { DEMO_PRACTICE } from "@/lib/types";
import Link from "next/link";

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  const state = getDemoState();
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            Ostella
            <span className="ml-2 text-sm font-normal text-slate-500">
              {DEMO_PRACTICE.name}
            </span>
          </Link>
          <RoleSwitcher currentRole={state.role} />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
