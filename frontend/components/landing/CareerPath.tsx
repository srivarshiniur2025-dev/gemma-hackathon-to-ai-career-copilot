"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

export const CAREER_MILESTONES = [
  { id: "hero", label: "Start" },
  { id: "features", label: "Platform" },
  { id: "how-it-works", label: "Process" },
  { id: "why-gemma", label: "Engine" },
  { id: "testimonials", label: "Stories" },
  { id: "faq", label: "FAQ" },
  { id: "roadmap", label: "Launch" },
] as const;

export function CareerPath() {
  const { scrollYProgress } = useScroll();
  const pathHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <div
      className="pointer-events-none fixed left-4 top-0 z-30 hidden h-full w-10 lg:left-6 xl:block"
      aria-hidden
    >
      <div className="relative mx-auto h-full w-px bg-border/60">
        <motion.div
          className="absolute left-0 top-0 w-px origin-top bg-accent"
          style={{ height: pathHeight }}
        />

        {CAREER_MILESTONES.map((milestone, i) => {
          const threshold = i / (CAREER_MILESTONES.length - 1);
          return (
            <MilestoneDot
              key={milestone.id}
              milestone={milestone}
              top={`${threshold * 92 + 4}%`}
              scrollYProgress={scrollYProgress}
              threshold={threshold}
            />
          );
        })}
      </div>
    </div>
  );
}

function MilestoneDot({
  milestone,
  top,
  scrollYProgress,
  threshold,
}: {
  milestone: (typeof CAREER_MILESTONES)[number];
  top: string;
  scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"];
  threshold: number;
}) {
  const isActive = useTransform(scrollYProgress, (v) => v >= threshold - 0.02);
  const scale = useTransform(isActive, (active) => (active ? 1.15 : 1));
  const opacity = useTransform(isActive, (active) => (active ? 1 : 0.35));

  return (
    <motion.div
      className="absolute -left-[5px] flex items-center gap-2"
      style={{ top, scale, opacity }}
    >
      <motion.div
        className={cn(
          "h-2.5 w-2.5 rounded-full border-2 border-white bg-accent shadow-sm",
          "ring-2 ring-accent/20"
        )}
      />
      <span className="whitespace-nowrap text-[9px] font-semibold uppercase tracking-wider text-muted">
        {milestone.label}
      </span>
    </motion.div>
  );
}

export function CareerSection({
  id,
  children,
  className,
  highlight = false,
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
  highlight?: boolean;
}) {
  return (
    <section
      id={id}
      data-career-section={id}
      className={cn(
        "relative transition-colors duration-700",
        highlight && "bg-background-secondary/50",
        className
      )}
    >
      {children}
    </section>
  );
}
