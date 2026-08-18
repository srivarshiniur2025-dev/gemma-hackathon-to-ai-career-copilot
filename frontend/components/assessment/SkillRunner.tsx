"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Clock, X } from "lucide-react";
import { getSkillTest, questionsForSkillTest } from "@/lib/skills/catalog";
import { saveSkillAttempt } from "@/lib/skills/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SkillRunner({ testId }: { testId: string }) {
  const test = getSkillTest(testId);
  const [runId, setRunId] = useState(0);
  const questions = useMemo(
    () => (test ? questionsForSkillTest({ ...test, id: `${test.id}-r${runId}` }) : []),
    [test, runId]
  );
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<(number | null)[]>([]);
  const [secondsLeft, setSecondsLeft] = useState(test ? test.durationMin * 60 : 0);
  const [done, setDone] = useState(false);
  const savedRef = useRef(false);

  useEffect(() => {
    setPicked(Array(questions.length).fill(null));
    setIndex(0);
    setDone(false);
    savedRef.current = false;
    setSecondsLeft(test ? test.durationMin * 60 : 0);
  }, [questions.length, test, runId]);

  useEffect(() => {
    if (!test || done) return;
    const id = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          window.clearInterval(id);
          setDone(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [test, done]);

  useEffect(() => {
    if (!done || !test || !questions.length || savedRef.current) return;
    savedRef.current = true;
    const score = questions.reduce((sum, q, i) => sum + (picked[i] === q.answerIndex ? 1 : 0), 0);
    saveSkillAttempt(test, score, questions.length);
  }, [done, test, questions, picked]);

  if (!test) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <p className="text-muted">That assessment could not be found.</p>
        <Link href="/assessment" className="mt-4 inline-block text-sm font-semibold text-accent">
          Back to skill tests
        </Link>
      </div>
    );
  }

  const q = questions[index];
  const score = questions.reduce((sum, item, i) => sum + (picked[i] === item.answerIndex ? 1 : 0), 0);
  const mm = Math.floor(secondsLeft / 60);
  const ss = String(secondsLeft % 60).padStart(2, "0");
  const timedOut = secondsLeft === 0 && done;

  if (done) {
    const percent = questions.length ? Math.round((score / questions.length) * 100) : 0;
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Link href="/assessment" className="inline-flex items-center gap-1 text-sm text-accent hover:underline">
          <ArrowLeft className="h-4 w-4" /> All assessments
        </Link>
        <div className="rounded-[28px] border border-border bg-white p-8 text-center shadow-[var(--shadow-lg)]">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">{test.title}</p>
          <h1 className="mt-2 font-heading text-3xl font-bold">
            {percent >= 70 ? "Interview-ready on this set." : percent >= 40 ? "Close — drill the misses." : "Review explanations, then retry."}
          </h1>
          {timedOut ? <p className="mt-1 text-sm text-warning">Time ran out — we submitted what you had.</p> : null}
          <p className="mt-4 text-5xl font-extrabold text-foreground-heading">{percent}%</p>
          <p className="mt-1 text-sm text-muted">
            {score} / {questions.length} correct
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button variant="accent" onClick={() => setRunId((n) => n + 1)}>
              Retry this paper
            </Button>
            <Link href="/assessment">
              <Button variant="outline">Next test</Button>
            </Link>
          </div>
        </div>
        <div className="space-y-3">
          {questions.map((item, i) => {
            const ok = picked[i] === item.answerIndex;
            return (
              <div key={item.id} className="rounded-[20px] border border-border bg-white p-5">
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold">
                  {ok ? <Check className="h-4 w-4 text-success" /> : <X className="h-4 w-4 text-error" />}
                  <span className={ok ? "text-success" : "text-error"}>Q{i + 1}</span>
                </div>
                <p className="text-sm font-medium text-foreground-heading">{item.question}</p>
                <p className="mt-2 text-sm text-accent">Correct: {item.options[item.answerIndex]}</p>
                {picked[i] != null && !ok ? (
                  <p className="mt-1 text-sm text-error">You picked: {item.options[picked[i]!]}</p>
                ) : null}
                <p className="mt-1 text-xs leading-relaxed text-muted">{item.explanation}</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (!q) return null;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link href="/assessment" className="inline-flex items-center gap-1 text-sm text-muted hover:text-accent">
          <ArrowLeft className="h-4 w-4" /> Exit
        </Link>
        <div className="flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1.5 text-sm font-semibold">
          <Clock className={cn("h-4 w-4", secondsLeft < 60 ? "text-error" : "text-accent")} />
          {mm}:{ss}
        </div>
      </div>
      <div className="mb-4 h-2 overflow-hidden rounded-full bg-background-secondary">
        <motion.div
          className="h-full bg-accent"
          animate={{ width: `${((index + 1) / questions.length) * 100}%` }}
          transition={{ duration: 0.25 }}
        />
      </div>
      <p className="text-xs font-semibold uppercase tracking-wider text-accent">{test.title}</p>
      <p className="mt-1 text-sm text-muted">
        Question {index + 1} of {questions.length}
      </p>
      <h2 className="mt-4 font-heading text-xl font-bold leading-snug text-foreground-heading">{q.question}</h2>
      <div className="mt-6 space-y-3">
        {q.options.map((opt, oi) => {
          const selected = picked[index] === oi;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => {
                const next = [...picked];
                next[index] = oi;
                setPicked(next);
              }}
              className={cn(
                "w-full cursor-pointer rounded-[18px] border px-4 py-3 text-left text-sm transition-colors",
                selected
                  ? "border-accent bg-accent/10 font-semibold text-foreground-heading"
                  : "border-border bg-white text-foreground hover:border-accent/40"
              )}
            >
              <span className="mr-2 font-bold text-accent">{String.fromCharCode(65 + oi)}.</span>
              {opt}
            </button>
          );
        })}
      </div>
      <div className="mt-8 flex justify-between gap-3">
        <Button variant="outline" disabled={index === 0} onClick={() => setIndex((i) => Math.max(0, i - 1))}>
          Previous
        </Button>
        {index === questions.length - 1 ? (
          <Button variant="accent" onClick={() => setDone(true)} disabled={picked[index] == null}>
            Submit paper
          </Button>
        ) : (
          <Button variant="accent" onClick={() => setIndex((i) => i + 1)} disabled={picked[index] == null}>
            Next
          </Button>
        )}
      </div>
    </div>
  );
}
