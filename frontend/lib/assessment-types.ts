export type AssessmentPhase =
  | "overview"
  | "question"
  | "evaluating"
  | "evaluation"
  | "complete"
  | "results";

export type QuestionDifficulty = "Easy" | "Medium" | "Hard";
export type QuestionType = "coding" | "theory";
export type SkillStatus = "pending" | "active" | "completed";

export interface SkillDomain {
  id: string;
  name: string;
  score: number;
  status: SkillStatus;
  questionsAnswered: number;
  totalQuestions: number;
}

export interface AssessmentQuestion {
  id: number;
  domain: string;
  question: string;
  difficulty: QuestionDifficulty;
  category: string;
  type: QuestionType;
  language?: string;
  example?: string;
  hints: string[];
  estimatedMinutes: number;
}

export interface EvaluationResult {
  correctness: number;
  isCorrect: boolean;
  explanation: string;
  betterAnswer: string;
  industryStandard: string;
  score: number;
  suggestions: string[];
}

export interface AssessmentInsights {
  currentSkillScore: number;
  confidence: number;
  strengths: string[];
  weaknesses: string[];
  gemmaInsight: string;
  learningTips: string[];
}

export interface AssessmentResults {
  overallScore: number;
  skillsEstimate: Record<string, number>;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  industryBenchmark: number;
  roadmap: string[];
  projects: string[];
  certifications: string[];
  resumeReadiness: number;
  interviewReadiness: number;
  internshipReadiness: number;
}

export interface AssessmentStartResponse {
  welcome?: string;
  question: string;
  domain?: string;
  question_number?: number;
}

export interface AssessmentAnswerResponse {
  done?: boolean;
  question?: string;
  domain?: string;
  question_number?: number;
  feedback?: string;
  summary?: string;
  skills_estimate?: Record<string, string | number>;
  strengths?: string[];
  weaknesses?: string[];
}
