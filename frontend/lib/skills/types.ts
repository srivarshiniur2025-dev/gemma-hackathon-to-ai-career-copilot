export type SkillDomainId =
  | "python"
  | "javascript"
  | "dsa"
  | "sql"
  | "react"
  | "system-design"
  | "git"
  | "ml";

export type SkillKind = "chapter" | "sectional" | "full" | "interview" | "rapid";

export type SkillFact = {
  domain: SkillDomainId;
  topic: string;
  correct: string;
  distractors: [string, string, string];
  why: string;
};

export type SkillMcq = {
  id: string;
  domain: SkillDomainId;
  question: string;
  options: [string, string, string, string];
  answerIndex: 0 | 1 | 2 | 3;
  explanation: string;
};

export type SkillTestMeta = {
  id: string;
  title: string;
  subtitle: string;
  domain: SkillDomainId | "mixed";
  kind: SkillKind;
  durationMin: number;
  questionCount: number;
  difficulty: "easy" | "medium" | "hard" | "mixed";
};
