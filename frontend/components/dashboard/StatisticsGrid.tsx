"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CountUp } from "@/components/dashboard/CountUp";
import { useAuth } from "@/contexts/AuthContext";
import { useCareerProfile } from "@/contexts/CareerProfileContext";
import { experienceForProfile } from "@/lib/learner-track";
import { useSchoolInsights } from "@/lib/school/insights";
import { loadMockProgress, mockStats } from "@/lib/neet/progress";

const TINTS = [
  "bg-accent/10 text-accent-hover",
  "bg-primary text-white",
  "bg-background-secondary text-foreground-heading",
  "bg-accent text-white",
];

export function StatisticsGrid() {
  const { career, profile } = useCareerProfile();
  const { user } = useAuth();
  const exp = experienceForProfile(profile);
  const school = useSchoolInsights(user?.email ?? undefined, profile?.onboarding_answers, exp === "school");
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
            { label: "Quizzes taken", value: school?.quizzesTaken ?? 0 },
            { label: "Average accuracy", value: school?.accuracy ?? 0, suffix: "%" },
            { label: "Questions answered", value: school?.questionsAnswered ?? 0 },
            { label: "Flashcards reviewed", value: school?.board.flashcardsReviewed ?? 0 },
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
