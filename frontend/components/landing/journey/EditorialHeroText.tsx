"use client";

import { useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

export function EditorialHeroText({
  tagline,
  children,
  className,
}: {
  tagline: string;
  children: React.ReactNode;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <div className={cn("relative z-20", className)}>
      <motion.p
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
        className="mb-8 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#A1A1AA]"
      >
        {tagline}
      </motion.p>
      {children}
    </div>
  );
}

export function HeadlineAssemble() {
  const reduceMotion = useReducedMotion();
  const line1 = "Navigate".split("");
  const line2 = " your career with precision.".split("");

  if (reduceMotion) {
    return (
      <h1 className="font-heading text-[clamp(2.75rem,7vw,5.5rem)] font-extrabold leading-[1.02] tracking-[-0.03em] text-[#18181B]">
        <span className="relative text-[#0D9488]">
          Navigate
          <span className="absolute -bottom-1 left-0 h-[3px] w-full bg-[#0D9488]/40" />
        </span>
        your career with precision.
      </h1>
    );
  }

  return (
    <h1
      className="font-heading text-[clamp(2.75rem,7vw,5.5rem)] font-extrabold leading-[1.02] tracking-[-0.03em] text-[#18181B]"
      aria-label="Navigate your career with precision."
    >
      <span className="inline-flex flex-wrap">
        {line1.map((char, i) => (
          <motion.span
            key={`n-${i}`}
            initial={{ opacity: 0, y: 28, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.35 + i * 0.04, duration: 0.55, ease: EASE }}
            className="relative inline-block text-[#0D9488]"
          >
            {char === " " ? "\u00A0" : char}
            {i === line1.length - 1 && (
              <motion.span
                className="absolute -bottom-1 left-0 h-[3px] bg-[#0D9488]"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 0.9, duration: 0.7, ease: EASE }}
              />
            )}
          </motion.span>
        ))}
      </span>
      <span className="inline-flex flex-wrap">
        {line2.map((char, i) => (
          <motion.span
            key={`r-${i}`}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 + i * 0.018, duration: 0.45, ease: EASE }}
            className="inline-block"
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </span>
    </h1>
  );
}

export function ParagraphLines({ text }: { text: string }) {
  const reduceMotion = useReducedMotion();
  const sentences = text.match(/[^.!?]+[.!?]+/g) ?? [text];

  if (reduceMotion) {
    return <p className="mt-6 max-w-lg text-lg leading-[1.65] text-[#71717A]">{text}</p>;
  }

  return (
    <div className="mt-6 max-w-lg space-y-1 overflow-hidden">
      {sentences.map((s, i) => (
        <div key={i} className="overflow-hidden">
          <motion.p
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.1 + i * 0.15, duration: 0.65, ease: EASE }}
            className="text-lg leading-[1.65] text-[#71717A]"
          >
            {s.trim()}
          </motion.p>
        </div>
      ))}
    </div>
  );
}

export function MagneticElement({
  children,
  className,
  strength = 0.25,
}: {
  children: React.ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  function onMove(e: React.MouseEvent) {
    if (reduceMotion || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const dx = (e.clientX - r.left - r.width / 2) * strength;
    const dy = (e.clientY - r.top - r.height / 2) * strength;
    const clamp = (v: number) => Math.max(-6, Math.min(6, v));
    ref.current.style.transform = `translate(${clamp(dx)}px, ${clamp(dy)}px)`;
  }

  function onLeave() {
    if (ref.current) ref.current.style.transform = "";
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={cn("transition-transform duration-300 ease-out", className)}
      style={{ willChange: "transform" }}
    >
      {children}
    </div>
  );
}
