"use client";

import { useEffect, useState } from "react";
import { levelFor, loadScoreboard, type SchoolScoreboard } from "./scoreboard";
import {
  chaptersFor,
  classFromAnswers,
  subjectFromAnswers,
  subjectLabel,
  type SchoolChapter,
  type SchoolClass,
  type SchoolSubject,
} from "./syllabus";

export type SchoolPick = { classLevel: SchoolClass; subject: SchoolSubject };

export const schoolPickKey = (email?: string) => `careerCopilotSchoolPick:${(email || "guest").toLowerCase()}`;

export function loadSchoolPick(email?: string): SchoolPick | null {
  try {
    const raw = window.localStorage.getItem(schoolPickKey(email));
    const parsed = raw ? (JSON.parse(raw) as SchoolPick) : null;
    if (parsed && (parsed.classLevel === 9 || parsed.classLevel === 10) && (parsed.subject === "science" || parsed.subject === "maths")) {
      return parsed;
    }
  } catch {
    /* ignore corrupt value */
  }
  return null;
}

export function saveSchoolPick(email: string | undefined, pick: SchoolPick) {
  window.localStorage.setItem(schoolPickKey(email), JSON.stringify(pick));
  window.dispatchEvent(new Event("school-score-updated"));
}

export function streakFromDays(days: string[]): number {
  const set = new Set(days);
  let streak = 0;
  const d = new Date();
  if (!set.has(d.toISOString().slice(0, 10))) d.setDate(d.getDate() - 1);
  while (set.has(d.toISOString().slice(0, 10))) {
    streak += 1;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

function longestStreakFrom(days: string[]): number {
  const sorted = [...new Set(days)].sort();
  let best = 0;
  let run = 0;
  let prev: number | null = null;
  for (const day of sorted) {
    const t = Date.parse(`${day}T00:00:00Z`);
    run = prev != null && t - prev === 86_400_000 ? run + 1 : 1;
    best = Math.max(best, run);
    prev = t;
  }
  return best;
}

/** Approximate start of CBSE exams: boards for Class 10 (mid-Feb), school annual exams for Class 9 (early March). */
function daysToExams(classLevel: SchoolClass): number {
  const now = new Date();
  const month = classLevel === 10 ? 1 : 2;
  const day = classLevel === 10 ? 15 : 1;
  let target = new Date(now.getFullYear(), month, day);
  if (target.getTime() < now.getTime()) target = new Date(now.getFullYear() + 1, month, day);
  return Math.ceil((target.getTime() - now.getTime()) / 86_400_000);
}

export type ChapterInsight = { chapter: SchoolChapter; mastery: number | null };

export type SchoolInsights = {
  pick: SchoolPick;
  board: SchoolScoreboard;
  points: number;
  level: ReturnType<typeof levelFor>;
  streak: number;
  longestStreak: number;
  last7Active: boolean[];
  accuracy: number | null;
  questionsAnswered: number;
  quizzesTaken: number;
  chapters: ChapterInsight[];
  testedCount: number;
  masteredCount: number;
  weakest: ChapterInsight | null;
  nextUp: ChapterInsight | null;
  accuracyTrend: { v: number }[];
  pointsByDay: { day: number; progress: number }[];
  daysToExams: number;
  focusList: string[];
  subjectSummary: { label: string; level: number; note: string }[];
};

export function computeSchoolInsights(email: string | undefined, answers?: Record<string, string>): SchoolInsights {
  const board = loadScoreboard(email);
  const pick = loadSchoolPick(email) ?? { classLevel: classFromAnswers(answers), subject: subjectFromAnswers(answers) };
  const quizzes = board.history.filter((h) => h.total > 0);
  const correct = quizzes.reduce((s, h) => s + h.correct, 0);
  const total = quizzes.reduce((s, h) => s + h.total, 0);

  const chapters: ChapterInsight[] = chaptersFor(pick.classLevel, pick.subject).map((chapter) => ({
    chapter,
    mastery: board.chapterMastery[chapter.id] ?? null,
  }));
  const tested = chapters.filter((c) => c.mastery != null);
  const weakest = tested.filter((c) => (c.mastery ?? 0) < 80).sort((a, b) => (a.mastery ?? 0) - (b.mastery ?? 0))[0] ?? null;
  const nextUp = chapters.find((c) => c.mastery == null && !c.chapter.internalOnly) ?? null;

  const accuracyTrend = quizzes
    .slice(0, 10)
    .reverse()
    .map((h) => ({ v: Math.round((h.correct / h.total) * 100) }));

  const today = new Date();
  const pointsByDay = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    const pts = board.history.filter((h) => h.at.slice(0, 10) === key).reduce((s, h) => s + h.points, 0);
    return { day: i + 1, progress: pts };
  });

  const focusList = [
    ...tested
      .filter((c) => (c.mastery ?? 0) < 80)
      .sort((a, b) => (a.mastery ?? 0) - (b.mastery ?? 0))
      .slice(0, 3)
      .map((c) => `Revise Ch ${c.chapter.number}: ${c.chapter.name}`),
    ...chapters
      .filter((c) => c.mastery == null && !c.chapter.internalOnly)
      .slice(0, 3)
      .map((c) => `Try Ch ${c.chapter.number}: ${c.chapter.name}`),
  ].slice(0, 5);

  const otherSubject: SchoolSubject = pick.subject === "science" ? "maths" : "science";
  const summaryFor = (subject: SchoolSubject) => {
    const list = chaptersFor(pick.classLevel, subject);
    const scores = list.map((c) => board.chapterMastery[c.id]).filter((v): v is number => v != null);
    const avg = scores.length ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length) : 0;
    return {
      label: `Class ${pick.classLevel} ${subjectLabel(subject)}`,
      level: avg,
      note: scores.length ? `${scores.length}/${list.length} chapters · avg ${avg}%` : "Not started",
    };
  };

  return {
    pick,
    board,
    points: board.totalPoints,
    level: levelFor(board.totalPoints),
    streak: streakFromDays(board.activeDays),
    longestStreak: longestStreakFrom(board.activeDays),
    last7Active: pointsByDay.map((_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i));
      return board.activeDays.includes(d.toISOString().slice(0, 10));
    }),
    accuracy: total ? Math.round((correct / total) * 100) : null,
    questionsAnswered: total,
    quizzesTaken: quizzes.length,
    chapters,
    testedCount: tested.length,
    masteredCount: tested.filter((c) => (c.mastery ?? 0) >= 80).length,
    weakest,
    nextUp,
    accuracyTrend,
    pointsByDay,
    daysToExams: daysToExams(pick.classLevel),
    focusList,
    subjectSummary: [summaryFor(pick.subject), summaryFor(otherSubject)],
  };
}

/** Live per-user school stats; recomputes whenever the scoreboard or class/subject pick changes. */
export function useSchoolInsights(email: string | undefined, answers?: Record<string, string>, enabled = true): SchoolInsights | null {
  const [insights, setInsights] = useState<SchoolInsights | null>(null);
  const grade = answers?.grade;
  const hard = answers?.hard_subject;

  useEffect(() => {
    if (!enabled) return;
    const refresh = () => setInsights(computeSchoolInsights(email, { grade: grade ?? "", hard_subject: hard ?? "" }));
    refresh();
    window.addEventListener("school-score-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("school-score-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [email, grade, hard, enabled]);

  return insights;
}
