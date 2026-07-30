import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Briefcase,
  ClipboardCheck,
  Code2,
  FileText,
  Mic,
} from "lucide-react";

export type CareerMilestone = {
  id: string;
  label: string;
  icon: LucideIcon;
  duration: string;
  skills: string[];
  progress: number;
  sectionId: string;
};

/** Vertical route — y positions in viewBox units (0–520) */
export const CAREER_MILESTONES: CareerMilestone[] = [
  {
    id: "assessment",
    label: "Assessment",
    icon: ClipboardCheck,
    duration: "15 min",
    skills: ["Skill mapping", "Proficiency score"],
    progress: 100,
    sectionId: "hero",
  },
  {
    id: "learning",
    label: "Learning",
    icon: BookOpen,
    duration: "4–8 weeks",
    skills: ["Roadmap", "Curated paths"],
    progress: 68,
    sectionId: "features",
  },
  {
    id: "projects",
    label: "Projects",
    icon: Code2,
    duration: "2–4 weeks",
    skills: ["Portfolio", "GitHub"],
    progress: 45,
    sectionId: "how-it-works",
  },
  {
    id: "resume",
    label: "Resume",
    icon: FileText,
    duration: "1–2 days",
    skills: ["ATS-ready", "Gemma rewrite"],
    progress: 80,
    sectionId: "why-gemma",
  },
  {
    id: "interview",
    label: "Interview",
    icon: Mic,
    duration: "Ongoing",
    skills: ["Mock sessions", "Feedback"],
    progress: 55,
    sectionId: "testimonials",
  },
  {
    id: "internship",
    label: "Internship",
    icon: Briefcase,
    duration: "Goal",
    skills: ["Verified roles", "Scam filter"],
    progress: 30,
    sectionId: "cta",
  },
];

/** Smooth vertical S-curve through milestone anchor points */
export const ROUTE_PATH_D =
  "M 168 36 C 168 68, 208 88, 168 118 C 128 148, 168 178, 168 208 C 208 238, 128 268, 168 298 C 208 328, 128 358, 168 388 C 208 418, 168 448, 168 478";

export const MILESTONE_ANCHORS = [
  { x: 168, y: 36 },
  { x: 168, y: 118 },
  { x: 168, y: 208 },
  { x: 168, y: 298 },
  { x: 168, y: 388 },
  { x: 168, y: 478 },
];
