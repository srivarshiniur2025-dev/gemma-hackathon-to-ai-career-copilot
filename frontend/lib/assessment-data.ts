import type {
  AssessmentInsights,
  AssessmentQuestion,
  AssessmentResults,
  EvaluationResult,
  SkillDomain,
} from "./assessment-types";

export const ASSESSMENT_SKILLS = [
  "Python",
  "Java",
  "JavaScript",
  "SQL",
  "AI/ML",
  "Communication",
] as const;

export const LIVE_API_TOTAL_QUESTIONS = 6;
export const MOCK_TOTAL_QUESTIONS = 15;

const CODING_KEYWORDS = /\b(write|implement|code|function|algorithm|program|debug|syntax)\b/i;

export function detectQuestionType(question: string): "coding" | "theory" {
  return CODING_KEYWORDS.test(question) ? "coding" : "theory";
}

export function detectDifficulty(index: number): "Easy" | "Medium" | "Hard" {
  if (index <= 4) return "Easy";
  if (index <= 10) return "Medium";
  return "Hard";
}

export function enrichQuestion(
  raw: string,
  domain: string,
  questionNumber: number
): AssessmentQuestion {
  const type = detectQuestionType(raw);
  const mock = MOCK_QUESTIONS.find((q) => q.id === questionNumber);
  return {
    id: questionNumber,
    domain: domain || mock?.domain || "Python",
    question: raw,
    difficulty: mock?.difficulty ?? detectDifficulty(questionNumber),
    category: mock?.category ?? `${domain || "General"} Fundamentals`,
    type: mock?.type ?? type,
    language: type === "coding" ? mock?.language ?? domainToLanguage(domain) : undefined,
    example: mock?.example,
    hints: mock?.hints ?? defaultHints(type, domain),
    estimatedMinutes: mock?.estimatedMinutes ?? (type === "coding" ? 8 : 4),
  };
}

function domainToLanguage(domain: string): string {
  const map: Record<string, string> = {
    Python: "python",
    Java: "java",
    JavaScript: "javascript",
    SQL: "sql",
  };
  return map[domain] ?? "python";
}

function defaultHints(type: "coding" | "theory", domain: string): string[] {
  if (type === "coding") {
    return [
      "State your approach before writing code.",
      `Consider edge cases typical in ${domain} interviews.`,
      "Mention time and space complexity if applicable.",
    ];
  }
  return [
    "Structure your answer with a clear definition first.",
    "Give a practical example from real-world usage.",
    "Compare with related concepts when relevant.",
  ];
}

export function createInitialSkills(): SkillDomain[] {
  return ASSESSMENT_SKILLS.map((name, i) => ({
    id: name.toLowerCase().replace(/\//g, "-"),
    name,
    score: 0,
    status: i === 0 ? "active" : "pending",
    questionsAnswered: 0,
    totalQuestions: 3,
  }));
}

export function updateSkillsAfterAnswer(
  skills: SkillDomain[],
  domain: string,
  scoreDelta: number
): SkillDomain[] {
  const idx = skills.findIndex((s) => s.name === domain || domain.includes(s.name));
  const targetIdx = idx >= 0 ? idx : skills.findIndex((s) => s.status === "active");
  return skills.map((skill, i) => {
    if (i === targetIdx) {
      const newScore = Math.min(100, skill.score + scoreDelta);
      const answered = skill.questionsAnswered + 1;
      const completed = answered >= skill.totalQuestions;
      return {
        ...skill,
        score: newScore,
        questionsAnswered: answered,
        status: completed ? "completed" : "active",
      };
    }
    if (i === targetIdx + 1 && skills[targetIdx]?.questionsAnswered + 1 >= skills[targetIdx]?.totalQuestions) {
      return { ...skill, status: skill.status === "pending" ? "active" : skill.status };
    }
    return skill;
  });
}

export function buildMockEvaluation(
  answer: string,
  question: AssessmentQuestion
): EvaluationResult {
  const trimmed = answer.trim();
  const hasContent = trimmed.length > 20;
  const score = hasContent ? Math.floor(55 + Math.random() * 35) : Math.floor(20 + Math.random() * 25);
  const isCorrect = score >= 70;

  return {
    correctness: score,
    isCorrect,
    score,
    explanation: isCorrect
      ? `Your answer demonstrates solid understanding of ${question.category}. You covered the key concepts Gemma was probing for.`
      : `Your response touches on part of the problem, but misses depth expected at the ${question.difficulty.toLowerCase()} level for ${question.domain}.`,
    betterAnswer: MOCK_BETTER_ANSWERS[question.id % MOCK_BETTER_ANSWERS.length],
    industryStandard: MOCK_INDUSTRY_ANSWERS[question.id % MOCK_INDUSTRY_ANSWERS.length],
    suggestions: [
      `Review ${question.domain} fundamentals in ${question.category}.`,
      "Practice explaining trade-offs clearly in under 3 minutes.",
      isCorrect ? "Try a harder follow-up on system design." : "Write a minimal working example and test edge cases.",
    ],
  };
}

export function buildEvaluationFromFeedback(
  feedback: string,
  answer: string,
  question: AssessmentQuestion,
  api?: {
    score?: number;
    is_correct?: boolean;
    better_answer?: string;
    industry_standard?: string;
    suggestions?: string[];
  }
): EvaluationResult {
  const trimmed = answer.trim();
  const hasContent = trimmed.length > 20;
  const score =
    typeof api?.score === "number"
      ? Math.max(0, Math.min(100, Math.round(api.score)))
      : hasContent
        ? Math.floor(45 + Math.min(trimmed.length, 400) / 8)
        : 15;
  const isCorrect = api?.is_correct ?? score >= 70;

  return {
    correctness: score,
    isCorrect,
    score,
    explanation: feedback || `Gemma evaluated your ${question.domain} response.`,
    betterAnswer:
      api?.better_answer ||
      MOCK_BETTER_ANSWERS[question.id % MOCK_BETTER_ANSWERS.length],
    industryStandard:
      api?.industry_standard ||
      MOCK_INDUSTRY_ANSWERS[question.id % MOCK_INDUSTRY_ANSWERS.length],
    suggestions:
      api?.suggestions?.length
        ? api.suggestions
        : [
            `Review ${question.domain} fundamentals in ${question.category}.`,
            "Practice explaining trade-offs clearly in under 3 minutes.",
            isCorrect ? "Try a harder follow-up on system design." : "Write a minimal working example and test edge cases.",
          ],
  };
}

export function buildInsights(
  skills: SkillDomain[],
  evaluation: EvaluationResult | null,
  questionNumber: number
): AssessmentInsights {
  const active = skills.find((s) => s.status === "active") ?? skills[0];
  const completedSkills = skills.filter((s) => s.status === "completed");
  const topSkills = [...skills].sort((a, b) => b.score - a.score).slice(0, 2);
  const weakSkills = [...skills].sort((a, b) => a.score - b.score).slice(0, 2);

  return {
    currentSkillScore: active?.score ?? 0,
    confidence: Math.min(95, 40 + questionNumber * 4 + (evaluation?.score ?? 0) * 0.2),
    strengths: topSkills.filter((s) => s.score > 0).map((s) => `${s.name}: ${s.score}% proficiency`),
    weaknesses: weakSkills.map((s) => `${s.name}: needs reinforcement`),
    gemmaInsight:
      evaluation?.isCorrect
        ? "Strong signal detected. Gemma will increase difficulty on the next question."
        : "Gemma detected gaps — the next question will probe foundational concepts.",
    learningTips: [
      `Focus 30 min daily on ${active?.name ?? "Python"} practice problems.`,
      "Explain your reasoning aloud before submitting — mirrors real interviews.",
      completedSkills.length > 0
        ? `${completedSkills.length} domain(s) assessed — maintain momentum.`
        : "Complete 3 questions per domain for accurate scoring.",
    ],
  };
}

export function buildResultsFromApi(
  skillsEstimate: Record<string, string | number>,
  summary: string,
  strengths: string[],
  weaknesses: string[]
): AssessmentResults {
  const numericSkills: Record<string, number> = {};
  for (const [key, val] of Object.entries(skillsEstimate)) {
    if (typeof val === "number") numericSkills[key] = val;
    else {
      const map: Record<string, number> = {
        beginner: 35,
        intermediate: 65,
        advanced: 88,
        expert: 95,
      };
      numericSkills[key] = map[String(val).toLowerCase()] ?? 50;
    }
  }

  const scores = Object.values(numericSkills);
  const overall = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 72;

  return {
    overallScore: overall,
    skillsEstimate: numericSkills,
    summary,
    strengths,
    weaknesses,
    industryBenchmark: 68,
    roadmap: [
      "Strengthen DSA with 50 curated problems",
      "Build a full-stack capstone project",
      "Complete cloud deployment fundamentals",
      "Practice system design at intern level",
    ],
    projects: [
      "REST API with authentication (FastAPI/Express)",
      "ML pipeline with evaluation metrics dashboard",
      "Open-source contribution with tests",
    ],
    certifications: [
      "Google Cloud Digital Leader",
      "AWS Cloud Practitioner",
      "Meta Front-End Developer",
    ],
    resumeReadiness: Math.min(95, overall + 8),
    interviewReadiness: Math.min(92, overall + 2),
    internshipReadiness: Math.min(90, overall - 2),
  };
}

export const MOCK_RESULTS: AssessmentResults = buildResultsFromApi(
  { Python: 78, Java: 52, JavaScript: 71, SQL: 64, "AI/ML": 58, Communication: 82 },
  "You demonstrate strong Python and communication skills with solid JavaScript fundamentals. Focus on Java depth and AI/ML practical projects to reach internship-ready level.",
  ["Python fundamentals", "Clear technical communication", "JavaScript async patterns"],
  ["Java OOP depth", "SQL query optimization", "ML model evaluation"]
);

const MOCK_BETTER_ANSWERS = [
  "Lists are mutable sequences suited for collections that change; tuples are immutable and hashable, ideal for fixed records and dict keys. Use tuples for coordinates, configs; lists for dynamic data.",
  "Use a list comprehension: [x for sub in nested for x in sub]. Time O(n), space O(n) for output.",
  "Implement two pointers after sorting, or use a hash map to track complements in O(n) time.",
];

const MOCK_INDUSTRY_ANSWERS = [
  "Industry interviews expect you to mention mutability, performance (slight tuple advantage), and hashability. Always tie choice to use case.",
  "Flatten with itertools.chain.from_iterable for readability in production Python code.",
  "For production, prefer readable built-ins unless performance-critical — then document complexity explicitly.",
];

export const MOCK_QUESTIONS: AssessmentQuestion[] = [
  {
    id: 1,
    domain: "Python",
    question: "Explain the difference between a list and a tuple. When would you choose each?",
    difficulty: "Easy",
    category: "Data Structures",
    type: "theory",
    example: "coordinates = (40.7, -74.0)  vs  items = [1, 2, 3]",
    hints: ["Mutability is the key distinction.", "Consider hashability for dict keys.", "Mention performance only as a secondary factor."],
    estimatedMinutes: 4,
  },
  {
    id: 2,
    domain: "Python",
    question: "Write a function that flattens a nested list [[1,2],[3,4]] into [1,2,3,4].",
    difficulty: "Easy",
    category: "Algorithms",
    type: "coding",
    language: "python",
    example: "Input: [[1, 2], [3, 4]]  →  Output: [1, 2, 3, 4]",
    hints: ["List comprehension works well here.", "Handle arbitrary nesting if time permits.", "State time complexity."],
    estimatedMinutes: 6,
  },
  {
    id: 3,
    domain: "Python",
    question: "What are Python decorators and give a practical use case?",
    difficulty: "Medium",
    category: "Language Features",
    type: "theory",
    hints: ["Explain @syntax sugar.", "Mention functools.wraps.", "Example: timing, auth, caching."],
    estimatedMinutes: 5,
  },
];

export function getMockQuestion(index: number): AssessmentQuestion {
  const base = MOCK_QUESTIONS[(index - 1) % MOCK_QUESTIONS.length];
  return {
    ...base,
    id: index,
    domain: ASSESSMENT_SKILLS[Math.floor((index - 1) / 3) % ASSESSMENT_SKILLS.length],
    difficulty: detectDifficulty(index),
    question: base.question.replace(/^Explain|^Write|^What/, (m) => m),
  };
}
