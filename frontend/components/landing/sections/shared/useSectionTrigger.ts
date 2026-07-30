"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function useSectionTrigger(
  onEnter: () => void,
  deps: React.DependencyList = []
) {
  const ref = useRef<HTMLElement>(null);
  const fired = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 72%",
      once: true,
      onEnter: () => {
        if (fired.current) return;
        fired.current = true;
        onEnter();
      },
    });

    return () => st.kill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return ref;
}

export function animateCount(
  from: number,
  to: number,
  duration: number,
  onUpdate: (v: number) => void
) {
  const obj = { val: from };
  return gsap.to(obj, {
    val: to,
    duration,
    ease: "power2.out",
    onUpdate: () => onUpdate(Math.round(obj.val)),
  });
}

export const PREMIUM_EASE = "power3.out";
