"use client";

import Link from "next/link";
import { Sparkles, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useCareerProfile } from "@/contexts/CareerProfileContext";
import { experienceForProfile } from "@/lib/learner-track";
import { useSchoolInsights } from "@/lib/school/insights";
import { cn } from "@/lib/utils";

const BAR_COLORS = ["#0D9488", "#14B8A6", "#18181B", "#52525B"];
const CHIP_COLORS = [
  "border-accent/25 bg-accent/5 text-accent-hover",
  "border-border bg-background-secondary text-foreground-heading",
  "border-primary bg-primary text-white",
  "border-accent/25 bg-accent/5 text-accent-hover",
  "border-border bg-background-secondary text-foreground-heading",
];

type Bar = { name: string; level: number; label: string };
type Chip = { label: string; href?: string };

function masteryLabel(score: number) {
  if (score >= 80) return `Mastered · ${score}%`;
  if (score >= 50) return `Getting there · ${score}%`;
  return `Needs work · ${score}%`;
}

export function SkillsInsightsPanel() {
  const { career, profile } = useCareerProfile();
  const { user } = useAuth();
  const exp = experienceForProfile(profile);
  const school = useSchoolInsights(user?.email ?? undefined, profile?.onboarding_answers, exp === "school");

  let skillTitle = exp === "developer" ? "Your skills" : "PCB grip";
  let recTitle = exp === "developer" ? "Gemma recommends" : "Today's attack list";
  let bars: Bar[] = career.skillLevels.slice(0, 4);
  let chips: Chip[] = career.recommendedSkills.map((label) => ({ label }));
  let emptyNote: string | null = null;

  if (exp === "school") {
    skillTitle = "Chapter confidence";
    recTitle = "Your next moves";
    const tested = (school?.chapters ?? [])
      .filter((c) => c.mastery != null)
      .sort((a, b) => (a.mastery ?? 0) - (b.mastery ?? 0));
    bars = tested.slice(0, 4).map((c) => ({
      name: `Ch ${c.chapter.number}: ${c.chapter.name}`,
      level: c.mastery ?? 0,
      label: masteryLabel(c.mastery ?? 0),
    }));
    if (!bars.length) {
      bars = (school?.subjectSummary ?? []).map((s) => ({ name: s.label, level: s.level, label: s.note }));
      emptyNote = "Finish a chapter test and your weakest chapters will show up here.";
    }
    chips = (school?.chapters ?? [])
      .filter((c) => !c.chapter.internalOnly && (c.mastery == null || c.mastery < 80))
      .sort((a, b) => (a.mastery ?? 101) - (b.mastery ?? 101))
      .slice(0, 5)
      .map((c) => ({
        label: `${c.mastery == null ? "Try" : "Revise"} Ch ${c.chapter.number}: ${c.chapter.name}`,
        href: `/mocks?chapter=${c.chapter.id}`,
      }));
    if (!chips.length && school) chips = [{ label: "Every chapter mastered — try Quiz Blitz", href: "/activities" }];
  }

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
        {bars.map((skill, i) => (
          <div key={skill.name}>
            <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
              <span className="truncate font-medium text-foreground-heading">{skill.name}</span>
              <span className="shrink-0 text-xs font-semibold" style={{ color: BAR_COLORS[i] }}>
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
        {emptyNote && <p className="text-xs text-muted">{emptyNote}</p>}
      </div>

      <h3 className="mb-3 mt-6 flex items-center gap-2 text-sm font-semibold text-foreground-heading">
        <Sparkles className="h-4 w-4 text-accent" />
        {recTitle}
      </h3>
      <div className="flex flex-wrap gap-2">
        {chips.map((chip, i) => {
          const className = cn(
            "rounded-full border px-3 py-1 text-xs font-medium",
            CHIP_COLORS[i % CHIP_COLORS.length],
            chip.href && "transition-transform hover:-translate-y-0.5"
          );
          return (
            <motion.span
              key={chip.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35 + i * 0.04 }}
            >
              {chip.href ? (
                <Link href={chip.href} className={cn(className, "inline-block")}>
                  {chip.label}
                </Link>
              ) : (
                <span className={cn(className, "inline-block")}>{chip.label}</span>
              )}
            </motion.span>
          );
        })}
      </div>
    </motion.div>
  );
}
