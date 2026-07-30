"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { JourneyMilestone } from "@/lib/journey-milestones";

type JourneySectionProps = {
  milestone: JourneyMilestone;
  progress: number;
  children?: React.ReactNode;
};

export function JourneySection({ milestone, progress, children }: JourneySectionProps) {
  const reduceMotion = useReducedMotion();
  const distance = Math.abs(progress - milestone.progress);
  const isActive = distance < 0.08;
  const isApproaching = progress < milestone.progress && distance < 0.12;
  const opacity = reduceMotion ? 1 : isActive ? 1 : isApproaching ? 0.5 : 0.15;

  return (
    <section
      id={milestone.sectionId}
      data-milestone={milestone.id}
      className="relative flex min-h-[75vh] items-center bg-white px-6 py-24 lg:px-12 lg:py-28"
    >
      <motion.div
        animate={{ opacity }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-xl lg:ml-[8%]"
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#A1A1AA]">
          {milestone.label}
        </p>
        <h2 className="font-heading mt-4 text-[clamp(1.75rem,3.5vw,2.75rem)] font-extrabold leading-[1.08] tracking-[-0.02em] text-[#18181B]">
          {milestone.headline}
        </h2>
        <p className="mt-5 max-w-lg text-lg leading-relaxed text-[#71717A]">{milestone.body}</p>
        {children}
        {isActive && !reduceMotion && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 flex items-center gap-3 text-[10px] font-medium uppercase tracking-wider text-[#A1A1AA]"
          >
            <span>{milestone.duration}</span>
            <span className="h-px w-8 bg-[#E4E4E7]" />
            <span className="tabular-nums text-[#0D9488]">{milestone.completion}% complete</span>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
