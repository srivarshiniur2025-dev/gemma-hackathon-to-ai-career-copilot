"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CountUp } from "@/components/dashboard/CountUp";
import { useCareerProfile } from "@/contexts/CareerProfileContext";
import { NAVIGATOR_INDEX_LABEL } from "@/lib/gemma";
import { experienceForProfile } from "@/lib/learner-track";
import { CATALOG_COUNTS } from "@/lib/neet/catalog";
import { loadMockProgress, mockStats } from "@/lib/neet/progress";
import { cn } from "@/lib/utils";

const SparklineChart = dynamic(
  () => import("@/components/charts/MetricCardCharts").then((m) => m.SparklineChart),
  { ssr: false, loading: () => <div className="h-full w-full" /> }
);
const RoadmapAreaChart = dynamic(
  () => import("@/components/charts/MetricCardCharts").then((m) => m.RoadmapAreaChart),
  { ssr: false, loading: () => <div className="h-full w-full" /> }
);

const cardMotion = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
};

function MetricCardShell({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      {...cardMotion}
      transition={{ ...cardMotion.transition, delay }}
      whileHover={{ y: -5 }}
      className={cn(
        "cursor-pointer overflow-hidden rounded-[22px] p-5 shadow-[0_2px_8px_rgba(24,24,27,0.04),0_8px_24px_rgba(24,24,27,0.06)] transition-shadow duration-300 hover:shadow-[0_4px_16px_rgba(24,24,27,0.08),0_12px_32px_rgba(24,24,27,0.08)]",
        className
      )}
    >
      {children}
    </motion.div>
  );
}

export function MetricCardsGrid() {
  const { career, skillScore, skillSparkline, roadmapCurve, profile } = useCareerProfile();
  const exp = experienceForProfile(profile);
  const [mocksDone, setMocksDone] = useState(0);
  const [pyq, setPyq] = useState(0);

  useEffect(() => {
    const stats = mockStats(loadMockProgress());
    setMocksDone(stats.completed);
    setPyq(stats.pyqAccuracy);
  }, [career.assessmentCount]);

  if (exp === "neet" || exp === "high_school") {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCardShell delay={0.05} className="bg-gradient-to-br from-[#0D9488] to-[#0F766E] text-white lg:col-span-2">
          <p className="text-xs font-medium text-white/80">NEET readiness</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight">
            <CountUp value={Math.max(skillScore, pyq || 18)} suffix="%" />
          </p>
          <div className="mt-4 h-14 w-full">
            <SparklineChart data={skillSparkline} />
          </div>
        </MetricCardShell>
        <MetricCardShell delay={0.1} className="bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] text-white">
          <p className="text-xs font-medium text-white/80">PYQ accuracy</p>
          <p className="mt-1 text-3xl font-extrabold tracking-tight">
            <CountUp value={pyq} suffix="%" />
          </p>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/20">
            <motion.div
              className="h-full rounded-full bg-white"
              initial={{ width: 0 }}
              animate={{ width: `${pyq}%` }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </MetricCardShell>
        <MetricCardShell delay={0.12} className="bg-gradient-to-br from-[#F59E0B] to-[#D97706] text-white">
          <p className="text-xs font-medium text-white/80">Mocks done</p>
          <p className="mt-1 text-3xl font-extrabold tracking-tight">
            <CountUp value={mocksDone} />
          </p>
          <p className="mt-1 text-xs text-white/70">of {CATALOG_COUNTS.neet}</p>
        </MetricCardShell>
        <MetricCardShell delay={0.16} className="bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] text-white lg:col-span-2">
          <p className="text-xs font-medium text-white/80">Roadmap left</p>
          <p className="mt-1 text-3xl font-extrabold tracking-tight">
            <CountUp value={career.roadmapDaysRemaining} />
            <span className="text-lg font-bold"> days</span>
          </p>
          <div className="mt-3 h-12 w-full">
            <RoadmapAreaChart data={roadmapCurve} />
          </div>
        </MetricCardShell>
        <MetricCardShell delay={0.2} className="bg-gradient-to-br from-[#EC4899] to-[#BE185D] text-white">
          <p className="text-xs font-medium text-white/80">Streak</p>
          <p className="mt-1 text-3xl font-extrabold">
            <CountUp value={career.streak.count} />
          </p>
          <p className="text-xs text-white/70">days live</p>
        </MetricCardShell>
        <MetricCardShell delay={0.22} className="bg-gradient-to-br from-[#312E81] to-[#1E1B4B] text-white">
          <p className="text-xs font-medium text-white/80">Avg score</p>
          <p className="mt-1 text-3xl font-extrabold">
            <CountUp value={pyq || skillScore} suffix="%" />
          </p>
        </MetricCardShell>
      </div>
    );
  }

  if (exp === "school") {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCardShell delay={0.05} className="bg-gradient-to-br from-[#0D9488] to-[#0F766E] text-white lg:col-span-2">
          <p className="text-xs font-medium text-white/80">Confidence index</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight">
            <CountUp value={skillScore} suffix="%" />
          </p>
          <div className="mt-4 h-14 w-full">
            <SparklineChart data={skillSparkline} />
          </div>
        </MetricCardShell>
        <MetricCardShell delay={0.1} className="bg-gradient-to-br from-[#10B981] to-[#059669] text-white">
          <p className="text-xs font-medium text-white/80">Chapters</p>
          <p className="mt-1 text-3xl font-extrabold">
            <CountUp value={mocksDone} />
          </p>
        </MetricCardShell>
        <MetricCardShell delay={0.12} className="bg-gradient-to-br from-[#F59E0B] to-[#D97706] text-white">
          <p className="text-xs font-medium text-white/80">Streak</p>
          <p className="mt-1 text-3xl font-extrabold">
            <CountUp value={career.streak.count} />
          </p>
        </MetricCardShell>
        <MetricCardShell delay={0.16} className="bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] text-white lg:col-span-2">
          <p className="text-xs font-medium text-white/80">Plan remaining</p>
          <p className="mt-1 text-3xl font-extrabold">
            <CountUp value={career.roadmapDaysRemaining} /> days
          </p>
          <div className="mt-3 h-12 w-full">
            <RoadmapAreaChart data={roadmapCurve} />
          </div>
        </MetricCardShell>
        <MetricCardShell delay={0.2} className="bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] text-white lg:col-span-2">
          <p className="text-xs font-medium text-white/80">Curiosity track</p>
          <p className="mt-2 text-lg font-bold">{career.recommendedSkills[0] || "Explore"}</p>
        </MetricCardShell>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <MetricCardShell delay={0.05} className="bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] text-white lg:col-span-2">
        <p className="text-xs font-medium text-white/80">{NAVIGATOR_INDEX_LABEL}</p>
        <p className="mt-1 text-4xl font-extrabold tracking-tight">
          <CountUp value={skillScore} suffix="%" />
        </p>
        <div className="mt-4 h-14 w-full">
          <SparklineChart data={skillSparkline} />
        </div>
      </MetricCardShell>
      <MetricCardShell delay={0.1} className="bg-gradient-to-br from-[#10B981] to-[#059669] text-white">
        <p className="text-xs font-medium text-white/80">ATS Resume</p>
        <p className="mt-1 text-3xl font-extrabold">
          <CountUp value={career.resumeAtsScore} suffix="%" />
        </p>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/20">
          <motion.div
            className="h-full rounded-full bg-white"
            initial={{ width: 0 }}
            animate={{ width: `${career.resumeAtsScore}%` }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </MetricCardShell>
      <MetricCardShell delay={0.12} className="bg-gradient-to-br from-[#F59E0B] to-[#D97706] text-white">
        <p className="text-xs font-medium text-white/80">Streak</p>
        <p className="mt-1 text-3xl font-extrabold">
          <CountUp value={career.streak.count} />
        </p>
      </MetricCardShell>
      <MetricCardShell delay={0.16} className="bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] text-white lg:col-span-2">
        <p className="text-xs font-medium text-white/80">Roadmap remaining</p>
        <p className="mt-1 text-3xl font-extrabold">
          <CountUp value={career.roadmapDaysRemaining} /> days
        </p>
        <div className="mt-3 h-12 w-full">
          <RoadmapAreaChart data={roadmapCurve} />
        </div>
      </MetricCardShell>
      <MetricCardShell delay={0.2} className="bg-gradient-to-br from-[#312E81] to-[#1E1B4B] text-white">
        <p className="text-xs font-medium text-white/80">Internships</p>
        <p className="mt-1 text-3xl font-extrabold">
          <CountUp value={Math.max(career.internshipMatches, 0)} />
        </p>
      </MetricCardShell>
      <MetricCardShell delay={0.22} className="bg-gradient-to-br from-[#EC4899] to-[#BE185D] text-white">
        <p className="text-xs font-medium text-white/80">Interview</p>
        <p className="mt-1 text-3xl font-extrabold">
          <CountUp value={career.interviewScore ?? 0} suffix="%" />
        </p>
      </MetricCardShell>
    </div>
  );
}
