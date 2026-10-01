"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Bot, ChevronDown, ChevronUp, ListChecks, MessageCircle, Save, Send, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api, type SchoolNotes } from "@/lib/api";
import type { SchoolQuestion } from "@/lib/school/questions";
import { bumpCounter } from "@/lib/school/scoreboard";
import {
  EXCLUDED_TOPICS,
  SYLLABUS_BOOKS,
  chaptersFor,
  schoolChapterById,
  subjectLabel,
  type SchoolClass,
  type SchoolSubject,
} from "@/lib/school/syllabus";
import { cn } from "@/lib/utils";
import { NotesBody } from "./GemmaNotes";
import { loadSets, storeSets, toSchoolQuestions } from "./GemmaQuestionAgent";
import { GemmaWaiting } from "./GemmaWaiting";

type Mode = "questions" | "notes";

type ChatEntry = {
  id: string;
  role: "user" | "assistant";
  content: string;
  questions?: SchoolQuestion[];
  notes?: SchoolNotes;
  chapterId?: string | null;
  error?: boolean;
};

const SUGGESTIONS: Record<Mode, (subject: SchoolSubject) => string[]> = {
  questions: (s) =>
    s === "science"
      ? [
          "Give me 5 hard numericals on electricity",
          "Quiz me on the cell — 10 easy MCQs",
          "Make assertion–reason questions on acids and bases",
          "Which chapter should I practise first?",
        ]
      : [
          "10 medium questions on quadratic equations",
          "Board-style questions on trigonometry",
          "Give me tricky probability MCQs",
          "I keep getting AP questions wrong — help me practise",
        ],
  notes: (s) =>
    s === "science"
      ? [
          "Explain osmosis in simple words",
          "Make a one-page cheat sheet for light",
          "What is the difference between mitosis and meiosis?",
          "Give me memory tricks for the reactivity series",
        ]
      : [
          "Explain the discriminant like I'm new to it",
          "Make a formula sheet for surface areas and volumes",
          "Why does the section formula work?",
          "Revision notes for coordinate geometry",
        ],
};

const chatKey = (mode: Mode, email?: string) => `careerCopilotSchoolChat:${mode}:${(email || "guest").toLowerCase()}`;

function loadChat(mode: Mode, email?: string): ChatEntry[] {
  try {
    return JSON.parse(window.localStorage.getItem(chatKey(mode, email)) || "[]") as ChatEntry[];
  } catch {
    return [];
  }
}

type Props = {
  mode: Mode;
  classLevel: SchoolClass;
  subject: SchoolSubject;
  email?: string;
  focusChapterId?: string;
  preferences?: string[];
  onPlay: (title: string, questions: SchoolQuestion[], chapterId: string) => void;
};

export function GemmaChat({ mode, classLevel, subject, email, focusChapterId, preferences = [], onPlay }: Props) {
  const chapters = useMemo(() => chaptersFor(classLevel, subject), [classLevel, subject]);
  const [entries, setEntries] = useState<ChatEntry[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [openNotes, setOpenNotes] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEntries(loadChat(mode, email));
  }, [mode, email]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [entries, loading]);

  const persist = (next: ChatEntry[]) => {
    setEntries(next);
    window.localStorage.setItem(chatKey(mode, email), JSON.stringify(next.slice(-30)));
  };

  const send = async (text: string) => {
    const message = text.trim();
    if (!message || loading) return;
    const userEntry: ChatEntry = { id: `${Date.now()}-u`, role: "user", content: message };
    const withUser = [...entries, userEntry];
    persist(withUser);
    setInput("");
    setLoading(true);
    try {
      const res = await api.schoolChat({
        mode,
        class_level: classLevel,
        subject,
        book: SYLLABUS_BOOKS[`${classLevel}-${subject}`],
        chapters: chapters.map((c) => ({
          id: c.id,
          number: c.number,
          name: c.name,
          key_topics: c.keyTopics,
          excluded: EXCLUDED_TOPICS[c.id] ?? [],
          internal_only: Boolean(c.internalOnly),
        })),
        focus_chapter_id: focusChapterId,
        message,
        history: entries
          .filter((e) => !e.error)
          .slice(-10)
          .map((e) => ({
            role: e.role,
            content: e.notes ? `${e.content}\n[Shared notes: ${e.notes.title}]` : e.questions ? `${e.content}\n[Shared ${e.questions.length} questions]` : e.content,
          })),
        preferences,
      });
      const fallbackChapter = res.chapter_id || focusChapterId || chapters[0]?.id || "";
      const reply: ChatEntry = {
        id: `${Date.now()}-a`,
        role: "assistant",
        content: res.reply,
        chapterId: res.chapter_id,
        questions: res.action === "questions" && res.questions.length ? toSchoolQuestions(res.questions, fallbackChapter) : undefined,
        notes: res.action === "notes" && res.notes ? res.notes : undefined,
      };
      if (reply.questions) bumpCounter(email, "gemmaSets");
      if (reply.notes) {
        bumpCounter(email, "notesGenerated");
        setOpenNotes(reply.id);
      }
      persist([...withUser, reply]);
    } catch (e) {
      persist([
        ...withUser,
        {
          id: `${Date.now()}-e`,
          role: "assistant",
          content: e instanceof Error ? e.message : "Gemma is unavailable right now. Please try again.",
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const saveSet = (entry: ChatEntry) => {
    if (!entry.questions) return;
    const chapterName = schoolChapterById(entry.questions[0]?.chapterId ?? "")?.name ?? subjectLabel(subject);
    const sets = loadSets(email);
    storeSets(email, [
      {
        id: entry.id,
        title: `Gemma chat · ${chapterName}`,
        chapterId: entry.questions[0]?.chapterId ?? "",
        createdAt: new Date().toISOString(),
        questions: entry.questions,
      },
      ...sets.filter((s) => s.id !== entry.id),
    ]);
    setSavedIds((ids) => [...ids, entry.id]);
  };

  const accent = mode === "questions" ? "violet" : "emerald";

  return (
    <div
      className={cn(
        "flex flex-col rounded-[28px] border bg-white shadow-[var(--shadow-md)]",
        accent === "violet" ? "border-violet-200" : "border-emerald-200"
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-2xl text-white",
              accent === "violet" ? "bg-violet-600" : "bg-emerald-600"
            )}
          >
            <MessageCircle className="h-5 w-5" />
          </span>
          <div>
            <p className="font-heading text-base font-bold text-foreground-heading">Chat with Gemma</p>
            <p className="text-xs text-muted">
              {mode === "questions"
                ? "Ask for any number of questions, any chapter, any difficulty — in your own words."
                : "Ask doubts, get explanations or notes on any topic in your syllabus."}
            </p>
          </div>
        </div>
        {entries.length ? (
          <button
            type="button"
            onClick={() => persist([])}
            disabled={loading}
            className="inline-flex items-center gap-1 text-xs font-semibold text-muted hover:text-error"
          >
            <Trash2 className="h-3.5 w-3.5" /> Clear chat
          </button>
        ) : null}
      </div>

      <div ref={scrollRef} className="max-h-[560px] min-h-[280px] space-y-4 overflow-y-auto px-5 py-4">
        {entries.length === 0 ? (
          <div className="space-y-3">
            <Bubble role="assistant">
              Hi! I&apos;m Gemma. Ask me anything from your Class {classLevel} {subjectLabel(subject)} syllabus —
              {mode === "questions" ? " tell me what to quiz you on and I'll make the questions." : " a doubt, an explanation, or notes for revision."}
            </Bubble>
            <div className="flex flex-wrap gap-2 pl-11">
              {SUGGESTIONS[mode](subject).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium text-foreground hover:border-violet-300"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {entries.map((e) => (
          <div key={e.id} className="space-y-2">
            <Bubble role={e.role} error={e.error}>
              <span className="whitespace-pre-wrap">{e.content}</span>
            </Bubble>

            {e.questions?.length ? (
              <div className="ml-11 rounded-2xl border border-violet-200 bg-violet-50/60 p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-foreground-heading">
                  <ListChecks className="h-4 w-4 text-violet-600" /> {e.questions.length} questions ready
                  {e.chapterId ? <span className="font-normal text-muted">· {schoolChapterById(e.chapterId)?.name}</span> : null}
                </p>
                <ol className="mt-2 list-decimal space-y-1 pl-5 text-xs text-muted">
                  {e.questions.slice(0, 3).map((q) => (
                    <li key={q.id} className="line-clamp-1">
                      {q.question}
                    </li>
                  ))}
                  {e.questions.length > 3 ? <li className="list-none">…and {e.questions.length - 3} more</li> : null}
                </ol>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="accent"
                    onClick={() => onPlay(`Gemma chat quiz (${e.questions!.length} Qs)`, e.questions!, e.questions![0].chapterId)}
                  >
                    Start quiz
                  </Button>
                  <Button size="sm" variant="outline" disabled={savedIds.includes(e.id)} onClick={() => saveSet(e)}>
                    <Save className="h-4 w-4" /> {savedIds.includes(e.id) ? "Saved" : "Save set"}
                  </Button>
                </div>
              </div>
            ) : null}

            {e.notes ? (
              <div className="ml-11 rounded-2xl border border-emerald-200 bg-emerald-50/40">
                <button
                  type="button"
                  onClick={() => setOpenNotes((id) => (id === e.id ? null : e.id))}
                  className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-foreground-heading"
                >
                  {e.notes.title}
                  {openNotes === e.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {openNotes === e.id ? (
                  <div className="border-t border-emerald-100 bg-white px-4 py-4">
                    <NotesBody notes={e.notes} compact />
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        ))}

        {loading ? (
          <div className="pl-11">
            <GemmaWaiting label="Gemma is thinking" />
          </div>
        ) : null}
      </div>

      <form
        className="flex items-end gap-2 border-t border-border p-3"
        onSubmit={(ev) => {
          ev.preventDefault();
          void send(input);
        }}
      >
        <textarea
          value={input}
          onChange={(ev) => setInput(ev.target.value)}
          onKeyDown={(ev) => {
            if (ev.key === "Enter" && !ev.shiftKey) {
              ev.preventDefault();
              void send(input);
            }
          }}
          rows={1}
          maxLength={2000}
          placeholder={mode === "questions" ? "e.g. 8 hard questions on refraction, board style" : "e.g. explain Newton's third law with an example"}
          className="max-h-32 min-h-[44px] flex-1 resize-none rounded-2xl border border-border bg-background-secondary/50 px-4 py-2.5 text-sm outline-none focus:border-violet-400"
        />
        <Button type="submit" variant="accent" size="icon" disabled={loading || !input.trim()} aria-label="Send">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}

function Bubble({ role, error, children }: { role: "user" | "assistant"; error?: boolean; children: React.ReactNode }) {
  if (role === "user") {
    return (
      <div className="flex items-start justify-end gap-3">
        <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-violet-600 px-4 py-2.5 text-sm text-white">{children}</div>
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-700">
          <User className="h-4 w-4" />
        </span>
      </div>
    );
  }
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700">
        <Bot className="h-4 w-4" />
      </span>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm shadow-sm",
          error ? "border border-amber-200 bg-amber-50 text-amber-900" : "bg-background-secondary text-foreground"
        )}
      >
        {children}
      </div>
    </motion.div>
  );
}
