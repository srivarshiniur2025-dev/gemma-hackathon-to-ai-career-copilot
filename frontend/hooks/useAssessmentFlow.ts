"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api } from "@/lib/api";
import {
  buildEvaluationFromFeedback,
  buildInsights,
  buildMockEvaluation,
  buildResultsFromApi,
  createInitialSkills,
  enrichQuestion,
  getMockQuestion,
  LIVE_API_TOTAL_QUESTIONS,
  MOCK_TOTAL_QUESTIONS,
  updateSkillsAfterAnswer,
} from "@/lib/assessment-data";
import { saveAssessmentResults } from "@/lib/career-store";
import type {
  AssessmentAnswerResponse,
  AssessmentInsights,
  AssessmentPhase,
  AssessmentQuestion,
  AssessmentResults,
  EvaluationResult,
  SkillDomain,
} from "@/lib/assessment-types";

export function useAssessmentFlow() {
  const [phase, setPhase] = useState<AssessmentPhase>("overview");
  const [useMock, setUseMock] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [welcome, setWelcome] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<AssessmentQuestion | null>(null);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [results, setResults] = useState<AssessmentResults | null>(null);
  const [skills, setSkills] = useState<SkillDomain[]>(createInitialSkills);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [answer, setAnswer] = useState("");
  const [skippedIds, setSkippedIds] = useState<number[]>([]);
  const questionHistory = useRef<AssessmentQuestion[]>([]);
  const pendingResponse = useRef<AssessmentAnswerResponse | null>(null);

  const totalQuestions = useMock ? MOCK_TOTAL_QUESTIONS : LIVE_API_TOTAL_QUESTIONS;
  const progressPercent = Math.round((questionNumber / totalQuestions) * 100);
  const estimatedMinutesRemaining = Math.max(0, (totalQuestions - questionNumber) * 5);

  const insights: AssessmentInsights = useMemo(
    () => buildInsights(skills, evaluation, questionNumber),
    [skills, evaluation, questionNumber]
  );

  const finishAssessment = useCallback((apiResults: AssessmentAnswerResponse) => {
    const built = buildResultsFromApi(
      apiResults.skills_estimate ?? {},
      apiResults.summary ?? "Assessment complete.",
      apiResults.strengths ?? [],
      apiResults.weaknesses ?? []
    );
    saveAssessmentResults({
      skillsEstimate: apiResults.skills_estimate ?? {},
      summary: apiResults.summary,
      strengths: apiResults.strengths,
      weaknesses: apiResults.weaknesses,
    });
    setResults(built);
    setPhase("results");
  }, []);

  const startAssessment = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.startAssessment();
      setUseMock(false);
      setWelcome(res.welcome ?? null);
      const qNum = res.question_number ?? 1;
      const enriched = enrichQuestion(res.question, res.domain ?? "Python", qNum);
      setCurrentQuestion(enriched);
      setQuestionNumber(qNum);
      questionHistory.current = [enriched];
      setPhase("question");
    } catch {
      setUseMock(true);
      setWelcome(
        "Welcome to your Gemma 4 skill certification. This adaptive assessment evaluates six core domains."
      );
      const enriched = getMockQuestion(1);
      setCurrentQuestion(enriched);
      setQuestionNumber(1);
      questionHistory.current = [enriched];
      setPhase("question");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadQuestion = useCallback((enriched: AssessmentQuestion) => {
    setCurrentQuestion(enriched);
    setQuestionNumber(enriched.id);
    questionHistory.current = [...questionHistory.current, enriched];
    setAnswer("");
    setEvaluation(null);
    setPhase("question");
  }, []);

  const submitAnswer = useCallback(async () => {
    if (!currentQuestion || !answer.trim()) return;
    setPhase("evaluating");
    pendingResponse.current = null;

    try {
      let evalResult: EvaluationResult;

      if (useMock) {
        await new Promise((r) => setTimeout(r, 1200));
        evalResult = buildMockEvaluation(answer, currentQuestion);
      } else {
        const res = await api.answerAssessment(answer);
        pendingResponse.current = res;
        evalResult = buildEvaluationFromFeedback(
          String(res.feedback ?? ""),
          answer,
          currentQuestion,
          {
            score: typeof res.score === "number" ? res.score : undefined,
            is_correct: res.is_correct,
            better_answer: res.better_answer,
            industry_standard: res.industry_standard,
            suggestions: res.suggestions,
          }
        );
      }

      setEvaluation(evalResult);
      setSkills((prev) =>
        updateSkillsAfterAnswer(prev, currentQuestion.domain, Math.round(evalResult.score / 10))
      );
      setPhase("evaluation");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
      setPhase("question");
    }
  }, [answer, currentQuestion, useMock]);

  const continueAfterEvaluation = useCallback(() => {
    if (useMock) {
      if (questionNumber >= totalQuestions) {
        finishAssessment({
          skills_estimate: Object.fromEntries(skills.map((s) => [s.name, s.score])),
          summary:
            "You completed the full skill certification. Review your radar chart and recommended next steps below.",
          strengths: skills.filter((s) => s.score >= 60).map((s) => `${s.name} proficiency`),
          weaknesses: skills.filter((s) => s.score < 60).map((s) => `${s.name} needs work`),
        });
        return;
      }
      const next = getMockQuestion(questionNumber + 1);
      loadQuestion(next);
      return;
    }

    const res = pendingResponse.current;
    if (!res) return;

    if (res.done) {
      finishAssessment(res);
      return;
    }

    if (res.question) {
      const qNum = res.question_number ?? questionNumber + 1;
      const enriched = enrichQuestion(res.question, res.domain ?? "Python", qNum);
      setCurrentQuestion(enriched);
      setQuestionNumber(qNum);
      questionHistory.current = [...questionHistory.current, enriched];
      setAnswer("");
      setEvaluation(null);
      pendingResponse.current = null;
      setPhase("question");
    }
  }, [finishAssessment, loadQuestion, questionNumber, skills, totalQuestions, useMock]);

  const skipQuestion = useCallback(() => {
    if (!currentQuestion) return;
    setSkippedIds((ids) => [...ids, currentQuestion.id]);
    setAnswer("[skipped]");
    void submitAnswer();
  }, [currentQuestion, submitAnswer]);

  const goToPrevious = useCallback(() => {
    if (questionNumber <= 1) return;
    const prev = questionHistory.current[questionNumber - 2];
    if (prev) {
      setCurrentQuestion(prev);
      setQuestionNumber(questionNumber - 1);
      setEvaluation(null);
      setPhase("question");
    }
  }, [questionNumber]);

  const handleNavigate = useCallback(
    (id: string) => {
      if (id === "overview" && phase !== "results") {
        setPhase("overview");
        setCurrentQuestion(null);
        setEvaluation(null);
      } else if (id === "results" && results) {
        setPhase("results");
      }
    },
    [phase, results]
  );

  const handleSkillSelect = useCallback(
    (_skillId: string) => {
      if (phase === "results" && results) {
        setPhase("results");
        return;
      }
      if (phase !== "overview" && phase !== "results") return;
      setPhase("overview");
      setError(null);
    },
    [phase, results]
  );

  useEffect(() => {
    if (phase !== "evaluation" || !evaluation) return;
    const timer = setTimeout(() => continueAfterEvaluation(), 3500);
    return () => clearTimeout(timer);
  }, [phase, evaluation, continueAfterEvaluation]);

  return {
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
    skippedIds,
    startAssessment,
    submitAnswer,
    skipQuestion,
    goToPrevious,
    continueAfterEvaluation,
    handleNavigate,
    handleSkillSelect,
  };
}
