import type { LearnerTrack } from "@/lib/onboarding-tracks";
import type { Profile } from "@/lib/types";

export type TrackExperience = "neet" | "high_school" | "school" | "developer";

export function trackFromProfile(profile: Profile | null | undefined): LearnerTrack | undefined {
  const raw = profile?.learner_track;
  if (raw === "bio" || raw === "high_school" || raw === "grade_9_10" || raw === "developer") return raw;
  return undefined;
}

export function experienceForProfile(profile: Profile | null | undefined): TrackExperience {
  const track = trackFromProfile(profile);
  const answers = profile?.onboarding_answers ?? {};
  if (track === "developer") return "developer";
  if (track === "grade_9_10") return "school";
  if (track === "bio") return "neet";
  if (track === "high_school") {
    if (answers.stream === "pcb" || answers.goal === "entrance" || answers.exam === "neet") return "neet";
    return "high_school";
  }
  return "developer";
}

export function isDeveloperTrack(profile: Profile | null | undefined): boolean {
  return experienceForProfile(profile) === "developer";
}

export function showsMockInterviews(profile: Profile | null | undefined): boolean {
  return isDeveloperTrack(profile);
}

export function showsResumeBuilder(profile: Profile | null | undefined): boolean {
  return isDeveloperTrack(profile);
}

export function showsInternships(profile: Profile | null | undefined): boolean {
  return isDeveloperTrack(profile);
}

export function showsExamMocks(profile: Profile | null | undefined): boolean {
  const exp = experienceForProfile(profile);
  return exp === "neet" || exp === "high_school" || exp === "school";
}

export type NavItem = {
  href: string;
  label: string;
  icon: "dashboard" | "assessment" | "mocks" | "roadmap" | "planner" | "resume" | "internships" | "interview" | "progress" | "settings";
};

export function navItemsForProfile(profile: Profile | null | undefined): NavItem[] {
  const exp = experienceForProfile(profile);
  const items: NavItem[] = [{ href: "/dashboard", label: "Dashboard", icon: "dashboard" }];

  if (exp === "developer") {
    items.push({ href: "/assessment", label: "Skill Assessments", icon: "assessment" });
  } else {
    items.push({
      href: "/mocks",
      label:
        exp === "neet"
          ? "NEET Mocks & PYQs"
          : exp === "high_school"
            ? "Board & Entrance Tests"
            : "Chapter Practice",
      icon: "mocks",
    });
  }

  items.push(
    { href: "/roadmap", label: "Learning Roadmap", icon: "roadmap" },
    { href: "/planner", label: "Study Planner", icon: "planner" }
  );

  if (showsResumeBuilder(profile)) {
    items.push({ href: "/resume", label: "Resume Builder", icon: "resume" });
  }
  if (showsInternships(profile)) {
    items.push({ href: "/internships", label: "Internships", icon: "internships" });
  }

  if (showsMockInterviews(profile)) {
    items.push({ href: "/interview", label: "Mock Interview", icon: "interview" });
  }

  items.push(
    { href: "/progress", label: "Progress", icon: "progress" },
    { href: "/settings", label: "Settings", icon: "settings" }
  );

  return items;
}

export function dashboardHeading(profile: Profile | null | undefined): string {
  switch (experienceForProfile(profile)) {
    case "neet":
      return "NEET Command Centre";
    case "high_school":
      return "Board + Entrance Sprint";
    case "school":
      return "Class 9–10 Science Lab";
    default:
      return "Developer Career Dashboard";
  }
}

export type TrackCopy = {
  plannerTitle: string;
  plannerSubtitle: string;
  defaultBlockTitle: string;
  seedWeekTitles: string[];
  plannerCopilotIntro: string;
  mocksEyebrow: string;
  mocksTitle: string;
  mocksDescription: string;
};

export function trackCopy(exp: TrackExperience): TrackCopy {
  switch (exp) {
    case "neet":
      return {
        plannerTitle: "NEET Study Planner",
        plannerSubtitle: "Block Physics, Chemistry, Biology, and full mocks around your school day.",
        defaultBlockTitle: "NEET study block",
        seedWeekTitles: ["Physics drill", "Chemistry NCERT", "Biology recall", "PYQ paper", "Full mock review"],
        plannerCopilotIntro:
          "Tell me your free slots and toughest NEET topics (e.g. Organic Chemistry, Human Physiology). I will draft a weekly PCB plan — confirm before it lands on your calendar.",
        mocksEyebrow: "NEET vigorous prep",
        mocksTitle: "Mocks, PYQs & chapter tests",
        mocksDescription:
          "Timed papers across Physics, Chemistry and Biology with NEET-style topic mix and explanations after every attempt.",
      };
    case "high_school":
      return {
        plannerTitle: "Board + Entrance Planner",
        plannerSubtitle: "Balance board syllabus revision with entrance-style drills.",
        defaultBlockTitle: "Board revision",
        seedWeekTitles: ["Weak subject repair", "Board PYQ", "Formula sheet", "Mixed revision", "Weekly test"],
        plannerCopilotIntro:
          "Share when you are free and which subject feels hardest for boards or entrance prep. I will suggest realistic study blocks you can confirm.",
        mocksEyebrow: "Board + entrance sprint",
        mocksTitle: "Chapter tests & mixed papers",
        mocksDescription:
          "Shorter chapter quizzes and mixed papers tuned for Class 11–12 boards and entrance readiness — not NEET-only depth.",
      };
    case "school":
      return {
        plannerTitle: "Class 9–10 Planner",
        plannerSubtitle: "Light daily blocks for science chapters and homework without burnout.",
        defaultBlockTitle: "Chapter practice",
        seedWeekTitles: ["Science chapter", "Math practice", "Revision quiz", "Homework block", "Week recap"],
        plannerCopilotIntro:
          "Tell me your after-school free time and the chapter that feels confusing. I will keep blocks short (45–60 min) until you confirm.",
        mocksEyebrow: "Class 9–10 practice",
        mocksTitle: "Chapter assessments",
        mocksDescription: "Short chapter quizzes with instant explanations — build confidence before higher grades.",
      };
    default:
      return {
        plannerTitle: "Developer Prep Planner",
        plannerSubtitle: "Skill tests, DSA, projects, and interview prep in focused build sessions.",
        defaultBlockTitle: "Build session",
        seedWeekTitles: ["Skill assessment", "DSA practice", "Project build", "Mock interview prep", "Portfolio polish"],
        plannerCopilotIntro:
          "Tell me your coding hours and what you are preparing for (internships, DSA, full-stack). I will draft a build-week plan from your skill test gaps — confirm to add it.",
        mocksEyebrow: "Developer skill bank",
        mocksTitle: "Timed skill assessments",
        mocksDescription: "Domain MCQs across Python, DSA, React, and more — scores feed Gemma internship matching.",
      };
  }
}
