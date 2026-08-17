"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CountUp } from "@/components/dashboard/CountUp";
import { useCareerProfile } from "@/contexts/CareerProfileContext";
import { experienceForProfile } from "@/lib/learner-track";
import { loadMockProgress, mockStats } from "@/lib/neet/progress";

const TINTS = [
  "bg-[#ECFDF5] text-[#047857]",
  "bg-[#EFF6FF] text-[#1D4ED8]",
  "bg-[#FFFBEB] text-[#B45309]",
  "bg-[#F5F3FF] text-[#6D28D9]",
];

export function StatisticsGrid() {
  const { career, profile } = useCareerProfile();
  const exp = experienceForProfile(profile);
  const [mocksDone, setMocksDone] = useState(0);
  const [avg, setAvg] = useState(0);

  useEffect(() => {
    const stats = mockStats(loadMockProgress());
    setMocksDone(stats.completed);
    setAvg(stats.avg);
  }, [career.assessmentCount]);

  const stats =
    exp === "developer"
      ? [
          { label: "Assessments", value: career.assessmentCount },
          { label: "Resume versions", value: career.resumeVersions },
          { label: "Projects", value: career.projectCount },
          {
            label: "Interview score",
            value: career.interviewScore ?? 0,
            suffix: career.interviewScore != null ? "%" : "",
          },
        ]
      : exp === "school"
        ? [
            { label: "Chapter quizzes", value: mocksDone },
            { label: "Average score", value: avg, suffix: "%" },
            { label: "Streak days", value: career.streak.count },
            { label: "Plan weeks", value: Math.max(1, Math.round(career.roadmapDaysRemaining / 7)) },
          ]
        : [
            { label: "Mocks completed", value: mocksDone },
            { label: "Average score", value: avg, suffix: "%" },
            { label: "Study streak", value: career.streak.count },
            { label: "Assessments", value: career.assessmentCount },
          ];

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-foreground-heading">Statistics</h3>
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
            className={`rounded-[18px] p-4 ${TINTS[i]}`}
          >
            <p className="text-2xl font-extrabold">
              <CountUp value={stat.value} suffix={stat.suffix ?? ""} />
            </p>
            <p className="mt-1 text-xs opacity-80">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
