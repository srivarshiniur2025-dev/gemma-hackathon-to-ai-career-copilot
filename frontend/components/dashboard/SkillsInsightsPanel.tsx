"use client";

import { Sparkles, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { useCareerProfile } from "@/contexts/CareerProfileContext";
import { cn } from "@/lib/utils";

export function SkillsInsightsPanel() {
  const { career } = useCareerProfile();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.28 }}
      className="mt-6"
    >
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground-heading">
        <TrendingUp className="h-4 w-4 text-accent" />
        Your skills
      </h3>
      <div className="space-y-2">
        {career.skillLevels.slice(0, 4).map((skill, i) => (
          <div key={skill.name} className="rounded-[16px] border border-border bg-white p-3">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-foreground-heading">{skill.name}</span>
              <span className="text-xs text-muted">{skill.label}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-background-secondary">
              <motion.div
                className="h-full rounded-full bg-accent"
                initial={{ width: 0 }}
                animate={{ width: `${skill.level}%` }}
                transition={{ duration: 0.8, delay: 0.2 + i * 0.06 }}
              />
            </div>
          </div>
        ))}
      </div>

      <h3 className="mb-3 mt-5 flex items-center gap-2 text-sm font-semibold text-foreground-heading">
        <Sparkles className="h-4 w-4 text-accent" />
        Gemma recommends
      </h3>
      <div className="flex flex-wrap gap-2">
        {career.recommendedSkills.map((skill, i) => (
          <motion.span
            key={skill}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35 + i * 0.04 }}
            className={cn(
              "rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-xs font-medium text-accent"
            )}
          >
            {skill}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
}
