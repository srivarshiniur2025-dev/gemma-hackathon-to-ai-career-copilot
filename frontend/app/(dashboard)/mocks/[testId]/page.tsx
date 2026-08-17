"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { MockRunner } from "@/components/mocks/MockRunner";
import { useCareerProfile } from "@/contexts/CareerProfileContext";
import { showsExamMocks } from "@/lib/learner-track";

export default function MockTestPage() {
  const params = useParams<{ testId: string }>();
  const { profile, loading } = useCareerProfile();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!showsExamMocks(profile)) router.replace("/assessment");
  }, [loading, profile, router]);

  if (!showsExamMocks(profile)) return null;
  return <MockRunner testId={params.testId} />;
}
