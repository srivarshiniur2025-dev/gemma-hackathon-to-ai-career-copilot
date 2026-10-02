"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Flame,
  Menu,
  Play,
  Search,
  Sparkles,
  Star,
  Target,
  Trophy,
} from "lucide-react";
import { useDashboardNav } from "@/components/dashboard/DashboardNavContext";
import { ChapterArt } from "@/components/school/ChapterArt";
import { useAuth } from "@/contexts/AuthContext";
import { useCareerProfile } from "@/contexts/CareerProfileContext";
import { dashboardHeading } from "@/lib/learner-track";
import { useSchoolInsights, type ChapterInsight, type SchoolInsights } from "@/lib/school/insights";
import { questionsForChapter, type SchoolDifficulty } from "@/lib/school/questions";
import { SYLLABUS_SESSION, subjectLabel } from "@/lib/school/syllabus";
import { heroArt } from "@/lib/school/visuals";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;
const GLASS =
  "relative overflow-hidden rounded-[22px] border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.015] shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-md";
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

function IconTile({ icon: Icon, tone = "teal" }: { icon: React.ElementType; tone?: "teal" | "amber" | "orange" }) {
  return (
    <span
      className={cn(
        "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border",
        tone === "teal" && "border-accent-light/30 bg-accent/15 text-accent-light",
        tone === "amber" && "border-amber-300/25 bg-amber-300/10 text-amber-300",
        tone === "orange" && "border-orange-400/25 bg-orange-400/10 text-orange-400"
      )}
    >
      <Icon className="h-5 w-5" />
    </span>
  );
}

function Sparkline({ values, className }: { values: number[]; className?: string }) {
  const max = Math.max(...values, 1);
  const pts = values.map((v, i) => [(i / Math.max(values.length - 1, 1)) * 100, 34 - (v / max) * 28] as const);
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const last = pts[pts.length - 1];
  return (
    <svg viewBox="0 0 100 40" preserveAspectRatio="none" className={className} aria-hidden>
      <motion.path
        d={d}
        fill="none"
        stroke="#2DD4BF"
        strokeWidth="1.6"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.4, ease: EASE }}
      />
      {last ? <circle cx={last[0]} cy={last[1]} r="2.2" fill="#5EEAD4" /> : null}
    </svg>
  );
}

function Bars({ values, className }: { values: number[]; className?: string }) {
  const max = Math.max(...values, 1);
  return (
    <div className={cn("flex items-end gap-1.5", className)} aria-hidden>
      {values.map((v, i) => (
        <motion.span
          key={i}
          className={cn("w-3 rounded-t-md", v ? "bg-gradient-to-t from-accent/40 to-accent-light" : "bg-white/10")}
          initial={{ height: 4 }}
          animate={{ height: `${Math.max(12, (v / max) * 100)}%` }}
          transition={{ duration: 0.9, delay: 0.3 + i * 0.06, ease: EASE }}
        />
      ))}
    </div>
  );
}

function HeroStat({ icon, tone, value, label, delay }: { icon: React.ElementType; tone: "teal" | "amber" | "orange"; value: string; label: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay, ease: EASE }}
      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur-md"
    >
      <IconTile icon={icon} tone={tone} />
      <div>
        <p className="text-xl font-extrabold leading-none text-white">{value}</p>
        <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-white/60">{label}</p>
      </div>
    </motion.div>
  );
}

function MetricCard({
  href,
  children,
  className,
  delay,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  delay: number;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay, ease: EASE }}>
      <Link
        href={href}
        className={cn(
          GLASS,
          "group block h-full cursor-pointer p-5 transition-[border-color,box-shadow] duration-300 hover:border-accent-light/40 hover:shadow-[0_0_0_1px_rgba(45,212,191,0.15),0_18px_50px_rgba(13,148,136,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-light/60",
          className
        )}
      >
        {children}
        <ArrowUpRight className="absolute right-4 top-4 h-4 w-4 text-white/40 transition-colors duration-200 group-hover:text-accent-light" />
      </Link>
    </motion.div>
  );
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.07, ease: EASE }}
    >
      <Link
        href={testHref(c.id, difficulty)}
        aria-label={`Start Chapter ${c.number} test: ${c.name}`}
        className={cn(
          GLASS,
          "group flex h-full min-h-[210px] cursor-pointer flex-col p-5 transition-[border-color,box-shadow] duration-300 hover:border-accent-light/40 hover:shadow-[0_18px_50px_rgba(13,148,136,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-light/60"
        )}
      >
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
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition-colors duration-200 group-hover:border-accent-light group-hover:bg-accent-light group-hover:text-[#042F2E]">
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>

        <ChapterArt
          chapterId={c.id}
          subject={c.subject}
          alt=""
          className="absolute -right-3 bottom-6 w-[46%] max-w-[170px]"
          sizes="170px"
        />
      </Link>
    </motion.div>
  );
}

export function SchoolDashboard() {
  const { displayName, profile, initials } = useCareerProfile();
  const { user } = useAuth();
  const { openMobileNav, toggleNavPanel } = useDashboardNav();
  const s = useSchoolInsights(user?.email ?? undefined, profile?.onboarding_answers);
  const reduce = useReducedMotion();
  const [difficulty, setDifficulty] = useState<SchoolDifficulty | "all">("all");
  const [query, setQuery] = useState("");

  const first = displayName.split(" ")[0] || "there";
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
    <div className="relative min-h-full text-white">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[480px] w-[480px] rounded-full bg-accent/20 blur-[120px]" />
        <div className="absolute -right-32 top-[420px] h-[420px] w-[420px] rounded-full bg-accent-light/10 blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.15] [background-image:radial-gradient(rgba(255,255,255,0.35)_1px,transparent_1px)] [background-size:28px_28px]" />
      </div>

      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-white/10 bg-[#071012]/80 px-4 py-3.5 backdrop-blur-xl sm:px-6">
        <button
          type="button"
          aria-label="Open menu"
          onClick={openMobileNav}
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-white/70 transition-colors hover:bg-white/10 md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label="Open navigation menu"
          onClick={toggleNavPanel}
          className="hidden h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-white/70 transition-colors hover:bg-white/10 md:flex lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="flex items-center gap-2 text-base font-bold text-white sm:text-lg">
          <Sparkles className="h-4 w-4 text-accent-light" />
          {dashboardHeading(profile)}
        </h1>
        <label className="relative ml-auto hidden w-full max-w-xs sm:block">
          <span className="sr-only">Search chapters and topics</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search chapters, topics…"
            className="w-full rounded-full border border-white/10 bg-white/[0.05] py-2 pl-10 pr-4 text-sm text-white placeholder:text-white/40 transition-colors focus:border-accent-light/50 focus:outline-none"
          />
        </label>
        <Link
          href="/settings"
          aria-label="Account settings"
          className="ml-auto flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-accent-light to-accent text-sm font-bold text-[#042F2E] ring-2 ring-white/10 transition-shadow hover:ring-accent-light/60 sm:ml-0"
        >
          {initials}
        </Link>
      </header>

      <div className="relative mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="relative overflow-hidden rounded-[26px] border border-accent-light/15 bg-gradient-to-br from-[#0E2426] via-[#0A1719] to-[#071012] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.45)] sm:p-8"
        >
          <div className="grid items-center gap-6 lg:grid-cols-[1.05fr_1fr_210px]">
            <div className="relative z-10">
              <span className="inline-flex rounded-full border border-accent-light/30 bg-accent/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-accent-light">
                {dashboardHeading(profile)}
              </span>
              <h2 className="mt-4 font-heading text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl">
                {copy.greeting}
                <span className="mt-1 flex items-center gap-2 bg-gradient-to-r from-accent-light to-[#5EEAD4] bg-clip-text text-transparent">
                  {first}
                  <motion.span
                    aria-hidden
                    animate={reduce ? undefined : { rotate: [0, 18, 0], scale: [1, 1.15, 1] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Sparkles className="h-7 w-7 text-accent-light" />
                  </motion.span>
                </span>
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-white/75">{copy.sub}</p>
              <Link
                href={copy.href}
                className="mt-6 inline-flex max-w-full cursor-pointer items-center gap-2 rounded-full bg-gradient-to-r from-[#99F6E4] to-accent-light px-5 py-3 text-sm font-bold text-[#042F2E] shadow-[0_0_30px_rgba(45,212,191,0.35)] transition-shadow duration-300 hover:shadow-[0_0_44px_rgba(45,212,191,0.6)]"
              >
                <span className="truncate">{copy.cta}</span>
                <ArrowRight className="h-4 w-4 shrink-0" />
              </Link>
            </div>

            <motion.div
              className="relative mx-auto aspect-[16/10] w-full max-w-[460px]"
              animate={reduce ? undefined : { y: [0, -8, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <div aria-hidden className="absolute inset-[18%] rounded-full bg-accent/30 blur-3xl" />
              <Image
                src={heroArt(subject)}
                alt={`${subjectLabel(subject)} lab illustration`}
                fill
                priority
                sizes="(max-width: 1024px) 90vw, 460px"
                className="object-contain"
                style={{
                  maskImage: "radial-gradient(ellipse 50% 50% at 50% 50%, #000 62%, transparent 100%)",
                  WebkitMaskImage: "radial-gradient(ellipse 50% 50% at 50% 50%, #000 62%, transparent 100%)",
                }}
              />
            </motion.div>

            <div className="relative z-10 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <HeroStat icon={Trophy} tone="amber" value={`${s?.points ?? 0}`} label="Points" delay={0.15} />
              <HeroStat
                icon={BookOpen}
                tone="teal"
                value={`${s?.masteredCount ?? 0}/${s?.chapters.length ?? 0}`}
                label="Chapters mastered"
                delay={0.22}
              />
              <HeroStat
                icon={Flame}
                tone="orange"
                value={`${s?.streak ?? 0} day${s?.streak === 1 ? "" : "s"}`}
                label="Study streak"
                delay={0.29}
              />
            </div>
          </div>
        </motion.section>

        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard
            href="/scoreboard"
            delay={0.1}
            className="border-accent-light/25 bg-gradient-to-br from-[#0F766E]/70 via-[#0B3E3B]/70 to-[#082624]/80"
          >
            <div className="flex items-start gap-3">
              <IconTile icon={Target} />
              <div className="min-w-0 flex-1 pr-5">
                <p className="text-sm font-semibold text-white/85">Your accuracy</p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/15">
                    <motion.div
                      className="h-full rounded-full bg-white"
                      initial={{ width: 0 }}
                      animate={{ width: `${s?.accuracy ?? 4}%` }}
                      transition={{ duration: 1.2, ease: EASE }}
                    />
                  </div>
                  <span className="text-2xl font-extrabold text-white">{s?.accuracy != null ? `${s.accuracy}%` : "–%"}</span>
                </div>
                <p className="mt-2 text-xs text-white/70">
                  {s?.quizzesTaken
                    ? `${s.questionsAnswered} questions · ${s.quizzesTaken} quiz${s.quizzesTaken === 1 ? "" : "zes"}`
                    : "Take your first chapter test to see this"}
                </p>
              </div>
            </div>
            <svg aria-hidden viewBox="0 0 400 60" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 bottom-0 h-14 w-full opacity-40">
              <motion.path
                d="M0 40 C 60 10, 120 60, 200 32 S 330 10, 400 30 L400 60 L0 60 Z"
                fill="rgba(94,234,212,0.25)"
                animate={reduce ? undefined : { d: ["M0 40 C 60 10, 120 60, 200 32 S 330 10, 400 30 L400 60 L0 60 Z", "M0 34 C 70 50, 140 14, 210 38 S 320 52, 400 24 L400 60 L0 60 Z", "M0 40 C 60 10, 120 60, 200 32 S 330 10, 400 30 L400 60 L0 60 Z"] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              />
            </svg>
          </MetricCard>

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
            <Sparkline
              values={s?.pointsByDay.length ? s.pointsByDay.map((d) => d.progress) : [0, 0]}
              className="absolute bottom-4 right-4 h-12 w-[45%]"
            />
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
            <div role="radiogroup" aria-label="Test difficulty" className="flex rounded-full border border-white/10 bg-white/[0.04] p-1">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  role="radio"
                  aria-checked={difficulty === d.id}
                  onClick={() => setDifficulty(d.id)}
                  className={cn(
                    "relative cursor-pointer rounded-full px-4 py-1.5 text-xs font-semibold transition-colors duration-200",
                    difficulty === d.id ? "text-[#042F2E]" : "text-white/70 hover:text-white"
                  )}
                >
                  {difficulty === d.id ? (
                    <motion.span layoutId="school-difficulty" className="absolute inset-0 rounded-full bg-accent-light" transition={{ duration: 0.25 }} />
                  ) : null}
                  <span className="relative">{d.label}</span>
                </button>
              ))}
            </div>
          </div>

          <label className="relative mt-4 block sm:hidden">
            <span className="sr-only">Search chapters and topics</span>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search chapters, topics…"
              className="w-full rounded-full border border-white/10 bg-white/[0.05] py-2 pl-10 pr-4 text-sm text-white placeholder:text-white/40 focus:border-accent-light/50 focus:outline-none"
            />
          </label>

          {chapters.length ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {chapters.map((item, i) => (
                <ChapterTile key={item.chapter.id} item={item} difficulty={difficulty} index={i} />
              ))}
            </div>
          ) : (
            <p className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center text-sm text-white/65">
              No chapters match &ldquo;{query}&rdquo;.{" "}
              <button type="button" onClick={() => setQuery("")} className="cursor-pointer font-semibold text-accent-light hover:underline">
                Clear search
              </button>
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
