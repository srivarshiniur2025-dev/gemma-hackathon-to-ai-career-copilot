"use client";

import { motion } from "framer-motion";
import { CountUp } from "@/components/dashboard/CountUp";
import { useCareerProfile } from "@/contexts/CareerProfileContext";

export function StatisticsGrid() {
  const { career } = useCareerProfile();

  const stats = [
    { label: "Completed Assessments", value: career.assessmentCount },
    { label: "Resume Versions", value: career.resumeVersions },
    { label: "Projects", value: career.projectCount },
    {
      label: "Interview Score",
      value: career.interviewScore ?? 0,
      suffix: career.interviewScore != null ? "%" : "",
    },
  ];

  return (
    <div className="mt-6">
      <h3 className="mb-3 text-sm font-semibold text-foreground-heading">Statistics</h3>
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-[18px] border border-border bg-white p-4 shadow-[0_1px_3px_rgba(24,24,27,0.04)]"
          >
            <p className="text-2xl font-extrabold text-foreground-heading">
              <CountUp value={stat.value} suffix={stat.suffix ?? ""} />
            </p>
            <p className="mt-1 text-xs text-muted">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
