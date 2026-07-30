"use client";

import { motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  SkipForward,
} from "lucide-react";
import { GemmaBadge, GemmaModelTag } from "@/components/gemma/GemmaBrand";
import { AnswerSection } from "@/components/assessment/AnswerSection";
import { EvaluationCard } from "@/components/assessment/EvaluationCard";
import { QuestionCard } from "@/components/assessment/QuestionCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { AssessmentPhase, AssessmentQuestion, EvaluationResult } from "@/lib/assessment-types";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface QuestionWorkspaceProps {
  phase: AssessmentPhase;
  question: AssessmentQuestion | null;
  evaluation: EvaluationResult | null;
  questionNumber: number;
  totalQuestions: number;
  answer: string;
  loading: boolean;
  onAnswerChange: (value: string) => void;
  onSubmit: () => void;
  onSkip: () => void;
  onPrevious: () => void;
  onContinue?: () => void;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function QuestionWorkspace({
  phase,
  question,
  evaluation,
  questionNumber,
  totalQuestions,
  answer,
  loading,
  onAnswerChange,
  onSubmit,
  onSkip,
  onPrevious,
  onContinue,
}: QuestionWorkspaceProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (phase !== "question" || !question) return;
    setElapsed(0);
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, [phase, question?.id]);

  if (!question) return null;

  const progressValue = (questionNumber / totalQuestions) * 100;
  const isEvaluating = phase === "evaluating";
  const showEvaluation = phase === "evaluation" && evaluation;

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      {/* Breadcrumb */}
      <div className="mb-4 flex flex-wrap items-center gap-1.5 text-sm text-muted">
        <span>Assessment</span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-foreground-heading">{question.domain}</span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-accent">Question {questionNumber}</span>
      </div>

      {/* Header */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground-heading lg:text-3xl">
              {question.domain} Assessment
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <GemmaBadge size="sm" />
              <GemmaModelTag />
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-[16px] border border-border bg-white px-4 py-2.5">
            <Clock className="h-4 w-4 text-muted" />
            <span className="font-mono text-sm font-semibold text-foreground-heading">
              {formatTime(elapsed)}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium text-muted-secondary">
            Question {questionNumber} of {totalQuestions}
          </p>
          <div className="flex items-center gap-2">
            <Badge className={cn(
              question.difficulty === "Easy" && "bg-success/10 text-success",
              question.difficulty === "Medium" && "bg-warning/10 text-warning",
              question.difficulty === "Hard" && "bg-error/10 text-error"
            )}>
              {question.difficulty}
            </Badge>
            <span className="text-xs text-muted">~{question.estimatedMinutes} min</span>
          </div>
        </div>
        <Progress value={progressValue} className="h-2" />
      </div>

      {/* Cards */}
      <div className="relative flex-1 space-y-6">
        {isEvaluating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-10 flex items-center justify-center rounded-[24px] bg-white/90"
          >
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
              <p className="text-sm font-medium text-muted-secondary">Gemma is evaluating your answer...</p>
            </div>
          </motion.div>
        )}

        {!showEvaluation ? (
          <motion.div
            key={`question-${question.id}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6"
          >
            <QuestionCard question={question} />
            <AnswerSection
              question={question}
              answer={answer}
              onChange={onAnswerChange}
              disabled={isEvaluating}
            />
          </motion.div>
        ) : (
          <motion.div
            key={`eval-${question.id}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <EvaluationCard evaluation={evaluation} domain={question.domain} />
          </motion.div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
        <Button
          variant="secondary"
          onClick={onPrevious}
          disabled={questionNumber <= 1 || isEvaluating || !!showEvaluation}
          className="gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="flex flex-wrap gap-2">
          {!showEvaluation ? (
            <>
              <Button
                variant="outline"
                onClick={onSkip}
                disabled={isEvaluating || loading}
                className="gap-1"
              >
                <SkipForward className="h-4 w-4" />
                Skip
              </Button>
              <Button
                variant="accent"
                onClick={onSubmit}
                disabled={!answer.trim() || isEvaluating || loading}
                className="gap-1 transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Submit Answer
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button
              variant="accent"
              onClick={onContinue}
              className="gap-1 transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {questionNumber >= totalQuestions ? "View Results" : "Next Question"}
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {showEvaluation && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted"
        >
          {evaluation.isCorrect ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-success" />
          ) : (
            <AlertCircle className="h-3.5 w-3.5 text-warning" />
          )}
          Auto-advancing in a few seconds, or click Next Question
        </motion.p>
      )}
    </div>
  );
}
