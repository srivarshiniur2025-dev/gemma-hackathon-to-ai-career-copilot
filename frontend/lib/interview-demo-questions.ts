import type { InterviewFocus } from "./interview-types";

const DEMO_SESSION_KEY = "careerCopilotDemoInterview:";

export type DemoInterviewConfig = {
  targetRole: string;
  focus: InterviewFocus;
  companyContext: string;
  jobDescription: string;
  questions: string[];
};

export function storeDemoInterviewConfig(sessionId: string, config: DemoInterviewConfig): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(`${DEMO_SESSION_KEY}${sessionId}`, JSON.stringify(config));
}

export function loadDemoInterviewConfig(sessionId: string): DemoInterviewConfig | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(`${DEMO_SESSION_KEY}${sessionId}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as DemoInterviewConfig;
  } catch {
    return null;
  }
}

const ROLE_QUESTIONS: Record<string, string[]> = {
  "SDE Intern": [
    "Walk me through your background and why you want this software engineering internship.",
    "Explain how you would find the first duplicate in an array. What is the time complexity?",
    "Describe a bug you fixed in a project. How did you debug it?",
    "How would you design a rate limiter for an API? What trade-offs would you consider?",
    "Tell me about a time you had to learn a new technology quickly for a project.",
  ],
  "Software Engineer": [
    "Why are you interested in this software engineer role, and what stack are you strongest in?",
    "Implement a function to reverse a linked list — explain your approach verbally.",
    "How do you ensure code quality in team projects? Mention testing and reviews.",
    "Design a notification system that sends emails and push alerts to millions of users.",
    "Describe a conflict on a team project and how you resolved it using STAR.",
  ],
  "Data Analyst Intern": [
    "What drew you to data analytics, and which tools have you used?",
    "How would you investigate a sudden 20% drop in daily active users?",
    "Explain the difference between mean, median, and when you'd use each.",
    "Walk me through a SQL query you'd write to find top customers by revenue.",
    "Tell me about a data visualization you built and what insight it revealed.",
  ],
  "AI/ML Intern": [
    "Summarize your ML experience and a model you trained or fine-tuned.",
    "How would you handle imbalanced classes in a classification problem?",
    "Explain bias-variance tradeoff in plain language with an example.",
    "Describe how you'd evaluate a recommendation system offline and online.",
    "Tell me about an ethical consideration when deploying an ML model.",
  ],
  "Frontend Developer Intern": [
    "What excites you about frontend development, and which frameworks do you know?",
    "How does React reconciliation work at a high level?",
    "How would you improve Largest Contentful Paint on a slow marketing page?",
    "Design the component architecture for a dashboard with filters and charts.",
    "Describe a UI accessibility improvement you made on a project.",
  ],
  "Backend Developer Intern": [
    "Why backend engineering, and what languages or frameworks have you used?",
    "Explain REST vs GraphQL — when would you pick each?",
    "How would you debug a production API that suddenly returns 500 errors?",
    "Design a job queue for processing video uploads asynchronously.",
    "Tell me about a time you optimized a slow database query.",
  ],
  "Product Manager Intern": [
    "Why product management, and how do you prioritize features?",
    "How would you measure success for a new onboarding flow?",
    "Walk me through how you'd write a PRD for a mobile feature.",
    "Describe a product you admire and what makes it great.",
    "Tell me about a time you used data to change a product decision.",
  ],
  "DevOps / SRE Intern": [
    "What interests you about DevOps or site reliability?",
    "Explain CI/CD and how you've used it in a project.",
    "How would you respond to an alert that error rates doubled?",
    "Describe infrastructure as code and a tool you've used.",
    "How do you balance shipping fast with system stability?",
  ],
};

const GENERIC_QUESTIONS = [
  "Introduce yourself and why you're a fit for this role.",
  "Describe a technical challenge from a recent project and how you solved it.",
  "What skills from the job description are your strongest, and where do you want to grow?",
  "How would you approach a task you've never done before on this team?",
  "Tell me about a time you received critical feedback and what you changed.",
];

function extractJobKeywords(jobDescription: string): string[] {
  const text = jobDescription.toLowerCase();
  const keywords = [
    "python",
    "react",
    "typescript",
    "java",
    "aws",
    "docker",
    "kubernetes",
    "sql",
    "machine learning",
    "data",
    "api",
    "node",
    "go",
    "rust",
    "figma",
    "agile",
  ];
  return keywords.filter((k) => text.includes(k));
}

function focusTailoredQuestion(focus: InterviewFocus, role: string, keywords: string[]): string {
  const skillHint = keywords.length ? keywords.slice(0, 3).join(", ") : "core role skills";
  switch (focus) {
    case "system_design":
      return `For a ${role} at this company, how would you design a scalable service handling ${skillHint}? Discuss components and trade-offs.`;
    case "behavioral":
      return `Using STAR, tell me about a time you demonstrated ${skillHint} under pressure for a team goal.`;
    case "fundamentals":
      return `Let's go deeper on ${skillHint}: explain a fundamental concept and how you'd apply it in this role.`;
    default:
      return `This role emphasizes ${skillHint}. How does your experience map to those requirements?`;
  }
}

/** Gemma-style tailored question set for demo mode (role + optional job description). */
export function generateRoleInterviewQuestions(input: {
  targetRole: string;
  focus: InterviewFocus;
  companyContext: string;
  jobDescription?: string;
}): string[] {
  const role = input.targetRole.trim() || "Software Engineering Intern";
  const base =
    ROLE_QUESTIONS[role] ??
    ROLE_QUESTIONS[
      Object.keys(ROLE_QUESTIONS).find((k) => role.toLowerCase().includes(k.split(" ")[0].toLowerCase())) ??
        ""
    ] ??
    GENERIC_QUESTIONS;

  const keywords = extractJobKeywords(input.jobDescription ?? "");
  const company = input.companyContext.trim() || "the company";

  const tailored = base.slice(0, 5).map((q, i) => {
    if (i === 0) {
      return q.replace("this role", `${role} at ${company}`).replace("this software engineering internship", `${role} at ${company}`);
    }
    if (i === 2 && keywords.length) {
      return `${q} (Role mentions: ${keywords.join(", ")})`;
    }
    return q;
  });

  tailored[3] = focusTailoredQuestion(input.focus, role, keywords);

  if (input.jobDescription?.trim()) {
    const snippet = input.jobDescription.trim().slice(0, 120);
    tailored[4] = `Based on this job requirement — "${snippet}…" — how would you demonstrate you're ready on day one?`;
  }

  return tailored.slice(0, input.focus === "full_pipeline" ? 6 : 5);
}
