import type { InterviewEvaluation, InterviewFocus, InterviewSession } from "./interview-types";
import type { InternshipSearchResult, VerifiedInternshipRecommendation } from "./types";
import type { DemoInterviewConfig } from "./interview-demo-questions";
import {
  generateRoleInterviewQuestions,
  storeDemoInterviewConfig,
} from "./interview-demo-questions";

export type { DemoInterviewConfig };
export { storeDemoInterviewConfig, loadDemoInterviewConfig } from "./interview-demo-questions";

export const MOCK_INTERNSHIP_SEARCH: InternshipSearchResult[] = [
  {
    posting: {
      title: "Junior Python Developer Intern",
      company_name: "TechNova Labs",
      description: "Build REST APIs and internal tools with Python and FastAPI.",
      location: "Remote",
      salary: "₹25,000/mo",
      source_url: "https://example.com/jobs/technova-python-intern",
      contact_email: "careers@technova.example",
    },
    verdict: "legitimate",
    spam_risk_score: 8,
    trust_score: 92,
    red_flags: [],
    reasoning: "Verified company domain and standard internship posting patterns.",
  },
  {
    posting: {
      title: "Frontend Developer Intern",
      company_name: "WebCraft Studio",
      description: "Work on React dashboards and design systems for client projects.",
      location: "Hybrid · Mumbai",
      salary: "₹20,000/mo",
      source_url: "https://example.com/jobs/webcraft-frontend-intern",
      contact_email: null,
    },
    verdict: "legitimate",
    spam_risk_score: 12,
    trust_score: 88,
    red_flags: [],
    reasoning: "Established portfolio company with consistent hiring history.",
  },
  {
    posting: {
      title: "ML Engineering Intern",
      company_name: "DataBridge Analytics",
      description: "Support model training pipelines and data preprocessing workflows.",
      location: "Bangalore",
      salary: "₹30,000/mo",
      source_url: "https://example.com/jobs/databridge-ml-intern",
      contact_email: "hr@databridge.example",
    },
    verdict: "legitimate",
    spam_risk_score: 10,
    trust_score: 90,
    red_flags: [],
    reasoning: "Role requirements align with verified ML team job listings.",
  },
];

export const MOCK_INTERNSHIP_RECOMMENDATIONS: VerifiedInternshipRecommendation[] = [
  {
    posting: MOCK_INTERNSHIP_SEARCH[0].posting,
    is_safe: true,
    trust_score: 92,
    flags: [],
    verdict: "legitimate",
    match_score: 88,
    why_recommended: "Strong Python fundamentals and project experience align with backend intern requirements.",
    missing_skills: ["Docker"],
    improvement_plan: ["Complete a containerization mini-project", "Add CI/CD to a GitHub repo"],
  },
  {
    posting: MOCK_INTERNSHIP_SEARCH[1].posting,
    is_safe: true,
    trust_score: 88,
    flags: [],
    verdict: "legitimate",
    match_score: 82,
    why_recommended: "React project experience and web development scores make you a strong frontend candidate.",
    missing_skills: ["TypeScript"],
    improvement_plan: ["Migrate one React project to TypeScript", "Practice component testing"],
  },
];

export function createDemoInterviewSession(
  targetRole: string,
  focus: InterviewFocus,
  companyContext?: string,
  jobDescription?: string,
  questions?: string[]
): InterviewSession {
  const now = new Date().toISOString();
  const sessionId = `demo-${crypto.randomUUID()}`;
  const q =
    questions ??
    generateRoleInterviewQuestions({
      targetRole,
      focus,
      companyContext: companyContext ?? "",
      jobDescription,
    });

  const config: DemoInterviewConfig = {
    targetRole,
    focus,
    companyContext: companyContext ?? "",
    jobDescription: jobDescription ?? "",
    questions: q,
  };
  storeDemoInterviewConfig(sessionId, config);

  return {
    session_id: sessionId,
    uid: "demo",
    target_role: targetRole,
    focus,
    company_context: companyContext,
    total_questions: q.length,
    status: "active",
    current_stage: "fundamentals",
    question_count: 0,
    transcript: [],
    evaluation: null,
    created_at: now,
    updated_at: now,
  };
}

export const DEMO_INTERVIEW_QUESTIONS = [
  "Tell me about yourself and why you're interested in this role.",
  "Describe a technical project you're proud of. What challenges did you face?",
  "How would you design a URL shortener that handles 10K requests per second?",
];

export const MOCK_INTERVIEW_EVALUATION: InterviewEvaluation = {
  technical_accuracy: 78,
  communication: 85,
  confidence: 72,
  overall_score: 79,
  stage_scores: { fundamentals: 80, system_design: 75, behavioral: 82 },
  strengths: ["Clear communication", "Structured problem-solving", "Relevant project examples"],
  areas_to_improve: ["Add more quantitative impact in answers", "Deepen system design trade-off discussion"],
  star_method_feedback: {
    situation: "Good context setting in behavioral answers.",
    task: "Clearly stated your responsibility.",
    action: "Action steps were logical but could include more technical depth.",
    result: "Include measurable outcomes where possible.",
    overall: "Solid STAR structure with room to add metrics.",
  },
  missed_topics: ["Caching strategies", "Database indexing"],
  got_right: ["REST API design", "Team collaboration", "Python fundamentals"],
  summary:
    "Strong interview performance with clear communication. Focus on quantifying impact and discussing scalability trade-offs in system design.",
};
