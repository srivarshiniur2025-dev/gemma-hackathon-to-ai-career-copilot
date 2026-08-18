"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { SkillRunner } from "@/components/assessment/SkillRunner";
import { useCareerProfile } from "@/contexts/CareerProfileContext";
import { showsExamMocks } from "@/lib/learner-track";

export default function SkillTestPage() {
  const params = useParams<{ testId: string }>();
  const { profile, loading } = useCareerProfile();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (showsExamMocks(profile)) router.replace("/mocks");
  }, [loading, profile, router]);

  if (showsExamMocks(profile)) return null;
  return <SkillRunner testId={params.testId} />;
}
