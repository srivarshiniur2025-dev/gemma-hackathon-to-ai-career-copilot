"use client";

import { useCallback, useRef } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";

export function HeroAmbientLight() {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const rawX = useMotionValue(0.5);
  const rawY = useMotionValue(0.4);
  const x = useSpring(rawX, { stiffness: 50, damping: 24 });
  const y = useSpring(rawY, { stiffness: 50, damping: 24 });

  const left = useTransform(x, (v) => `${v * 100}%`);
  const top = useTransform(y, (v) => `${v * 100}%`);
  const glow = useMotionTemplate`radial-gradient(600px circle at ${left} ${top}, rgba(13,148,136,0.045), transparent 72%)`;

  const onMove = useCallback(
    (e: React.PointerEvent) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      rawX.set((e.clientX - r.left) / r.width);
      rawY.set((e.clientY - r.top) / r.height);
    },
    [rawX, rawY]
  );

  if (reduceMotion) return null;

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      className="pointer-events-auto absolute inset-0"
      aria-hidden
    >
      <motion.div className="absolute inset-0" style={{ background: glow }} />
    </div>
  );
}
