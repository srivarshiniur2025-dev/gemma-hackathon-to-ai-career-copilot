"use client";

import { useEffect } from "react";

/** Smooth scroll for the landing page only — deferred via idle callback. */
export function LandingLenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionQuery.matches) return;

    let lenis: InstanceType<typeof import("lenis").default> | null = null;
    let rafId = 0;
    let isVisible = document.visibilityState === "visible";
    let started = false;

    const initLenis = () => {
      if (started || motionQuery.matches) return;
      started = true;

      void import("lenis").then(({ default: Lenis }) => {
        if (motionQuery.matches) return;

        lenis = new Lenis({
          duration: 1.0,
          lerp: 0.1,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: true,
          touchMultiplier: 1.2,
        });

        lenis.on("scroll", () => {
          void import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => ScrollTrigger.update());
        });

        function raf(time: number) {
          if (isVisible && lenis) lenis.raf(time);
          rafId = requestAnimationFrame(raf);
        }
        rafId = requestAnimationFrame(raf);
      });
    };

    let idleId: number | undefined;
    let timerId: ReturnType<typeof setTimeout> | undefined;

    if ("requestIdleCallback" in window) {
      idleId = requestIdleCallback(initLenis, { timeout: 2000 });
    } else {
      timerId = setTimeout(initLenis, 1);
    }

    function onVisibilityChange() {
      isVisible = document.visibilityState === "visible";
    }

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      if (idleId !== undefined) cancelIdleCallback(idleId);
      if (timerId !== undefined) clearTimeout(timerId);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      cancelAnimationFrame(rafId);
      lenis?.destroy();
    };
  }, []);

  return <>{children}</>;
}
