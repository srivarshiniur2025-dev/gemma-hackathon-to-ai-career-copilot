"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Flame, Sparkles, Timer, Trophy, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SchoolQuestion } from "@/lib/school/questions";
import { BADGES, pointsFor, recordActivity, type ActivityKind } from "@/lib/school/scoreboard";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  questions: SchoolQuestion[];
  kind: ActivityKind;
  email?: string;
  chapterId?: string;
  /** Seconds per question; enables the speed bonus. */
  secondsPerQuestion?: number;
  onExit: () => void;
  onRetry?: () => void;
};

export function QuizPlayer({ title, questions, kind, email, chapterId, secondsPerQuestion, onExit, onRetry }: Props) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<(number | null)[]>(() => Array(questions.length).fill(null));
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [speedBonus, setSpeedBonus] = useState(0);
  const [left, setLeft] = useState(secondsPerQuestion ?? 0);
  const [done, setDone] = useState(false);
  const [result, setResult] = useState<{ points: number; newBadges: string[] } | null>(null);
  const savedRef = useRef(false);

  const q = questions[index];
  const answered = picked[index] != null;
  const correctCount = questions.reduce((sum, item, i) => sum + (picked[i] === item.answerIndex ? 1 : 0), 0);

  useEffect(() => {
    if (!secondsPerQuestion || done || answered) return;
    setLeft(secondsPerQuestion);
    const id = window.setInterval(() => {
      setLeft((s) => {
        if (s <= 1) {
          window.clearInterval(id);
          setPicked((prev) => {
            const next = [...prev];
            if (next[index] == null) next[index] = -1;
            return next;
          });
          setStreak(0);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [index, secondsPerQuestion, done, answered]);

  useEffect(() => {
    if (!done || savedRef.current) return;
    savedRef.current = true;
    const points = pointsFor(correctCount, questions.length, bestStreak, speedBonus);
    const { newBadges } = recordActivity(email, {
      kind,
      title,
      chapterId,
      points,
      correct: correctCount,
      total: questions.length,
    });
    setResult({ points, newBadges });
  }, [done, correctCount, questions.length, bestStreak, speedBonus, email, kind, title, chapterId]);

  const choose = (oi: number) => {
    if (answered) return;
    const next = [...picked];
    next[index] = oi;
    setPicked(next);
    if (oi === q.answerIndex) {
      const s = streak + 1;
      setStreak(s);
      setBestStreak((b) => Math.max(b, s));
      if (secondsPerQuestion) setSpeedBonus((b) => b + Math.floor(left / 2));
    } else {
      setStreak(0);
    }
  };

  if (!questions.length) {
    return (
      <div className="rounded-[24px] border border-border bg-white p-8 text-center">
        <p className="text-sm text-muted">No questions available for this selection yet.</p>
        <Button variant="outline" className="mt-4" onClick={onExit}>
          Back
        </Button>
      </div>
    );
  }

  if (done) {
    const percent = Math.round((correctCount / questions.length) * 100);
    return (
      <div className="space-y-5">
        <div className="rounded-[28px] border border-border bg-white p-8 text-center shadow-[var(--shadow-lg)]">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">{title}</p>
          <h2 className="mt-2 font-heading text-3xl font-bold">
            {percent === 100 ? "Perfect score!" : percent >= 70 ? "Great work!" : percent >= 40 ? "Good try — keep going." : "Let's review and retry."}
          </h2>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-6">
            <div>
              <p className="text-4xl font-extrabold text-foreground-heading">{percent}%</p>
              <p className="text-xs text-muted">
                {correctCount} / {questions.length} correct
              </p>
            </div>
            <div>
              <p className="flex items-center justify-center gap-1 text-4xl font-extrabold text-accent">
                <Trophy className="h-7 w-7" /> +{result?.points ?? 0}
              </p>
              <p className="text-xs text-muted">points earned</p>
            </div>
            <div>
              <p className="flex items-center justify-center gap-1 text-4xl font-extrabold text-orange-500">
                <Flame className="h-7 w-7" /> {bestStreak}
              </p>
              <p className="text-xs text-muted">best streak</p>
            </div>
          </div>
          {result?.newBadges.length ? (
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {result.newBadges.map((b) => (
                <span key={b} className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                  <Sparkles className="h-3.5 w-3.5" /> New badge: {BADGES[b]?.label ?? b}
                </span>
              ))}
            </div>
          ) : null}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {onRetry ? (
              <Button variant="accent" onClick={onRetry}>
                Try again
              </Button>
            ) : null}
            <Button variant="outline" onClick={onExit}>
              Back to practice
            </Button>
          </div>
        </div>
        <div className="space-y-3">
          {questions.map((item, i) => {
            const ok = picked[i] === item.answerIndex;
            return (
              <div key={item.id} className="rounded-[20px] border border-border bg-white p-5">
                <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-semibold">
                  {ok ? <Check className="h-4 w-4 text-success" /> : <X className="h-4 w-4 text-error" />}
                  <span className={ok ? "text-success" : "text-error"}>Q{i + 1}</span>
                  <span className="rounded-full bg-background-secondary px-2 py-0.5 capitalize text-muted">{item.difficulty}</span>
                  {item.source === "gemma" ? (
                    <span className="rounded-full bg-violet-100 px-2 py-0.5 text-violet-700">Gemma</span>
                  ) : null}
                </div>
                <p className="text-sm font-medium text-foreground-heading">{item.question}</p>
                {!ok && picked[i] != null && picked[i]! >= 0 ? (
                  <p className="mt-2 text-sm text-error">Your answer: {item.options[picked[i]!]}</p>
                ) : null}
                <p className="mt-1 text-sm text-accent">Correct: {item.options[item.answerIndex]}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted">{item.explanation}</p>
                <p className="mt-2 text-[11px] text-muted">
                  <span className="font-semibold">Reference:</span> {item.reference}
                  {item.syllabusPoint ? (
                    <>
                      {" · "}
                      <span className="font-semibold">Syllabus point:</span> {item.syllabusPoint}
                    </>
                  ) : null}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={onExit} className="inline-flex items-center gap-1 text-sm text-muted hover:text-accent">
          <ArrowLeft className="h-4 w-4" /> Exit
        </button>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full border border-border bg-white px-3 py-1.5 text-sm font-semibold text-orange-500">
            <Flame className="h-4 w-4" /> {streak}
          </span>
          {secondsPerQuestion ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-white px-3 py-1.5 text-sm font-semibold">
              <Timer className={cn("h-4 w-4", left <= 5 ? "text-error" : "text-accent")} /> {left}s
            </span>
          ) : null}
        </div>
      </div>

      <div className="mb-4 h-2 overflow-hidden rounded-full bg-background-secondary">
        <motion.div
          className="h-full bg-accent"
          animate={{ width: `${((index + 1) / questions.length) * 100}%` }}
          transition={{ duration: 0.25 }}
        />
      </div>

      <p className="text-xs font-semibold uppercase tracking-wider text-accent">{title}</p>
      <p className="mt-1 text-sm text-muted">
        Question {index + 1} of {questions.length} · <span className="capitalize">{q.difficulty}</span>
      </p>
      <h2 className="mt-4 font-heading text-xl font-bold leading-snug text-foreground-heading">{q.question}</h2>

      <div className="mt-6 space-y-3">
        {q.options.map((opt, oi) => {
          const isCorrect = oi === q.answerIndex;
          const isPicked = picked[index] === oi;
          return (
            <button
              key={`${opt}-${oi}`}
              type="button"
              disabled={answered}
              onClick={() => choose(oi)}
              className={cn(
                "w-full cursor-pointer rounded-[18px] border px-4 py-3 text-left text-sm transition-colors duration-200 disabled:cursor-default",
                !answered && "border-border bg-white text-foreground hover:border-accent/40",
                answered && isCorrect && "border-success bg-success/10 font-semibold text-foreground-heading",
                answered && isPicked && !isCorrect && "border-error bg-error/10 text-foreground-heading",
                answered && !isCorrect && !isPicked && "border-border bg-white opacity-60"
              )}
            >
              <span className="mr-2 font-bold text-accent">{String.fromCharCode(65 + oi)}.</span>
              {opt}
            </button>
          );
        })}
      </div>

      {answered ? (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "mt-4 rounded-[18px] border p-4 text-sm",
            picked[index] === q.answerIndex ? "border-success/30 bg-success/5" : "border-error/30 bg-error/5"
          )}
        >
          <p className="font-semibold text-foreground-heading">
            {picked[index] === q.answerIndex ? "Correct! +10" : picked[index] === -1 ? "Time's up!" : "Not quite."}
          </p>
          <p className="mt-1 text-muted">{q.explanation}</p>
          <p className="mt-1 text-[11px] text-muted">Reference: {q.reference}</p>
        </motion.div>
      ) : null}

      <div className="mt-6 flex justify-end">
        {index === questions.length - 1 ? (
          <Button variant="accent" disabled={!answered} onClick={() => setDone(true)}>
            See my score
          </Button>
        ) : (
          <Button variant="accent" disabled={!answered} onClick={() => setIndex((i) => i + 1)}>
            Next question
          </Button>
        )}
      </div>
    </div>
  );
}
