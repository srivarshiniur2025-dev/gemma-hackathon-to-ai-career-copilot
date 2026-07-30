"use client";

import type { JourneyMilestone } from "@/lib/journey-milestones";
import { cn } from "@/lib/utils";

type SectionLayoutProps = {
  milestone: JourneyMilestone;
  children: React.ReactNode;
  background?: React.ReactNode;
  className?: string;
  visualClassName?: string;
  minHeight?: string;
};

export function SectionLayout({
  milestone,
  children,
  background,
  className,
  visualClassName,
  minHeight = "min-h-[90vh]",
}: SectionLayoutProps) {
  return (
    <section
      id={milestone.sectionId}
      data-milestone={milestone.id}
      className={cn("relative overflow-hidden bg-white px-6 py-24 lg:px-12 lg:py-32", minHeight, className)}
    >
      {background}
      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[minmax(0,42%)_minmax(0,58%)] lg:gap-10">
        <div className="max-w-xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#A1A1AA]">
            {milestone.label}
          </p>
          <h2 className="font-heading mt-4 text-[clamp(1.75rem,3.5vw,2.75rem)] font-extrabold leading-[1.08] tracking-[-0.02em] text-[#18181B]">
            {milestone.headline}
          </h2>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-[#71717A]">{milestone.body}</p>
          <div className="mt-8 flex items-center gap-3 text-[10px] font-medium uppercase tracking-wider text-[#A1A1AA]">
            <span>{milestone.duration}</span>
            <span className="h-px w-8 bg-[#E4E4E7]" />
            <span className="tabular-nums text-[#0D9488]">{milestone.completion}% complete</span>
          </div>
        </div>
        <div className={cn("relative min-h-[360px] lg:min-h-[480px]", visualClassName)}>{children}</div>
      </div>
    </section>
  );
}
