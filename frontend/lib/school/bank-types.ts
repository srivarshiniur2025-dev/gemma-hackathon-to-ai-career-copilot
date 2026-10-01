import { schoolChapterById } from "./syllabus";

export type SchoolDifficulty = "easy" | "medium" | "hard";

export type SchoolQuestion = {
  id: string;
  chapterId: string;
  difficulty: SchoolDifficulty;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
  reference: string;
  syllabusPoint?: string;
  source: "bank" | "gemma";
};

export type Flashcard = { chapterId: string; front: string; back: string };

function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export function chapterReference(chapterId: string): string {
  const ch = schoolChapterById(chapterId);
  if (!ch) return "NCERT textbook";
  return `${ch.book}, Ch ${ch.number}: ${ch.name}`;
}

export type RawQuestion = [
  difficulty: SchoolDifficulty,
  question: string,
  correct: string,
  distractors: [string, string, string],
  explanation: string,
];

export function buildQuestions(chapterId: string, raw: RawQuestion[]): SchoolQuestion[] {
  const reference = chapterReference(chapterId);
  return raw.map(([difficulty, question, correct, distractors, explanation], i) => {
    const slot = hash(`${chapterId}:${question}`) % 4;
    const options = [...distractors];
    options.splice(slot, 0, correct);
    return {
      id: `${chapterId}-q${i + 1}`,
      chapterId,
      difficulty,
      question,
      options,
      answerIndex: slot,
      explanation,
      reference,
      source: "bank",
    };
  });
}

export function buildCards(chapterId: string, raw: [string, string][]): Flashcard[] {
  return raw.map(([front, back]) => ({ chapterId, front, back }));
}
