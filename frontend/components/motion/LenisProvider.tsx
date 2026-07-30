"use client";

import { useEffect } from "react";

export function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionQuery.matches) return;

    let lenis: InstanceType<typeof import("lenis").default> | null = null;
    let rafId = 0;
    let isVisible = document.visibilityState === "visible";

    void import("lenis").then(({ default: Lenis }) => {
      if (motionQuery.matches) return;

      lenis = new Lenis({
        duration: 1.0,
        lerp: 0.1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 1.2,
      });

      function raf(time: number) {
        if (isVisible && lenis) lenis.raf(time);
        rafId = requestAnimationFrame(raf);
      }
      rafId = requestAnimationFrame(raf);
    });

    function onVisibilityChange() {
      isVisible = document.visibilityState === "visible";
    }

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      cancelAnimationFrame(rafId);
      lenis?.destroy();
    };
  }, []);

  return <>{children}</>;
}
