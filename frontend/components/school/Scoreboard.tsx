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
      <div className="relative overflow-hidden rounded-[var(--radius-card)] border border-primary bg-primary p-5 shadow-[var(--shadow-lg)] sm:p-6">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)", backgroundSize: "20px 20px" }}
        />
        <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-accent/25 blur-3xl" />
        <div className="relative grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
          <Stat icon={Trophy} label="Total points" value={board.totalPoints} />
          <Stat icon={Star} label="Level" value={level.name} />
          <Stat icon={Flame} label="Day streak" value={`${streak} day${streak === 1 ? "" : "s"}`} />
          <Stat icon={Medal} label="Accuracy" value={`${accuracy}%`} />
        </div>
        <div className="relative mt-5">
          <div className="flex items-center justify-between text-xs">
            <p className="font-semibold uppercase tracking-[0.16em] text-zinc-400">Level progress</p>
            <p className="text-zinc-300">{level.nextAt ? `${level.nextAt - board.totalPoints} pts to next level` : "Max level reached"}</p>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-accent-light" style={{ width: `${level.progress}%` }} />
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-[24px] border border-border bg-white p-5">
          <p className="flex items-center gap-2 font-heading text-base font-bold text-foreground-heading">
            <Award className="h-5 w-5 text-accent" /> Badges
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {Object.entries(BADGES).map(([id, b]) => {
              const earned = board.badges.includes(id);
              return (
                <div
                  key={id}
                  className={cn(
                    "rounded-2xl border p-3 text-center",
                    earned ? "border-accent/30 bg-accent/5" : "border-dashed border-border bg-background-secondary/50 opacity-70"
                  )}
                  title={b.hint}
                >
                  {earned ? <Award className="mx-auto h-6 w-6 text-accent" /> : <Lock className="mx-auto h-5 w-5 text-muted" />}
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
                    <span className={cn("font-semibold", pct >= 80 ? "text-accent" : pct >= 50 ? "text-foreground-heading" : "text-muted")}>
                      {pct ? `${pct}%` : "—"}
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-background-secondary">
                    <div
                      className={cn("h-full rounded-full", pct >= 80 ? "bg-accent" : pct >= 50 ? "bg-accent-light/70" : "bg-zinc-400")}
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

function Stat({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number }) {
  return (
    <div className="bg-primary/95 p-4">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-accent/15 text-accent-light">
          <Icon className="h-3.5 w-3.5" />
        </span>
        {label}
      </div>
      <p className="mt-3 font-heading text-2xl font-bold text-white">{value}</p>
    </div>
  );
}
