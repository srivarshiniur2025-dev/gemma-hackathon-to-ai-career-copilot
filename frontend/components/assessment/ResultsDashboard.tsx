"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Award,
  Briefcase,
  FileText,
  Map,
  Mic,
  Target,
  TrendingUp,
} from "lucide-react";
import { GemmaBadge, GemmaModelTag } from "@/components/gemma/GemmaBrand";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import type { AssessmentResults } from "@/lib/assessment-types";

const SkillRadarChart = dynamic(
  () => import("@/components/charts/DashboardCharts").then((m) => m.SkillRadarChart),
  { ssr: false, loading: () => <div className="h-[280px] animate-pulse rounded-lg bg-[#F4F4F5]" /> }
);
const ProgressBarChart = dynamic(
  () => import("@/components/charts/DashboardCharts").then((m) => m.ProgressBarChart),
  { ssr: false, loading: () => <div className="h-[280px] animate-pulse rounded-lg bg-[#F4F4F5]" /> }
);

interface ResultsDashboardProps {
  results: AssessmentResults;
}

function ReadinessCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-[24px] border border-border bg-white p-5">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 text-accent" />
        <p className="text-sm font-semibold text-foreground-heading">{label}</p>
      </div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-heading text-3xl font-bold text-foreground-heading"
      >
        {value}%
      </motion.p>
      <Progress value={value} className="mt-3 h-2" />
    </div>
  );
}

export function ResultsDashboard({ results }: ResultsDashboardProps) {
  const radarData = Object.entries(results.skillsEstimate).map(([skill, score]) => ({
    skill: skill.length > 10 ? skill.slice(0, 8) + "…" : skill,
    score,
    fullMark: 100,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto max-w-6xl space-y-8"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground-heading">
            Assessment Results
          </h1>
          <p className="mt-2 max-w-2xl text-muted leading-relaxed">{results.summary}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <GemmaBadge size="sm" />
            <GemmaModelTag />
          </div>
        </div>
        <div className="rounded-[24px] border border-accent/20 bg-accent/5 px-8 py-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">Overall Score</p>
          <motion.p
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="font-heading text-5xl font-bold text-foreground-heading"
          >
            {results.overallScore}%
          </motion.p>
          <Badge variant="accent" className="mt-2">
            vs {results.industryBenchmark}% industry avg
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[24px] border border-border bg-white p-6">
          <h2 className="mb-4 font-heading text-lg font-bold">Skill Radar</h2>
          <SkillRadarChart data={radarData.length ? radarData : [{ skill: "Python", score: 70, fullMark: 100 }]} />
        </div>
        <div className="rounded-[24px] border border-border bg-white p-6">
          <h2 className="mb-4 font-heading text-lg font-bold">Skill Breakdown</h2>
          <ProgressBarChart data={results.skillsEstimate} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-[24px] border border-border bg-white p-6">
          <h2 className="mb-4 flex items-center gap-2 font-heading text-lg font-bold">
            <TrendingUp className="h-5 w-5 text-success" />
            Strength Areas
          </h2>
          <ul className="space-y-2">
            {results.strengths.map((s, i) => (
              <li key={i} className="flex gap-2 text-sm text-muted">
                <span className="text-success">✓</span> {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-[24px] border border-border bg-white p-6">
          <h2 className="mb-4 flex items-center gap-2 font-heading text-lg font-bold">
            <Target className="h-5 w-5 text-warning" />
            Weak Areas
          </h2>
          <ul className="space-y-2">
            {results.weaknesses.map((w, i) => (
              <li key={i} className="flex gap-2 text-sm text-muted">
                <span className="text-warning">→</span> {w}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-[24px] border border-border bg-white p-6">
          <h2 className="mb-4 flex items-center gap-2 font-heading text-base font-bold">
            <Map className="h-4 w-4 text-accent" />
            Recommended Roadmap
          </h2>
          <ol className="space-y-2">
            {results.roadmap.map((item, i) => (
              <li key={i} className="text-sm text-muted">
                <span className="mr-2 font-semibold text-accent">{i + 1}.</span>
                {item}
              </li>
            ))}
          </ol>
        </div>
        <div className="rounded-[24px] border border-border bg-white p-6">
          <h2 className="mb-4 flex items-center gap-2 font-heading text-base font-bold">
            <Award className="h-4 w-4 text-accent" />
            Suggested Projects
          </h2>
          <ul className="space-y-2">
            {results.projects.map((p, i) => (
              <li key={i} className="text-sm text-muted">• {p}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-[24px] border border-border bg-white p-6">
          <h2 className="mb-4 flex items-center gap-2 font-heading text-base font-bold">
            <Award className="h-4 w-4 text-accent" />
            Certifications
          </h2>
          <ul className="space-y-2">
            {results.certifications.map((c, i) => (
              <li key={i} className="text-sm text-muted">• {c}</li>
            ))}
          </ul>
        </div>
      </div>

      <div>
        <h2 className="mb-4 font-heading text-lg font-bold">Career Readiness</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <ReadinessCard label="Resume Readiness" value={results.resumeReadiness} icon={FileText} />
          <ReadinessCard label="Interview Readiness" value={results.interviewReadiness} icon={Mic} />
          <ReadinessCard label="Internship Readiness" value={results.internshipReadiness} icon={Briefcase} />
        </div>
      </div>

      <div className="flex flex-wrap gap-3 rounded-[24px] border border-border bg-background-secondary p-6">
        <Link href="/roadmap" className={cn(buttonVariants({ variant: "accent" }))}>
          View Learning Roadmap
        </Link>
        <Link href="/resume" className={cn(buttonVariants({ variant: "secondary" }))}>
          Build Resume
        </Link>
        <Link href="/interview" className={cn(buttonVariants({ variant: "outline" }))}>
          Practice Interview
        </Link>
      </div>
    </motion.div>
  );
}
