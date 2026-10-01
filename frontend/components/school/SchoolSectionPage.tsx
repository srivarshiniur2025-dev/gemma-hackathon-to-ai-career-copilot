"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCareerProfile } from "@/contexts/CareerProfileContext";
import { experienceForProfile } from "@/lib/learner-track";
import { SchoolPractice, type PracticeSection } from "./SchoolPractice";

export function SchoolSectionPage({ section }: { section: PracticeSection }) {
  const { profile, loading } = useCareerProfile();
  const router = useRouter();
  const isSchool = experienceForProfile(profile) === "school";

  useEffect(() => {
    if (!loading && !isSchool) router.replace("/dashboard");
  }, [loading, isSchool, router]);

  if (loading || !isSchool) {
    return <div className="h-40 animate-pulse rounded-[24px] bg-background-secondary" />;
  }
  return <SchoolPractice section={section} />;
}
