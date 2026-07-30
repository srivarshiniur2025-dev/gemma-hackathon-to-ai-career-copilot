/**
 * Per-user career data in localStorage — syncs assessment, streak, planner, skills.
 * Merges with backend Profile when API is available.
 */

import type { TimelineEvent } from "@/lib/dashboard-data";
import { weeklyTimelineEvents } from "@/lib/dashboard-data";
import { getCurrentUser } from "@/lib/fake-auth";

const PREFIX = "careerCopilotCareer:";

export type CareerPathStage = {
  id: string;
  title: string;
  subtitle: string;
  year: string;
  status: "done" | "current" | "upcoming";
};

export type SkillLevel = {
  name: string;
  level: number;
  label: string;
};

export type CareerData = {
  targetRole: string;
  degree: string;
  skills: string[];
  recommendedSkills: string[];
  skillLevels: SkillLevel[];
  assessmentCount: number;
  resumeVersions: number;
  projectCount: number;
  interviewScore: number | null;
  resumeAtsScore: number;
  internshipMatches: number;
  streak: { count: number; lastActiveDate: string; longestStreak: number };
  weeklyActivity: { day: string; hours: number }[];
  plannerEvents: TimelineEvent[];
  careerPath: CareerPathStage[];
  assessmentSummary?: string;
  strengths: string[];
  weaknesses: string[];
  roadmapDaysRemaining: number;
  updatedAt: string;
};

function storageKey(email?: string | null): string {
  const user = email ?? getCurrentUser()?.email ?? "guest";
  return `${PREFIX}${user.toLowerCase()}`;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function defaultCareerData(): CareerData {
  return {
    targetRole: "Software Engineering Intern",
    degree: "",
    skills: ["Python", "Git", "Problem Solving"],
    recommendedSkills: ["System Design", "React", "Cloud (AWS)", "SQL"],
    skillLevels: [
      { name: "Python", level: 72, label: "Intermediate" },
      { name: "Git", level: 65, label: "Intermediate" },
      { name: "Problem Solving", level: 58, label: "Developing" },
    ],
    assessmentCount: 0,
    resumeVersions: 0,
    projectCount: 0,
    interviewScore: null,
    resumeAtsScore: 72,
    internshipMatches: 0,
    streak: { count: 0, lastActiveDate: "", longestStreak: 0 },
    weeklyActivity: [
      { day: "Mon", hours: 0 },
      { day: "Tue", hours: 0 },
      { day: "Wed", hours: 0 },
      { day: "Thu", hours: 0 },
      { day: "Fri", hours: 0 },
      { day: "Sat", hours: 0 },
      { day: "Sun", hours: 0 },
    ],
    plannerEvents: [...weeklyTimelineEvents],
    careerPath: defaultCareerPath("Software Engineering Intern"),
    strengths: [],
    weaknesses: [],
    roadmapDaysRemaining: 42,
    updatedAt: new Date().toISOString(),
  };
}

export function defaultCareerPath(targetRole: string): CareerPathStage[] {
  const role = targetRole || "Software Engineer";
  return [
    { id: "1", title: "Skill Foundation", subtitle: "Assessments & core skills", year: "Now", status: "current" },
    { id: "2", title: `${role} Intern`, subtitle: "First industry experience", year: "Year 1", status: "upcoming" },
    { id: "3", title: `Junior ${role.split(" ")[0]} Developer`, subtitle: "Full-time or extended internship", year: "Year 2", status: "upcoming" },
    { id: "4", title: `Mid-level ${role.split(" ")[0]} Engineer`, subtitle: "Specialization & leadership", year: "Year 3–4", status: "upcoming" },
  ];
}

export function loadCareerData(email?: string): CareerData {
  if (typeof window === "undefined") return defaultCareerData();
  const raw = localStorage.getItem(storageKey(email));
  if (!raw) {
    const seeded = seedFromSessionUser(defaultCareerData());
    saveCareerData(seeded, email);
    return seeded;
  }
  try {
    return { ...defaultCareerData(), ...JSON.parse(raw) } as CareerData;
  } catch {
    return defaultCareerData();
  }
}

function seedFromSessionUser(data: CareerData): CareerData {
  const user = getCurrentUser();
  if (!user) return data;
  return {
    ...data,
    degree: user.college ? `Student • ${user.college}` : data.degree,
  };
}

export function saveCareerData(data: CareerData, email?: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    storageKey(email),
    JSON.stringify({ ...data, updatedAt: new Date().toISOString() })
  );
}

export function recordDailyActivity(email?: string): CareerData {
  const data = loadCareerData(email);
  const today = todayISO();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayISO = yesterday.toISOString().slice(0, 10);

  let { count, lastActiveDate, longestStreak } = data.streak;

  if (lastActiveDate !== today) {
    if (lastActiveDate === yesterdayISO) {
      count += 1;
    } else if (lastActiveDate === "") {
      count = 1;
    } else {
      count = 1;
    }
    lastActiveDate = today;
    longestStreak = Math.max(longestStreak, count);
  }

  const dayIndex = new Date().getDay();
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayName = dayNames[dayIndex];
  const weeklyActivity = data.weeklyActivity.map((d) =>
    d.day === dayName ? { ...d, hours: Math.min(d.hours + 0.5, 8) } : d
  );

  const next = {
    ...data,
    streak: { count, lastActiveDate, longestStreak },
    weeklyActivity,
  };
  saveCareerData(next, email);
  return next;
}

const LEVEL_MAP: Record<string, number> = {
  beginner: 35,
  novice: 45,
  developing: 55,
  intermediate: 68,
  advanced: 82,
  expert: 94,
};

export function levelFromLabel(raw: string | number): number {
  if (typeof raw === "number") return Math.max(0, Math.min(100, raw));
  const key = raw.toLowerCase().trim();
  if (LEVEL_MAP[key] !== undefined) return LEVEL_MAP[key];
  const num = parseInt(key, 10);
  return Number.isFinite(num) ? Math.max(0, Math.min(100, num)) : 50;
}

export function labelFromLevel(level: number): string {
  if (level >= 85) return "Advanced";
  if (level >= 70) return "Intermediate";
  if (level >= 50) return "Developing";
  return "Beginner";
}

export function saveAssessmentResults(input: {
  skillsEstimate: Record<string, string | number>;
  summary?: string;
  strengths?: string[];
  weaknesses?: string[];
  targetRole?: string;
}): CareerData {
  const data = loadCareerData();
  const skillLevels: SkillLevel[] = Object.entries(input.skillsEstimate).map(([name, val]) => {
    const level = levelFromLabel(val);
    return { name, level, label: labelFromLevel(level) };
  });

  const avg =
    skillLevels.length > 0
      ? Math.round(skillLevels.reduce((s, k) => s + k.level, 0) / skillLevels.length)
      : data.resumeAtsScore;

  const recommended = buildRecommendedSkills(
    skillLevels.map((s) => s.name),
    input.weaknesses ?? [],
    input.targetRole ?? data.targetRole
  );

  const next: CareerData = {
    ...data,
    skillLevels,
    skills: skillLevels.map((s) => s.name),
    recommendedSkills: recommended,
    assessmentCount: data.assessmentCount + 1,
    assessmentSummary: input.summary ?? data.assessmentSummary,
    strengths: input.strengths ?? data.strengths,
    weaknesses: input.weaknesses ?? data.weaknesses,
    targetRole: input.targetRole ?? data.targetRole,
    resumeAtsScore: Math.max(data.resumeAtsScore, Math.min(avg + 5, 98)),
    careerPath: defaultCareerPath(input.targetRole ?? data.targetRole),
    roadmapDaysRemaining: Math.max(14, data.roadmapDaysRemaining - 7),
  };
  saveCareerData(next);
  return next;
}

function buildRecommendedSkills(
  current: string[],
  weaknesses: string[],
  targetRole: string
): string[] {
  const pool = [
    "System Design",
    "React",
    "TypeScript",
    "AWS",
    "Docker",
    "SQL",
    "Machine Learning",
    "Communication",
    "Data Structures",
    "API Design",
  ];
  const role = targetRole.toLowerCase();
  if (role.includes("ml") || role.includes("ai")) {
    pool.unshift("TensorFlow", "PyTorch", "MLOps");
  }
  if (role.includes("frontend") || role.includes("web")) {
    pool.unshift("Next.js", "CSS", "Accessibility");
  }
  const fromWeaknesses = weaknesses
    .map((w) => w.replace(/needs work|proficiency|weak in/gi, "").trim())
    .filter(Boolean)
    .slice(0, 3);

  const combined = [...new Set([...fromWeaknesses, ...pool])].filter(
    (s) => !current.some((c) => c.toLowerCase() === s.toLowerCase())
  );
  return combined.slice(0, 5);
}

export function computeSkillScore(data: CareerData): number {
  if (data.skillLevels.length === 0) return 68;
  return Math.round(
    data.skillLevels.reduce((sum, s) => sum + s.level, 0) / data.skillLevels.length
  );
}

export function buildSkillSparkline(data: CareerData): { v: number }[] {
  const base = computeSkillScore(data);
  return [
    { v: Math.max(base - 18, 40) },
    { v: Math.max(base - 12, 45) },
    { v: Math.max(base - 8, 50) },
    { v: Math.max(base - 4, 55) },
    { v: Math.max(base - 2, 60) },
    { v: base },
  ];
}

export function buildRoadmapCurve(data: CareerData): { day: number; progress: number }[] {
  const pct = Math.max(10, 100 - data.roadmapDaysRemaining);
  return Array.from({ length: 7 }, (_, i) => ({
    day: i + 1,
    progress: Math.round(pct * ((i + 1) / 7)),
  }));
}
