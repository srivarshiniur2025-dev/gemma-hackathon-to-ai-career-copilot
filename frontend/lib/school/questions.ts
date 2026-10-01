import { MATHS_CARDS, MATHS_QUESTIONS } from "./bank-maths";
import { SCIENCE_CARDS, SCIENCE_QUESTIONS } from "./bank-science";
import {
  buildCards,
  buildQuestions,
  type Flashcard,
  type SchoolDifficulty,
  type SchoolQuestion,
} from "./bank-types";
import { chaptersFor, type SchoolClass, type SchoolSubject } from "./syllabus";

export type { Flashcard, SchoolDifficulty, SchoolQuestion } from "./bank-types";

const RAW_QUESTIONS = { ...SCIENCE_QUESTIONS, ...MATHS_QUESTIONS };
const RAW_CARDS = { ...SCIENCE_CARDS, ...MATHS_CARDS };

const questionCache = new Map<string, SchoolQuestion[]>();

/** Only the questions authored for this exact chapter — never padded from other chapters. */
export function questionsForChapter(chapterId: string, difficulty?: SchoolDifficulty): SchoolQuestion[] {
  let all = questionCache.get(chapterId);
  if (!all) {
    all = buildQuestions(chapterId, RAW_QUESTIONS[chapterId] ?? []);
    questionCache.set(chapterId, all);
  }
  return difficulty ? all.filter((q) => q.difficulty === difficulty) : all;
}

export function cardsForChapter(chapterId: string): Flashcard[] {
  return buildCards(chapterId, RAW_CARDS[chapterId] ?? []);
}

export function questionsForChapters(chapterIds: string[]): SchoolQuestion[] {
  return chapterIds.flatMap((id) => questionsForChapter(id));
}

export function shuffle<T>(items: T[], seed = Math.random()): T[] {
  const out = [...items];
  let s = Math.floor(seed * 2147483647) || 1;
  for (let i = out.length - 1; i > 0; i -= 1) {
    s = (s * 48271) % 2147483647;
    const j = s % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export type TrueFalseItem = {
  id: string;
  chapterId: string;
  prompt: string;
  claim: string;
  isTrue: boolean;
  correction: string;
};

/** True/false statements built from the chapter's own questions (correct answer vs a distractor). */
export function trueFalseForChapter(chapterId: string): TrueFalseItem[] {
  return questionsForChapter(chapterId).map((q, i) => {
    const correct = q.options[q.answerIndex];
    const useTrue = i % 2 === 0;
    const wrong = q.options.find((_, idx) => idx !== q.answerIndex) ?? correct;
    const shown = useTrue ? correct : wrong;
    return {
      id: `${q.id}-tf`,
      chapterId,
      prompt: q.question,
      claim: shown,
      isTrue: useTrue,
      correction: `Correct answer: ${correct}. ${q.explanation}`,
    };
  });
}

export function matchPairsForChapter(chapterId: string, count = 4): Flashcard[] {
  return shuffle(cardsForChapter(chapterId)).slice(0, count);
}

function daySeed(date = new Date()): number {
  const key = date.toISOString().slice(0, 10);
  let h = 0;
  for (let i = 0; i < key.length; i += 1) h = (h * 31 + key.charCodeAt(i)) % 100000;
  return (h + 1) / 100001;
}

/** Same 5 questions for everyone on a given day, drawn from the learner's class and subject. */
export function dailyChallenge(classLevel: SchoolClass, subject: SchoolSubject, count = 5): SchoolQuestion[] {
  const ids = chaptersFor(classLevel, subject)
    .filter((c) => !c.internalOnly)
    .map((c) => c.id);
  return shuffle(questionsForChapters(ids), daySeed()).slice(0, count);
}

export function todayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}
