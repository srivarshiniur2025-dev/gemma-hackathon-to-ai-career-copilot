"use client";

import { AssessmentSection } from "@/components/landing/sections/AssessmentSection";
import { RoadmapSection } from "@/components/landing/sections/RoadmapSection";
import { ProjectsSection } from "@/components/landing/sections/ProjectsSection";
import { ResumeSection } from "@/components/landing/sections/ResumeSection";
import { InterviewSection } from "@/components/landing/sections/InterviewSection";
import { InternshipSection } from "@/components/landing/sections/InternshipSection";
import { DashboardSection } from "@/components/landing/sections/DashboardSection";
import { SuccessSection } from "@/components/landing/sections/SuccessSection";
import { JOURNEY_MILESTONES } from "@/lib/journey-milestones";

function getMilestone(id: string) {
  const m = JOURNEY_MILESTONES.find((x) => x.id === id);
  if (!m) throw new Error(`Missing milestone: ${id}`);
  return m;
}

export function JourneySections() {
  return (
    <div className="relative z-10">
      <AssessmentSection milestone={getMilestone("assessment")} />
      <RoadmapSection milestone={getMilestone("skills")} />
      <ProjectsSection milestone={getMilestone("projects")} />
      <ResumeSection milestone={getMilestone("resume")} />
      <InterviewSection milestone={getMilestone("interview")} />
      <InternshipSection milestone={getMilestone("internship")} />
      <DashboardSection milestone={getMilestone("dashboard")} />
      <SuccessSection milestone={getMilestone("success")} />
    </div>
  );
}
