"use client";

import { animate, useMotionValue, useMotionValueEvent } from "framer-motion";
import { useEffect, useState } from "react";
import {
  Award,
  CheckCircle2,
  Lightbulb,
  Sparkles,
  XCircle,
} from "lucide-react";
import { GemmaBadge } from "@/components/gemma/GemmaBrand";
import { Progress } from "@/components/ui/progress";
import type { EvaluationResult } from "@/lib/assessment-types";

interface EvaluationCardProps {
  evaluation: EvaluationResult;
  domain: string;
}

function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
  const motionValue = useMotionValue(0);
  const [display, setDisplay] = useState(0);

  useMotionValueEvent(motionValue, "change", (v) => setDisplay(Math.round(v)));

  useEffect(() => {
    const controls = animate(motionValue, value, { duration: 1, ease: [0.22, 1, 0.36, 1] });
    return controls.stop;
  }, [motionValue, value]);

  return (
    <span className="font-heading text-3xl font-bold text-foreground-heading">
      {display}
      {suffix}
    </span>
  );
}

export function EvaluationCard({ evaluation, domain }: EvaluationCardProps) {
  return (
    <div className="rounded-[24px] border border-border bg-white p-6 lg:p-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2">
            {evaluation.isCorrect ? (
              <CheckCircle2 className="h-5 w-5 text-success" />
            ) : (
              <XCircle className="h-5 w-5 text-warning" />
            )}
            <h2 className="font-heading text-xl font-bold text-foreground-heading">
              Answer Evaluation
            </h2>
          </div>
          <p className="text-sm text-muted">{domain} · Gemma 4 analysis</p>
        </div>
        <GemmaBadge size="sm" />
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-[16px] bg-background-secondary p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Correctness</p>
          <CountUp value={evaluation.correctness} suffix="%" />
          <Progress value={evaluation.correctness} className="mt-3 h-1.5" />
        </div>
        <div className="rounded-[16px] bg-accent/5 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">Score</p>
          <CountUp value={evaluation.score} suffix="/100" />
        </div>
      </div>

      <div className="space-y-5">
        <section>
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground-heading">
            <Sparkles className="h-4 w-4 text-accent" />
            Explanation
          </h3>
          <p className="text-sm leading-relaxed text-muted">{evaluation.explanation}</p>
        </section>

        <section className="rounded-[16px] border border-border p-4">
          <h3 className="mb-2 text-sm font-semibold text-foreground-heading">Better Answer</h3>
          <p className="text-sm leading-relaxed text-muted-secondary">{evaluation.betterAnswer}</p>
        </section>

        <section className="rounded-[16px] bg-background-secondary p-4">
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground-heading">
            <Award className="h-4 w-4 text-accent" />
            Industry Standard Answer
          </h3>
          <p className="text-sm leading-relaxed text-muted-secondary">{evaluation.industryStandard}</p>
        </section>

        <section>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground-heading">
            <Lightbulb className="h-4 w-4 text-accent" />
            Improvement Suggestions
          </h3>
          <ul className="space-y-2">
            {evaluation.suggestions.map((s, i) => (
              <li key={i} className="flex gap-2 text-sm text-muted">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                {s}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
