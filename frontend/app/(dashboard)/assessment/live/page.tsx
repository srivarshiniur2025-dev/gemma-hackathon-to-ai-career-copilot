"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Clock, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AssessmentSidebar } from "@/components/assessment/AssessmentSidebar";
import { InsightsPanel } from "@/components/assessment/InsightsPanel";
import { QuestionWorkspace } from "@/components/assessment/QuestionWorkspace";
import { ResultsSkeleton } from "@/components/ui/skeleton";
import { GemmaBadge, GemmaModelTag } from "@/components/gemma/GemmaBrand";
import { Button } from "@/components/ui/button";
import { useAssessmentFlow } from "@/hooks/useAssessmentFlow";
import { useCareerProfile } from "@/contexts/CareerProfileContext";
import { showsExamMocks } from "@/lib/learner-track";

const ResultsDashboard = dynamic(
  () => import("@/components/assessment/ResultsDashboard").then((m) => m.ResultsDashboard),
  { loading: () => <ResultsSkeleton /> }
);

export default function LiveAssessmentPage() {
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
            <Link href="/assessment" className="mb-4 inline-flex items-center gap-1 text-sm text-accent hover:underline">
              <ArrowLeft className="h-4 w-4" /> Timed skill papers
            </Link>
            {error && (
              <div className="mb-4 rounded-[14px] border border-error/20 bg-error/5 px-4 py-3 text-sm text-error">
                {error}
              </div>
            )}

            {phase === "overview" && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-auto max-w-2xl py-8"
              >
                <div className="mb-6 flex flex-wrap items-center gap-2">
                  <GemmaBadge size="md" />
                  <GemmaModelTag />
                </div>
                <h1 className="font-heading text-3xl font-bold text-foreground-heading">Live Gemma interview</h1>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {welcome ??
                    "Six adaptive questions. Gemma scores each answer (not a random number) and writes a better intern-level response."}
                </p>
                {useMock && (
                  <p className="mt-2 text-xs text-warning">
                    Backend unavailable — you can still take timed papers on the catalog.
                  </p>
                )}
                <p className="mt-4 flex items-center gap-2 text-sm text-muted">
                  <Clock className="h-4 w-4" /> ~20 min · <Sparkles className="h-4 w-4 text-accent" /> Gemma 4
                </p>
                <Button variant="accent" size="lg" className="mt-6 gap-2" onClick={startAssessment} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Connecting…
                    </>
                  ) : (
                    <>
                      Begin live interview
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </motion.div>
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
