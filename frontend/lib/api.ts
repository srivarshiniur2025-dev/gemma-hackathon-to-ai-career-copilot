import type {
  InternshipPosting,
  InternshipRecommendResponse,
  InternshipSearchResponse,
  Profile,
  Resume,
  Roadmap,
  SpamCheckResult,
} from "./types";
import type { InterviewEvaluation, InterviewFocus, InterviewSession } from "./interview-types";

let authToken: string | null = null;

function getApiBase(): string {
  if (typeof window !== "undefined") return "";
  return process.env.BACKEND_URL ?? "http://127.0.0.1:8000";
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string> | undefined),
  };
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  const res = await fetch(`${getApiBase()}${path}`, { ...options, headers });

  if (!res.ok) {
    let detail = `Request failed: ${res.status}`;
    try {
      const body = await res.json();
      detail = body.detail ?? body.message ?? JSON.stringify(body);
    } catch {
      detail = (await res.text()) || detail;
    }
    throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
  }

  return res.json() as Promise<T>;
}

export const api = {
  setToken(token: string | null) {
    authToken = token;
  },

  clearToken() {
    authToken = null;
  },

  health: () =>
    request<{ status: string; model: string; model_chain?: string[]; version: string }>("/api/health"),

  registerUser: (name: string) =>
    request<Profile>("/api/users/register", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),

  getMe: () => request<Profile>("/api/users/me"),

  updateMe: (body: Partial<Profile>) =>
    request<Profile>("/api/users/me", {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  startAssessment: () =>
    request<{ welcome?: string; question: string; domain?: string; question_number?: number }>(
      "/api/assessment/start",
      { method: "POST" }
    ),

  answerAssessment: (answer: string) =>
    request<{
      done?: boolean;
      question?: string;
      domain?: string;
      question_number?: number;
      feedback?: string;
      summary?: string;
      skills_estimate?: Record<string, string | number>;
      strengths?: string[];
      weaknesses?: string[];
    }>("/api/assessment/answer", {
      method: "POST",
      body: JSON.stringify({ answer }),
    }),

  generateRoadmap: () => request<Roadmap>("/api/roadmap/generate", { method: "POST" }),

  generateResume: (roleFocus = "") =>
    request<Resume>(
      `/api/resume/generate${roleFocus ? `?role_focus=${encodeURIComponent(roleFocus)}` : ""}`,
      { method: "POST" }
    ),

  optimizeResume: (jobDescription: string, roleFocus = "") =>
    request<NonNullable<Resume["tailoring"]>>("/api/resume/optimize", {
      method: "POST",
      body: JSON.stringify({ job_description: jobDescription, role_focus: roleFocus }),
    }),

  recommendInternships: () =>
    request<InternshipRecommendResponse>("/api/internships/recommend", { method: "POST" }),

  checkInternshipSpam: (posting: InternshipPosting) =>
    request<SpamCheckResult>("/api/internships/spam-check", {
      method: "POST",
      body: JSON.stringify(posting),
    }),

  searchInternships: (body: { query: string; location?: string; skills?: string[] }) =>
    request<InternshipSearchResponse>("/api/internships/search", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  startInterview: () =>
    request<{ intro?: string; question: string }>("/api/interview/start", { method: "POST" }),

  answerInterview: (answer: string) =>
    request<Record<string, unknown>>("/api/interview/answer", {
      method: "POST",
      body: JSON.stringify({ answer }),
    }),

  createInterviewSession: (
    targetRole: string,
    focus: InterviewFocus,
    options?: {
      companyContext?: string;
      jobDescription?: string;
      resumeSummary?: string;
      targetSkills?: string[];
    }
  ) =>
    request<InterviewSession>("/api/interview/sessions", {
      method: "POST",
      body: JSON.stringify({
        target_role: targetRole,
        focus,
        company_context: options?.companyContext ?? "",
        job_description: options?.jobDescription ?? "",
        resume_summary: options?.resumeSummary ?? "",
        target_skills: options?.targetSkills ?? [],
      }),
    }),

  generateInterviewQuestions: (body: {
    targetRole: string;
    focus: InterviewFocus;
    companyContext?: string;
    jobDescription?: string;
    resumeSummary?: string;
    count?: number;
  }) =>
    request<{ questions: string[]; source: string }>("/api/interview/generate-questions", {
      method: "POST",
      body: JSON.stringify({
        target_role: body.targetRole,
        focus: body.focus,
        company_context: body.companyContext ?? "",
        job_description: body.jobDescription ?? "",
        resume_summary: body.resumeSummary ?? "",
        count: body.count ?? 5,
      }),
    }),

  getInterviewSession: (sessionId: string) =>
    request<InterviewSession>(`/api/interview/sessions/${sessionId}`),

  evaluateInterviewSession: (sessionId: string) =>
    request<InterviewEvaluation>(`/api/interview/sessions/${sessionId}/evaluate`, {
      method: "POST",
    }),

  chat: (message: string, history: { role: string; content: string }[] = []) =>
    request<{ reply: string }>("/api/chat", {
      method: "POST",
      body: JSON.stringify({ message, history }),
    }),

  recommendPlanner: (message: string, history: { role: string; content: string }[] = []) =>
    request<{
      needs_more?: boolean;
      question?: string;
      summary: string;
      events: {
        title: string;
        startTime: string;
        endTime: string;
        startHour: number;
        durationHours: number;
        why?: string;
      }[];
    }>("/api/planner/recommend", {
      method: "POST",
      body: JSON.stringify({ message, history }),
    }),

  confirmPlanner: (
    events: {
      title: string;
      startTime: string;
      endTime: string;
      startHour: number;
      durationHours: number;
      why?: string;
    }[],
    replace = false
  ) =>
    request<{ planner_events: unknown[] }>("/api/planner/confirm", {
      method: "POST",
      body: JSON.stringify({ events, replace }),
    }),
};
