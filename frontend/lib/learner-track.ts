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
    items.push({ href: "/assessment", label: "Skill Assessment", icon: "assessment" });
  } else {
    items.push({
      href: "/mocks",
      label: exp === "school" ? "Chapter Practice" : "Mocks & PYQs",
      icon: "mocks",
    });
  }

  items.push(
    { href: "/roadmap", label: "Learning Roadmap", icon: "roadmap" },
    { href: "/planner", label: "Calendar", icon: "planner" }
  );

  if (exp === "developer") {
    items.push(
      { href: "/resume", label: "Resume Builder", icon: "resume" },
      { href: "/internships", label: "Internships", icon: "internships" }
    );
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
      return "Board Prep Hub";
    case "school":
      return "Learning Lab";
    default:
      return "Career Dashboard";
  }
}
