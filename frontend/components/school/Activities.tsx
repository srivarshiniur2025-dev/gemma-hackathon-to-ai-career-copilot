"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Check, Flame, RotateCcw, Shuffle, Timer, Trophy, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  cardsForChapter,
  matchPairsForChapter,
  shuffle,
  trueFalseForChapter,
  type Flashcard,
  type TrueFalseItem,
} from "@/lib/school/questions";
import { bumpCounter, pointsFor, recordActivity } from "@/lib/school/scoreboard";
import { chaptersFor, schoolChapterById, type SchoolClass, type SchoolSubject } from "@/lib/school/syllabus";
import { cn } from "@/lib/utils";

type Base = { classLevel: SchoolClass; subject: SchoolSubject; email?: string; onExit: () => void };

export function ChapterSelect({
  classLevel,
  subject,
  value,
  onChange,
  allowAll = true,
}: {
  classLevel: SchoolClass;
  subject: SchoolSubject;
  value: string;
  onChange: (id: string) => void;
  allowAll?: boolean;
}) {
  const chapters = chaptersFor(classLevel, subject);
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-2xl border border-border bg-white px-3 py-2 text-sm"
    >
      {allowAll ? <option value="all">All chapters</option> : null}
      {chapters.map((c) => (
        <option key={c.id} value={c.id}>
          Ch {c.number}. {c.name}
        </option>
      ))}
    </select>
  );
}

function chapterIdsFor(classLevel: SchoolClass, subject: SchoolSubject, pick: string): string[] {
  if (pick !== "all") return [pick];
  return chaptersFor(classLevel, subject)
    .filter((c) => !c.internalOnly)
    .map((c) => c.id);
}

function Header({ title, onExit, right }: { title: string; onExit: () => void; right?: React.ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <button type="button" onClick={onExit} className="inline-flex items-center gap-1 text-sm text-muted hover:text-accent">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <h2 className="font-heading text-xl font-bold text-foreground-heading">{title}</h2>
      </div>
      {right}
    </div>
  );
}

export function FlashcardsActivity({ classLevel, subject, email, onExit, initialChapter = "all" }: Base & { initialChapter?: string }) {
  const [pick, setPick] = useState(initialChapter);
  const [round, setRound] = useState(0);
  const [deck, setDeck] = useState<Flashcard[]>([]);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(0);
  const [reviewed, setReviewed] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    setDeck(shuffle(chapterIdsFor(classLevel, subject, pick).flatMap((id) => cardsForChapter(id))).slice(0, 20));
    setFlipped(false);
    setKnown(0);
    setReviewed(0);
    setFinished(false);
  }, [classLevel, subject, pick, round]);

  const card = deck[0];

  const answer = (gotIt: boolean) => {
    if (!card) return;
    setReviewed((n) => n + 1);
    setFlipped(false);
    if (gotIt) {
      setKnown((n) => n + 1);
      const rest = deck.slice(1);
      setDeck(rest);
      if (!rest.length) {
        setFinished(true);
        bumpCounter(email, "flashcardsReviewed", reviewed + 1);
      }
    } else {
      setDeck([...deck.slice(1), card]);
    }
  };

  return (
    <div>
      <Header
        title="Flashcards"
        onExit={onExit}
        right={<ChapterSelect classLevel={classLevel} subject={subject} value={pick} onChange={setPick} />}
      />
      {finished ? (
        <div className="rounded-[28px] border border-border bg-white p-8 text-center">
          <p className="font-heading text-2xl font-bold">Deck cleared!</p>
          <p className="mt-2 text-sm text-muted">
            {known} cards learnt in {reviewed} flips · +{reviewed * 2} points
          </p>
          <Button variant="accent" className="mt-5" onClick={() => setRound((r) => r + 1)}>
            <RotateCcw className="h-4 w-4" /> New deck
          </Button>
        </div>
      ) : card ? (
        <div className="mx-auto max-w-xl">
          <p className="mb-3 text-center text-xs text-muted">
            {deck.length} cards left · {schoolChapterById(card.chapterId)?.name}
          </p>
          <button
            type="button"
            onClick={() => setFlipped((f) => !f)}
            className="relative block h-64 w-full [perspective:1000px]"
            aria-label="Flip card"
          >
            <motion.div
              animate={{ rotateY: flipped ? 180 : 0 }}
              transition={{ duration: 0.45 }}
              className="relative h-full w-full [transform-style:preserve-3d]"
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center rounded-[28px] bg-primary p-6 text-white shadow-lg [backface-visibility:hidden]">
                <p className="text-xs uppercase tracking-widest opacity-80">Term</p>
                <p className="mt-2 text-center font-heading text-2xl font-bold text-white">{card.front}</p>
                <p className="mt-4 text-xs opacity-80">Tap to flip</p>
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center rounded-[28px] bg-white p-6 text-foreground-heading shadow-lg ring-2 ring-accent/25 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                <p className="text-xs uppercase tracking-widest text-accent">Meaning</p>
                <p className="mt-2 text-center text-lg font-semibold">{card.back}</p>
              </div>
            </motion.div>
          </button>
          <div className="mt-5 flex justify-center gap-3">
            <Button variant="outline" onClick={() => answer(false)}>
              <RotateCcw className="h-4 w-4" /> Again
            </Button>
            <Button variant="accent" onClick={() => answer(true)}>
              <Check className="h-4 w-4" /> Got it
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted">No cards for this chapter yet.</p>
      )}
    </div>
  );
}

const SPRINT_SECONDS = 60;

export function TrueFalseSprint({ classLevel, subject, email, onExit }: Base) {
  const [pick, setPick] = useState("all");
  const [items, setItems] = useState<TrueFalseItem[]>([]);
  const [i, setI] = useState(0);
  const [left, setLeft] = useState(SPRINT_SECONDS);
  const [running, setRunning] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [flash, setFlash] = useState<{ ok: boolean; text: string } | null>(null);
  const [result, setResult] = useState<number | null>(null);
  const savedRef = useRef(false);

  const start = () => {
    setItems(shuffle(chapterIdsFor(classLevel, subject, pick).flatMap((id) => trueFalseForChapter(id))));
    setI(0);
    setLeft(SPRINT_SECONDS);
    setCorrect(0);
    setAnswered(0);
    setStreak(0);
    setBest(0);
    setFlash(null);
    setResult(null);
    savedRef.current = false;
    setRunning(true);
  };

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setLeft((s) => (s <= 1 ? 0 : s - 1)), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  const finished = running && (left === 0 || (items.length > 0 && i >= items.length));

  useEffect(() => {
    if (!finished || savedRef.current) return;
    savedRef.current = true;
    setRunning(false);
    const points = pointsFor(correct, answered, best);
    recordActivity(email, { kind: "true_false", title: "True / False Sprint", points, correct, total: answered });
    setResult(points);
  }, [finished, correct, answered, best, email]);

  const reply = (saysTrue: boolean) => {
    const item = items[i];
    if (!item || !running) return;
    const ok = saysTrue === item.isTrue;
    setAnswered((n) => n + 1);
    if (ok) {
      setCorrect((n) => n + 1);
      const s = streak + 1;
      setStreak(s);
      setBest((b) => Math.max(b, s));
      setFlash({ ok: true, text: "Correct! +10" });
    } else {
      setStreak(0);
      setFlash({ ok: false, text: item.correction });
    }
    setI((n) => n + 1);
  };

  const item = items[i];

  return (
    <div>
      <Header
        title="True / False Sprint"
        onExit={onExit}
        right={
          running ? (
            <div className="flex gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-white px-3 py-1.5 text-sm font-semibold text-warning">
                <Flame className="h-4 w-4" /> {streak}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-white px-3 py-1.5 text-sm font-semibold">
                <Timer className={cn("h-4 w-4", left <= 10 ? "text-error" : "text-accent")} /> {left}s
              </span>
            </div>
          ) : (
            <ChapterSelect classLevel={classLevel} subject={subject} value={pick} onChange={setPick} />
          )
        }
      />
      {!running ? (
        <div className="rounded-[28px] border border-border bg-white p-8 text-center">
          {result != null ? (
            <>
              <p className="font-heading text-2xl font-bold">Time!</p>
              <p className="mt-2 text-sm text-muted">
                {correct} / {answered} correct · best streak {best}
              </p>
              <p className="mt-3 inline-flex items-center gap-1 text-3xl font-extrabold text-accent">
                <Trophy className="h-6 w-6" /> +{result}
              </p>
            </>
          ) : (
            <>
              <p className="font-heading text-2xl font-bold">60 seconds. How many can you get right?</p>
              <p className="mt-2 text-sm text-muted">Each card shows a question and a claimed answer. Is the claim true or false?</p>
            </>
          )}
          <div className="mt-5">
            <Button variant="accent" onClick={start}>
              {result != null ? "Play again" : "Start sprint"}
            </Button>
          </div>
        </div>
      ) : item ? (
        <div className="mx-auto max-w-xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="rounded-[28px] border border-border bg-white p-6 shadow-[var(--shadow-md)]"
            >
              <p className="text-sm text-muted">{item.prompt}</p>
              <p className="mt-3 font-heading text-xl font-bold text-foreground-heading">Claim: {item.claim}</p>
            </motion.div>
          </AnimatePresence>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Button className="h-14 bg-success text-white hover:bg-success/90" onClick={() => reply(true)}>
              <Check className="h-5 w-5" /> True
            </Button>
            <Button variant="destructive" className="h-14" onClick={() => reply(false)}>
              <X className="h-5 w-5" /> False
            </Button>
          </div>
          {flash ? (
            <p className={cn("mt-4 rounded-2xl p-3 text-xs", flash.ok ? "bg-success/10 text-success" : "bg-error/10 text-error")}>{flash.text}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function MatchPairs({ classLevel, subject, email, onExit }: Base) {
  const chapters = useMemo(() => chaptersFor(classLevel, subject), [classLevel, subject]);
  const [pick, setPick] = useState(chapters[0]?.id ?? "");
  const [round, setRound] = useState(0);
  const [pairs, setPairs] = useState<Flashcard[]>([]);
  const [meanings, setMeanings] = useState<Flashcard[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [wrong, setWrong] = useState<string | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [startedAt, setStartedAt] = useState(0);
  const [result, setResult] = useState<{ points: number; seconds: number } | null>(null);

  useEffect(() => {
    if (!chapters.some((c) => c.id === pick)) setPick(chapters[0]?.id ?? "");
  }, [chapters, pick]);

  useEffect(() => {
    const p = matchPairsForChapter(pick, 5);
    setPairs(p);
    setMeanings(shuffle(p));
    setSelected(null);
    setMatched([]);
    setMistakes(0);
    setResult(null);
    setStartedAt(Date.now());
  }, [pick, round]);

  const chooseMeaning = (front: string) => {
    if (!selected || matched.includes(front)) return;
    if (selected === front) {
      const next = [...matched, front];
      setMatched(next);
      setSelected(null);
      if (next.length === pairs.length) {
        const seconds = Math.round((Date.now() - startedAt) / 1000);
        const points = Math.max(10, pairs.length * 10 - mistakes * 3 + Math.max(0, 30 - seconds));
        recordActivity(email, {
          kind: "match_pairs",
          title: `Match Pairs · ${schoolChapterById(pick)?.name ?? ""}`,
          chapterId: pick,
          points,
          correct: pairs.length,
          total: pairs.length + mistakes,
        });
        setResult({ points, seconds });
      }
    } else {
      setMistakes((m) => m + 1);
      setWrong(front);
      window.setTimeout(() => setWrong(null), 500);
    }
  };

  return (
    <div>
      <Header
        title="Match Pairs"
        onExit={onExit}
        right={<ChapterSelect classLevel={classLevel} subject={subject} value={pick} onChange={setPick} allowAll={false} />}
      />
      {result ? (
        <div className="rounded-[28px] border border-border bg-white p-8 text-center">
          <p className="font-heading text-2xl font-bold">All matched in {result.seconds}s!</p>
          <p className="mt-2 text-sm text-muted">{mistakes} wrong tries</p>
          <p className="mt-3 inline-flex items-center gap-1 text-3xl font-extrabold text-accent">
            <Trophy className="h-6 w-6" /> +{result.points}
          </p>
          <div className="mt-5">
            <Button variant="accent" onClick={() => setRound((r) => r + 1)}>
              <Shuffle className="h-4 w-4" /> New round
            </Button>
          </div>
        </div>
      ) : (
        <>
          <p className="mb-4 text-sm text-muted">Tap a term, then tap its meaning. Fewer mistakes and faster finishes earn more points.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              {pairs.map((p) => (
                <button
                  key={p.front}
                  type="button"
                  disabled={matched.includes(p.front)}
                  onClick={() => setSelected(p.front)}
                  className={cn(
                    "w-full rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition-colors",
                    matched.includes(p.front) && "border-success bg-success/10 text-success",
                    selected === p.front && "border-accent bg-accent/5",
                    !matched.includes(p.front) && selected !== p.front && "border-border bg-white hover:border-accent/40"
                  )}
                >
                  {p.front}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              {meanings.map((m) => (
                <motion.button
                  key={m.front}
                  type="button"
                  disabled={matched.includes(m.front)}
                  onClick={() => chooseMeaning(m.front)}
                  animate={wrong === m.front ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
                  className={cn(
                    "w-full rounded-2xl border px-4 py-3 text-left text-sm transition-colors",
                    matched.includes(m.front) ? "border-success bg-success/10 text-success" : "border-border bg-white hover:border-accent/40",
                    wrong === m.front && "border-error bg-error/10"
                  )}
                >
                  {m.back}
                </motion.button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
