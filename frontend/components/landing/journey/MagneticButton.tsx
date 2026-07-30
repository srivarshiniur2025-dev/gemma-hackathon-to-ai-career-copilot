"use client";

import Link from "next/link";
import { useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type MagneticButtonProps = {
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "ghost";
  children: React.ReactNode;
  className?: string;
};

export function MagneticButton({
  href,
  onClick,
  variant = "primary",
  children,
  className,
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  function onMove(e: React.MouseEvent) {
    if (reduceMotion || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const dx = (e.clientX - r.left - r.width / 2) * 0.22;
    const dy = (e.clientY - r.top - r.height / 2) * 0.22;
    const clamp = (v: number) => Math.max(-6, Math.min(6, v));
    ref.current.style.transform = `translate(${clamp(dx)}px, ${clamp(dy)}px)`;
  }

  function onLeave() {
    if (ref.current) ref.current.style.transform = "";
  }

  const styles = cn(
    "inline-flex h-12 items-center justify-center rounded-full px-7 text-sm font-semibold transition-colors duration-300",
    variant === "primary"
      ? "bg-[#18181B] text-white hover:bg-[#27272A]"
      : "border border-[#E4E4E7] bg-white text-[#18181B] hover:bg-[#FAFAFA]",
    className
  );

  const inner = (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} className="inline-block cursor-pointer">
      <div className={styles}>{children}</div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} onClick={onClick}>
        {inner}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className="border-0 bg-transparent p-0">
      {inner}
    </button>
  );
}
