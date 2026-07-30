"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Briefcase,
  ClipboardList,
  Code2,
  FileText,
  Mic,
  Navigation,
} from "lucide-react";
import {
  HERO_MILESTONES,
  HERO_NAVIGATOR,
  HERO_ROUTE_D,
  HERO_VIEWBOX,
} from "@/lib/hero-journey";
import { cn } from "@/lib/utils";

const ICONS = {
  clipboard: ClipboardList,
  book: BookOpen,
  code: Code2,
  file: FileText,
  mic: Mic,
  briefcase: Briefcase,
};

const EASE = [0.22, 1, 0.36, 1] as const;

/** Per-milestone label placement to avoid collisions */
const LABEL_OFFSET: Record<string, string> = {
  assessment: "mt-2",
  learning: "mt-2 ml-2",
  projects: "mt-2 -ml-6 text-right",
  resume: "mt-2 ml-4 text-left",
  interview: "mt-2",
  internship: "mt-2 ml-1",
};

function NavigatorPin() {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      animate={reduceMotion ? undefined : { scale: [1, 1.03, 1] }}
      transition={{ duration: 3.5, repeat: Infinity, ease: [0.45, 0, 0.55, 1] }}
      className="relative"
    >
      {!reduceMotion && (
        <span className="absolute left-1/2 top-1/2 h-11 w-11 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0D9488]/10 animate-[pulse_3.5s_ease-in-out_infinite]" />
      )}
      <svg width="32" height="40" viewBox="0 0 32 40" fill="none" className="relative drop-shadow-sm">
        <path
          d="M16 38C16 38 4 26 4 13C4 7.5 9.5 2 16 2C22.5 2 28 7.5 28 13C28 26 16 38 16 38Z"
          fill="#FFFFFF"
          stroke="#18181B"
          strokeWidth="1"
        />
        <circle cx="16" cy="13" r="7" fill="#FAFAFA" stroke="#E4E4E7" strokeWidth="0.75" />
        <circle cx="16" cy="13" r="2.5" fill="#0D9488" />
        <path d="M16 7L17 12L16 11L15 12L16 7Z" fill="#18181B" />
      </svg>
    </motion.div>
  );
}

function FloatingCard({
  className,
  children,
  delay = 0,
}: {
  className?: string;
  children: React.ReactNode;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay + 1.2, duration: 0.6, ease: EASE }}
      whileHover={{ y: -6 }}
      className={cn(
        "pointer-events-auto rounded-xl border border-[#E4E4E7] bg-white px-3.5 py-2.5 shadow-[0_4px_24px_rgba(24,24,27,0.06)]",
        className
      )}
    >
      {children}
    </motion.div>
  );
}

export function CareerJourneyIllustration() {
  const reduceMotion = useReducedMotion();
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLen, setPathLen] = useState(0);
  const [drawn, setDrawn] = useState(!!reduceMotion);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    if (pathRef.current) {
      setPathLen(pathRef.current.getTotalLength());
    }
    if (reduceMotion) {
      setDrawn(true);
      return;
    }
    const t = setTimeout(() => setDrawn(true), 100);
    return () => clearTimeout(t);
  }, [reduceMotion]);

  const strokeOffset = drawn || !pathLen ? 0 : pathLen;

  return (
    <div className="relative h-full w-full">
      <svg
        viewBox={`0 0 ${HERO_VIEWBOX.w} ${HERO_VIEWBOX.h}`}
        className="absolute inset-0 h-full w-full"
        fill="none"
        preserveAspectRatio="xMidYMid meet"
      >
        <path d={HERO_ROUTE_D} stroke="#E4E4E7" strokeWidth="1.25" strokeLinecap="round" />
        <path
          ref={pathRef}
          d={HERO_ROUTE_D}
          stroke="#0D9488"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray={pathLen || 1000}
          strokeDashoffset={strokeOffset}
          style={{
            transition: reduceMotion ? undefined : "stroke-dashoffset 1.8s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />
      </svg>

      {HERO_MILESTONES.map((m, i) => {
        const Icon = ICONS[m.icon];
        const isHovered = hovered === m.id;
        return (
          <motion.div
            key={m.id}
            initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: isHovered ? 1.05 : 1 }}
            transition={{ delay: 0.9 + i * 0.12, duration: 0.5, ease: EASE }}
            className="pointer-events-auto absolute z-[2] -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${(m.x / HERO_VIEWBOX.w) * 100}%`,
              top: `${(m.y / HERO_VIEWBOX.h) * 100}%`,
            }}
            onMouseEnter={() => setHovered(m.id)}
            onMouseLeave={() => setHovered(null)}
          >
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full border bg-white transition-shadow sm:h-11 sm:w-11",
                isHovered
                  ? "border-[#0D9488]/30 shadow-[0_8px_28px_rgba(24,24,27,0.1)]"
                  : "border-[#E4E4E7] shadow-[0_2px_8px_rgba(24,24,27,0.04)]"
              )}
            >
              <Icon className="h-4 w-4 text-[#52525B] sm:h-[18px] sm:w-[18px]" strokeWidth={1.5} />
            </div>
            <div className={cn("whitespace-nowrap", LABEL_OFFSET[m.id] ?? "mt-2 text-center")}>
              <p className="text-[10px] font-semibold text-[#18181B] sm:text-[11px]">{m.label}</p>
              <p className="text-[8px] text-[#A1A1AA] sm:text-[9px]">{m.sub}</p>
            </div>
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="absolute left-1/2 top-full z-20 mt-1 -translate-x-1/2 whitespace-nowrap rounded-lg border border-[#E4E4E7] bg-white px-2.5 py-1.5 text-[10px] text-[#71717A] shadow-md"
                >
                  {m.sub}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.5, duration: 0.6, ease: EASE }}
        className="pointer-events-none absolute z-[3] -translate-x-1/2 -translate-y-full"
        style={{
          left: `${(HERO_NAVIGATOR.x / HERO_VIEWBOX.w) * 100}%`,
          top: `${(HERO_NAVIGATOR.y / HERO_VIEWBOX.h) * 100}%`,
        }}
      >
        <NavigatorPin />
      </motion.div>

      {/* Cards — spaced to avoid milestones & navigator */}
      <FloatingCard className="absolute left-[18%] top-[78%] z-[4] w-[9.5rem] sm:w-40" delay={0.1}>
        <div className="flex items-center gap-1.5">
          <Navigation className="h-3 w-3 text-[#0D9488]" />
          <p className="text-[9px] font-semibold uppercase tracking-wider text-[#A1A1AA]">
            Navigator Active
          </p>
        </div>
        <p className="mt-1 text-[11px] text-[#52525B]">Charting your career route…</p>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-[#F4F4F5]">
          <div className="h-full w-[14%] rounded-full bg-[#0D9488]" />
        </div>
      </FloatingCard>

      <FloatingCard className="absolute left-[50%] top-[30%] z-[1] w-[8.75rem] sm:w-36" delay={0.2}>
        <p className="text-[9px] font-semibold uppercase tracking-wider text-[#A1A1AA]">Next Stop</p>
        <p className="mt-0.5 text-[11px] font-semibold text-[#18181B]">Skill Assessment</p>
        <p className="text-[9px] text-[#A1A1AA]">~ 8 min read</p>
      </FloatingCard>

      <FloatingCard className="absolute right-0 top-[2%] z-[4] w-[9.5rem] sm:w-40" delay={0.3}>
        <p className="text-[9px] font-semibold uppercase tracking-wider text-[#A1A1AA]">Your Journey</p>
        <p className="mt-0.5 text-base font-bold tabular-nums text-[#18181B]">24%</p>
        <p className="text-[9px] text-[#A1A1AA]">Completed</p>
        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-[#F4F4F5]">
          <div className="h-full w-1/4 rounded-full bg-[#0D9488]" />
        </div>
        <p className="mt-1.5 text-[8px] leading-relaxed text-[#71717A]">
          &ldquo;Every step brings you closer.&rdquo;
        </p>
      </FloatingCard>
    </div>
  );
}
