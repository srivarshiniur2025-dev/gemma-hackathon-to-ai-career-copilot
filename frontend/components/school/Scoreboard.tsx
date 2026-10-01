"use client";

import { Award, Flame, Lock, Medal, Star, Trophy } from "lucide-react";
import {
  ACTIVITY_LABELS,
  BADGES,
  levelFor,
  type ActivityKind,
  type SchoolScoreboard,
} from "@/lib/school/scoreboard";
import { chaptersFor, schoolChapterById, type SchoolClass, type SchoolSubject } from "@/lib/school/syllabus";
import { cn } from "@/lib/utils";

export function currentStreak(days: string[]): number {
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

type Props = { board: SchoolScoreboard; classLevel: SchoolClass; subject: SchoolSubject };

export function Scoreboard({ board, classLevel, subject }: Props) {
  const level = levelFor(board.totalPoints);
  const chapters = chaptersFor(classLevel, subject);
  const streak = currentStreak(board.activeDays);
  const quizzes = board.history.filter((h) => h.total > 0);
  const accuracy = quizzes.length
    ? Math.round((quizzes.reduce((s, h) => s + h.correct, 0) / quizzes.reduce((s, h) => s + h.total, 0)) * 100)
    : 0;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={<Trophy className="h-5 w-5" />} label="Total points" value={board.totalPoints} tone="from-amber-400 to-orange-500" />
        <Stat icon={<Star className="h-5 w-5" />} label="Level" value={level.name} tone="from-violet-500 to-fuchsia-500" />
        <Stat icon={<Flame className="h-5 w-5" />} label="Day streak" value={`${streak} day${streak === 1 ? "" : "s"}`} tone="from-rose-500 to-orange-400" />
        <Stat icon={<Medal className="h-5 w-5" />} label="Accuracy" value={`${accuracy}%`} tone="from-emerald-500 to-teal-500" />
      </div>

      <div className="rounded-[24px] border border-border bg-white p-5">
        <div className="flex items-center justify-between text-sm">
          <p className="font-semibold text-foreground-heading">{level.name}</p>
          <p className="text-muted">{level.nextAt ? `${level.nextAt - board.totalPoints} pts to next level` : "Max level reached!"}</p>
        </div>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-background-secondary">
          <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-sky-500" style={{ width: `${level.progress}%` }} />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-[24px] border border-border bg-white p-5">
          <p className="flex items-center gap-2 font-heading text-base font-bold text-foreground-heading">
            <Award className="h-5 w-5 text-amber-500" /> Badges
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {Object.entries(BADGES).map(([id, b]) => {
              const earned = board.badges.includes(id);
              return (
                <div
                  key={id}
                  className={cn(
                    "rounded-2xl border p-3 text-center",
                    earned ? "border-amber-200 bg-amber-50" : "border-dashed border-border bg-background-secondary/50 opacity-70"
                  )}
                  title={b.hint}
                >
                  {earned ? <Award className="mx-auto h-6 w-6 text-amber-500" /> : <Lock className="mx-auto h-5 w-5 text-muted" />}
                  <p className="mt-1 text-xs font-semibold text-foreground-heading">{b.label}</p>
                  <p className="text-[10px] text-muted">{b.hint}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-[24px] border border-border bg-white p-5">
          <p className="font-heading text-base font-bold text-foreground-heading">Chapter mastery</p>
          <p className="text-xs text-muted">Best chapter-test score for each chapter</p>
          <div className="mt-4 space-y-2.5">
            {chapters.map((c) => {
              const pct = board.chapterMastery[c.id] ?? 0;
              return (
                <div key={c.id}>
                  <div className="flex justify-between text-xs">
                    <span className="truncate pr-2 text-foreground">
                      Ch {c.number}. {c.name}
                    </span>
                    <span className={cn("font-semibold", pct >= 80 ? "text-success" : pct >= 50 ? "text-amber-600" : "text-muted")}>
                      {pct ? `${pct}%` : "—"}
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-background-secondary">
                    <div
                      className={cn("h-full rounded-full", pct >= 80 ? "bg-success" : pct >= 50 ? "bg-amber-400" : "bg-sky-400")}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-[24px] border border-border bg-white p-5">
          <p className="font-heading text-base font-bold text-foreground-heading">Personal bests</p>
          <div className="mt-3 space-y-2">
            {(Object.keys(ACTIVITY_LABELS) as ActivityKind[]).map((k) => (
              <div key={k} className="flex items-center justify-between rounded-xl bg-background-secondary px-3 py-2 text-sm">
                <span>{ACTIVITY_LABELS[k]}</span>
                <span className="font-bold text-foreground-heading">{board.bestByKind[k] ?? "—"}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[24px] border border-border bg-white p-5">
          <p className="font-heading text-base font-bold text-foreground-heading">Recent activity</p>
          {board.history.length === 0 ? (
            <p className="mt-3 text-sm text-muted">Play any quiz or activity to start your scoreboard.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {board.history.slice(0, 8).map((h) => (
                <div key={h.id} className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground-heading">{h.title}</p>
                    <p className="text-[11px] text-muted">
                      {ACTIVITY_LABELS[h.kind]}
                      {h.chapterId ? ` · ${schoolChapterById(h.chapterId)?.name ?? ""}` : ""} · {h.correct}/{h.total} ·{" "}
                      {new Date(h.at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="shrink-0 font-bold text-accent">+{h.points}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string | number; tone: string }) {
  return (
    <div className={cn("rounded-[22px] bg-gradient-to-br p-4 text-white shadow-[var(--shadow-md)]", tone)}>
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide opacity-90">
        {icon} {label}
      </div>
      <p className="mt-2 font-heading text-2xl font-bold">{value}</p>
    </div>
  );
}
