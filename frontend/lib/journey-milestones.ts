export type JourneyMilestone = {
  id: string;
  label: string;
  routeLabel?: string;
  duration: string;
  completion: number;
  sectionId: string;
  /** 0–1 position along scroll journey */
  progress: number;
  headline: string;
  body: string;
  difficulty?: string;
  skillsUnlocked?: string[];
  aiInsight?: string;
};

export const JOURNEY_VIEWBOX = { w: 400, h: 2800 };

/** Anchor points the SVG path passes through */
export const JOURNEY_ANCHORS = [
  { x: 200, y: 120 },
  { x: 280, y: 380 },
  { x: 120, y: 640 },
  { x: 290, y: 900 },
  { x: 110, y: 1160 },
  { x: 285, y: 1420 },
  { x: 105, y: 1680 },
  { x: 275, y: 1940 },
  { x: 200, y: 2200 },
];

export const JOURNEY_MILESTONES: JourneyMilestone[] = [
  {
    id: "hero",
    label: "Origin",
    progress: 0,
    duration: "Now",
    completion: 0,
    sectionId: "journey-hero",
    headline: "Navigate your career with precision.",
    body: "An autonomous navigator guides every step — from first assessment to offer letter.",
  },
  {
    id: "assessment",
    label: "Assessment",
    routeLabel: "15 min",
    progress: 0.11,
    duration: "15 minutes",
    completion: 100,
    sectionId: "journey-assessment",
    headline: "Know exactly where you stand.",
    body: "Gemma maps your skills with adaptive questions — real proficiency, not checkbox lists.",
    difficulty: "Beginner",
    skillsUnlocked: ["Skill graph", "Gemma score"],
    aiInsight: "Adaptive questions converge in ~12 responses.",
  },
  {
    id: "skills",
    label: "Roadmap",
    routeLabel: "Python · DSA",
    progress: 0.24,
    duration: "4–8 weeks",
    completion: 68,
    sectionId: "journey-skills",
    headline: "Your personalized career roadmap.",
    body: "Personalized learning paths tuned to your target role and current gaps.",
    difficulty: "Intermediate",
    skillsUnlocked: ["Python", "DSA", "System design"],
    aiInsight: "Route recalculated as proficiency shifts.",
  },
  {
    id: "projects",
    label: "Projects",
    routeLabel: "Portfolio",
    progress: 0.37,
    duration: "2–4 weeks",
    completion: 45,
    sectionId: "journey-projects",
    headline: "Ship work that recruiters notice.",
    body: "Project milestones designed to fill portfolio gaps Gemma identifies.",
  },
  {
    id: "resume",
    label: "Resume",
    routeLabel: "Resume",
    progress: 0.5,
    duration: "1–2 days",
    completion: 80,
    sectionId: "journey-resume",
    headline: "ATS-ready in one pass.",
    body: "Structured resume output — optimized keywords, clean JSON, instant export.",
  },
  {
    id: "interview",
    label: "Interview",
    routeLabel: "Interview",
    progress: 0.63,
    duration: "Ongoing",
    completion: 55,
    sectionId: "journey-interview",
    headline: "Practice until confidence is data.",
    body: "Role-specific mock interviews with Gemma feedback on every answer.",
  },
  {
    id: "internship",
    label: "Internship",
    routeLabel: "Offer",
    progress: 0.76,
    duration: "Your goal",
    completion: 30,
    sectionId: "journey-internship",
    headline: "Verified roles. Zero scams.",
    body: "Gemma searches the web, matches roles to your profile, filters fraud.",
  },
  {
    id: "dashboard",
    label: "Dashboard",
    progress: 0.88,
    duration: "Always on",
    completion: 92,
    sectionId: "journey-dashboard",
    headline: "Your command center.",
    body: "Every metric, streak, and insight — one operating system for your career.",
  },
  {
    id: "success",
    label: "Success",
    progress: 1,
    duration: "Destination",
    completion: 100,
    sectionId: "journey-success",
    headline: "You arrived.",
    body: "Start your route today. The navigator is ready.",
  },
];

/** Smooth winding path through all anchors */
export const JOURNEY_PATH_D =
  "M 200 120 C 240 220, 280 300, 280 380 C 220 480, 120 560, 120 640 C 180 740, 290 820, 290 900 C 230 1000, 110 1080, 110 1160 C 170 1260, 285 1340, 285 1420 C 220 1520, 105 1600, 105 1680 C 165 1780, 275 1860, 275 1940 C 240 2040, 200 2120, 200 2200";

export const ROUTE_CONTEXT_LABELS = [
  { at: 0.18, text: "Estimated Time" },
  { at: 0.28, text: "Python" },
  { at: 0.32, text: "DSA" },
  { at: 0.52, text: "Resume" },
  { at: 0.66, text: "Interview" },
  { at: 0.78, text: "Offer" },
];
