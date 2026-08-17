import { getCurrentUser } from "@/lib/fake-auth";
import { recordDailyActivity } from "@/lib/career-store";
import type { MockTestMeta } from "@/lib/neet/types";

const PREFIX = "careerCopilotMocks:";

export type MockAttempt = {
  testId: string;
  score: number;
  total: number;
  percent: number;
  at: string;
  kind: MockTestMeta["kind"];
  subject: MockTestMeta["subject"];
};

export type MockProgressState = {
  attempts: MockAttempt[];
  bestByTest: Record<string, number>;
};

function key(email?: string | null): string {
  const user = email ?? getCurrentUser()?.email ?? "guest";
  return `${PREFIX}${user.toLowerCase()}`;
}

export function loadMockProgress(email?: string | null): MockProgressState {
  if (typeof window === "undefined") return { attempts: [], bestByTest: {} };
  const raw = localStorage.getItem(key(email));
  if (!raw) return { attempts: [], bestByTest: {} };
  try {
    return { attempts: [], bestByTest: {}, ...JSON.parse(raw) } as MockProgressState;
  } catch {
    return { attempts: [], bestByTest: {} };
  }
}

export function saveMockAttempt(test: MockTestMeta, score: number, total: number, email?: string | null): MockProgressState {
  const prev = loadMockProgress(email);
  const percent = total ? Math.round((score / total) * 100) : 0;
  const attempt: MockAttempt = {
    testId: test.id,
    score,
    total,
    percent,
    at: new Date().toISOString(),
    kind: test.kind,
    subject: test.subject,
  };
  const bestByTest = {
    ...prev.bestByTest,
    [test.id]: Math.max(prev.bestByTest[test.id] ?? 0, percent),
  };
  const next: MockProgressState = {
    attempts: [attempt, ...prev.attempts].slice(0, 200),
    bestByTest,
  };
  if (typeof window !== "undefined") localStorage.setItem(key(email), JSON.stringify(next));
  recordDailyActivity(email ?? undefined);
  return next;
}

export function mockStats(state: MockProgressState) {
  const completed = Object.keys(state.bestByTest).length;
  const pyq = state.attempts.filter((a) => a.kind === "pyq");
  const pyqAccuracy = pyq.length
    ? Math.round(pyq.reduce((s, a) => s + a.percent, 0) / pyq.length)
    : 0;
  const recent = state.attempts.slice(0, 8);
  const avg = state.attempts.length
    ? Math.round(state.attempts.reduce((s, a) => s + a.percent, 0) / state.attempts.length)
    : 0;
  const bySubject: Record<string, number> = {};
  for (const a of state.attempts) {
    bySubject[a.subject] = (bySubject[a.subject] ?? 0) + 1;
  }
  return { completed, pyqAccuracy, avg, recent, bySubject };
}
