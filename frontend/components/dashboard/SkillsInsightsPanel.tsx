"use client";

import { Sparkles, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { useCareerProfile } from "@/contexts/CareerProfileContext";
import { experienceForProfile } from "@/lib/learner-track";
import { cn } from "@/lib/utils";

const BAR_COLORS = ["#0D9488", "#2563EB", "#F59E0B", "#8B5CF6"];
const CHIP_COLORS = [
  "border-teal-200 bg-teal-50 text-teal-700",
  "border-blue-200 bg-blue-50 text-blue-700",
  "border-amber-200 bg-amber-50 text-amber-700",
  "border-violet-200 bg-violet-50 text-violet-700",
  "border-pink-200 bg-pink-50 text-pink-700",
];

export function SkillsInsightsPanel() {
  const { career, profile } = useCareerProfile();
  const exp = experienceForProfile(profile);
  const skillTitle = exp === "developer" ? "Your skills" : exp === "school" ? "Subject confidence" : "PCB grip";
  const recTitle = exp === "developer" ? "Gemma recommends" : "Today's attack list";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.28 }}
    >
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground-heading">
        <TrendingUp className="h-4 w-4 text-accent" />
        {skillTitle}
      </h3>
      <div className="space-y-3">
        {career.skillLevels.slice(0, 4).map((skill, i) => (
          <div key={skill.name}>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="font-medium text-foreground-heading">{skill.name}</span>
              <span className="text-xs font-semibold" style={{ color: BAR_COLORS[i] }}>
                {skill.label}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-background-secondary">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: BAR_COLORS[i] }}
                initial={{ width: 0 }}
                animate={{ width: `${skill.level}%` }}
                transition={{ duration: 0.8, delay: 0.2 + i * 0.06 }}
              />
            </div>
          </div>
        ))}
      </div>

      <h3 className="mb-3 mt-6 flex items-center gap-2 text-sm font-semibold text-foreground-heading">
        <Sparkles className="h-4 w-4 text-accent" />
        {recTitle}
      </h3>
      <div className="flex flex-wrap gap-2">
        {career.recommendedSkills.map((skill, i) => (
          <motion.span
            key={skill}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35 + i * 0.04 }}
            className={cn("rounded-full border px-3 py-1 text-xs font-medium", CHIP_COLORS[i % CHIP_COLORS.length])}
          >
            {skill}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
}
