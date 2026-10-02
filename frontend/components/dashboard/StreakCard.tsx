"use client";

import { Flame } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useCareerProfile } from "@/contexts/CareerProfileContext";
import { experienceForProfile } from "@/lib/learner-track";
import { useSchoolInsights } from "@/lib/school/insights";

export function StreakCard() {
  const { career, profile } = useCareerProfile();
  const { user } = useAuth();
  const isSchool = experienceForProfile(profile) === "school";
  const school = useSchoolInsights(user?.email ?? undefined, profile?.onboarding_answers, isSchool);

  const count = isSchool ? school?.streak ?? 0 : career.streak.count;
  const longestStreak = isSchool ? school?.longestStreak ?? 0 : career.streak.longestStreak;
  const week = isSchool && school ? school.last7Active : Array.from({ length: 7 }, (_, i) => i >= 7 - Math.min(count, 7));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.22 }}
      className="overflow-hidden rounded-[22px] bg-gradient-to-br from-[#18181B] via-[#27272A] to-[#134E4A] p-5 text-white shadow-[0_8px_28px_rgba(24,24,27,0.16)]"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-white/70">Learning streak</p>
          <p className="mt-1 flex items-center gap-2 text-3xl font-extrabold tracking-tight">
            <Flame className="h-7 w-7 text-accent-light" />
            {count}
            <span className="text-base font-semibold text-white/80">day{count === 1 ? "" : "s"}</span>
          </p>
          <p className="mt-1 text-xs text-white/60">
            {count === 0 && isSchool ? "Practise today to start a streak" : `Best: ${longestStreak} days`}
          </p>
        </div>
        <div className="flex gap-1" aria-label="Activity in the last 7 days">
          {week.map((active, i) => (
            <motion.span
              key={i}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              className={`h-10 w-2 origin-bottom rounded-full ${active ? "bg-accent" : "bg-white/15"}`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
