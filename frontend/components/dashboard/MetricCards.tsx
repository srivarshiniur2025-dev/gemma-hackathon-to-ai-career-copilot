"use client";

import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Line,
  LineChart,
  ResponsiveContainer,
} from "recharts";
import { CountUp } from "@/components/dashboard/CountUp";
import {
  dashboardMetrics,
  roadmapCurveData,
  skillScoreSparkline,
} from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";

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

function CircularProgress({ value, size = 56 }: { value: number; size?: number }) {
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth={stroke}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="white"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  );
}

export function MetricCardsGrid() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <MetricCardShell
        delay={0.05}
        className="bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] text-white"
      >
        <p className="text-xs font-medium text-white/80">Skill Score</p>
        <p className="mt-1 text-3xl font-extrabold tracking-tight">
          <CountUp value={dashboardMetrics.skillScore} suffix="%" />
        </p>
        <div className="mt-3 h-10 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={skillScoreSparkline}>
              <Line
                type="monotone"
                dataKey="v"
                stroke="rgba(255,255,255,0.9)"
                strokeWidth={2}
                dot={false}
                animationDuration={1200}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </MetricCardShell>

      <MetricCardShell
        delay={0.1}
        className="bg-gradient-to-br from-[#10B981] to-[#059669] text-white"
      >
        <p className="text-xs font-medium text-white/80">ATS Resume Score</p>
        <p className="mt-1 text-3xl font-extrabold tracking-tight">
          <CountUp value={dashboardMetrics.atsResumeScore} suffix="%" />
        </p>
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/20">
          <motion.div
            className="h-full rounded-full bg-white"
            initial={{ width: 0 }}
            animate={{ width: `${dashboardMetrics.atsResumeScore}%` }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </MetricCardShell>

      <MetricCardShell
        delay={0.15}
        className="bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] text-white"
      >
        <p className="text-xs font-medium text-white/80">Roadmap Progress</p>
        <p className="mt-1 text-2xl font-extrabold leading-tight tracking-tight">
          <CountUp value={dashboardMetrics.roadmapDaysRemaining} />
          <span className="text-lg font-bold"> Days</span>
        </p>
        <p className="text-xs text-white/70">Remaining</p>
        <div className="mt-2 h-10 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={roadmapCurveData}>
              <Area
                type="monotone"
                dataKey="progress"
                stroke="rgba(255,255,255,0.9)"
                fill="rgba(255,255,255,0.15)"
                strokeWidth={2}
                animationDuration={1200}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </MetricCardShell>

      <MetricCardShell
        delay={0.2}
        className="bg-gradient-to-br from-[#312E81] to-[#1E1B4B] text-white"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-white/80">Internship Matches</p>
            <p className="mt-1 text-3xl font-extrabold tracking-tight">
              <CountUp value={dashboardMetrics.internshipMatches} />
            </p>
            <p className="text-xs text-white/70">Matches</p>
          </div>
          <div className="relative flex items-center justify-center">
            <CircularProgress value={Math.min(dashboardMetrics.internshipMatches * 4, 100)} />
            <span className="absolute text-[10px] font-bold">
              <CountUp value={dashboardMetrics.internshipMatches} />
            </span>
          </div>
        </div>
      </MetricCardShell>
    </div>
  );
}
