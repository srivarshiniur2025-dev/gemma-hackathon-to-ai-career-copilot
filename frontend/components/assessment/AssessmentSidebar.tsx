"use client";

import Link from "next/link";
import { memo } from "react";
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { GemmaBadge } from "@/components/gemma/GemmaBrand";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { AssessmentPhase, SkillDomain } from "@/lib/assessment-types";

interface AssessmentSidebarProps {
  phase: AssessmentPhase;
  skills: SkillDomain[];
  progressPercent: number;
  estimatedMinutesRemaining: number;
  questionNumber: number;
  totalQuestions: number;
  useMock: boolean;
  onNavigate: (id: string) => void;
  onSkillSelect?: (skillId: string) => void;
}

function SkillStatusIcon({ status, score }: { status: SkillDomain["status"]; score: number }) {
  if (status === "completed") {
    return (
      <div className="relative flex h-8 w-8 items-center justify-center">
        <CheckCircle2 className="h-8 w-8 text-accent" strokeWidth={1.5} />
      </div>
    );
  }
  if (status === "active") {
    const pct = Math.min(score, 100);
    return (
      <div className="relative flex h-8 w-8 items-center justify-center">
        <svg className="h-8 w-8 -rotate-90" viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="13" fill="none" stroke="#E4E4E7" strokeWidth="2.5" />
          <circle
            cx="16"
            cy="16"
            r="13"
            fill="none"
            stroke="#0D9488"
            strokeWidth="2.5"
            strokeDasharray={`${(pct / 100) * 81.7} 81.7`}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute text-[9px] font-bold text-accent">{score || "—"}</span>
      </div>
    );
  }
  return <Circle className="h-5 w-5 text-border" strokeWidth={1.5} />;
}

export const AssessmentSidebar = memo(function AssessmentSidebar({
  phase,
  skills,
  progressPercent,
  estimatedMinutesRemaining,
  questionNumber,
  totalQuestions,
  useMock,
  onNavigate,
  onSkillSelect,
}: AssessmentSidebarProps) {
  return (
    <aside className="flex w-full shrink-0 flex-col border-r border-border bg-white lg:w-[280px] xl:w-[300px]">
      <div className="border-b border-border px-5 py-4">
        <Link
          href="/dashboard"
          className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-muted-secondary transition-colors hover:text-accent"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Dashboard
        </Link>
        <Logo size="sm" />
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 pt-4">
        <p className="mb-3 px-1 text-xs font-semibold uppercase tracking-wider text-muted">
          Skill Domains
        </p>
        <ul className="space-y-1">
          {skills.map((skill) => (
            <li key={skill.id}>
              <button
                type="button"
                onClick={() => onSkillSelect?.(skill.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-[14px] px-3 py-2.5 text-left transition-colors",
                  skill.status === "active" && "bg-background-secondary",
                  "hover:bg-background-hover"
                )}
              >
                <SkillStatusIcon status={skill.status} score={skill.score} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground-heading">{skill.name}</p>
                  <p className="text-xs text-muted capitalize">
                    {skill.status === "completed"
                      ? `Score ${skill.score}%`
                      : skill.status === "active"
                        ? "In progress"
                        : "Pending"}
                  </p>
                </div>
              </button>
            </li>
          ))}
        </ul>

        {phase === "results" && (
          <button
            type="button"
            onClick={() => onNavigate("results")}
            className="mt-4 flex w-full items-center gap-2 rounded-[14px] bg-accent/10 px-3 py-2.5 text-sm font-medium text-accent"
          >
            <BarChart3 className="h-4 w-4" />
            View Full Results
          </button>
        )}
      </div>

      <div className="space-y-4 border-t border-border p-5">
        <div>
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="text-muted">Current Progress</span>
            <span className="font-semibold text-foreground-heading">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-1.5" />
          <p className="mt-1.5 text-xs text-muted">
            Question {questionNumber} of {totalQuestions}
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-[14px] bg-background-secondary px-3 py-2.5">
          <Clock className="h-4 w-4 shrink-0 text-muted" />
          <div>
            <p className="text-xs text-muted">Est. Time Remaining</p>
            <p className="text-sm font-semibold text-foreground-heading">
              ~{estimatedMinutesRemaining} min
            </p>
          </div>
        </div>

        <div className="rounded-[14px] border border-border bg-background-secondary p-3">
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            <span className="text-xs font-semibold text-foreground-heading">Gemma Status</span>
          </div>
          <p className="text-xs leading-relaxed text-muted">
            {phase === "evaluating"
              ? "Evaluating your response..."
              : phase === "results"
                ? "Assessment complete — review your report."
                : useMock
                  ? "Demo mode — connect backend for live adaptive questions."
                  : "Live adaptive assessment active."}
          </p>
          <GemmaBadge size="sm" className="mt-2" />
        </div>
      </div>
    </aside>
  );
});
