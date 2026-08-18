import { SKILL_FACTS } from "@/lib/skills/facts";
import type { SkillDomainId, SkillKind, SkillMcq, SkillTestMeta } from "@/lib/skills/types";

export const SKILL_DOMAINS: { id: SkillDomainId; label: string }[] = [
  { id: "python", label: "Python" },
  { id: "javascript", label: "JavaScript" },
  { id: "dsa", label: "DSA" },
  { id: "sql", label: "SQL" },
  { id: "react", label: "React" },
  { id: "system-design", label: "System design" },
  { id: "git", label: "Git" },
  { id: "ml", label: "ML" },
];

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

function rng(seed: number) {
  let t = seed || 1;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: T[], seed: string): T[] {
  const copy = [...items];
  const next = rng(hashString(seed));
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function rotateOptions(
  correct: string,
  distractors: [string, string, string],
  seed: string
): { options: [string, string, string, string]; answerIndex: 0 | 1 | 2 | 3 } {
  const raw = shuffle([correct, ...distractors], seed);
  const options = raw as [string, string, string, string];
  const answerIndex = options.indexOf(correct) as 0 | 1 | 2 | 3;
  return { options, answerIndex };
}

function stemsFor(topic: string, variant: 0 | 1 | 2): string {
  if (variant === 0) return `Which statement is correct about ${topic}?`;
  if (variant === 1) return `In intern interviews, ${topic} is best described as:`;
  return `Pick the most accurate claim regarding ${topic}.`;
}

export function expandSkillBank(): SkillMcq[] {
  const out: SkillMcq[] = [];
  for (const fact of SKILL_FACTS) {
    for (let v = 0; v < 3; v++) {
      const { options, answerIndex } = rotateOptions(fact.correct, fact.distractors, `${fact.domain}-${v}-${fact.topic}`);
      out.push({
        id: `${fact.domain}-v${v}-${hashString(fact.topic).toString(16)}`,
        domain: fact.domain,
        question: stemsFor(fact.topic, v as 0 | 1 | 2),
        options,
        answerIndex,
        explanation: fact.why,
      });
    }
  }
  return out;
}

const BANK = expandSkillBank();

function pick(pool: SkillMcq[], count: number, seed: string): SkillMcq[] {
  const unique = new Map<string, SkillMcq>();
  for (const q of shuffle(pool, seed)) {
    const topic = q.id.replace(/-v\d+-/, "-");
    if (!unique.has(topic)) unique.set(topic, q);
    if (unique.size >= count) break;
  }
  return [...unique.values()].slice(0, count);
}

function byDomain(domain: SkillDomainId): SkillMcq[] {
  return BANK.filter((q) => q.domain === domain);
}

export function buildSkillCatalog(): SkillTestMeta[] {
  const tests: SkillTestMeta[] = [];
  for (const d of SKILL_DOMAINS) {
    tests.push({
      id: `skill-${d.id}-core`,
      title: `${d.label} core`,
      subtitle: "8 intern-screen questions with explanations",
      domain: d.id,
      kind: "chapter",
      durationMin: 12,
      questionCount: 8,
      difficulty: "easy",
    });
    tests.push({
      id: `skill-${d.id}-deep`,
      title: `${d.label} deep dive`,
      subtitle: "12 questions — traps interviewers actually use",
      domain: d.id,
      kind: "sectional",
      durationMin: 18,
      questionCount: 12,
      difficulty: "medium",
    });
  }

  tests.push(
    {
      id: "skill-interview-swe",
      title: "SWE intern screen",
      subtitle: "Mixed Python, DSA, Git, SQL — 20 questions",
      domain: "mixed",
      kind: "interview",
      durationMin: 25,
      questionCount: 20,
      difficulty: "mixed",
    },
    {
      id: "skill-interview-frontend",
      title: "Frontend intern screen",
      subtitle: "JavaScript + React + Git",
      domain: "mixed",
      kind: "interview",
      durationMin: 20,
      questionCount: 16,
      difficulty: "mixed",
    },
    {
      id: "skill-full-stack",
      title: "Full-stack checkpoint",
      subtitle: "All eight domains, 24 questions",
      domain: "mixed",
      kind: "full",
      durationMin: 35,
      questionCount: 24,
      difficulty: "mixed",
    },
    {
      id: "skill-rapid",
      title: "Rapid fire",
      subtitle: "10 mixed questions, 8 minutes",
      domain: "mixed",
      kind: "rapid",
      durationMin: 8,
      questionCount: 10,
      difficulty: "easy",
    }
  );
  return tests;
}

export const SKILL_CATALOG = buildSkillCatalog();
export const SKILL_CATALOG_COUNT = SKILL_CATALOG.length;

export function getSkillTest(id: string): SkillTestMeta | undefined {
  return SKILL_CATALOG.find((t) => t.id === id);
}

export function questionsForSkillTest(test: SkillTestMeta): SkillMcq[] {
  const seed = test.id;
  if (test.domain !== "mixed") {
    return pick(byDomain(test.domain), test.questionCount, seed);
  }
  if (test.id.includes("frontend")) {
    return pick([...byDomain("javascript"), ...byDomain("react"), ...byDomain("git")], test.questionCount, seed);
  }
  if (test.id.includes("swe")) {
    return pick(
      [...byDomain("python"), ...byDomain("dsa"), ...byDomain("git"), ...byDomain("sql")],
      test.questionCount,
      seed
    );
  }
  return pick(BANK, test.questionCount, seed);
}

export function skillTestsByKind(kind: SkillKind | "all"): SkillTestMeta[] {
  if (kind === "all") return SKILL_CATALOG;
  return SKILL_CATALOG.filter((t) => t.kind === kind);
}
