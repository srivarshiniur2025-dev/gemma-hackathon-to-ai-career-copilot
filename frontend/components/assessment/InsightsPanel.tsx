"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  Lightbulb,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { AssessmentInsights } from "@/lib/assessment-types";

interface InsightsPanelProps {
  insights: AssessmentInsights;
  questionNumber: number;
  totalQuestions: number;
  progressPercent: number;
}

export function InsightsPanel({
  insights,
  questionNumber,
  totalQuestions,
  progressPercent,
}: InsightsPanelProps) {
  return (
    <aside className="sticky top-0 w-full shrink-0 space-y-4 lg:w-[300px] xl:w-[320px]">
      <div className="rounded-[24px] border border-border bg-white p-5">
        <h3 className="mb-4 font-heading text-sm font-bold text-foreground-heading">
          Assessment Progress
        </h3>
        <div className="mb-2 flex justify-between text-xs">
          <span className="text-muted">Overall</span>
          <span className="font-semibold">{progressPercent}%</span>
        </div>
        <Progress value={progressPercent} className="mb-4 h-2" />
        <p className="text-xs text-muted">
          {questionNumber} of {totalQuestions} questions completed
        </p>
      </div>

      <div className="rounded-[24px] border border-border bg-white p-5">
        <div className="mb-3 flex items-center gap-2">
          <Target className="h-4 w-4 text-accent" />
          <h3 className="font-heading text-sm font-bold text-foreground-heading">
            Current Skill Score
          </h3>
        </div>
        <motion.p
          key={insights.currentSkillScore}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-heading text-3xl font-bold text-foreground-heading"
        >
          {insights.currentSkillScore}%
        </motion.p>
        <Progress value={insights.currentSkillScore} className="mt-3 h-1.5" />
      </div>

      <div className="rounded-[24px] border border-border bg-white p-5">
        <h3 className="mb-3 font-heading text-sm font-bold text-foreground-heading">
          Confidence Meter
        </h3>
        <div className="relative h-3 overflow-hidden rounded-full bg-background-secondary">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-accent/60 to-accent"
            initial={{ width: 0 }}
            animate={{ width: `${insights.confidence}%` }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
        <p className="mt-2 text-xs text-muted">{Math.round(insights.confidence)}% signal confidence</p>
      </div>

      <div className="rounded-[24px] border border-border bg-white p-5">
        <div className="mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-success" />
          <h3 className="font-heading text-sm font-bold text-foreground-heading">Strengths</h3>
        </div>
        <ul className="space-y-2">
          {insights.strengths.length > 0 ? (
            insights.strengths.map((s, i) => (
              <li key={i} className="text-xs leading-relaxed text-muted">{s}</li>
            ))
          ) : (
            <li className="text-xs text-muted">Complete questions to identify strengths</li>
          )}
        </ul>
      </div>

      <div className="rounded-[24px] border border-border bg-white p-5">
        <div className="mb-3 flex items-center gap-2">
          <TrendingDown className="h-4 w-4 text-warning" />
          <h3 className="font-heading text-sm font-bold text-foreground-heading">Weaknesses</h3>
        </div>
        <ul className="space-y-2">
          {insights.weaknesses.map((w, i) => (
            <li key={i} className="text-xs leading-relaxed text-muted">{w}</li>
          ))}
        </ul>
      </div>

      <div className="rounded-[24px] border border-accent/20 bg-accent/5 p-5">
        <div className="mb-2 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent" />
          <h3 className="font-heading text-sm font-bold text-foreground-heading">Gemma Insights</h3>
        </div>
        <p className="text-xs leading-relaxed text-muted-secondary">{insights.gemmaInsight}</p>
      </div>

      <div className="rounded-[24px] border border-border bg-white p-5">
        <div className="mb-3 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-accent" />
          <h3 className="font-heading text-sm font-bold text-foreground-heading">Learning Tips</h3>
        </div>
        <ul className="space-y-2">
          {insights.learningTips.map((tip, i) => (
            <li key={i} className="flex gap-2 text-xs leading-relaxed text-muted">
              <Lightbulb className="mt-0.5 h-3 w-3 shrink-0 text-accent" />
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
