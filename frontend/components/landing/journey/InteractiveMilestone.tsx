"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { JourneyMilestone } from "@/lib/journey-milestones";
import { MagneticElement } from "@/components/landing/journey/EditorialHeroText";

type Props = {
  index: number;
  milestone: JourneyMilestone;
  anchor: { x: number; y: number };
  viewW: number;
  viewH: number;
  reached: boolean;
  isCurrent: boolean;
  isHovered: boolean;
  onHover: (v: boolean) => void;
  onClick: () => void;
  mouseNear?: boolean;
};

export function InteractiveMilestone({
  index,
  milestone,
  anchor,
  viewW,
  viewH,
  reached,
  isCurrent,
  isHovered,
  onHover,
  onClick,
  mouseNear,
}: Props) {
  const left = `${(anchor.x / viewW) * 100}%`;
  const top = `${(anchor.y / viewH) * 100}%`;

  return (
    <div
      className="absolute z-[3] -translate-x-1/2 -translate-y-1/2"
      style={{ left, top }}
    >
      <MagneticElement strength={0.2}>
        <motion.button
          type="button"
          onMouseEnter={() => onHover(true)}
          onMouseLeave={() => onHover(false)}
          onClick={onClick}
          animate={{
            scale: isHovered ? 1.12 : isCurrent ? 1.08 : mouseNear ? 1.04 : 1,
          }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          className={cn(
            "relative flex h-10 w-10 items-center justify-center rounded-xl border bg-white transition-shadow",
            reached
              ? "border-[#0D9488]/35 shadow-[0_0_0_4px_rgba(13,148,136,0.06)]"
              : "border-[#E4E4E7] shadow-[0_1px_4px_rgba(24,24,27,0.06)]",
            isHovered && "shadow-[0_8px_28px_rgba(24,24,27,0.12)]"
          )}
        >
          <span className="text-[10px] font-bold tabular-nums text-[#52525B]">{index + 1}</span>
          {isCurrent && (
            <motion.span
              className="absolute inset-0 rounded-xl border border-[#0D9488]/40"
              animate={{ scale: [1, 1.2], opacity: [0.5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: [0.22, 1, 0.36, 1] }}
            />
          )}
        </motion.button>
      </MagneticElement>

      <motion.span
        animate={{ opacity: reached || isHovered ? 1 : 0.3 }}
        className="mt-1.5 block text-center text-[9px] font-medium tracking-wide text-[#A1A1AA]"
      >
        {milestone.label}
      </motion.span>

      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-full top-0 z-50 ml-3 w-52 rounded-xl border border-[#E4E4E7] bg-white/95 p-3.5 shadow-[0_12px_40px_rgba(24,24,27,0.1)] backdrop-blur-sm"
          >
            <p className="text-xs font-semibold text-[#18181B]">{milestone.label}</p>
            <p className="mt-2 text-[10px] text-[#71717A]">{milestone.duration}</p>
            {milestone.difficulty && (
              <p className="mt-1 text-[10px] text-[#A1A1AA]">Difficulty · {milestone.difficulty}</p>
            )}
            {milestone.skillsUnlocked && (
              <div className="mt-2 flex flex-wrap gap-1">
                {milestone.skillsUnlocked.map((s) => (
                  <span key={s} className="rounded bg-[#F4F4F5] px-1.5 py-0.5 text-[9px] text-[#52525B]">
                    {s}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-[#F4F4F5]">
              <div className="h-full bg-[#0D9488]" style={{ width: `${milestone.completion}%` }} />
            </div>
            {milestone.aiInsight && (
              <p className="mt-2 text-[10px] leading-relaxed text-[#0D9488]">{milestone.aiInsight}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function SectionPreviewGhost({
  visible,
  headline,
}: {
  visible: boolean;
  headline: string;
}) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 0.35, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none fixed bottom-12 right-8 z-30 max-w-xs text-right"
        >
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#A1A1AA]">Next</p>
          <p className="mt-1 text-sm font-medium text-[#71717A]">{headline}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
