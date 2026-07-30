"use client";

import { Flame } from "lucide-react";
import { motion } from "framer-motion";
import { useCareerProfile } from "@/contexts/CareerProfileContext";

export function StreakCard() {
  const { career } = useCareerProfile();
  const { count, longestStreak } = career.streak;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.22 }}
      className="mt-6 overflow-hidden rounded-[22px] border border-border bg-gradient-to-br from-[#18181B] to-[#27272A] p-5 text-white shadow-[0_4px_20px_rgba(24,24,27,0.12)]"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-white/70">Learning streak</p>
          <p className="mt-1 flex items-center gap-2 text-3xl font-extrabold tracking-tight">
            <Flame className="h-7 w-7 text-orange-400" />
            {count}
            <span className="text-base font-semibold text-white/80">days</span>
          </p>
          <p className="mt-1 text-xs text-white/60">Best: {longestStreak} days</p>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <motion.span
              key={i}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              className={`h-10 w-2 origin-bottom rounded-full ${
                i < Math.min(count, 7) ? "bg-accent" : "bg-white/15"
              }`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
