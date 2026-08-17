"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCareerProfile } from "@/contexts/CareerProfileContext";
import { showsMockInterviews } from "@/lib/learner-track";

export default function InterviewGateLayout({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useCareerProfile();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!showsMockInterviews(profile)) router.replace("/dashboard");
  }, [loading, profile, router]);

  if (loading || !showsMockInterviews(profile)) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted">
        Mock interviews are available on the Developer track.
      </div>
    );
  }

  return children;
}
