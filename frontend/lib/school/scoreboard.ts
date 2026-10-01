import { recordDailyActivity } from "@/lib/career-store";

export type ActivityKind = "chapter_test" | "quiz_blitz" | "true_false" | "match_pairs" | "flashcards" | "daily" | "gemma_quiz";

export type ScoreEntry = {
  id: string;
  kind: ActivityKind;
  title: string;
  chapterId?: string;
  points: number;
  correct: number;
  total: number;
  at: string;
};

export type SchoolScoreboard = {
  totalPoints: number;
  history: ScoreEntry[];
  bestByKind: Partial<Record<ActivityKind, number>>;
  chapterMastery: Record<string, number>;
  dailyDone: Record<string, number>;
  badges: string[];
  flashcardsReviewed: number;
  notesGenerated: number;
  gemmaSets: number;
  activeDays: string[];
};

export const ACTIVITY_LABELS: Record<ActivityKind, string> = {
  chapter_test: "Chapter test",
  quiz_blitz: "Quiz Blitz",
  true_false: "True / False Sprint",
  match_pairs: "Match Pairs",
  flashcards: "Flashcards",
  daily: "Daily Challenge",
  gemma_quiz: "Gemma quiz",
};

export const LEVELS = [
  "Curious Starter",
  "Lab Explorer",
  "Concept Builder",
  "Problem Solver",
  "Science Star",
  "Board Ready",
  "Topper Track",
];
export const POINTS_PER_LEVEL = 250;

export const BADGES: Record<string, { label: string; hint: string }> = {
  first_quiz: { label: "First Quiz", hint: "Finish any quiz" },
  perfect: { label: "Perfect Score", hint: "Get every answer right in a quiz" },
  streak5: { label: "5-Day Streak", hint: "Practise on 5 different days" },
  flashcard_fan: { label: "Flashcard Fan", hint: "Review 30 flashcards" },
  matchmaker: { label: "Matchmaker", hint: "Clear a Match Pairs round" },
  gemma_explorer: { label: "Gemma Explorer", hint: "Generate a question set with Gemma" },
  note_taker: { label: "Note Taker", hint: "Generate 3 sets of Gemma notes" },
  daily_hero: { label: "Daily Hero", hint: "Complete a Daily Challenge" },
  century: { label: "Century", hint: "Earn 100 points" },
  master: { label: "Chapter Master", hint: "Score 80%+ in a chapter test" },
};

const EMPTY: SchoolScoreboard = {
  totalPoints: 0,
  history: [],
  bestByKind: {},
  chapterMastery: {},
  dailyDone: {},
  badges: [],
  flashcardsReviewed: 0,
  notesGenerated: 0,
  gemmaSets: 0,
  activeDays: [],
};

export function emptyScoreboard(): SchoolScoreboard {
  return { ...EMPTY, history: [], bestByKind: {}, chapterMastery: {}, dailyDone: {}, badges: [], activeDays: [] };
}

function key(email?: string) {
  return `careerCopilotSchoolScore:${(email || "guest").toLowerCase()}`;
}

export function loadScoreboard(email?: string): SchoolScoreboard {
  if (typeof window === "undefined") return { ...EMPTY };
  try {
    const raw = window.localStorage.getItem(key(email));
    if (!raw) return { ...EMPTY };
    return { ...EMPTY, ...(JSON.parse(raw) as Partial<SchoolScoreboard>) };
  } catch {
    return { ...EMPTY };
  }
}

function save(email: string | undefined, board: SchoolScoreboard) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key(email), JSON.stringify(board));
  window.dispatchEvent(new Event("school-score-updated"));
}

function awardBadges(board: SchoolScoreboard, latest?: ScoreEntry): string[] {
  const earned = new Set(board.badges);
  const fresh: string[] = [];
  const give = (id: string) => {
    if (!earned.has(id)) {
      earned.add(id);
      fresh.push(id);
    }
  };
  const quizKinds: ActivityKind[] = ["chapter_test", "quiz_blitz", "true_false", "daily", "gemma_quiz"];
  if (board.history.some((h) => quizKinds.includes(h.kind))) give("first_quiz");
  if (latest && quizKinds.includes(latest.kind) && latest.total > 0 && latest.correct === latest.total) give("perfect");
  if (board.activeDays.length >= 5) give("streak5");
  if (board.flashcardsReviewed >= 30) give("flashcard_fan");
  if (board.history.some((h) => h.kind === "match_pairs")) give("matchmaker");
  if (board.gemmaSets >= 1) give("gemma_explorer");
  if (board.notesGenerated >= 3) give("note_taker");
  if (Object.keys(board.dailyDone).length >= 1) give("daily_hero");
  if (board.totalPoints >= 100) give("century");
  if (Object.values(board.chapterMastery).some((p) => p >= 80)) give("master");
  board.badges = [...earned];
  return fresh;
}

function touchDay(board: SchoolScoreboard, email?: string) {
  const today = new Date().toISOString().slice(0, 10);
  if (!board.activeDays.includes(today)) board.activeDays = [...board.activeDays, today].slice(-60);
  recordDailyActivity(email);
}

/** Points: 10 per correct answer, +5 per streak step beyond 2, +bonus passed in (speed, perfect). */
export function pointsFor(correct: number, total: number, bestStreak = 0, bonus = 0): number {
  const perfect = total > 0 && correct === total ? 20 : 0;
  return correct * 10 + Math.max(0, bestStreak - 2) * 5 + perfect + bonus;
}

export function recordActivity(
  email: string | undefined,
  entry: Omit<ScoreEntry, "id" | "at">
): { board: SchoolScoreboard; newBadges: string[] } {
  const board = loadScoreboard(email);
  const full: ScoreEntry = { ...entry, id: `${Date.now()}`, at: new Date().toISOString() };
  board.history = [full, ...board.history].slice(0, 100);
  board.totalPoints += full.points;
  board.bestByKind[full.kind] = Math.max(board.bestByKind[full.kind] ?? 0, full.points);
  if (full.kind === "chapter_test" && full.chapterId && full.total > 0) {
    const pct = Math.round((full.correct / full.total) * 100);
    board.chapterMastery[full.chapterId] = Math.max(board.chapterMastery[full.chapterId] ?? 0, pct);
  }
  if (full.kind === "daily") board.dailyDone[new Date().toISOString().slice(0, 10)] = full.points;
  touchDay(board, email);
  const newBadges = awardBadges(board, full);
  save(email, board);
  return { board, newBadges };
}

export function bumpCounter(
  email: string | undefined,
  counter: "flashcardsReviewed" | "notesGenerated" | "gemmaSets",
  by = 1
): { board: SchoolScoreboard; newBadges: string[] } {
  const board = loadScoreboard(email);
  board[counter] += by;
  if (counter === "flashcardsReviewed") board.totalPoints += by * 2;
  touchDay(board, email);
  const newBadges = awardBadges(board);
  save(email, board);
  return { board, newBadges };
}

export function levelFor(points: number) {
  const index = Math.min(LEVELS.length - 1, Math.floor(points / POINTS_PER_LEVEL));
  const intoLevel = points - index * POINTS_PER_LEVEL;
  const isMax = index === LEVELS.length - 1;
  return {
    index,
    name: LEVELS[index],
    progress: isMax ? 100 : Math.round((intoLevel / POINTS_PER_LEVEL) * 100),
    nextAt: isMax ? null : (index + 1) * POINTS_PER_LEVEL,
  };
}
