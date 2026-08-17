import type { CareerPathStage, CareerData, SkillLevel } from "@/lib/career-store";
import type { TimelineEvent } from "@/lib/dashboard-data";
import { addDaysISO, todayISO } from "@/lib/calendar";
import { getTrack, type LearnerTrack } from "@/lib/onboarding-tracks";
import type { Profile } from "@/lib/types";

const PALETTE: Pick<TimelineEvent, "color" | "dotColor" | "bgColor">[] = [
  { color: "#0D9488", dotColor: "#0D9488", bgColor: "#F0FDFA" },
  { color: "#2563EB", dotColor: "#2563EB", bgColor: "#EFF6FF" },
  { color: "#FB923C", dotColor: "#FB923C", bgColor: "#FFF7ED" },
  { color: "#8B5CF6", dotColor: "#8B5CF6", bgColor: "#F5F3FF" },
  { color: "#10B981", dotColor: "#10B981", bgColor: "#ECFDF5" },
];

function hourForFreeTime(freeTime?: string): number {
  switch (freeTime) {
    case "morning":
      return 8;
    case "afternoon":
    case "after_school":
      return 16;
    case "night":
      return 21;
    case "weekend":
    case "irregular":
      return 11;
    case "daily_short":
    case "short":
      return 19;
    case "weekday_eve":
    case "evening":
    default:
      return 18;
  }
}

function formatHourLabel(hour: number): string {
  const suffix = hour >= 12 ? "PM" : "AM";
  const h = hour % 12 || 12;
  return `${h}:00 ${suffix}`;
}

export function careerPathForTrack(trackId: string, answers: Record<string, string>, targetRole: string): CareerPathStage[] {
  if (trackId === "bio") {
    const neet = answers.exam === "neet" || answers.focus === "medicine";
    return [
      { id: "1", title: "Chapter mastery (PCB)", subtitle: answers.hardest ? `Repair: ${answers.hardest}` : "NCERT line-by-line", year: "Now", status: "current" },
      { id: "2", title: neet ? "PYQ-style grind" : "Application & diagrams", subtitle: "Timed chapter + sectional tests", year: "This season", status: "upcoming" },
      { id: "3", title: "Full mock stamina", subtitle: "45–180 min PCB papers every week", year: "Peak prep", status: "upcoming" },
      { id: "4", title: neet ? "NEET UG / MBBS" : targetRole || "Life sciences", subtitle: "Rank from revision, not new chapters", year: "Exam year", status: "upcoming" },
    ];
  }
  if (trackId === "high_school") {
    return [
      { id: "1", title: `Class ${answers.grade || "11–12"} focus`, subtitle: answers.weak_subject ? `Lift ${answers.weak_subject}` : "Weekly system", year: "Now", status: "current" },
      { id: "2", title: answers.goal === "entrance" ? "Entrance shortlist" : "Board excellence", subtitle: answers.stream?.toUpperCase() || "Stream mastery", year: "This year", status: "upcoming" },
      { id: "3", title: "College / first intern", subtitle: "Applications with a clear story", year: "Year 1", status: "upcoming" },
      { id: "4", title: targetRole || "Chosen field", subtitle: "Depth after class 12", year: "Year 2–3", status: "upcoming" },
    ];
  }
  if (trackId === "grade_9_10") {
    return [
      { id: "1", title: `${answers.grade === "10" ? "10th" : "9th"} fundamentals`, subtitle: answers.hard_subject ? `Support ${answers.hard_subject}` : "Habits first", year: "Now", status: "current" },
      { id: "2", title: "Explore interests", subtitle: answers.curiosity || "Try one extra skill", year: "This year", status: "upcoming" },
      { id: "3", title: "Class 11 stream choice", subtitle: "Pick from evidence, not panic", year: "Next", status: "upcoming" },
      { id: "4", title: "Early career map", subtitle: targetRole || "Keep options open", year: "Year 2+", status: "upcoming" },
    ];
  }
  const stack = answers.stack === "ai" ? "AI intern" : answers.stack === "web" ? "Web intern" : "Software intern";
  return [
    { id: "1", title: "Build in public", subtitle: answers.known || "Ship a small project", year: "Now", status: "current" },
    { id: "2", title: stack, subtitle: answers.goal === "dsa" ? "DSA + portfolio" : "Internship-ready GitHub", year: "Year 1", status: "upcoming" },
    { id: "3", title: "Junior engineer", subtitle: "Full-time or return offer", year: "Year 2", status: "upcoming" },
    { id: "4", title: targetRole || "Software engineer", subtitle: "Specialise with shipped work", year: "Year 3–4", status: "upcoming" },
  ];
}

export function skillsFromOnboarding(trackId: string, answers: Record<string, string>): SkillLevel[] {
  const known = (answers.known ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3)
    .map((name) => ({ name, level: 62, label: "Developing" }));

  const byTrack: Record<string, SkillLevel[]> = {
    bio: [
      { name: "Biology", level: answers.strength ? 68 : 55, label: "Developing" },
      { name: "Physics", level: answers.phy_level === "strong" ? 70 : answers.phy_level === "weak" ? 38 : 50, label: answers.phy_level === "strong" ? "Intermediate" : "Beginner" },
      { name: "Chemistry", level: answers.chem_level === "strong" ? 70 : answers.chem_level === "weak" ? 40 : 52, label: answers.chem_level === "strong" ? "Intermediate" : "Beginner" },
      { name: answers.hardest || "Weak chapter", level: 36, label: "Beginner" },
    ],
    high_school: [
      { name: answers.strong_subject || answers.stream?.toUpperCase() || "Core stream", level: 70, label: "Intermediate" },
      { name: answers.weak_subject || "Weak subject", level: 40, label: "Beginner" },
      { name: answers.goal === "entrance" ? "Entrance practice" : "Board revision", level: 52, label: "Developing" },
    ],
    grade_9_10: [
      { name: answers.favorite || "Favourite subject", level: 72, label: "Intermediate" },
      { name: answers.hard_subject || "Hardest subject", level: 38, label: "Beginner" },
      { name: answers.curiosity === "coding" ? "Exploring code" : "Curiosity project", level: 45, label: "Beginner" },
    ],
    developer: known.length
      ? [...known, { name: answers.stack || "Focus stack", level: 50, label: "Developing" }]
      : [
          { name: answers.stack === "web" ? "React / web" : answers.stack === "ai" ? "Python / ML" : "Coding basics", level: 48, label: "Beginner" },
          { name: answers.difficulty === "dsa" ? "DSA" : "Debugging", level: 40, label: "Beginner" },
          { name: "Git / GitHub", level: answers.github === "yes" ? 70 : 35, label: answers.github === "yes" ? "Intermediate" : "Beginner" },
        ],
  };
  return (byTrack[trackId] ?? byTrack.developer).slice(0, 4);
}

export function recommendedFromOnboarding(trackId: string, answers: Record<string, string>): string[] {
  if (trackId === "bio") return [answers.hardest || "Genetics PYQs", "Physics numericals", "Organic mechanisms", "Full NEET mock"].filter(Boolean);
  if (trackId === "high_school") return [answers.weak_subject || "Weak subject repair", "Timed mocks", "Error log"];
  if (trackId === "grade_9_10") return [answers.hard_subject || "Daily 20-min review", answers.curiosity || "Explore one skill", "Exam calm"];
  return [answers.stack === "dsa" || answers.goal === "dsa" ? "Daily DSA" : "Ship a project", "GitHub readme", answers.difficulty === "consistency" ? "Habit tracker" : "Debug journal"];
}

export function seedPlannerEvents(trackId: string, answers: Record<string, string>): TimelineEvent[] {
  const start = hourForFreeTime(answers.free_time);
  const titles: Record<string, string[]> = {
    bio: [
      answers.hardest ? `${answers.hardest} repair` : "Biology NCERT",
      answers.phy_level === "weak" ? "Physics numericals" : "Physics sectional",
      answers.chem_level === "weak" ? "Organic reactions" : "Chemistry PYQ set",
    ],
    high_school: [
      answers.weak_subject ? `${answers.weak_subject} block` : "Core subject block",
      "Timed practice",
      answers.goal === "entrance" ? "Entrance mock slice" : "Board revision",
    ],
    grade_9_10: [
      answers.hard_subject ? `${answers.hard_subject} practice` : "Homework + review",
      answers.curiosity === "coding" ? "Explore coding (20 min)" : "Curiosity project",
      "Light recap",
    ],
    developer: [
      answers.stack === "web" ? "Frontend build" : "Code practice",
      answers.difficulty === "dsa" ? "DSA set" : "Project sprint",
      "GitHub / notes",
    ],
  };
  const list = titles[trackId] ?? titles.developer;
  const startDate = todayISO();
  return list.map((title, i) => {
    const hour = Math.min(21, start + i);
    const palette = PALETTE[i % PALETTE.length];
    return {
      id: `onboard-${trackId}-${i}`,
      title,
      startTime: formatHourLabel(hour),
      endTime: formatHourLabel(hour + 1),
      startHour: hour,
      durationHours: 1,
      date: addDaysISO(startDate, i),
      ...palette,
    };
  });
}

export function dashboardSubtitle(profile: Profile | null, fallback: string): string {
  if (!profile) return fallback;
  const track = profile.learner_track;
  if (!track) return profile.degree || profile.target_role || fallback;
  try {
    const def = getTrack(track as LearnerTrack);
    const answers = profile.onboarding_answers ?? {};
    const bits = [def.title];
    if (answers.grade) bits.push(`Class ${answers.grade}`);
    if (answers.stream) bits.push(answers.stream.toUpperCase());
    if (answers.focus) bits.push(answers.focus);
    if (answers.stack) bits.push(answers.stack);
    return bits.slice(0, 3).join(" · ");
  } catch {
    return profile.target_role || fallback;
  }
}

export function applyOnboardingToCareer(career: CareerData, profile: Profile): CareerData {
  const track = profile.learner_track || "";
  const answers = profile.onboarding_answers ?? {};
  const skills = skillsFromOnboarding(track, answers);
  const seededPlanner =
    profile.planner_events?.length
      ? (profile.planner_events as TimelineEvent[])
      : seedPlannerEvents(track, answers);

  return {
    ...career,
    targetRole: profile.target_role || career.targetRole,
    degree: dashboardSubtitle(profile, career.degree),
    skills: profile.skills?.length ? profile.skills : skills.map((s) => s.name),
    skillLevels: profile.assessment?.skills_estimate && Object.keys(profile.assessment.skills_estimate).length
      ? career.skillLevels
      : skills,
    recommendedSkills: profile.roadmap?.priority_skills?.map((p) => p.skill).slice(0, 5) ?? recommendedFromOnboarding(track, answers),
    weaknesses: [
      answers.hardest,
      answers.weak_subject,
      answers.hard_subject,
      answers.difficulty,
    ].filter(Boolean) as string[],
    strengths: [answers.strength, answers.strong_subject, answers.favorite, answers.known].filter(Boolean) as string[],
    careerPath: careerPathForTrack(track, answers, profile.target_role || career.targetRole),
    plannerEvents: seededPlanner,
    roadmapDaysRemaining: profile.roadmap?.milestones?.length
      ? profile.roadmap.milestones.length * 7
      : career.roadmapDaysRemaining,
  };
}

export function colorizePlannerEvents(events: TimelineEvent[]): TimelineEvent[] {
  const start = todayISO();
  return events.map((event, i) => ({
    ...event,
    id: event.id || `gemma-${Date.now()}-${i}`,
    date: event.date || addDaysISO(start, i),
    ...PALETTE[i % PALETTE.length],
  }));
}
