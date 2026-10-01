"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Bot, RotateCcw, Sparkles, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api, type GemmaSchoolQuestion } from "@/lib/api";
import { questionsForChapter, type SchoolQuestion } from "@/lib/school/questions";
import { bumpCounter } from "@/lib/school/scoreboard";
import {
  EXCLUDED_TOPICS,
  SYLLABUS_SESSION,
  chaptersFor,
  schoolChapterById,
  subjectLabel,
  type SchoolClass,
  type SchoolSubject,
} from "@/lib/school/syllabus";
import { cn } from "@/lib/utils";
import { GemmaWaiting } from "./GemmaWaiting";

type Difficulty = "easy" | "medium" | "hard" | "mixed";

const FOCUS_CHIPS = [
  "Board exam style",
  "Numericals / problem solving",
  "Definitions and key terms",
  "Diagram and activity based",
  "Tricky concepts I usually get wrong",
  "Real-life application questions",
];

const REFERENCE_OPTIONS = [
  "NCERT textbook (in-text and exercise style)",
  "NCERT Exemplar style",
  "CBSE sample paper / competency-based style",
  "Previous board exam style",
  "My own notes",
];

export type SavedSet = {
  id: string;
  title: string;
  chapterId: string;
  createdAt: string;
  questions: SchoolQuestion[];
};

function setsKey(email?: string) {
  return `careerCopilotSchoolSets:${(email || "guest").toLowerCase()}`;
}

export function loadSets(email?: string): SavedSet[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(setsKey(email)) || "[]") as SavedSet[];
  } catch {
    return [];
  }
}

export function storeSets(email: string | undefined, sets: SavedSet[]) {
  window.localStorage.setItem(setsKey(email), JSON.stringify(sets.slice(0, 12)));
  window.dispatchEvent(new Event("school-sets-updated"));
}

export function toSchoolQuestions(
  items: (GemmaSchoolQuestion & { chapter_id?: string | null })[],
  fallbackChapterId: string
): SchoolQuestion[] {
  const stamp = Date.now();
  return items.map((q, i) => ({
    id: `gemma-${stamp}-${i}`,
    chapterId: q.chapter_id || fallbackChapterId,
    difficulty: (["easy", "medium", "hard"].includes(q.difficulty) ? q.difficulty : "medium") as SchoolQuestion["difficulty"],
    question: q.question,
    options: q.options,
    answerIndex: q.answer_index,
    explanation: q.explanation,
    reference: q.reference,
    syllabusPoint: q.syllabus_point,
    source: "gemma",
  }));
}

type Props = {
  classLevel: SchoolClass;
  subject: SchoolSubject;
  email?: string;
  onPlay: (title: string, questions: SchoolQuestion[], chapterId: string) => void;
};

const STEPS = ["chapter", "topics", "focus", "difficulty", "references", "count", "review"] as const;
type Step = (typeof STEPS)[number];

export function GemmaQuestionAgent({ classLevel, subject, email, onPlay }: Props) {
  const chapters = useMemo(() => chaptersFor(classLevel, subject), [classLevel, subject]);
  const [step, setStep] = useState<Step>("chapter");
  const [chapterId, setChapterId] = useState("");
  const [topics, setTopics] = useState<string[]>([]);
  const [focus, setFocus] = useState<string[]>([]);
  const [focusText, setFocusText] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [references, setReferences] = useState<string[]>([REFERENCE_OPTIONS[0]]);
  const [ownNotes, setOwnNotes] = useState("");
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<SavedSet[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const chapter = chapterId ? schoolChapterById(chapterId) : undefined;

  useEffect(() => {
    const refresh = () => setSaved(loadSets(email));
    refresh();
    window.addEventListener("school-sets-updated", refresh);
    return () => window.removeEventListener("school-sets-updated", refresh);
  }, [email]);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [step]);

  const reset = () => {
    setStep("chapter");
    setChapterId("");
    setTopics([]);
    setFocus([]);
    setFocusText("");
    setDifficulty("medium");
    setReferences([REFERENCE_OPTIONS[0]]);
    setOwnNotes("");
    setCount(5);
    setError(null);
  };

  const reached = (s: Step) => STEPS.indexOf(step) >= STEPS.indexOf(s);
  const toggle = (list: string[], value: string) =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  const generate = async () => {
    if (!chapter) return;
    setLoading(true);
    setError(null);
    const recommendation = [...focus, focusText.trim()].filter(Boolean).join("; ");
    try {
      const res = await api.generateSchoolQuestions({
        class_level: classLevel,
        subject,
        chapter_id: chapter.id,
        chapter_number: chapter.number,
        chapter_name: chapter.name,
        book: chapter.book,
        key_topics: chapter.keyTopics,
        topics: topics.length ? topics : chapter.keyTopics,
        excluded: EXCLUDED_TOPICS[chapter.id] ?? [],
        difficulty,
        count,
        references,
        recommendation: recommendation || undefined,
        own_notes: references.includes("My own notes") && ownNotes.trim() ? ownNotes.trim() : undefined,
      });
      const stamp = Date.now();
      const questions = toSchoolQuestions(res.questions, chapter.id);
      const title = `Gemma · ${chapter.name} (${difficulty})`;
      const set: SavedSet = { id: `${stamp}`, title, chapterId: chapter.id, createdAt: new Date().toISOString(), questions };
      const nextSets = [set, ...saved];
      setSaved(nextSets);
      storeSets(email, nextSets);
      bumpCounter(email, "gemmaSets");
      onPlay(title, questions, chapter.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gemma is unavailable right now.");
    } finally {
      setLoading(false);
    }
  };

  const practiseBank = () => {
    if (!chapter) return;
    const pool = questionsForChapter(chapter.id, difficulty === "mixed" ? undefined : difficulty);
    const qs = (pool.length ? pool : questionsForChapter(chapter.id)).slice(0, count);
    onPlay(`Chapter bank · ${chapter.name}`, qs, chapter.id);
  };

  const removeSet = (id: string) => {
    const next = saved.filter((s) => s.id !== id);
    setSaved(next);
    storeSets(email, next);
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
      <div className="rounded-[28px] border border-accent/25 bg-white p-5 shadow-[var(--shadow-md)] sm:p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-white">
              <Bot className="h-6 w-6" />
            </span>
            <div>
              <p className="font-heading text-lg font-bold text-foreground-heading">Generate questions with Gemma</p>
              <p className="text-xs text-muted">
                Class {classLevel} {subjectLabel(subject)} · {SYLLABUS_SESSION} syllabus · questions stay inside the chapter you pick
              </p>
            </div>
          </div>
          <button type="button" onClick={reset} disabled={loading} className="inline-flex items-center gap-1 text-xs font-semibold text-muted hover:text-accent-hover">
            <RotateCcw className="h-3.5 w-3.5" /> Start over
          </button>
        </div>

        <div className="max-h-[560px] space-y-4 overflow-y-auto pr-1">
          <AgentBubble>Hi! I&apos;m your Gemma study buddy. Which chapter should I make questions from?</AgentBubble>
          {step === "chapter" ? (
            <div className="flex flex-wrap gap-2 pl-11">
              {chapters.map((c) => (
                <Chip
                  key={c.id}
                  active={chapterId === c.id}
                  onClick={() => {
                    setChapterId(c.id);
                    setTopics([...c.keyTopics]);
                    setStep("topics");
                  }}
                >
                  Ch {c.number}. {c.name}
                  {c.internalOnly ? " (school test only)" : ""}
                </Chip>
              ))}
            </div>
          ) : chapter ? (
            <UserBubble>Ch {chapter.number}. {chapter.name}</UserBubble>
          ) : null}

          {reached("topics") && chapter ? (
            <>
              <AgentBubble>
                These are the syllabus topics in this chapter. Keep the ones you want — I will only ask from these.
                {EXCLUDED_TOPICS[chapter.id]?.length ? (
                  <span className="mt-1 block text-[11px] text-muted">
                    Not in this year&apos;s board exam (I&apos;ll skip): {EXCLUDED_TOPICS[chapter.id].join(", ")}
                  </span>
                ) : null}
              </AgentBubble>
              {step === "topics" ? (
                <div className="space-y-3 pl-11">
                  <div className="flex flex-wrap gap-2">
                    {chapter.keyTopics.map((t) => (
                      <Chip key={t} active={topics.includes(t)} onClick={() => setTopics((prev) => toggle(prev, t))}>
                        {t}
                      </Chip>
                    ))}
                  </div>
                  <Button variant="accent" size="sm" disabled={!topics.length} onClick={() => setStep("focus")}>
                    Use {topics.length === chapter.keyTopics.length ? "all topics" : `${topics.length} topic${topics.length === 1 ? "" : "s"}`}
                  </Button>
                </div>
              ) : (
                <UserBubble>{topics.length === chapter.keyTopics.length ? "Whole chapter" : topics.join(", ")}</UserBubble>
              )}
            </>
          ) : null}

          {reached("focus") ? (
            <>
              <AgentBubble>What would you like to practise? Pick any, or tell me in your own words.</AgentBubble>
              {step === "focus" ? (
                <div className="space-y-3 pl-11">
                  <div className="flex flex-wrap gap-2">
                    {FOCUS_CHIPS.map((f) => (
                      <Chip key={f} active={focus.includes(f)} onClick={() => setFocus((prev) => toggle(prev, f))}>
                        {f}
                      </Chip>
                    ))}
                  </div>
                  <input
                    value={focusText}
                    onChange={(e) => setFocusText(e.target.value)}
                    placeholder="e.g. I keep mixing up mitosis and meiosis"
                    className="w-full rounded-2xl border border-border bg-white px-4 py-2.5 text-sm outline-none focus:border-accent-light"
                  />
                  <Button variant="accent" size="sm" onClick={() => setStep("difficulty")}>
                    {focus.length || focusText.trim() ? "Continue" : "Skip — surprise me"}
                  </Button>
                </div>
              ) : (
                <UserBubble>{[...focus, focusText.trim()].filter(Boolean).join("; ") || "Surprise me"}</UserBubble>
              )}
            </>
          ) : null}

          {reached("difficulty") ? (
            <>
              <AgentBubble>How tough should the questions be?</AgentBubble>
              {step === "difficulty" ? (
                <div className="flex flex-wrap gap-2 pl-11">
                  {(
                    [
                      ["easy", "Easy — recall"],
                      ["medium", "Medium — apply"],
                      ["hard", "Hard — board / HOTS"],
                      ["mixed", "Mixed"],
                    ] as [Difficulty, string][]
                  ).map(([value, label]) => (
                    <Chip
                      key={value}
                      active={difficulty === value}
                      onClick={() => {
                        setDifficulty(value);
                        setStep("references");
                      }}
                    >
                      {label}
                    </Chip>
                  ))}
                </div>
              ) : (
                <UserBubble className="capitalize">{difficulty}</UserBubble>
              )}
            </>
          ) : null}

          {reached("references") ? (
            <>
              <AgentBubble>Which references should I follow for the question style?</AgentBubble>
              {step === "references" ? (
                <div className="space-y-3 pl-11">
                  <div className="flex flex-wrap gap-2">
                    {REFERENCE_OPTIONS.map((r) => (
                      <Chip key={r} active={references.includes(r)} onClick={() => setReferences((prev) => toggle(prev, r))}>
                        {r}
                      </Chip>
                    ))}
                  </div>
                  {references.includes("My own notes") ? (
                    <textarea
                      value={ownNotes}
                      onChange={(e) => setOwnNotes(e.target.value)}
                      rows={4}
                      maxLength={4000}
                      placeholder="Paste your class notes here — Gemma will use them as the main reference."
                      className="w-full rounded-2xl border border-border bg-white px-4 py-2.5 text-sm outline-none focus:border-accent-light"
                    />
                  ) : null}
                  <Button variant="accent" size="sm" disabled={!references.length} onClick={() => setStep("count")}>
                    Continue
                  </Button>
                </div>
              ) : (
                <UserBubble>{references.join(", ")}</UserBubble>
              )}
            </>
          ) : null}

          {reached("count") ? (
            <>
              <AgentBubble>How many questions?</AgentBubble>
              {step === "count" ? (
                <div className="flex flex-wrap gap-2 pl-11">
                  {[5, 10, 15].map((n) => (
                    <Chip
                      key={n}
                      active={count === n}
                      onClick={() => {
                        setCount(n);
                        setStep("review");
                      }}
                    >
                      {n} questions
                    </Chip>
                  ))}
                </div>
              ) : (
                <UserBubble>{count} questions</UserBubble>
              )}
            </>
          ) : null}

          {step === "review" && chapter ? (
            <>
              <AgentBubble>
                Got it! I&apos;ll write <b>{count}</b> <b>{difficulty}</b> questions from <b>{chapter.name}</b> ({chapter.book}),
                following {references.join(", ").toLowerCase()}. Every answer comes with an explanation and the syllabus point it tests.
              </AgentBubble>
              <div className="pl-11">
                {loading ? (
                  <GemmaWaiting label={`Gemma is writing ${count} questions`} />
                ) : (
                  <Button variant="accent" onClick={generate}>
                    <Sparkles className="h-4 w-4" />
                    {error ? "Try again" : "Generate with Gemma"}
                  </Button>
                )}
              </div>
              {error ? (
                <div className="ml-11 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm">
                  <p className="font-semibold text-amber-900">Gemma couldn&apos;t answer: {error}</p>
                  <p className="mt-1 text-amber-800">You can retry, or practise this chapter&apos;s own question bank instead.</p>
                  <Button variant="outline" size="sm" className="mt-3" onClick={practiseBank}>
                    Practise the chapter bank
                  </Button>
                </div>
              ) : null}
            </>
          ) : null}
          <div ref={bottomRef} />
        </div>
      </div>

      <aside className="rounded-[24px] border border-border bg-white p-5">
        <p className="font-heading text-sm font-bold text-foreground-heading">Your Gemma sets</p>
        <p className="mt-1 text-xs text-muted">Saved on this device so you can replay them.</p>
        <div className="mt-4 space-y-2">
          {saved.length === 0 ? (
            <p className="text-xs text-muted">No sets yet — generate your first one.</p>
          ) : (
            saved.map((s) => (
              <div key={s.id} className="flex items-center gap-2 rounded-2xl border border-border p-3">
                <button
                  type="button"
                  className="min-w-0 flex-1 text-left"
                  onClick={() => onPlay(s.title, s.questions, s.chapterId)}
                >
                  <p className="truncate text-xs font-semibold text-foreground-heading">{s.title}</p>
                  <p className="text-[11px] text-muted">
                    {s.questions.length} questions · {new Date(s.createdAt).toLocaleDateString()}
                  </p>
                </button>
                <button type="button" aria-label="Delete set" onClick={() => removeSet(s.id)} className="text-muted hover:text-error">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </aside>
    </div>
  );
}

function AgentBubble({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent-hover">
        <Bot className="h-4 w-4" />
      </span>
      <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white px-4 py-2.5 text-sm text-foreground shadow-sm">{children}</div>
    </motion.div>
  );
}

function UserBubble({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="flex items-start justify-end gap-3">
      <div className={cn("max-w-[85%] rounded-2xl rounded-tr-sm bg-accent px-4 py-2.5 text-sm text-white", className)}>
        {children}
      </div>
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white">
        <User className="h-4 w-4" />
      </span>
    </div>
  );
}

export function Chip({ active, onClick, children }: { active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
        active ? "border-accent bg-accent text-white" : "border-border bg-white text-foreground hover:border-accent/40"
      )}
    >
      {children}
    </button>
  );
}
