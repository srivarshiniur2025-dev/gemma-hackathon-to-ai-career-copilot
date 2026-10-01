"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bot,
  BookOpen,
  CalendarCheck,
  Dices,
  Gamepad2,
  Layers,
  ListChecks,
  NotebookPen,
  Puzzle,
  Timer,
  Trophy,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useCareerProfile } from "@/contexts/CareerProfileContext";
import {
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
  type SchoolClass,
  type SchoolSubject,
} from "@/lib/school/syllabus";
import { cn } from "@/lib/utils";
import { FlashcardsActivity, MatchPairs, TrueFalseSprint } from "./Activities";
import { GemmaNotes } from "./GemmaNotes";
import { GemmaQuestionAgent } from "./GemmaQuestionAgent";
import { QuizPlayer } from "./QuizPlayer";
import { Scoreboard, currentStreak } from "./Scoreboard";

type Tab = "chapters" | "agent" | "notes" | "activities" | "scoreboard";
type Playing = {
  title: string;
  questions: SchoolQuestion[];
  kind: ActivityKind;
  chapterId?: string;
  secondsPerQuestion?: number;
  retry?: () => void;
};
type ActiveActivity = "flashcards" | "true_false" | "match" | null;

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "chapters", label: "Chapter Tests", icon: ListChecks },
  { id: "agent", label: "Gemma Question Agent", icon: Bot },
  { id: "notes", label: "Gemma Notes", icon: NotebookPen },
  { id: "activities", label: "Activities", icon: Gamepad2 },
  { id: "scoreboard", label: "My Scoreboard", icon: Trophy },
];

export function SchoolPractice() {
  const { user } = useAuth();
  const { profile } = useCareerProfile();
  const email = user?.email ?? undefined;
  const answers = profile?.onboarding_answers;

  const [classLevel, setClassLevel] = useState<SchoolClass>(() => classFromAnswers(answers));
  const [subject, setSubject] = useState<SchoolSubject>(() => subjectFromAnswers(answers));
  const [tab, setTab] = useState<Tab>("chapters");
  const [playing, setPlaying] = useState<Playing | null>(null);
  const [activity, setActivity] = useState<ActiveActivity>(null);
  const [flashChapter, setFlashChapter] = useState("all");
  const [board, setBoard] = useState<SchoolScoreboard>(emptyScoreboard);
  const [difficulty, setDifficulty] = useState<SchoolDifficulty | "all">("all");

  const grade = answers?.grade;
  const hardSubject = answers?.hard_subject;
  useEffect(() => {
    setClassLevel(classFromAnswers({ grade: grade ?? "" }));
    setSubject(subjectFromAnswers({ hard_subject: hardSubject ?? "" }));
  }, [grade, hardSubject]);

  useEffect(() => {
    const refresh = () => setBoard(loadScoreboard(email));
    refresh();
    window.addEventListener("school-score-updated", refresh);
    return () => window.removeEventListener("school-score-updated", refresh);
  }, [email]);

  const chapters = useMemo(() => chaptersFor(classLevel, subject), [classLevel, subject]);
  const level = levelFor(board.totalPoints);
  const dailyDoneToday = board.dailyDone[todayKey()] != null;

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
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[32px] bg-gradient-to-br from-sky-500 via-violet-500 to-fuchsia-500 p-6 text-white shadow-[var(--shadow-lg)] sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">Chapter Practice · {SYLLABUS_SESSION}</p>
            <h1 className="mt-2 font-heading text-3xl font-bold sm:text-4xl">
              Class {classLevel} {subjectLabel(subject)}
            </h1>
            <p className="mt-2 text-sm text-white/85">
              Every test uses only questions from the chapter you pick, aligned to {SYLLABUS_BOOKS[`${classLevel}-${subject}`]}.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {([9, 10] as SchoolClass[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setClassLevel(c)}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-xs font-bold transition-colors",
                    classLevel === c ? "bg-white text-violet-700" : "bg-white/15 text-white hover:bg-white/25"
                  )}
                >
                  Class {c}
                </button>
              ))}
              <span className="mx-1 w-px bg-white/30" />
              {(["science", "maths"] as SchoolSubject[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSubject(s)}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-xs font-bold transition-colors",
                    subject === s ? "bg-white text-violet-700" : "bg-white/15 text-white hover:bg-white/25"
                  )}
                >
                  {subjectLabel(s)}
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setTab("scoreboard")}
            className="min-w-[220px] rounded-[24px] bg-white/15 p-4 text-left backdrop-blur transition-colors hover:bg-white/20"
          >
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/80">
              <Trophy className="h-4 w-4" /> My scoreboard
            </p>
            <p className="mt-1 font-heading text-3xl font-bold">{board.totalPoints} pts</p>
            <p className="text-sm text-white/85">
              {level.name} · {currentStreak(board.activeDays)}-day streak
            </p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/25">
              <div className="h-full rounded-full bg-white" style={{ width: `${level.progress}%` }} />
            </div>
          </button>
        </div>
      </section>

      <nav className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
              tab === t.id ? "border-violet-500 bg-violet-600 text-white" : "border-border bg-white text-foreground hover:border-violet-300"
            )}
          >
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </nav>

      {tab === "chapters" ? (
        <div className="space-y-5">
          <div
            className={cn(
              "flex flex-wrap items-center justify-between gap-4 rounded-[24px] border p-5",
              dailyDoneToday ? "border-success/30 bg-success/5" : "border-amber-200 bg-amber-50"
            )}
          >
            <div className="flex items-center gap-3">
              <CalendarCheck className={cn("h-8 w-8", dailyDoneToday ? "text-success" : "text-amber-600")} />
              <div>
                <p className="font-heading text-base font-bold text-foreground-heading">Daily Challenge</p>
                <p className="text-xs text-muted">
                  {dailyDoneToday
                    ? `Done for today — you scored ${board.dailyDone[todayKey()]} points. Come back tomorrow!`
                    : "5 mixed questions from your syllabus, 30 seconds each. New set every day."}
                </p>
              </div>
            </div>
            <Button variant={dailyDoneToday ? "outline" : "accent"} onClick={startDaily}>
              {dailyDoneToday ? "Play again (practice)" : "Start today's challenge"}
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted">Difficulty:</span>
            {(["all", "easy", "medium", "hard"] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDifficulty(d)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-semibold capitalize",
                  difficulty === d ? "border-violet-500 bg-violet-600 text-white" : "border-border bg-white"
                )}
              >
                {d}
              </button>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {chapters.map((c) => {
              const count = questionsForChapter(c.id, difficulty === "all" ? undefined : difficulty).length;
              const mastery = board.chapterMastery[c.id];
              const excluded = EXCLUDED_TOPICS[c.id];
              return (
                <div key={c.id} className="flex flex-col rounded-[24px] border border-border bg-white p-5 shadow-[var(--shadow-sm)]">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-violet-600">
                      Ch {c.number} · {c.unit}
                    </p>
                    {mastery != null ? (
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[11px] font-bold",
                          mastery >= 80 ? "bg-success/10 text-success" : "bg-amber-100 text-amber-700"
                        )}
                      >
                        Best {mastery}%
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 font-heading text-base font-bold leading-snug text-foreground-heading">{c.name}</p>
                  {c.internalOnly ? (
                    <p className="mt-1 text-[11px] font-semibold text-amber-700">School / internal assessment only this session</p>
                  ) : null}
                  <p className="mt-2 line-clamp-2 text-xs text-muted">{c.keyTopics.join(" · ")}</p>
                  {excluded?.length ? (
                    <p className="mt-1 text-[11px] text-muted">Not in board exam: {excluded.join(", ")}</p>
                  ) : null}
                  <div className="mt-auto flex flex-wrap gap-2 pt-4">
                    <Button size="sm" variant="accent" disabled={!count} onClick={() => startChapterTest(c.id, c.name)}>
                      <ListChecks className="h-4 w-4" /> Test · {count} Qs
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setFlashChapter(c.id);
                        setActivity("flashcards");
                      }}
                    >
                      <Layers className="h-4 w-4" /> Flashcards
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {tab === "agent" ? (
        <GemmaQuestionAgent
          classLevel={classLevel}
          subject={subject}
          email={email}
          onPlay={(title, questions, chapterId) => setPlaying({ title, questions, kind: "gemma_quiz", chapterId })}
        />
      ) : null}

      {tab === "notes" ? <GemmaNotes classLevel={classLevel} subject={subject} email={email} /> : null}

      {tab === "activities" ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <ActivityTile
            icon={Zap}
            title="Quiz Blitz"
            text="10 questions, 20 seconds each. Answer fast for speed bonus points and keep your streak alive."
            tone="from-orange-400 to-rose-500"
            onClick={startBlitz}
          />
          <ActivityTile
            icon={Timer}
            title="True / False Sprint"
            text="60 seconds on the clock. Decide if each claimed answer is true or false."
            tone="from-emerald-400 to-teal-500"
            onClick={() => setActivity("true_false")}
          />
          <ActivityTile
            icon={Puzzle}
            title="Match Pairs"
            text="Match key terms to their meanings. Fewer mistakes, more points."
            tone="from-sky-400 to-indigo-500"
            onClick={() => setActivity("match")}
          />
          <ActivityTile
            icon={Layers}
            title="Flashcards"
            text="Flip cards for definitions and formulas. Cards you miss come back until you know them."
            tone="from-violet-500 to-fuchsia-500"
            onClick={() => {
              setFlashChapter("all");
              setActivity("flashcards");
            }}
          />
          <ActivityTile
            icon={CalendarCheck}
            title="Daily Challenge"
            text={dailyDoneToday ? "Already done today — replay for practice." : "Today's 5 questions. Same set for everyone in your class."}
            tone="from-amber-400 to-yellow-500"
            onClick={startDaily}
          />
          <ActivityTile
            icon={Dices}
            title="Mystery Chapter"
            text="Can't decide? Roll the dice and take a random chapter test."
            tone="from-pink-400 to-red-400"
            onClick={startMystery}
          />
        </div>
      ) : null}

      {tab === "scoreboard" ? <Scoreboard board={board} classLevel={classLevel} subject={subject} /> : null}

      <p className="flex items-center gap-2 text-[11px] text-muted">
        <BookOpen className="h-3.5 w-3.5" />
        Syllabus follows the CBSE {SYLLABUS_SESSION} curriculum and current NCERT books. Gemma-generated questions are labelled and always show
        their reference and syllabus point.
      </p>
    </div>
  );
}

function ActivityTile({
  icon: Icon,
  title,
  text,
  tone,
  onClick,
}: {
  icon: React.ElementType;
  title: string;
  text: string;
  tone: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col rounded-[24px] border border-border bg-white p-5 text-left shadow-[var(--shadow-sm)] transition-transform hover:-translate-y-0.5"
    >
      <span className={cn("flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white", tone)}>
        <Icon className="h-6 w-6" />
      </span>
      <p className="mt-4 font-heading text-lg font-bold text-foreground-heading">{title}</p>
      <p className="mt-1 text-sm text-muted">{text}</p>
      <span className="mt-4 text-sm font-semibold text-violet-600 group-hover:underline">Play →</span>
    </button>
  );
}
