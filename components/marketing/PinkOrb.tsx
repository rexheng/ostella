// components/marketing/PinkOrb.tsx
// Glowing pink orb that follows the cursor inside its parent element.
// Pure CSS radial-gradient — no canvas, no trails, no flying lines.
// A requestAnimationFrame loop lerps the orb toward the cursor so the
// motion is smooth instead of jumpy. When the cursor leaves the
// parent, the orb drifts back to a resting position near the
// top-right of the hero.

"use client";

import { useEffect, useRef } from "react";

export function PinkOrb() {
  const orbRef = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0.72, y: 0.4 });
  const current = useRef({ x: 0.72, y: 0.4 });

  useEffect(() => {
    const el = orbRef.current;
    if (!el) return;
    const host = el.parentElement;
    if (!host) return;

    function onMove(e: MouseEvent) {
      const rect = host!.getBoundingClientRect();
      target.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      };
    }
    function onLeave() {
      // Drift back to the resting spot
      target.current = { x: 0.72, y: 0.4 };
    }

    let raf = 0;
    function loop() {
      current.current.x += (target.current.x - current.current.x) * 0.08;
      current.current.y += (target.current.y - current.current.y) * 0.08;
      if (el) {
        el.style.setProperty("--mx", `${current.current.x * 100}%`);
        el.style.setProperty("--my", `${current.current.y * 100}%`);
      }
      raf = requestAnimationFrame(loop);
    }

    host.addEventListener("mousemove", onMove);
    host.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(loop);
    return () => {
      host.removeEventListener("mousemove", onMove);
      host.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={orbRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 animate-[orbBreathe_7s_ease-in-out_infinite]"
      style={
        {
          background:
            "radial-gradient(620px 520px at var(--mx, 72%) var(--my, 40%), rgba(255, 77, 141, 0.38), rgba(255, 154, 184, 0.22) 28%, rgba(255, 190, 210, 0.08) 55%, transparent 72%)",
          "--mx": "72%",
          "--my": "40%",
        } as React.CSSProperties
      }
    />
  );
}
