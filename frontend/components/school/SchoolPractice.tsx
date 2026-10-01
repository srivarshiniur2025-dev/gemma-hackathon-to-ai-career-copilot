"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MotionConfig, motion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  Dices,
  Flame,
  Gamepad2,
  Layers,
  ListChecks,
  MessageSquareText,
  NotebookPen,
  Puzzle,
  Search,
  Sparkles,
  Timer,
  Trophy,
  Wand2,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useCareerProfile } from "@/contexts/CareerProfileContext";
import {
  cardsForChapter,
  dailyChallenge,
  questionsForChapter,
  questionsForChapters,
  shuffle,
  todayKey,
  type SchoolDifficulty,
  type SchoolQuestion,
} from "@/lib/school/questions";
import { emptyScoreboard, levelFor, loadScoreboard, type ActivityKind, type SchoolScoreboard } from "@/lib/school/scoreboard";
import {
  EXCLUDED_TOPICS,
  SYLLABUS_BOOKS,
  SYLLABUS_SESSION,
  chaptersFor,
  classFromAnswers,
  subjectFromAnswers,
  subjectLabel,
  type SchoolChapter,
  type SchoolClass,
  type SchoolSubject,
} from "@/lib/school/syllabus";
import { cn } from "@/lib/utils";
import { FlashcardsActivity, MatchPairs, TrueFalseSprint } from "./Activities";
import { GemmaChat } from "./GemmaChat";
import { GemmaNotes, loadNotePrefs } from "./GemmaNotes";
import { GemmaQuestionAgent } from "./GemmaQuestionAgent";
import { QuizPlayer } from "./QuizPlayer";
import { Scoreboard, currentStreak } from "./Scoreboard";

export type PracticeSection = "chapters" | "agent" | "notes" | "activities" | "scoreboard";
type Playing = {
  title: string;
  questions: SchoolQuestion[];
  kind: ActivityKind;
  chapterId?: string;
  secondsPerQuestion?: number;
  retry?: () => void;
};
type ActiveActivity = "flashcards" | "true_false" | "match" | null;

const SECTIONS: Record<PracticeSection, { label: string; icon: React.ElementType; blurb: string }> = {
  chapters: {
    label: "Chapter Tests",
    icon: ListChecks,
    blurb: "Every test uses only questions from the chapter you pick.",
  },
  agent: {
    label: "Gemma Questions",
    icon: Bot,
    blurb: "Chat with Gemma or build a set step by step — fresh practice questions from your chapter.",
  },
  notes: {
    label: "Gemma Notes",
    icon: NotebookPen,
    blurb: "Teacher-style revision notes grounded in your NCERT chapter. Rate them and Gemma adapts.",
  },
  activities: {
    label: "Activities",
    icon: Gamepad2,
    blurb: "Flashcards, quick quizzes and games that earn points for your scoreboard.",
  },
  scoreboard: {
    label: "My Scoreboard",
    icon: Trophy,
    blurb: "Your points, level, badges, streak and chapter mastery.",
  },
};

type Pick = { classLevel: SchoolClass; subject: SchoolSubject };
const pickKey = (email?: string) => `careerCopilotSchoolPick:${(email || "guest").toLowerCase()}`;

function loadPick(email?: string): Pick | null {
  try {
    const raw = window.localStorage.getItem(pickKey(email));
    const parsed = raw ? (JSON.parse(raw) as Pick) : null;
    if (parsed && (parsed.classLevel === 9 || parsed.classLevel === 10) && (parsed.subject === "science" || parsed.subject === "maths")) {
      return parsed;
    }
  } catch {
    /* ignore corrupt value */
  }
  return null;
}

export function SchoolPractice({ section }: { section: PracticeSection }) {
  const { user } = useAuth();
  const { profile } = useCareerProfile();
  const email = user?.email ?? undefined;
  const answers = profile?.onboarding_answers;
  const meta = SECTIONS[section];

  const [classLevel, setClassLevel] = useState<SchoolClass>(() => classFromAnswers(answers));
  const [subject, setSubject] = useState<SchoolSubject>(() => subjectFromAnswers(answers));
  const [playing, setPlaying] = useState<Playing | null>(null);
  const [activity, setActivity] = useState<ActiveActivity>(null);
  const [flashChapter, setFlashChapter] = useState("all");
  const [board, setBoard] = useState<SchoolScoreboard>(emptyScoreboard);
  const [difficulty, setDifficulty] = useState<SchoolDifficulty | "all">("all");
  const [gemmaView, setGemmaView] = useState<"chat" | "guided">("chat");
  const [query, setQuery] = useState("");

  const grade = answers?.grade;
  const hardSubject = answers?.hard_subject;
  useEffect(() => {
    const saved = loadPick(email);
    setClassLevel(saved?.classLevel ?? classFromAnswers({ grade: grade ?? "" }));
    setSubject(saved?.subject ?? subjectFromAnswers({ hard_subject: hardSubject ?? "" }));
  }, [email, grade, hardSubject]);

  const choose = (next: Partial<Pick>) => {
    const value: Pick = { classLevel: next.classLevel ?? classLevel, subject: next.subject ?? subject };
    setClassLevel(value.classLevel);
    setSubject(value.subject);
    window.localStorage.setItem(pickKey(email), JSON.stringify(value));
  };

  useEffect(() => {
    const refresh = () => setBoard(loadScoreboard(email));
    refresh();
    window.addEventListener("school-score-updated", refresh);
    return () => window.removeEventListener("school-score-updated", refresh);
  }, [email]);

  const chapters = useMemo(() => chaptersFor(classLevel, subject), [classLevel, subject]);
  const level = levelFor(board.totalPoints);
  const dailyDoneToday = board.dailyDone[todayKey()] != null;
  const streak = currentStreak(board.activeDays);

  const stats = useMemo(() => {
    const questions = chapters.reduce((sum, c) => sum + questionsForChapter(c.id).length, 0);
    const mastered = chapters.filter((c) => (board.chapterMastery[c.id] ?? 0) >= 80).length;
    return { questions, mastered };
  }, [chapters, board.chapterMastery]);

  const visibleChapters = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return chapters;
    return chapters.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.unit.toLowerCase().includes(q) ||
        c.keyTopics.some((t) => t.toLowerCase().includes(q)) ||
        String(c.number) === q
    );
  }, [chapters, query]);

  const exit = useCallback(() => {
    setPlaying(null);
    setActivity(null);
  }, []);

  const startChapterTest = (chapterId: string, name: string) => {
    const run = () => {
      const pool = questionsForChapter(chapterId, difficulty === "all" ? undefined : difficulty);
      setPlaying({
        title: `Ch test · ${name}`,
        questions: shuffle(pool),
        kind: "chapter_test",
        chapterId,
        retry: () => {
          setPlaying(null);
          window.setTimeout(run, 0);
        },
      });
    };
    run();
  };

  const startBlitz = () => {
    const ids = chapters.filter((c) => !c.internalOnly).map((c) => c.id);
    const run = () =>
      setPlaying({
        title: `Quiz Blitz · Class ${classLevel} ${subjectLabel(subject)}`,
        questions: shuffle(questionsForChapters(ids)).slice(0, 10),
        kind: "quiz_blitz",
        secondsPerQuestion: 20,
        retry: () => {
          setPlaying(null);
          window.setTimeout(run, 0);
        },
      });
    run();
  };

  const startMystery = () => {
    const pool = chapters.filter((c) => !c.internalOnly);
    const ch = pool[Math.floor(Math.random() * pool.length)];
    if (ch) startChapterTest(ch.id, ch.name);
  };

  const startDaily = () => {
    setPlaying({
      title: `Daily Challenge · ${new Date().toLocaleDateString()}`,
      questions: dailyChallenge(classLevel, subject),
      kind: "daily",
      secondsPerQuestion: 30,
    });
  };

  const openFlashcards = (chapterId: string) => {
    setFlashChapter(chapterId);
    setActivity("flashcards");
  };

  if (playing) {
    return (
      <div className="mx-auto max-w-3xl">
        <QuizPlayer
          key={`${playing.title}-${playing.questions[0]?.id ?? ""}-${playing.questions.length}`}
          title={playing.title}
          questions={playing.questions}
          kind={playing.kind}
          chapterId={playing.chapterId}
          secondsPerQuestion={playing.secondsPerQuestion}
          email={email}
          onExit={exit}
          onRetry={playing.retry}
        />
      </div>
    );
  }

  if (activity) {
    const props = { classLevel, subject, email, onExit: exit };
    return (
      <div className="mx-auto max-w-4xl">
        {activity === "flashcards" ? <FlashcardsActivity {...props} initialChapter={flashChapter} /> : null}
        {activity === "true_false" ? <TrueFalseSprint {...props} /> : null}
        {activity === "match" ? <MatchPairs {...props} /> : null}
      </div>
    );
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="space-y-6">
        <section className="relative overflow-hidden rounded-[28px] bg-primary p-6 text-white shadow-[var(--shadow-lg)] sm:p-8">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage: "radial-gradient(rgba(255,255,255,0.09) 1px, transparent 1px)",
              backgroundSize: "22px 22px",
            }}
          />
          <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/30 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-accent-light/10 blur-3xl" />

          <div className="relative flex flex-wrap items-center justify-between gap-8">
            <div className="max-w-xl">
              <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-light">
                <meta.icon className="h-4 w-4" /> {meta.label} · {SYLLABUS_SESSION}
              </p>
              <h1 className="mt-3 font-heading text-3xl font-bold text-white sm:text-[40px] sm:leading-[1.1]">
                Class {classLevel}{" "}
                <span className="bg-gradient-to-r from-accent-light to-teal-200 bg-clip-text text-transparent">
                  {subjectLabel(subject)}
                </span>
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                {meta.blurb} Aligned to {SYLLABUS_BOOKS[`${classLevel}-${subject}`]}.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Segmented
                  dark
                  value={String(classLevel)}
                  onChange={(v) => choose({ classLevel: Number(v) as SchoolClass })}
                  options={[
                    { value: "9", label: "Class 9" },
                    { value: "10", label: "Class 10" },
                  ]}
                />
                <Segmented
                  dark
                  value={subject}
                  onChange={(v) => choose({ subject: v as SchoolSubject })}
                  options={[
                    { value: "science", label: "Science" },
                    { value: "maths", label: "Maths" },
                  ]}
                />
              </div>
            </div>

            <Link
              href="/scoreboard"
              className="group flex items-center gap-5 rounded-[24px] border border-white/10 bg-white/[0.04] p-4 pr-6 backdrop-blur transition-colors duration-200 hover:border-accent/50 hover:bg-white/[0.07]"
            >
              <ProgressRing value={level.progress} size={88} stroke={7} dark>
                <span className="font-heading text-xl font-bold leading-none">{board.totalPoints}</span>
                <span className="mt-0.5 text-[10px] uppercase tracking-wider text-zinc-400">pts</span>
              </ProgressRing>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">Level</p>
                <p className="font-heading text-lg font-bold">{level.name}</p>
                <div className="mt-2 flex items-center gap-3 text-xs text-zinc-300">
                  <span className="inline-flex items-center gap-1">
                    <Flame className={cn("h-3.5 w-3.5", streak ? "text-warning" : "text-zinc-500")} /> {streak}-day streak
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-accent-light" /> {stats.mastered} mastered
                  </span>
                </div>
                <p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-accent-light">
                  Open scoreboard <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                </p>
              </div>
            </Link>
          </div>

          <div className="relative mt-7 grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10">
            <HeroStat label="Chapters" value={chapters.length} />
            <HeroStat label="Practice questions" value={stats.questions} />
            <HeroStat label="Chapters mastered" value={`${stats.mastered}/${chapters.length}`} />
          </div>
        </section>

        {section === "chapters" ? (
          <div className="space-y-5">
            <DailyChallengeCard done={dailyDoneToday} score={board.dailyDone[todayKey()]} onStart={startDaily} />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="relative w-full sm:w-80">
                <span className="sr-only">Search chapters</span>
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search a chapter or topic…"
                  className="h-11 w-full rounded-[14px] border border-border bg-white pl-10 pr-3 text-sm text-foreground outline-none transition-colors duration-200 placeholder:text-disabled focus:border-border-focus focus:ring-2 focus:ring-accent/15"
                />
              </label>
              <Segmented
                value={difficulty}
                onChange={(v) => setDifficulty(v as SchoolDifficulty | "all")}
                options={[
                  { value: "all", label: "All" },
                  { value: "easy", label: "Easy" },
                  { value: "medium", label: "Medium" },
                  { value: "hard", label: "Hard" },
                ]}
              />
            </div>

            {visibleChapters.length ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {visibleChapters.map((c, i) => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: Math.min(i * 0.035, 0.4), ease: [0.22, 1, 0.36, 1] }}
                  >
                    <ChapterCard
                      chapter={c}
                      difficulty={difficulty}
                      mastery={board.chapterMastery[c.id]}
                      onTest={() => startChapterTest(c.id, c.name)}
                      onFlashcards={() => openFlashcards(c.id)}
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="rounded-[var(--radius-card)] border border-dashed border-border-hover bg-background-muted p-10 text-center">
                <p className="font-heading text-base font-semibold text-foreground-heading">No chapter matches “{query}”</p>
                <p className="mt-1 text-sm text-muted">Try a topic like “refraction” or a chapter number.</p>
              </div>
            )}
          </div>
        ) : null}

        {section === "agent" || section === "notes" ? (
          <div className="space-y-4">
            <Segmented
              value={gemmaView}
              onChange={(v) => setGemmaView(v as "chat" | "guided")}
              options={[
                { value: "chat", label: "Chat freely", icon: MessageSquareText },
                { value: "guided", label: section === "agent" ? "Step-by-step builder" : "Notes builder", icon: Wand2 },
              ]}
            />

            {gemmaView === "chat" ? (
              <GemmaChat
                key={`${section}-${classLevel}-${subject}`}
                mode={section === "agent" ? "questions" : "notes"}
                classLevel={classLevel}
                subject={subject}
                email={email}
                preferences={section === "notes" ? loadNotePrefs(email) : []}
                onPlay={(title, questions, chapterId) => setPlaying({ title, questions, kind: "gemma_quiz", chapterId })}
              />
            ) : section === "agent" ? (
              <GemmaQuestionAgent
                classLevel={classLevel}
                subject={subject}
                email={email}
                onPlay={(title, questions, chapterId) => setPlaying({ title, questions, kind: "gemma_quiz", chapterId })}
              />
            ) : (
              <GemmaNotes classLevel={classLevel} subject={subject} email={email} />
            )}
          </div>
        ) : null}

        {section === "activities" ? (
          <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <ActivityTile
              featured
              icon={Zap}
              title="Quiz Blitz"
              meta="10 Qs · 20 s each"
              text="Mixed questions from your whole syllabus. Answer fast for speed bonus points and keep your streak alive."
              onClick={startBlitz}
            />
            <ActivityTile
              icon={Timer}
              title="True / False Sprint"
              meta="60 seconds"
              text="Decide if each claimed answer is true or false before the clock runs out."
              onClick={() => setActivity("true_false")}
            />
            <ActivityTile
              icon={Puzzle}
              title="Match Pairs"
              meta="Terms ↔ meanings"
              text="Match key terms to their meanings. Fewer mistakes, more points."
              onClick={() => setActivity("match")}
            />
            <ActivityTile
              icon={Layers}
              title="Flashcards"
              meta="Spaced review"
              text="Flip cards for definitions and formulas. Cards you miss come back until you know them."
              onClick={() => openFlashcards("all")}
            />
            <ActivityTile
              icon={CalendarCheck}
              title="Daily Challenge"
              meta={dailyDoneToday ? "Done today" : "5 Qs · 30 s"}
              text={dailyDoneToday ? "Already done today — replay for practice." : "Today's 5 questions. Same set for everyone in your class."}
              onClick={startDaily}
            />
            <ActivityTile
              icon={Dices}
              title="Mystery Chapter"
              meta="Random test"
              text="Can't decide? Roll the dice and take a random chapter test."
              onClick={startMystery}
            />
          </div>
        ) : null}

        {section === "scoreboard" ? <Scoreboard board={board} classLevel={classLevel} subject={subject} /> : null}

        <p className="flex items-center gap-2 text-[11px] text-muted">
          <BookOpen className="h-3.5 w-3.5 shrink-0" />
          Syllabus follows the CBSE {SYLLABUS_SESSION} curriculum and current NCERT books. Gemma-generated questions are labelled and always show
          their reference and syllabus point.
        </p>
      </div>
    </MotionConfig>
  );
}

function Segmented({
  value,
  onChange,
  options,
  dark = false,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string; icon?: React.ElementType }[];
  dark?: boolean;
}) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex rounded-full p-1",
        dark ? "border border-white/10 bg-white/[0.06]" : "border border-border bg-background-secondary"
      )}
    >
      {options.map((o) => {
        const active = o.value === value;
        const Icon = o.icon;
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={cn(
              "inline-flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
              active
                ? dark
                  ? "bg-white text-primary shadow-sm"
                  : "bg-white text-foreground-heading shadow-sm"
                : dark
                  ? "text-zinc-400 hover:text-white"
                  : "text-muted hover:text-foreground-heading"
            )}
          >
            {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function ProgressRing({
  value,
  size = 44,
  stroke = 4,
  dark = false,
  children,
}: {
  value: number;
  size?: number;
  stroke?: number;
  dark?: boolean;
  children?: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className={dark ? "stroke-white/10" : "stroke-background-secondary"} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          className="stroke-accent-light"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - (pct / 100) * c }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}

function HeroStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-primary/90 px-4 py-3">
      <p className="font-heading text-xl font-bold text-white sm:text-2xl">{value}</p>
      <p className="text-[11px] uppercase tracking-wider text-zinc-500">{label}</p>
    </div>
  );
}

function DailyChallengeCard({ done, score, onStart }: { done: boolean; score?: number; onStart: () => void }) {
  return (
    <div className="premium-card relative flex flex-wrap items-center justify-between gap-4 overflow-hidden p-5">
      <span aria-hidden className={cn("absolute inset-y-0 left-0 w-1", done ? "bg-success" : "bg-accent")} />
      <div className="flex items-center gap-4">
        <span
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-2xl",
            done ? "bg-success/10 text-success" : "bg-accent/10 text-accent"
          )}
        >
          {done ? <CheckCircle2 className="h-6 w-6" /> : <CalendarCheck className="h-6 w-6" />}
        </span>
        <div>
          <p className="flex items-center gap-2 font-heading text-base font-bold text-foreground-heading">
            Daily Challenge
            <span className="rounded-full bg-background-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-secondary">
              {done ? "Completed" : "New today"}
            </span>
          </p>
          <p className="mt-0.5 text-xs text-muted">
            {done
              ? `You scored ${score ?? 0} points today. A fresh set unlocks tomorrow.`
              : "5 mixed questions from your syllabus, 30 seconds each."}
          </p>
          <div className="mt-2 flex gap-1" aria-hidden>
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className={cn("h-1.5 w-6 rounded-full", done ? "bg-success/70" : "bg-border")} />
            ))}
          </div>
        </div>
      </div>
      <Button variant={done ? "outline" : "default"} onClick={onStart}>
        {done ? "Play again" : "Start challenge"} <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

function ChapterCard({
  chapter: c,
  difficulty,
  mastery,
  onTest,
  onFlashcards,
}: {
  chapter: SchoolChapter;
  difficulty: SchoolDifficulty | "all";
  mastery?: number;
  onTest: () => void;
  onFlashcards: () => void;
}) {
  const all = questionsForChapter(c.id);
  const mix = {
    easy: all.filter((q) => q.difficulty === "easy").length,
    medium: all.filter((q) => q.difficulty === "medium").length,
    hard: all.filter((q) => q.difficulty === "hard").length,
  };
  const count = difficulty === "all" ? all.length : mix[difficulty];
  const cards = cardsForChapter(c.id).length;
  const excluded = EXCLUDED_TOPICS[c.id];
  const topics = c.keyTopics.slice(0, 3);
  const more = c.keyTopics.length - topics.length;

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-border bg-white p-5 shadow-[var(--shadow)] transition-[border-color,box-shadow] duration-300 hover:border-accent/40 hover:shadow-[var(--shadow-hover)]">
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-accent transition-transform duration-300 group-hover:scale-x-100"
      />
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-baseline gap-3">
          <span className="font-heading text-4xl font-bold leading-none text-zinc-200 transition-colors duration-300 group-hover:text-accent/30">
            {String(c.number).padStart(2, "0")}
          </span>
          <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent-hover">
            {c.unit}
          </span>
        </div>
        {mastery != null ? (
          <ProgressRing value={mastery} size={42} stroke={4}>
            <span className={cn("text-[10px] font-bold", mastery >= 80 ? "text-accent" : "text-foreground-heading")}>{mastery}%</span>
          </ProgressRing>
        ) : (
          <span className="rounded-full border border-dashed border-border-hover px-2 py-0.5 text-[10px] font-medium text-muted">Not started</span>
        )}
      </div>

      <p className="mt-3 font-heading text-base font-bold leading-snug text-foreground-heading">{c.name}</p>
      {c.internalOnly ? (
        <p className="mt-1 text-[11px] font-semibold text-warning">School / internal assessment only this session</p>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {topics.map((t) => (
          <span key={t} className="rounded-md bg-background-secondary px-2 py-0.5 text-[11px] text-muted-secondary">
            {t}
          </span>
        ))}
        {more > 0 ? <span className="rounded-md px-1 py-0.5 text-[11px] text-muted">+{more} more</span> : null}
      </div>
      {excluded?.length ? <p className="mt-2 text-[11px] text-muted">Not in board exam: {excluded.join(", ")}</p> : null}

      <div className="mt-auto pt-5">
        <div className="flex h-1.5 overflow-hidden rounded-full bg-background-secondary" aria-hidden>
          <span className="bg-accent-light/50" style={{ width: `${(mix.easy / Math.max(all.length, 1)) * 100}%` }} />
          <span className="bg-accent" style={{ width: `${(mix.medium / Math.max(all.length, 1)) * 100}%` }} />
          <span className="bg-primary" style={{ width: `${(mix.hard / Math.max(all.length, 1)) * 100}%` }} />
        </div>
        <p className="mt-1.5 text-[11px] text-muted">
          {mix.easy} easy · {mix.medium} medium · {mix.hard} hard
        </p>

        <div className="mt-4 flex gap-2">
          <Button size="sm" className="flex-1" disabled={!count} onClick={onTest}>
            <ListChecks className="h-4 w-4" /> Start test · {count} Qs
          </Button>
          <Button size="sm" variant="outline" onClick={onFlashcards} aria-label={`Flashcards for ${c.name}`} disabled={!cards}>
            <Layers className="h-4 w-4" /> {cards}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ActivityTile({
  icon: Icon,
  title,
  text,
  meta,
  onClick,
  featured = false,
}: {
  icon: React.ElementType;
  title: string;
  text: string;
  meta: string;
  onClick: () => void;
  featured?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative flex cursor-pointer flex-col overflow-hidden rounded-[var(--radius-card)] border p-6 text-left transition-[border-color,box-shadow,background-color] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
        featured
          ? "border-primary bg-primary text-white shadow-[var(--shadow-lg)] hover:border-accent/60 sm:col-span-2 xl:col-span-1 xl:row-span-2"
          : "border-border bg-white shadow-[var(--shadow)] hover:border-accent/40 hover:shadow-[var(--shadow-hover)]"
      )}
    >
      {featured ? (
        <>
          <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-accent/30 blur-3xl" />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)", backgroundSize: "20px 20px" }}
          />
        </>
      ) : null}
      <div className="relative flex items-center justify-between gap-3">
        <span
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-2xl transition-colors duration-300",
            featured ? "bg-accent text-white" : "bg-accent/10 text-accent group-hover:bg-accent group-hover:text-white"
          )}
        >
          <Icon className="h-6 w-6" />
        </span>
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider",
            featured ? "bg-white/10 text-zinc-300" : "bg-background-secondary text-muted-secondary"
          )}
        >
          {meta}
        </span>
      </div>
      {featured ? (
        <p className="relative mt-6 inline-flex w-fit items-center gap-1.5 rounded-full bg-accent/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-accent-light">
          <Sparkles className="h-3 w-3" /> Most played
        </p>
      ) : null}
      <p className={cn("relative mt-4 font-heading font-bold", featured ? "text-2xl text-white" : "text-lg text-foreground-heading")}>{title}</p>
      <p className={cn("relative mt-1.5 text-sm leading-relaxed", featured ? "text-zinc-400" : "text-muted")}>{text}</p>
      <span
        className={cn(
          "relative mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold",
          featured ? "text-accent-light" : "text-accent"
        )}
      >
        Play now <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
      </span>
    </button>
  );
}
