"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Brain,
  Clock,
  Loader2,
  Shield,
  Sparkles,
  Target,
} from "lucide-react";
import { AssessmentSidebar } from "@/components/assessment/AssessmentSidebar";
import { InsightsPanel } from "@/components/assessment/InsightsPanel";
import { QuestionWorkspace } from "@/components/assessment/QuestionWorkspace";
import { ResultsSkeleton } from "@/components/ui/skeleton";
import { GemmaBadge, GemmaModelTag } from "@/components/gemma/GemmaBrand";
import { Button } from "@/components/ui/button";
import { useAssessmentFlow } from "@/hooks/useAssessmentFlow";
import { useCareerProfile } from "@/contexts/CareerProfileContext";
import { showsExamMocks } from "@/lib/learner-track";
import { ASSESSMENT_SKILLS } from "@/lib/assessment-data";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const ResultsDashboard = dynamic(
  () => import("@/components/assessment/ResultsDashboard").then((m) => m.ResultsDashboard),
  { loading: () => <ResultsSkeleton /> }
);

const OVERVIEW_FEATURES = [
  {
    icon: Brain,
    title: "Adaptive Questioning",
    description: "Gemma 4 adjusts difficulty based on your responses across six skill domains.",
  },
  {
    icon: Target,
    title: "Real Proficiency Scoring",
    description: "Industry-calibrated evaluation with correctness, explanations, and improvement paths.",
  },
  {
    icon: BarChart3,
    title: "Comprehensive Report",
    description: "Radar charts, benchmarks, roadmap, and career readiness metrics upon completion.",
  },
  {
    icon: Shield,
    title: "Certification-Grade UI",
    description: "Structured exam workspace — not a chat. Focus on performance, not conversation.",
  },
];

function AssessmentOverview({
  welcome,
  loading,
  useMock,
  onStart,
}: {
  welcome: string | null;
  loading: boolean;
  useMock: boolean;
  onStart: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto max-w-3xl py-4 lg:py-8"
    >
      <div className="mb-8 text-center">
        <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
          <GemmaBadge size="md" />
          <GemmaModelTag />
        </div>
        <h1 className="font-heading text-3xl font-bold text-foreground-heading lg:text-4xl">
          Gemma Skill Certification
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-muted leading-relaxed">
          {welcome ??
            "A professional adaptive assessment powered by Gemma 4. Evaluate your technical proficiency across core career domains."}
        </p>
        {useMock && (
          <p className="mt-2 text-xs text-warning">
            Demo mode — backend unavailable. Using mock questions for UI preview.
          </p>
        )}
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        {OVERVIEW_FEATURES.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="rounded-[24px] border border-border bg-white p-5 transition-shadow hover:shadow-[var(--shadow-hover)]"
          >
            <Icon className="mb-3 h-5 w-5 text-accent" />
            <h3 className="font-heading text-sm font-bold text-foreground-heading">{title}</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-muted">{description}</p>
          </div>
        ))}
      </div>

      <div className="rounded-[24px] border border-border bg-background-secondary p-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
          Domains Assessed
        </p>
        <div className="mb-6 flex flex-wrap gap-2">
          {ASSESSMENT_SKILLS.map((skill) => (
            <span
              key={skill}
              className="rounded-full border border-border bg-white px-3 py-1 text-xs font-medium text-muted-secondary"
            >
              {skill}
            </span>
          ))}
        </div>
        <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-muted">
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" /> ~45–60 min
          </span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-accent" /> Powered by Gemma 4
          </span>
        </div>
        <Button
          variant="accent"
          size="lg"
          onClick={onStart}
          disabled={loading}
          className="w-full gap-2 transition-transform hover:scale-[1.01] active:scale-[0.99] sm:w-auto"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Starting Assessment...
            </>
          ) : (
            <>
              Begin Certification
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}

export default function AssessmentPage() {
  const router = useRouter();
  const { profile, loading: profileLoading } = useCareerProfile();
  const flow = useAssessmentFlow();
  const {
    phase,
    loading,
    error,
    useMock,
    welcome,
    currentQuestion,
    evaluation,
    results,
    skills,
    questionNumber,
    totalQuestions,
    progressPercent,
    estimatedMinutesRemaining,
    answer,
    setAnswer,
    insights,
    startAssessment,
    submitAnswer,
    skipQuestion,
    goToPrevious,
    continueAfterEvaluation,
    handleNavigate,
    handleSkillSelect,
  } = flow;

  const showSidebar = phase !== "results" || !results;
  const inQuestionFlow = phase === "question" || phase === "evaluating" || phase === "evaluation";

  useEffect(() => {
    if (profileLoading) return;
    if (showsExamMocks(profile)) router.replace("/mocks");
  }, [profileLoading, profile, router]);

  if (showsExamMocks(profile)) return null;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-background">
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {showSidebar && (
          <AssessmentSidebar
            phase={phase}
            skills={skills}
            progressPercent={progressPercent}
            estimatedMinutesRemaining={estimatedMinutesRemaining}
            questionNumber={questionNumber}
            totalQuestions={totalQuestions}
            useMock={useMock}
            onNavigate={handleNavigate}
            onSkillSelect={handleSkillSelect}
          />
        )}

        <div className="flex min-w-0 flex-1 flex-col lg:flex-row">
          <main className="min-w-0 flex-1 overflow-y-auto p-6 lg:p-8">
            {error && (
              <div className="mb-4 rounded-[14px] border border-error/20 bg-error/5 px-4 py-3 text-sm text-error">
                {error}
              </div>
            )}

            {phase === "overview" && (
              <AssessmentOverview
                welcome={welcome}
                loading={loading}
                useMock={useMock}
                onStart={startAssessment}
              />
            )}

            {phase === "results" && results && <ResultsDashboard results={results} />}

            {inQuestionFlow && currentQuestion && (
              <QuestionWorkspace
                phase={phase}
                question={currentQuestion}
                evaluation={evaluation}
                questionNumber={questionNumber}
                totalQuestions={totalQuestions}
                answer={answer}
                loading={loading}
                onAnswerChange={setAnswer}
                onSubmit={submitAnswer}
                onSkip={skipQuestion}
                onPrevious={goToPrevious}
                onContinue={continueAfterEvaluation}
              />
            )}
          </main>

          {inQuestionFlow && (
            <div className="border-t border-border bg-background-secondary p-6 lg:border-l lg:border-t-0 lg:bg-white lg:p-6">
              <InsightsPanel
                insights={insights}
                questionNumber={questionNumber}
                totalQuestions={totalQuestions}
                progressPercent={progressPercent}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
