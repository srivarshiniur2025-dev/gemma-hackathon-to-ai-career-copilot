"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BookOpen, Briefcase, CalendarDays, Flame, Play, Trophy } from "lucide-react";
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
import { TrackArt } from "@/components/school/ChapterArt";
import { useAuth } from "@/contexts/AuthContext";
import { useCareerProfile } from "@/contexts/CareerProfileContext";
import { catalogForAudience } from "@/lib/neet/catalog";
import { loadMockProgress } from "@/lib/neet/progress";
import { SKILL_CATALOG, SKILL_DOMAINS } from "@/lib/skills/catalog";
import { loadSkillProgress } from "@/lib/skills/progress";
import { skillArt, topicArt, trackHeroArt } from "@/lib/school/visuals";
import { cn } from "@/lib/utils";

type Track = "neet" | "high_school" | "developer";

type TestItem = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  art: string;
  kind: string;
  group: string;
  questionCount: number;
  durationMin: number;
};

type Attempt = { testId: string; percent: number; at: string; group: string };

const GROUP_LABELS: Record<string, string> = {
  physics: "Physics",
  chemistry: "Chemistry",
  biology: "Biology",
  pcb: "PCB mixed",
  science: "Science",
  math: "Maths",
  mixed: "Mixed",
  ...Object.fromEntries(SKILL_DOMAINS.map((d) => [d.id, d.label])),
};

const MOCK_KINDS = [
  { id: "all", label: "All" },
  { id: "chapter", label: "Chapter" },
  { id: "sectional", label: "Sectional" },
  { id: "full", label: "Full" },
  { id: "pyq", label: "PYQ" },
  { id: "rapid", label: "Rapid" },
];

const SKILL_KINDS = [
  { id: "all", label: "All" },
  { id: "chapter", label: "Core" },
  { id: "sectional", label: "Deep dives" },
  { id: "interview", label: "Intern screens" },
  { id: "full", label: "Full" },
  { id: "rapid", label: "Rapid" },
];

const TRACK = {
  neet: { noun: "mocks", catalog: "/mocks", exam: "NEET", examMonth: 4, examDay: 3, imageAlt: "NEET biology and medicine illustration" },
  high_school: { noun: "tests", catalog: "/mocks", exam: "boards", examMonth: 1, examDay: 15, imageAlt: "Board exam study desk illustration" },
  developer: { noun: "skill tests", catalog: "/assessment", exam: null, examMonth: 0, examDay: 0, imageAlt: "Developer workstation illustration" },
} as const;

function daysUntil(month: number, day: number): number {
  const now = new Date();
  let target = new Date(now.getFullYear(), month, day);
  if (target.getTime() < now.getTime()) target = new Date(now.getFullYear() + 1, month, day);
  return Math.ceil((target.getTime() - now.getTime()) / 86_400_000);
}

function loadTrack(track: Track, email?: string): { items: TestItem[]; attempts: Attempt[]; best: Record<string, number> } {
  if (track === "developer") {
    const p = loadSkillProgress(email);
    return {
      items: SKILL_CATALOG.map((t) => ({
        id: t.id,
        title: t.title,
        subtitle: t.subtitle,
        href: `/assessment/${t.id}`,
        art: skillArt(t.domain),
        kind: t.kind,
        group: t.domain,
        questionCount: t.questionCount,
        durationMin: t.durationMin,
      })),
      attempts: p.attempts.map((a) => ({ testId: a.testId, percent: a.percent, at: a.at, group: a.domain })),
      best: p.bestByTest,
    };
  }
  const p = loadMockProgress(email);
  return {
    items: catalogForAudience(track === "neet" ? "neet" : "school").map((t) => ({
      id: t.id,
      title: t.title,
      subtitle: t.subtitle,
      href: `/mocks/${t.id}`,
      art: topicArt(`${t.title} ${t.subtitle}`, t.subject, t.kind),
      kind: t.kind,
      group: t.subject,
      questionCount: t.questionCount,
      durationMin: t.durationMin,
    })),
    attempts: p.attempts.map((a) => ({ testId: a.testId, percent: a.percent, at: a.at, group: a.subject })),
    best: p.bestByTest,
  };
}

function avg(values: number[]): number | null {
  return values.length ? Math.round(values.reduce((s, n) => s + n, 0) / values.length) : null;
}

function TestTile({ item, best, index }: { item: TestItem; best?: number; index: number }) {
  const kindLabel = [...MOCK_KINDS, ...SKILL_KINDS].find((k) => k.id === item.kind)?.label ?? item.kind;
  const status =
    best == null
      ? { label: "Not started", cls: "border-white/15 text-white/70" }
      : best >= 80
        ? { label: `Best · ${best}%`, cls: "border-accent-light/40 bg-accent/20 text-accent-light" }
        : { label: `${best}% · retry`, cls: "border-amber-300/30 bg-amber-300/10 text-amber-200" };

  return (
    <TileIn index={index}>
      <Link href={item.href} aria-label={`Start ${item.title}`} className={cn(GLASS, TILE_LINK)}>
        <div className="relative z-10 flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded-full bg-accent-light/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#042F2E]">{kindLabel}</span>
            <span className="rounded-full border border-white/15 px-2.5 py-0.5 text-[10px] font-semibold text-white/75">
              {GROUP_LABELS[item.group] ?? item.group}
            </span>
          </div>
          <span className={cn("shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold", status.cls)}>{status.label}</span>
        </div>

        <p className="relative z-10 mt-3 max-w-[62%] font-heading text-base font-bold capitalize leading-snug text-white">{item.title}</p>
        <p className="relative z-10 mt-2 max-w-[58%] text-[11px] leading-relaxed text-white/65">{item.subtitle}</p>

        <div className="relative z-10 mt-auto flex items-center justify-between pt-4">
          <span className="text-[11px] font-medium text-white/55">
            {item.questionCount} questions · {item.durationMin} min
          </span>
          <TileArrow />
        </div>

        <TrackArt src={item.art} alt="" className="absolute -right-3 bottom-6 w-[46%] max-w-[170px]" sizes="170px" />
      </Link>
    </TileIn>
  );
}

const PAGE = 12;

export function TrackDashboard({ track }: { track: Track }) {
  const { career } = useCareerProfile();
  const { user } = useAuth();
  const email = user?.email ?? undefined;
  const cfg = TRACK[track];
  const [data, setData] = useState<ReturnType<typeof loadTrack>>({ items: [], attempts: [], best: {} });
  const [kind, setKind] = useState("all");
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(PAGE);

  useEffect(() => {
    setData(loadTrack(track, email));
  }, [track, email, career.assessmentCount]);

  const { items, attempts, best } = data;
  const streak = career.streak.count;
  const completed = Object.keys(best).length;
  const average = avg(attempts.map((a) => a.percent));

  const groupAvgs = useMemo(() => {
    const by: Record<string, number[]> = {};
    for (const a of attempts) (by[a.group] ??= []).push(a.percent);
    return Object.entries(by)
      .map(([group, vals]) => ({ group, avg: avg(vals) ?? 0 }))
      .sort((a, b) => a.avg - b.avg);
  }, [attempts]);
  const weakest = groupAvgs[0] && groupAvgs[0].avg < 70 ? groupAvgs[0] : null;

  const next = useMemo(() => {
    const pool = weakest ? items.filter((t) => t.group === weakest.group) : items;
    return (
      pool.find((t) => best[t.id] == null && t.kind === "chapter") ??
      pool.find((t) => best[t.id] == null) ??
      [...pool].sort((a, b) => (best[a.id] ?? 0) - (best[b.id] ?? 0))[0] ??
      null
    );
  }, [items, best, weakest]);

  const days = useMemo(() => {
    const out: number[] = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toDateString();
      out.push(attempts.filter((a) => new Date(a.at).toDateString() === key).length);
    }
    return out;
  }, [attempts]);
  const weekCount = days.reduce((s, n) => s + n, 0);
  const trend = attempts.slice(0, 8).map((a) => a.percent).reverse();
  const groupBars = groupAvgs.slice(0, 6).map((g) => g.avg);

  const kinds = (track === "developer" ? SKILL_KINDS : MOCK_KINDS).filter((k) => k.id === "all" || items.some((t) => t.kind === k.id));
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(
      (t) =>
        (kind === "all" || t.kind === kind) &&
        (!q || `${t.title} ${t.subtitle} ${GROUP_LABELS[t.group] ?? t.group}`.toLowerCase().includes(q))
    );
  }, [items, kind, query]);

  const examDays = cfg.exam ? daysUntil(cfg.examMonth, cfg.examDay) : null;
  const statsLine = `${average ?? 0}% average · ${completed}/${items.length} ${cfg.noun} done${examDays ? ` · ~${examDays} days to ${cfg.exam}` : ""}.`;
  const copy = !attempts.length
    ? {
        greeting: "Let's get started,",
        sub:
          track === "developer"
            ? `Take a ${next?.durationMin ?? 12}-minute skill test to see your accuracy, streak and weakest domains here. Scores feed Gemma internship matching.`
            : `Your first ${track === "neet" ? "NEET" : "board"} test takes about ${next?.durationMin ?? 12} minutes. Accuracy, streak and weak subjects appear here once you finish.`,
        cta: next ? `Start ${next.title}` : `Browse ${cfg.noun}`,
        href: next?.href ?? cfg.catalog,
      }
    : weakest
      ? {
          greeting: streak > 1 ? `${streak}-day streak,` : "Welcome back,",
          sub: `${GROUP_LABELS[weakest.group] ?? weakest.group} is your weakest area at ${weakest.avg}%. ${statsLine}`,
          cta: next ? `Practise ${next.title}` : `Browse ${cfg.noun}`,
          href: next?.href ?? cfg.catalog,
        }
      : {
          greeting: "Nice work,",
          sub: `Every area is above 70%. ${statsLine}`,
          cta: next ? `Next: ${next.title}` : `Browse ${cfg.noun}`,
          href: next?.href ?? cfg.catalog,
        };

  const nounTitle = cfg.noun[0].toUpperCase() + cfg.noun.slice(1);

  return (
    <DarkShell query={query} onQuery={setQuery} searchPlaceholder={`Search ${cfg.noun}, topics…`}>
      <DarkHero
        {...copy}
        image={trackHeroArt(track)}
        imageAlt={cfg.imageAlt}
        stats={
          <>
            <HeroStat icon={Trophy} tone="amber" value={average != null ? `${average}%` : "–"} label="Average score" delay={0.15} />
            <HeroStat icon={BookOpen} tone="teal" value={`${completed}/${items.length}`} label={`${nounTitle} done`} delay={0.22} />
            <HeroStat icon={Flame} tone="orange" value={`${streak} day${streak === 1 ? "" : "s"}`} label="Study streak" delay={0.29} />
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <AccuracyCard
          href="/progress"
          label="Average score"
          value={average}
          caption={attempts.length ? `${attempts.length} attempt${attempts.length === 1 ? "" : "s"} logged` : "Finish a test to see this"}
        />

        <MetricCard href={cfg.catalog} delay={0.16}>
          <div className="flex items-start gap-3">
            <IconTile icon={BookOpen} />
            <div className="flex-1">
              <p className="text-sm font-semibold text-white/85">{nounTitle} completed</p>
              <p className="mt-2 text-4xl font-extrabold leading-none text-white">
                {completed}
                <span className="text-xl font-bold text-white/45">/{items.length}</span>
              </p>
              <p className="mt-2 text-xs text-white/65">
                {groupAvgs.length ? `${groupAvgs.length} area${groupAvgs.length === 1 ? "" : "s"} practised` : "No areas practised yet"}
              </p>
            </div>
            <Bars values={groupBars.length ? groupBars : [0, 0, 0]} className="mt-6 h-14" />
          </div>
        </MetricCard>

        <MetricCard href="/progress" delay={0.22}>
          <div className="flex items-start gap-3">
            <IconTile icon={Flame} tone="orange" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-white/85">Study streak</p>
              <p className="mt-2 text-4xl font-extrabold leading-none text-white">
                {streak}
                <span className="ml-1 text-xl font-bold text-white/80">day{streak === 1 ? "" : "s"}</span>
              </p>
              <p className="mt-2 text-xs text-white/65">Longest · {career.streak.longestStreak ?? streak} days</p>
            </div>
          </div>
          <Sparkline values={trend.length >= 2 ? trend : [0, 0]} className="absolute bottom-4 right-4 h-12 w-[45%]" />
        </MetricCard>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_1.15fr]">
        {track === "developer" ? (
          <MetricCard href="/resume" delay={0.26}>
            <div className="flex items-start gap-3">
              <IconTile icon={Briefcase} />
              <div className="flex-1">
                <p className="text-sm font-semibold text-white/85">Career readiness</p>
                <p className="mt-2 text-4xl font-extrabold leading-none text-white">
                  {career.resumeAtsScore}
                  <span className="text-xl font-bold text-white/45">% ATS</span>
                </p>
                <p className="mt-2 text-xs text-white/65">
                  {career.internshipMatches} internship match{career.internshipMatches === 1 ? "" : "es"} · interview {career.interviewScore ?? 0}%
                </p>
              </div>
              <Bars values={[career.resumeAtsScore, Math.min(100, career.internshipMatches * 10), career.interviewScore ?? 0]} className="mt-4 h-20" />
            </div>
          </MetricCard>
        ) : (
          <MetricCard href="/planner" delay={0.26}>
            <div className="flex items-start gap-3">
              <IconTile icon={CalendarDays} />
              <div className="flex-1">
                <p className="text-sm font-semibold text-white/85">Tests this week</p>
                <p className="mt-2 text-4xl font-extrabold leading-none text-white">{weekCount}</p>
                <p className="mt-2 text-xs text-white/65">~{examDays} days to {cfg.exam}</p>
              </div>
              <Bars values={days} className="mt-4 h-20" />
            </div>
          </MetricCard>
        )}

        <MetricCard href={next?.href ?? cfg.catalog} delay={0.3} className="min-h-[170px]">
          <div className="relative z-10 flex items-start gap-3 pr-[38%]">
            <IconTile icon={Play} />
            <div>
              <p className="text-sm font-semibold text-white/85">
                {weakest ? `Weakest · ${GROUP_LABELS[weakest.group] ?? weakest.group} ${weakest.avg}%` : "Next test to try"}
              </p>
              <p className="mt-2 font-heading text-lg font-bold capitalize leading-snug text-white">{next?.title ?? `Browse ${cfg.noun}`}</p>
              <p className="mt-1 text-xs text-white/65">{weakest ? "Practise it to push the area above 70%" : (next?.subtitle ?? "")}</p>
            </div>
          </div>
          {next ? <TrackArt src={next.art} alt="" active className="absolute bottom-0 right-6 w-[34%] max-w-[170px]" sizes="170px" /> : null}
        </MetricCard>
      </div>

      <section className="pt-2">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-2xl font-bold text-white">Your {nounTitle}</h2>
            <p className="mt-1 text-sm text-white/60">
              Filter by type, then tap a card to start.{" "}
              <Link href={cfg.catalog} className="font-semibold text-accent-light hover:underline">
                Open full catalogue
              </Link>
            </p>
          </div>
          <FilterPills
            options={kinds}
            value={kind}
            onChange={(k) => {
              setKind(k);
              setLimit(PAGE);
            }}
            label="Test type"
            layoutId={`${track}-kind`}
          />
        </div>

        <MobileSearch value={query} onChange={setQuery} placeholder={`Search ${cfg.noun}, topics…`} />

        {visible.length ? (
          <>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visible.slice(0, limit).map((item, i) => (
                <TestTile key={item.id} item={item} best={best[item.id]} index={i} />
              ))}
            </div>
            {visible.length > limit ? (
              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={() => setLimit((n) => n + PAGE)}
                  className="cursor-pointer rounded-full border border-white/15 bg-white/[0.04] px-5 py-2 text-sm font-semibold text-white transition-colors hover:border-accent-light/50 hover:text-accent-light"
                >
                  Show more ({visible.length - limit} left)
                </button>
              </div>
            ) : null}
          </>
        ) : items.length ? (
          <EmptySearch query={query} onClear={() => setQuery("")} noun={cfg.noun} />
        ) : null}
      </section>
    </DarkShell>
  );
}
