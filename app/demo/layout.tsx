// app/demo/layout.tsx
import Link from "next/link";
import { getDemoState } from "@/lib/demo-state";
import { RoleSwitcher } from "@/components/RoleSwitcher";
import { DEMO_PRACTICE } from "@/lib/types";

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const state = getDemoState();
  return (
    <div className="min-h-screen bg-cream-50">
      <header className="border-b border-cream-200 bg-cream-50/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-baseline gap-3 group">
            <span className="font-display text-2xl font-medium text-ink-900 tracking-tight">
              Ostella
            </span>
            <span className="text-xs uppercase tracking-wider text-ink-500 hidden sm:inline">
              {DEMO_PRACTICE.name}
            </span>
          </Link>
          <RoleSwitcher currentRole={state.role} />
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-12">{children}</main>
    </div>
  );
}
