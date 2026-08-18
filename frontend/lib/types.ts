export type Profile = {
  uid: string;
  name: string;
  email: string;
  degree: string;
  institution?: string;
  learner_track?: string;
  onboarding_answers?: Record<string, string>;
  onboarding_complete?: boolean;
  planner_events?: {
    id?: string;
    title: string;
    startTime: string;
    endTime: string;
    startHour: number;
    durationHours: number;
    color?: string;
    dotColor?: string;
    bgColor?: string;
    why?: string;
    date?: string;
  }[];
  interests: string[];
  target_role: string;
  skills: string[];
  projects: string[];
  certifications: string[];
  assessment: {
    questions_asked: number;
    history: { role: string; content: string }[];
    skills_estimate: Record<string, string>;
    summary?: string;
    strengths?: string[];
    weaknesses?: string[];
  };
  roadmap: Roadmap | null;
  resume: Resume | null;
  internships: InternshipRec[];
  interview: {
    history: { role: string; content: string }[];
    score: number | null;
    summary?: string;
  };
  progress_log: { event: string; skills?: Record<string, string> }[];
};

export type Roadmap = {
  overview: string;
  milestones: {
    week: number;
    title: string;
    tasks: string[];
    resources: string[];
    why: string;
  }[];
  priority_skills: {
    skill: string;
    current: string;
    target: string;
    reason: string;
  }[];
  project_ideas: string[];
  internship_readiness_score: number;
};

export type Resume = {
  summary: string;
  skills: string[];
  experience: { title: string; bullets: string[] }[];
  projects: { name: string; bullets: string[] }[];
  education: { degree: string; details: string }[];
  certifications: string[];
  ats_keywords: string[];
  tips: string[];
  tailoring?: {
    tailored_summary: string;
    updated_bullets: string[];
    missing_keywords: string[];
    match_score: number;
    recommendations: string[];
  };
};

export type InternshipRec = {
  company: string;
  role: string;
  location: string;
  match_score: number;
  why_recommended: string;
  missing_skills: string[];
  improvement_plan: string[];
};

export type InternshipPosting = {
  title: string;
  company_name: string;
  description: string;
  location: string;
  salary: string | null;
  source_url: string;
  contact_email: string | null;
};

export type SpamVerdict = "legitimate" | "suspicious" | "scam";

export type SpamCheckResult = {
  is_safe?: boolean;
  trust_score?: number;
  spam_risk_score: number;
  verdict: SpamVerdict;
  red_flags: string[];
  flags?: string[];
  reasoning: string;
};

export type InternshipSearchResult = SpamCheckResult & {
  posting: InternshipPosting;
};

export type InternshipSearchResponse = {
  results: InternshipSearchResult[];
  source: string | null;
  message: string | null;
  cached: boolean;
};

export type VerifiedInternshipRecommendation = {
  posting: InternshipPosting;
  is_safe: boolean;
  trust_score: number;
  flags: string[];
  verdict: SpamVerdict;
  match_score: number;
  why_recommended: string;
  missing_skills: string[];
  improvement_plan: string[];
};

export type InternshipRecommendResponse = {
  recommendations: VerifiedInternshipRecommendation[];
  overall_advice: string;
  source: string | null;
  cached: boolean;
  message: string | null;
  skill_profile_used?: {
    skills_estimate?: Record<string, number>;
    labeled_scores?: Record<string, number>;
    strengths?: string[];
    weaknesses?: string[];
    summary?: string;
  } | null;
};
