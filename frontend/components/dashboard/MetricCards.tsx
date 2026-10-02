"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { CountUp } from "@/components/dashboard/CountUp";
import { useAuth } from "@/contexts/AuthContext";
import { useCareerProfile } from "@/contexts/CareerProfileContext";
import { useSchoolInsights } from "@/lib/school/insights";
import { subjectLabel } from "@/lib/school/syllabus";
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
  href,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  href: string;
}) {
  return (
    <motion.div
      {...cardMotion}
      transition={{ ...cardMotion.transition, delay }}
      whileHover={{ y: -4 }}
      className={cn("rounded-[22px]", className?.includes("col-span-2") && "lg:col-span-2")}
    >
      <Link
        href={href}
        className={cn(
          "group relative block h-full overflow-hidden rounded-[22px] border border-white/5 p-5 text-white shadow-[0_2px_8px_rgba(24,24,27,0.04),0_8px_24px_rgba(24,24,27,0.06)] transition-[box-shadow,border-color] duration-300 hover:border-accent/40 hover:shadow-[0_4px_16px_rgba(24,24,27,0.10),0_12px_32px_rgba(24,24,27,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
          className?.replace("lg:col-span-2", "")
        )}
      >
        {children}
        <ArrowUpRight
          aria-hidden
          className="absolute right-4 top-4 h-4 w-4 text-white/40 transition-[color,transform] duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white"
        />
      </Link>
    </motion.div>
  );
}

const TEAL = "bg-gradient-to-br from-accent to-accent-hover";
const CHARCOAL = "bg-primary";
const GRAPHITE = "bg-gradient-to-br from-primary-hover to-primary";

export function MetricCardsGrid() {
  const { career, skillScore, skillSparkline, roadmapCurve, profile } = useCareerProfile();
  const exp = experienceForProfile(profile);
  const [mocksDone, setMocksDone] = useState(0);
  const [pyq, setPyq] = useState(0);
  const { user } = useAuth();
  const email = user?.email ?? undefined;
  const school = useSchoolInsights(email, profile?.onboarding_answers, exp === "school");

  useEffect(() => {
    const stats = mockStats(loadMockProgress());
    setMocksDone(stats.completed);
    setPyq(stats.pyqAccuracy);
  }, [career.assessmentCount]);

  if (exp === "neet" || exp === "high_school") {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCardShell delay={0.05} href="/progress" className={TEAL + " lg:col-span-2"}>
          <p className="text-xs font-medium text-white/80">NEET readiness</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight">
            <CountUp value={Math.max(skillScore, pyq || 18)} suffix="%" />
          </p>
          <div className="mt-4 h-14 w-full">
            <SparklineChart data={skillSparkline} />
          </div>
        </MetricCardShell>
        <MetricCardShell delay={0.1} href="/mocks" className={GRAPHITE}>
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
        <MetricCardShell delay={0.12} href="/mocks" className={CHARCOAL}>
          <p className="text-xs font-medium text-white/80">Mocks done</p>
          <p className="mt-1 text-3xl font-extrabold tracking-tight">
            <CountUp value={mocksDone} />
          </p>
          <p className="mt-1 text-xs text-white/70">of {CATALOG_COUNTS.neet}</p>
        </MetricCardShell>
        <MetricCardShell delay={0.16} href="/roadmap" className={GRAPHITE + " lg:col-span-2"}>
          <p className="text-xs font-medium text-white/80">Roadmap left</p>
          <p className="mt-1 text-3xl font-extrabold tracking-tight">
            <CountUp value={career.roadmapDaysRemaining} />
            <span className="text-lg font-bold"> days</span>
          </p>
          <div className="mt-3 h-12 w-full">
            <RoadmapAreaChart data={roadmapCurve} />
          </div>
        </MetricCardShell>
        <MetricCardShell delay={0.2} href="/progress" className={CHARCOAL}>
          <p className="text-xs font-medium text-white/80">Streak</p>
          <p className="mt-1 text-3xl font-extrabold">
            <CountUp value={career.streak.count} />
          </p>
          <p className="text-xs text-white/70">days live</p>
        </MetricCardShell>
        <MetricCardShell delay={0.22} href="/progress" className={GRAPHITE}>
          <p className="text-xs font-medium text-white/80">Avg score</p>
          <p className="mt-1 text-3xl font-extrabold">
            <CountUp value={pyq || skillScore} suffix="%" />
          </p>
        </MetricCardShell>
      </div>
    );
  }

  if (exp === "school") {
    const s = school;
    const subjectName = s ? `Class ${s.pick.classLevel} ${subjectLabel(s.pick.subject)}` : "Your subject";
    const focus = s?.weakest ?? s?.nextUp ?? null;
    const trend = s && s.accuracyTrend.length >= 2 ? s.accuracyTrend : [{ v: 0 }, { v: s?.accuracy ?? 0 }];
    const weekPoints = s?.pointsByDay.reduce((sum, d) => sum + d.progress, 0) ?? 0;
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCardShell delay={0.05} href="/scoreboard" className={TEAL + " lg:col-span-2"}>
          <p className="text-xs font-medium text-white/80">Your accuracy</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight">
            {s?.accuracy != null ? <CountUp value={s.accuracy} suffix="%" /> : "—"}
          </p>
          <p className="mt-1 text-xs text-white/75">
            {s?.quizzesTaken
              ? `${s.questionsAnswered} questions across ${s.quizzesTaken} quiz${s.quizzesTaken === 1 ? "" : "zes"}`
              : "Take your first chapter test to see this"}
          </p>
          <div className="mt-3 h-12 w-full">
            <SparklineChart data={trend} />
          </div>
        </MetricCardShell>
        <MetricCardShell delay={0.1} href="/mocks" className={GRAPHITE}>
          <p className="text-xs font-medium text-white/80">Chapters tested</p>
          <p className="mt-1 text-3xl font-extrabold">
            <CountUp value={s?.testedCount ?? 0} />
            <span className="text-lg font-bold text-white/60">/{s?.chapters.length ?? 0}</span>
          </p>
          <p className="mt-1 text-xs text-white/70">{s?.masteredCount ?? 0} mastered · {subjectName}</p>
        </MetricCardShell>
        <MetricCardShell delay={0.12} href="/scoreboard" className={CHARCOAL}>
          <p className="text-xs font-medium text-white/80">Study streak</p>
          <p className="mt-1 text-3xl font-extrabold">
            <CountUp value={s?.streak ?? 0} />
            <span className="text-lg font-bold"> day{s?.streak === 1 ? "" : "s"}</span>
          </p>
          <p className="mt-1 text-xs text-white/70">{s?.level.name ?? "Rookie"} · {s?.points ?? 0} pts</p>
        </MetricCardShell>
        <MetricCardShell delay={0.16} href="/planner" className={GRAPHITE + " lg:col-span-2"}>
          <p className="text-xs font-medium text-white/80">Points this week</p>
          <p className="mt-1 text-3xl font-extrabold">
            <CountUp value={weekPoints} />
            <span className="ml-2 text-sm font-semibold text-white/70">· ~{s?.daysToExams ?? 0} days to exams</span>
          </p>
          <div className="mt-3 h-12 w-full">
            <RoadmapAreaChart data={s?.pointsByDay ?? [{ progress: 0 }]} />
          </div>
        </MetricCardShell>
        <MetricCardShell
          delay={0.2}
          href={focus ? `/mocks?chapter=${focus.chapter.id}` : "/mocks"}
          className={CHARCOAL + " lg:col-span-2"}
        >
          <p className="text-xs font-medium text-white/80">
            {s?.weakest ? `Weakest chapter · ${s.weakest.mastery}%` : "Next chapter to try"}
          </p>
          <p className="mt-2 text-lg font-bold">
            {focus ? `Ch ${focus.chapter.number}: ${focus.chapter.name}` : "All chapters mastered"}
          </p>
          <p className="mt-1 text-xs text-white/70">
            {s?.weakest ? "Retake the chapter test to push it above 80%" : "Start its test to unlock your progress"}
          </p>
        </MetricCardShell>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <MetricCardShell delay={0.05} href="/assessment" className={GRAPHITE + " lg:col-span-2"}>
        <p className="text-xs font-medium text-white/80">{NAVIGATOR_INDEX_LABEL}</p>
        <p className="mt-1 text-4xl font-extrabold tracking-tight">
          <CountUp value={skillScore} suffix="%" />
        </p>
        <div className="mt-4 h-14 w-full">
          <SparklineChart data={skillSparkline} />
        </div>
      </MetricCardShell>
      <MetricCardShell delay={0.1} href="/resume" className={CHARCOAL}>
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
      <MetricCardShell delay={0.12} href="/progress" className={GRAPHITE}>
        <p className="text-xs font-medium text-white/80">Streak</p>
        <p className="mt-1 text-3xl font-extrabold">
          <CountUp value={career.streak.count} />
        </p>
      </MetricCardShell>
      <MetricCardShell delay={0.16} href="/roadmap" className={CHARCOAL + " lg:col-span-2"}>
        <p className="text-xs font-medium text-white/80">Roadmap remaining</p>
        <p className="mt-1 text-3xl font-extrabold">
          <CountUp value={career.roadmapDaysRemaining} /> days
        </p>
        <div className="mt-3 h-12 w-full">
          <RoadmapAreaChart data={roadmapCurve} />
        </div>
      </MetricCardShell>
      <MetricCardShell delay={0.2} href="/internships" className={GRAPHITE}>
        <p className="text-xs font-medium text-white/80">Internships</p>
        <p className="mt-1 text-3xl font-extrabold">
          <CountUp value={Math.max(career.internshipMatches, 0)} />
        </p>
      </MetricCardShell>
      <MetricCardShell delay={0.22} href="/interview" className={CHARCOAL}>
        <p className="text-xs font-medium text-white/80">Interview</p>
        <p className="mt-1 text-3xl font-extrabold">
          <CountUp value={career.interviewScore ?? 0} suffix="%" />
        </p>
      </MetricCardShell>
    </div>
  );
}
