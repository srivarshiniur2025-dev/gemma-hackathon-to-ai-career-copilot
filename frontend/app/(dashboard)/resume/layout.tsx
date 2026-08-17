"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCareerProfile } from "@/contexts/CareerProfileContext";
import { showsResumeBuilder } from "@/lib/learner-track";

export default function ResumeGateLayout({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useCareerProfile();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!showsResumeBuilder(profile)) router.replace("/dashboard");
  }, [loading, profile, router]);

  if (loading || !showsResumeBuilder(profile)) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted">
        Resume Builder is available on the Developer track.
      </div>
    );
  }

  return children;
}
