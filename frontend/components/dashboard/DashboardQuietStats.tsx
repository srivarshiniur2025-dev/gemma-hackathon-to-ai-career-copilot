"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CountUp } from "@/components/dashboard/CountUp";
import { useCareerProfile } from "@/contexts/CareerProfileContext";
import { NAVIGATOR_INDEX_LABEL } from "@/lib/gemma";
import { experienceForProfile } from "@/lib/learner-track";
import { loadMockProgress, mockStats } from "@/lib/neet/progress";

export function DashboardQuietStats() {
  const { career, skillScore, profile } = useCareerProfile();
  const exp = experienceForProfile(profile);
  const [mocksDone, setMocksDone] = useState(0);

  useEffect(() => {
    setMocksDone(mockStats(loadMockProgress()).completed);
  }, [career.assessmentCount]);

  const stats =
    exp === "developer"
      ? [
          { label: NAVIGATOR_INDEX_LABEL, value: skillScore, suffix: "%" },
          { label: "Streak", value: career.streak.count, suffix: "d" },
          { label: "Roadmap", value: career.roadmapDaysRemaining, suffix: "d" },
        ]
      : exp === "school"
        ? [
            { label: "Confidence", value: skillScore, suffix: "%" },
            { label: "Streak", value: career.streak.count, suffix: "d" },
            { label: "Chapters", value: mocksDone, suffix: "" },
          ]
        : [
            { label: "Readiness", value: skillScore, suffix: "%" },
            { label: "Streak", value: career.streak.count, suffix: "d" },
            { label: "Mocks done", value: mocksDone, suffix: "" },
          ];

  return (
    <div className="grid grid-cols-3 gap-6 border-y border-border py-6">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 * i }}
        >
          <p className="font-heading text-2xl font-bold tracking-tight text-foreground-heading sm:text-3xl">
            <CountUp value={stat.value} suffix={stat.suffix} />
          </p>
          <p className="mt-1 text-xs text-muted">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  );
}
