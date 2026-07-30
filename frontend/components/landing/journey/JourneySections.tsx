"use client";

import dynamic from "next/dynamic";
import { LazySection } from "@/components/landing/journey/LazySection";
import { JOURNEY_MILESTONES } from "@/lib/journey-milestones";

const AssessmentSection = dynamic(() =>
  import("@/components/landing/sections/AssessmentSection").then((m) => ({
    default: m.AssessmentSection,
  }))
);
const RoadmapSection = dynamic(() =>
  import("@/components/landing/sections/RoadmapSection").then((m) => ({
    default: m.RoadmapSection,
  }))
);
const ProjectsSection = dynamic(() =>
  import("@/components/landing/sections/ProjectsSection").then((m) => ({
    default: m.ProjectsSection,
  }))
);
const ResumeSection = dynamic(() =>
  import("@/components/landing/sections/ResumeSection").then((m) => ({
    default: m.ResumeSection,
  }))
);
const InterviewSection = dynamic(() =>
  import("@/components/landing/sections/InterviewSection").then((m) => ({
    default: m.InterviewSection,
  }))
);
const InternshipSection = dynamic(() =>
  import("@/components/landing/sections/InternshipSection").then((m) => ({
    default: m.InternshipSection,
  }))
);
const DashboardSection = dynamic(() =>
  import("@/components/landing/sections/DashboardSection").then((m) => ({
    default: m.DashboardSection,
  }))
);
const SuccessSection = dynamic(() =>
  import("@/components/landing/sections/SuccessSection").then((m) => ({
    default: m.SuccessSection,
  }))
);

function getMilestone(id: string) {
  const m = JOURNEY_MILESTONES.find((x) => x.id === id);
  if (!m) throw new Error(`Missing milestone: ${id}`);
  return m;
}

export function JourneySections() {
  return (
    <div className="relative z-10">
      <LazySection minHeight="100vh">
        <AssessmentSection milestone={getMilestone("assessment")} />
      </LazySection>
      <LazySection minHeight="100vh">
        <RoadmapSection milestone={getMilestone("skills")} />
      </LazySection>
      <LazySection minHeight="100vh">
        <ProjectsSection milestone={getMilestone("projects")} />
      </LazySection>
      <LazySection minHeight="100vh">
        <ResumeSection milestone={getMilestone("resume")} />
      </LazySection>
      <LazySection minHeight="100vh">
        <InterviewSection milestone={getMilestone("interview")} />
      </LazySection>
      <LazySection minHeight="100vh">
        <InternshipSection milestone={getMilestone("internship")} />
      </LazySection>
      <LazySection minHeight="100vh">
        <DashboardSection milestone={getMilestone("dashboard")} />
      </LazySection>
      <LazySection minHeight="80vh">
        <SuccessSection milestone={getMilestone("success")} />
      </LazySection>
    </div>
  );
}
