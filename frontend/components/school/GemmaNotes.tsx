"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpenCheck, Brain, Loader2, NotebookPen, Sparkles, ThumbsDown, ThumbsUp, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api, type SchoolNotes } from "@/lib/api";
import { bumpCounter } from "@/lib/school/scoreboard";
import {
  EXCLUDED_TOPICS,
  chaptersFor,
  schoolChapterById,
  type SchoolClass,
  type SchoolSubject,
} from "@/lib/school/syllabus";
import { Chip } from "./GemmaQuestionAgent";
import { GemmaWaiting } from "./GemmaWaiting";

type Style = "short" | "standard" | "detailed";

const FEEDBACK_CHIPS: [string, string][] = [
  ["More examples", "Add more solved / real-life examples"],
  ["Shorter", "Keep notes shorter and to the point"],
  ["Simpler words", "Use simpler words and shorter sentences"],
  ["More memory tricks", "Include more mnemonics and memory tricks"],
  ["More exam tips", "Add more board-exam tips and common mistakes"],
  ["Explain diagrams", "Describe the important diagrams in words"],
  ["Step-by-step maths", "Show every step in calculations"],
];

type SavedNote = { id: string; chapterId: string; createdAt: string; notes: SchoolNotes };

const prefsKey = (email?: string) => `careerCopilotSchoolNotePrefs:${(email || "guest").toLowerCase()}`;
const notesKey = (email?: string) => `careerCopilotSchoolNotes:${(email || "guest").toLowerCase()}`;

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function loadNotePrefs(email?: string): string[] {
  return read<string[]>(prefsKey(email), []);
}

type Props = { classLevel: SchoolClass; subject: SchoolSubject; email?: string };

export function GemmaNotes({ classLevel, subject, email }: Props) {
  const chapters = useMemo(() => chaptersFor(classLevel, subject), [classLevel, subject]);
  const [chapterId, setChapterId] = useState(chapters[0]?.id ?? "");
  const [topics, setTopics] = useState<string[]>([]);
  const [style, setStyle] = useState<Style>("standard");
  const [request, setRequest] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<SchoolNotes | null>(null);
  const [prefs, setPrefs] = useState<string[]>([]);
  const [saved, setSaved] = useState<SavedNote[]>([]);
  const [rated, setRated] = useState<"up" | "down" | null>(null);
  const chapter = schoolChapterById(chapterId);

  useEffect(() => {
    setPrefs(read<string[]>(prefsKey(email), []));
    setSaved(read<SavedNote[]>(notesKey(email), []));
  }, [email]);

  useEffect(() => {
    if (!chapters.some((c) => c.id === chapterId)) setChapterId(chapters[0]?.id ?? "");
  }, [chapters, chapterId]);

  useEffect(() => {
    setTopics(chapter ? [...chapter.keyTopics] : []);
  }, [chapter]);

  const savePrefs = (next: string[]) => {
    const unique = [...new Set(next)].slice(-10);
    setPrefs(unique);
    window.localStorage.setItem(prefsKey(email), JSON.stringify(unique));
  };

  const generate = async () => {
    if (!chapter) return;
    setLoading(true);
    setError(null);
    setRated(null);
    try {
      const res = await api.generateSchoolNotes({
        class_level: classLevel,
        subject,
        chapter_id: chapter.id,
        chapter_number: chapter.number,
        chapter_name: chapter.name,
        book: chapter.book,
        key_topics: chapter.keyTopics,
        topics: topics.length ? topics : chapter.keyTopics,
        excluded: EXCLUDED_TOPICS[chapter.id] ?? [],
        style,
        preferences: prefs,
        request: request.trim() || undefined,
      });
      setNotes(res);
      const entry: SavedNote = { id: `${Date.now()}`, chapterId: chapter.id, createdAt: new Date().toISOString(), notes: res };
      const next = [entry, ...saved].slice(0, 10);
      setSaved(next);
      window.localStorage.setItem(notesKey(email), JSON.stringify(next));
      bumpCounter(email, "notesGenerated");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gemma is unavailable right now.");
    } finally {
      setLoading(false);
    }
  };

  const removeSaved = (id: string) => {
    const next = saved.filter((s) => s.id !== id);
    setSaved(next);
    window.localStorage.setItem(notesKey(email), JSON.stringify(next));
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
      <div className="space-y-4">
        <div className="rounded-[24px] border border-accent/25 bg-white p-5">
          <div className="flex items-center gap-2">
            <NotebookPen className="h-5 w-5 text-accent" />
            <p className="font-heading text-base font-bold text-foreground-heading">Gemma Notes</p>
          </div>
          <p className="mt-1 text-xs text-muted">
            Notes are grounded in your NCERT chapter and follow a fixed teacher-style format. Rate them and Gemma remembers what you like.
          </p>

          <label className="mt-4 block text-xs font-semibold text-foreground-heading">Chapter</label>
          <select
            value={chapterId}
            onChange={(e) => setChapterId(e.target.value)}
            className="mt-1 w-full rounded-2xl border border-border bg-white px-3 py-2 text-sm"
          >
            {chapters.map((c) => (
              <option key={c.id} value={c.id}>
                Ch {c.number}. {c.name}
              </option>
            ))}
          </select>

          {chapter ? (
            <>
              <p className="mt-4 text-xs font-semibold text-foreground-heading">Topics</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {chapter.keyTopics.map((t) => (
                  <Chip
                    key={t}
                    active={topics.includes(t)}
                    onClick={() => setTopics((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))}
                  >
                    {t}
                  </Chip>
                ))}
              </div>
            </>
          ) : null}

          <p className="mt-4 text-xs font-semibold text-foreground-heading">Style</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {(
              [
                ["short", "1-page revision"],
                ["standard", "Full notes"],
                ["detailed", "Detailed + examples"],
              ] as [Style, string][]
            ).map(([v, label]) => (
              <Chip key={v} active={style === v} onClick={() => setStyle(v)}>
                {label}
              </Chip>
            ))}
          </div>

          <input
            value={request}
            onChange={(e) => setRequest(e.target.value)}
            placeholder="Anything specific? (optional)"
            className="mt-4 w-full rounded-2xl border border-border bg-white px-3 py-2 text-sm outline-none focus:border-accent-light"
          />

          <Button variant="accent" className="mt-4 w-full" onClick={generate} disabled={loading || !topics.length}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {loading ? "Writing notes…" : "Generate notes"}
          </Button>
          {error ? <p className="mt-2 text-xs text-error">{error}</p> : null}
        </div>

        <div className="rounded-[24px] border border-border bg-white p-5">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-accent" />
            <p className="text-sm font-bold text-foreground-heading">Gemma remembers</p>
          </div>
          {prefs.length === 0 ? (
            <p className="mt-2 text-xs text-muted">Rate a set of notes and your preferences will appear here.</p>
          ) : (
            <ul className="mt-2 space-y-1.5">
              {prefs.map((p) => (
                <li key={p} className="flex items-start gap-2 text-xs text-foreground">
                  <span className="flex-1">{p}</span>
                  <button type="button" aria-label="Forget" onClick={() => savePrefs(prefs.filter((x) => x !== p))} className="text-muted hover:text-error">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {saved.length ? (
          <div className="rounded-[24px] border border-border bg-white p-5">
            <p className="text-sm font-bold text-foreground-heading">Saved notes</p>
            <div className="mt-2 space-y-1.5">
              {saved.map((s) => (
                <div key={s.id} className="flex items-center gap-2">
                  <button type="button" className="min-w-0 flex-1 truncate text-left text-xs text-accent hover:underline" onClick={() => setNotes(s.notes)}>
                    {s.notes.title}
                  </button>
                  <button type="button" aria-label="Delete" onClick={() => removeSaved(s.id)} className="text-muted hover:text-error">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="rounded-[28px] border border-border bg-white p-6 shadow-[var(--shadow-md)]">
        {loading ? (
          <div className="flex h-full min-h-[320px] flex-col justify-center gap-4">
            <GemmaWaiting label={`Gemma is writing notes on ${chapter?.name ?? "your chapter"}`} />
            <div className="space-y-2">
              {[80, 95, 70, 88, 60].map((w, i) => (
                <div key={i} className="h-3 animate-pulse rounded-full bg-background-secondary" style={{ width: `${w}%` }} />
              ))}
            </div>
          </div>
        ) : !notes ? (
          <div className="flex h-full min-h-[320px] flex-col items-center justify-center text-center">
            <BookOpenCheck className="h-10 w-10 text-accent" />
            <p className="mt-3 font-heading text-lg font-bold text-foreground-heading">Pick a chapter and generate notes</p>
            <p className="mt-1 max-w-sm text-sm text-muted">
              You&apos;ll get a summary, key terms, formulas, examples, common mistakes, memory tricks, exam tips and a quick self-check.
            </p>
          </div>
        ) : (
          <article className="space-y-5">
            <NotesBody key={notes.title + notes.summary} notes={notes} />

            <footer className="rounded-2xl border border-dashed border-border p-4">
              <p className="text-sm font-semibold text-foreground-heading">How were these notes?</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  variant={rated === "up" ? "accent" : "outline"}
                  onClick={() => {
                    setRated("up");
                    savePrefs([...prefs, `Liked the ${style} format — keep this structure`]);
                  }}
                >
                  <ThumbsUp className="h-4 w-4" /> Helpful
                </Button>
                <Button size="sm" variant={rated === "down" ? "accent" : "outline"} onClick={() => setRated("down")}>
                  <ThumbsDown className="h-4 w-4" /> Needs work
                </Button>
              </div>
              {rated === "down" ? (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {FEEDBACK_CHIPS.map(([label, pref]) => (
                    <Chip key={label} active={prefs.includes(pref)} onClick={() => savePrefs([...prefs, pref])}>
                      {label}
                    </Chip>
                  ))}
                </div>
              ) : null}
              {rated ? <p className="mt-2 text-xs text-muted">Saved. Your next notes will follow this feedback.</p> : null}
              {notes.model ? <p className="mt-2 text-[11px] text-muted">Written by {notes.model}</p> : null}
            </footer>
          </article>
        )}
      </div>
    </div>
  );
}

export function NotesBody({ notes, compact = false }: { notes: SchoolNotes; compact?: boolean }) {
  const [revealed, setRevealed] = useState<number[]>([]);
  return (
    <div className="space-y-5">
      <header>
        <h2 className={compact ? "font-heading text-lg font-bold text-foreground-heading" : "font-heading text-2xl font-bold text-foreground-heading"}>
          {notes.title}
        </h2>
        {notes.summary ? <p className="mt-2 text-sm leading-relaxed text-foreground">{notes.summary}</p> : null}
      </header>

      {notes.sections.map((s) => (
        <section key={s.heading}>
          <h3 className="text-sm font-bold uppercase tracking-wide text-accent">{s.heading}</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground">
            {s.points.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </section>
      ))}

      {notes.key_terms.length ? (
        <section>
          <h3 className="text-sm font-bold uppercase tracking-wide text-accent">Key terms</h3>
          <dl className="mt-2 grid gap-2 sm:grid-cols-2">
            {notes.key_terms.map((k) => (
              <div key={k.term} className="rounded-2xl bg-background-secondary p-3">
                <dt className="text-sm font-semibold text-foreground-heading">{k.term}</dt>
                <dd className="text-xs text-muted">{k.meaning}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      <NoteList title="Formulas" items={notes.formulas} tone="bg-background-secondary text-foreground-heading" />
      <NoteList title="Examples" items={notes.examples} />
      <NoteList title="Common mistakes" items={notes.mistakes} tone="bg-error/5 text-foreground-heading" />
      <NoteList title="Memory tricks" items={notes.memory_tricks} tone="bg-warning/10 text-foreground-heading" />
      <NoteList title="Exam tips" items={notes.exam_tips} tone="bg-accent/5 text-foreground-heading" />

      {notes.quick_check.length ? (
        <section>
          <h3 className="text-sm font-bold uppercase tracking-wide text-accent">Quick self-check</h3>
          <div className="mt-2 space-y-2">
            {notes.quick_check.map((qc, i) => (
              <button
                key={qc.q}
                type="button"
                onClick={() => setRevealed((r) => (r.includes(i) ? r : [...r, i]))}
                className="w-full rounded-2xl border border-border p-3 text-left text-sm"
              >
                <p className="font-medium text-foreground-heading">{qc.q}</p>
                <p className="mt-1 text-xs text-muted">{revealed.includes(i) ? qc.a : "Tap to reveal the answer"}</p>
              </button>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function NoteList({ title, items, tone }: { title: string; items: string[]; tone?: string }) {
  if (!items.length) return null;
  return (
    <section>
      <h3 className="text-sm font-bold uppercase tracking-wide text-accent">{title}</h3>
      <ul className={`mt-2 space-y-1 rounded-2xl p-3 text-sm ${tone ?? "bg-background-secondary text-foreground"}`}>
        {items.map((it) => (
          <li key={it}>• {it}</li>
        ))}
      </ul>
    </section>
  );
}
