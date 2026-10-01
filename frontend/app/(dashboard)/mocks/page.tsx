"use client";

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MockCatalog } from "@/components/mocks/MockCatalog";
import { SchoolPractice } from "@/components/school/SchoolPractice";
import { useCareerProfile } from "@/contexts/CareerProfileContext";
import { experienceForProfile, showsExamMocks } from "@/lib/learner-track";

function MocksInner() {
  const { profile, loading } = useCareerProfile();
  const router = useRouter();
  const exp = experienceForProfile(profile);

  useEffect(() => {
    if (loading) return;
    if (!showsExamMocks(profile)) router.replace("/assessment");
  }, [loading, profile, router]);

  if (!showsExamMocks(profile)) return null;
  if (exp === "school") return <SchoolPractice />;
  return <MockCatalog audience={exp === "neet" ? "neet" : "school"} experience={exp} />;
}

export default function MocksPage() {
  return (
    <Suspense fallback={<div className="h-40 animate-pulse rounded-[24px] bg-background-secondary" />}>
      <MocksInner />
    </Suspense>
  );
}
