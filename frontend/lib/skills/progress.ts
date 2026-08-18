import { api } from "@/lib/api";
import { getCurrentUser } from "@/lib/fake-auth";
import { recordDailyActivity, saveAssessmentResults } from "@/lib/career-store";
import { SKILL_DOMAINS } from "@/lib/skills/catalog";
import type { SkillTestMeta } from "@/lib/skills/types";

const PREFIX = "careerCopilotSkills:";

export type SkillAttempt = {
  testId: string;
  score: number;
  total: number;
  percent: number;
  at: string;
  kind: SkillTestMeta["kind"];
  domain: SkillTestMeta["domain"];
};

export type SkillProgressState = {
  attempts: SkillAttempt[];
  bestByTest: Record<string, number>;
};

function key(email?: string | null): string {
  const user = email ?? getCurrentUser()?.email ?? "guest";
  return `${PREFIX}${user.toLowerCase()}`;
}

export function loadSkillProgress(email?: string | null): SkillProgressState {
  if (typeof window === "undefined") return { attempts: [], bestByTest: {} };
  const raw = localStorage.getItem(key(email));
  if (!raw) return { attempts: [], bestByTest: {} };
  try {
    return { attempts: [], bestByTest: {}, ...JSON.parse(raw) } as SkillProgressState;
  } catch {
    return { attempts: [], bestByTest: {} };
  }
}

export function saveSkillAttempt(
  test: SkillTestMeta,
  score: number,
  total: number,
  email?: string | null
): SkillProgressState {
  const prev = loadSkillProgress(email);
  const percent = total ? Math.round((score / total) * 100) : 0;
  const attempt: SkillAttempt = {
    testId: test.id,
    score,
    total,
    percent,
    at: new Date().toISOString(),
    kind: test.kind,
    domain: test.domain,
  };
  const bestByTest = {
    ...prev.bestByTest,
    [test.id]: Math.max(prev.bestByTest[test.id] ?? 0, percent),
  };
  const next: SkillProgressState = {
    attempts: [attempt, ...prev.attempts].slice(0, 200),
    bestByTest,
  };
  if (typeof window !== "undefined") localStorage.setItem(key(email), JSON.stringify(next));
  recordDailyActivity(email ?? undefined);

  const byDomain: Record<string, number[]> = {};
  for (const a of next.attempts) {
    const d = a.domain === "mixed" ? "Overall" : a.domain;
    byDomain[d] = byDomain[d] ?? [];
    byDomain[d].push(a.percent);
  }
  const skillsEstimate: Record<string, number> = {};
  for (const [name, vals] of Object.entries(byDomain)) {
    skillsEstimate[name] = Math.round(vals.reduce((s, n) => s + n, 0) / vals.length);
  }
  const weak = Object.entries(skillsEstimate)
    .filter(([, v]) => v < 60)
    .map(([k]) => k);
  const strong = Object.entries(skillsEstimate)
    .filter(([, v]) => v >= 70)
    .map(([k]) => k);
  saveAssessmentResults({
    skillsEstimate,
    summary: `Latest ${test.title}: ${percent}% (${score}/${total}).`,
    strengths: strong.length ? strong : [`${test.title} attempt logged`],
    weaknesses: weak.length ? weak : ["Keep a daily 20-minute drill"],
  });
  return next;
}

export function skillStats(state: SkillProgressState) {
  const completed = Object.keys(state.bestByTest).length;
  const avg = state.attempts.length
    ? Math.round(state.attempts.reduce((s, a) => s + a.percent, 0) / state.attempts.length)
    : 0;
  return { completed, avg, recent: state.attempts.slice(0, 8) };
}

function domainLabel(domain: string): string {
  if (domain === "Overall" || domain === "mixed") return "Overall";
  return SKILL_DOMAINS.find((d) => d.id === domain)?.label ?? domain.replace(/-/g, " ");
}

export function buildSkillAssessmentFromProgress(email?: string | null) {
  const state = loadSkillProgress(email);
  const byDomain: Record<string, number[]> = {};
  for (const attempt of state.attempts) {
    const domain = attempt.domain === "mixed" ? "Overall" : attempt.domain;
    byDomain[domain] = byDomain[domain] ?? [];
    byDomain[domain].push(attempt.percent);
  }

  const skillsEstimate: Record<string, number> = {};
  for (const [name, vals] of Object.entries(byDomain)) {
    skillsEstimate[name] = Math.round(vals.reduce((s, n) => s + n, 0) / vals.length);
  }

  const strengths = Object.entries(skillsEstimate)
    .filter(([, v]) => v >= 70)
    .sort((a, b) => b[1] - a[1])
    .map(([k]) => domainLabel(k));

  const weaknesses = Object.entries(skillsEstimate)
    .filter(([, v]) => v < 60)
    .sort((a, b) => a[1] - b[1])
    .map(([k]) => domainLabel(k));

  const top = Object.entries(skillsEstimate).sort((a, b) => b[1] - a[1])[0];
  const summary =
    state.attempts.length && top
      ? `Skill builder: ${domainLabel(top[0])} ${top[1]}% avg across ${Object.keys(state.bestByTest).length} completed tests.`
      : "Complete skill builder tests to unlock Gemma internship matching.";

  return {
    skillsEstimate,
    strengths,
    weaknesses,
    summary,
    testsCompleted: Object.keys(state.bestByTest).length,
  };
}

export async function syncSkillAssessmentToBackend(email?: string | null) {
  const payload = buildSkillAssessmentFromProgress(email);
  if (!Object.keys(payload.skillsEstimate).length) {
    return { ...payload, synced: false };
  }

  await api.updateMe({
    assessment: {
      questions_asked: payload.testsCompleted,
      history: [],
      skills_estimate: payload.skillsEstimate as unknown as Record<string, string>,
      summary: payload.summary,
      strengths: payload.strengths,
      weaknesses: payload.weaknesses,
    },
  });

  return { ...payload, synced: true };
}
