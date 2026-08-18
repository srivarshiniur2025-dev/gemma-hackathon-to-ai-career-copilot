"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCareerProfile } from "@/contexts/CareerProfileContext";
import { showsInternships } from "@/lib/learner-track";

export default function InternshipsGateLayout({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useCareerProfile();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!showsInternships(profile)) router.replace("/dashboard");
  }, [loading, profile, router]);

  if (loading || !showsInternships(profile)) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted">
        Internship search is available on the Developer track.
      </div>
    );
  }

  return children;
}
