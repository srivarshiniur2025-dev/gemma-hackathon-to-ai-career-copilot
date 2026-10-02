"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BookOpen, Flame, Play, Star, Trophy } from "lucide-react";
import {
  AccuracyCard,
  Bars,
  DarkHero,
  DarkShell,
  EmptySearch,
  FilterPills,
  GLASS,
  HeroStat,
  IconTile,
  MetricCard,
  MobileSearch,
  Sparkline,
  TILE_LINK,
  TileArrow,
  TileIn,
} from "@/components/dashboard/dark-kit";
import { ChapterArt } from "@/components/school/ChapterArt";
import { useAuth } from "@/contexts/AuthContext";
import { useCareerProfile } from "@/contexts/CareerProfileContext";
import { useSchoolInsights, type ChapterInsight, type SchoolInsights } from "@/lib/school/insights";
import { questionsForChapter, type SchoolDifficulty } from "@/lib/school/questions";
import { SYLLABUS_SESSION, subjectLabel } from "@/lib/school/syllabus";
import { heroArt } from "@/lib/school/visuals";
import { cn } from "@/lib/utils";

const DIFFICULTIES: { id: SchoolDifficulty | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "easy", label: "Easy" },
  { id: "medium", label: "Medium" },
  { id: "hard", label: "Hard" },
];

function testHref(chapterId: string, difficulty: SchoolDifficulty | "all" = "all") {
  return `/mocks?chapter=${chapterId}${difficulty === "all" ? "" : `&difficulty=${difficulty}`}`;
}

function heroCopy(s: SchoolInsights | null) {
  const course = s ? `Class ${s.pick.classLevel} ${subjectLabel(s.pick.subject)}` : "your";
  if (!s || s.quizzesTaken === 0) {
    const ch = s?.nextUp?.chapter;
    return {
      greeting: "Let's get started,",
      sub: `Your first ${course} test takes about 5 minutes. Your accuracy, streak and weak chapters will appear here once you're done (${SYLLABUS_SESSION} syllabus).`,
      cta: ch ? `Start Ch ${ch.number}: ${ch.name}` : "Open Chapter Practice",
      href: ch ? testHref(ch.id) : "/mocks",
    };
  }
  const stats = `${s.accuracy ?? 0}% accuracy · ${s.testedCount}/${s.chapters.length} chapters tested · ~${s.daysToExams} days to exams.`;
  if (s.weakest) {
    const ch = s.weakest.chapter;
    return {
      greeting: s.streak > 1 ? `${s.streak}-day streak,` : "Welcome back,",
      sub: `Ch ${ch.number} ${ch.name} is at ${s.weakest.mastery}% — your weakest chapter. ${stats}`,
      cta: `Retake Ch ${ch.number} test`,
      href: testHref(ch.id),
    };
  }
  if (s.nextUp) {
    const ch = s.nextUp.chapter;
    return {
      greeting: "Nice work,",
      sub: `Every chapter you've tested is above 80%. Ch ${ch.number} is next. ${stats}`,
      cta: `Start Ch ${ch.number}: ${ch.name}`,
      href: testHref(ch.id),
    };
  }
  return {
    greeting: "Brilliant,",
    sub: `All of ${course} is mastered. ${stats} Keep it sharp with a Quiz Blitz.`,
    cta: "Play Quiz Blitz",
    href: "/activities",
  };
}

function ChapterTile({ item, difficulty, index }: { item: ChapterInsight; difficulty: SchoolDifficulty | "all"; index: number }) {
  const c = item.chapter;
  const count = questionsForChapter(c.id, difficulty === "all" ? undefined : difficulty).length;
  const status =
    item.mastery == null
      ? { label: "Not started", cls: "border-white/15 text-white/70" }
      : item.mastery >= 80
        ? { label: `Mastered · ${item.mastery}%`, cls: "border-accent-light/40 bg-accent/20 text-accent-light" }
        : { label: `${item.mastery}% · revise`, cls: "border-amber-300/30 bg-amber-300/10 text-amber-200" };

  return (
    <TileIn index={index}>
      <Link href={testHref(c.id, difficulty)} aria-label={`Start Chapter ${c.number} test: ${c.name}`} className={cn(GLASS, TILE_LINK)}>
        <div className="relative z-10 flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="font-heading text-3xl font-bold leading-none text-white/25 transition-colors duration-300 group-hover:text-accent-light/60">
              {String(c.number).padStart(2, "0")}
            </span>
            <span className="rounded-full bg-accent-light/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#042F2E]">
              {c.unit}
            </span>
          </div>
          <span className={cn("shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold", status.cls)}>{status.label}</span>
        </div>

        <p className="relative z-10 mt-3 max-w-[62%] font-heading text-base font-bold leading-snug text-white">{c.name}</p>
        {c.internalOnly ? <p className="relative z-10 mt-1 text-[11px] font-semibold text-amber-200">School test only this session</p> : null}

        <div className="relative z-10 mt-3 flex max-w-[60%] flex-col items-start gap-1.5">
          {c.keyTopics.slice(0, 2).map((t) => (
            <span key={t} className="max-w-full truncate rounded-lg border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px] text-white/75">
              {t}
            </span>
          ))}
        </div>

        <div className="relative z-10 mt-auto flex items-center justify-between pt-4">
          <span className="text-[11px] font-medium text-white/55">
            {count} {difficulty === "all" ? "" : `${difficulty} `}questions
          </span>
          <TileArrow />
        </div>

        <ChapterArt chapterId={c.id} subject={c.subject} alt="" className="absolute -right-3 bottom-6 w-[46%] max-w-[170px]" sizes="170px" />
      </Link>
    </TileIn>
  );
}

export function SchoolDashboard() {
  const { profile } = useCareerProfile();
  const { user } = useAuth();
  const s = useSchoolInsights(user?.email ?? undefined, profile?.onboarding_answers);
  const [difficulty, setDifficulty] = useState<SchoolDifficulty | "all">("all");
  const [query, setQuery] = useState("");

  const copy = heroCopy(s);
  const subject = s?.pick.subject ?? "science";
  const focus = s?.weakest ?? s?.nextUp ?? null;
  const weekPoints = s?.pointsByDay.reduce((sum, d) => sum + d.progress, 0) ?? 0;

  const chapters = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = s?.chapters ?? [];
    if (!q) return list;
    return list.filter(
      (c) =>
        c.chapter.name.toLowerCase().includes(q) ||
        c.chapter.unit.toLowerCase().includes(q) ||
        c.chapter.keyTopics.some((t) => t.toLowerCase().includes(q)) ||
        String(c.chapter.number) === q
    );
  }, [s?.chapters, query]);

  const testedBars = (s?.chapters ?? [])
    .filter((c) => c.mastery != null)
    .slice(-5)
    .map((c) => c.mastery ?? 0);

  return (
    <DarkShell query={query} onQuery={setQuery} searchPlaceholder="Search chapters, topics…">
      <DarkHero
        {...copy}
        image={heroArt(subject)}
        imageAlt={`${subjectLabel(subject)} lab illustration`}
        stats={
          <>
            <HeroStat icon={Trophy} tone="amber" value={`${s?.points ?? 0}`} label="Points" delay={0.15} />
            <HeroStat icon={BookOpen} tone="teal" value={`${s?.masteredCount ?? 0}/${s?.chapters.length ?? 0}`} label="Chapters mastered" delay={0.22} />
            <HeroStat icon={Flame} tone="orange" value={`${s?.streak ?? 0} day${s?.streak === 1 ? "" : "s"}`} label="Study streak" delay={0.29} />
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <AccuracyCard
          href="/scoreboard"
          value={s?.accuracy ?? null}
          caption={
            s?.quizzesTaken
              ? `${s.questionsAnswered} questions · ${s.quizzesTaken} quiz${s.quizzesTaken === 1 ? "" : "zes"}`
              : "Take your first chapter test to see this"
          }
        />

        <MetricCard href="/mocks" delay={0.16}>
          <div className="flex items-start gap-3">
            <IconTile icon={BookOpen} />
            <div className="flex-1">
              <p className="text-sm font-semibold text-white/85">Chapters tested</p>
              <p className="mt-2 text-4xl font-extrabold leading-none text-white">
                {s?.testedCount ?? 0}
                <span className="text-xl font-bold text-white/45">/{s?.chapters.length ?? 0}</span>
              </p>
              <p className="mt-2 text-xs text-white/65">
                {s?.masteredCount ?? 0} mastered · Class {s?.pick.classLevel ?? 9} {subjectLabel(subject)}
              </p>
            </div>
            <Bars values={testedBars.length ? testedBars : [0, 0, 0]} className="mt-6 h-14" />
          </div>
        </MetricCard>

        <MetricCard href="/scoreboard" delay={0.22}>
          <div className="flex items-start gap-3">
            <IconTile icon={Flame} tone="orange" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-white/85">Study streak</p>
              <p className="mt-2 text-4xl font-extrabold leading-none text-white">
                {s?.streak ?? 0}
                <span className="ml-1 text-xl font-bold text-white/80">day{s?.streak === 1 ? "" : "s"}</span>
              </p>
              <p className="mt-2 text-xs text-white/65">
                {s?.level.name ?? "Curious Starter"} · {s?.points ?? 0} pts
              </p>
            </div>
          </div>
          <Sparkline values={s?.pointsByDay.length ? s.pointsByDay.map((d) => d.progress) : [0, 0]} className="absolute bottom-4 right-4 h-12 w-[45%]" />
        </MetricCard>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_1.15fr]">
        <MetricCard href="/planner" delay={0.26}>
          <div className="flex items-start gap-3">
            <IconTile icon={Star} />
            <div className="flex-1">
              <p className="text-sm font-semibold text-white/85">Points this week</p>
              <p className="mt-2 text-4xl font-extrabold leading-none text-white">{weekPoints}</p>
              <p className="mt-2 text-xs text-white/65">~{s?.daysToExams ?? 0} days to exams</p>
            </div>
            <Bars values={(s?.pointsByDay ?? []).map((d) => d.progress)} className="mt-4 h-20" />
          </div>
        </MetricCard>

        <MetricCard href={focus ? testHref(focus.chapter.id) : "/mocks"} delay={0.3} className="min-h-[170px]">
          <div className="relative z-10 flex items-start gap-3 pr-[38%]">
            <IconTile icon={Play} />
            <div>
              <p className="text-sm font-semibold text-white/85">
                {s?.weakest ? `Weakest chapter · ${s.weakest.mastery}%` : focus ? "Next chapter to try" : "All chapters mastered"}
              </p>
              <p className="mt-2 font-heading text-lg font-bold leading-snug text-white">
                {focus ? `Ch ${focus.chapter.number}: ${focus.chapter.name}` : "Try a Quiz Blitz"}
              </p>
              <p className="mt-1 text-xs text-white/65">
                {s?.weakest ? "Retake the test to push it above 80%" : "Start its test to unlock your progress"}
              </p>
            </div>
          </div>
          {focus ? (
            <ChapterArt
              chapterId={focus.chapter.id}
              subject={focus.chapter.subject}
              alt=""
              active
              className="absolute bottom-0 right-6 w-[34%] max-w-[170px]"
              sizes="170px"
            />
          ) : null}
        </MetricCard>
      </div>

      <section className="pt-2">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-2xl font-bold text-white">Your Chapters</h2>
            <p className="mt-1 text-sm text-white/60">
              Pick a difficulty, then tap a chapter to start its test. Class {s?.pick.classLevel ?? 9} {subjectLabel(subject)} ·{" "}
              <Link href="/mocks" className="font-semibold text-accent-light hover:underline">
                change class or subject
              </Link>
            </p>
          </div>
          <FilterPills options={DIFFICULTIES} value={difficulty} onChange={setDifficulty} label="Test difficulty" layoutId="school-difficulty" />
        </div>

        <MobileSearch value={query} onChange={setQuery} placeholder="Search chapters, topics…" />

        {chapters.length ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {chapters.map((item, i) => (
              <ChapterTile key={item.chapter.id} item={item} difficulty={difficulty} index={i} />
            ))}
          </div>
        ) : (
          <EmptySearch query={query} onClear={() => setQuery("")} noun="chapters" />
        )}
      </section>
    </DarkShell>
  );
}
