"use client";

import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useCareerProfile } from "@/contexts/CareerProfileContext";
import { experienceForProfile } from "@/lib/learner-track";
import { useSchoolInsights, type SchoolInsights } from "@/lib/school/insights";
import { subjectLabel } from "@/lib/school/syllabus";
import { cn } from "@/lib/utils";

const NODE = ["#0D9488", "#14B8A6", "#18181B", "#52525B", "#0F766E"];

type Stage = { id: string; year: string; title: string; subtitle: string; status?: string };

function schoolPath(s: SchoolInsights): Stage[] {
  const units = new Map<string, SchoolInsights["chapters"]>();
  for (const c of s.chapters) {
    if (c.chapter.internalOnly) continue;
    units.set(c.chapter.unit, [...(units.get(c.chapter.unit) ?? []), c]);
  }
  let currentSet = false;
  return [...units.entries()].map(([unit, list]) => {
    const mastered = list.filter((c) => (c.mastery ?? 0) >= 80).length;
    const tested = list.filter((c) => c.mastery != null).length;
    const done = mastered === list.length;
    const isCurrent = !done && !currentSet;
    if (isCurrent) currentSet = true;
    return {
      id: unit,
      year: done ? "Mastered" : isCurrent ? "You are here" : tested ? "In progress" : "Up next",
      title: unit,
      subtitle: `${mastered}/${list.length} chapters mastered${tested > mastered ? ` · ${tested - mastered} need revision` : ""}`,
      status: isCurrent ? "current" : done ? "done" : "upcoming",
    };
  });
}

export function CareerPathCard() {
  const { career, profile } = useCareerProfile();
  const { user } = useAuth();
  const exp = experienceForProfile(profile);
  const school = useSchoolInsights(user?.email ?? undefined, profile?.onboarding_answers, exp === "school");
  const title =
    exp === "neet"
      ? "Runway"
      : exp === "school"
        ? school
          ? `Your Class ${school.pick.classLevel} ${subjectLabel(school.pick.subject)} path`
          : "Your syllabus path"
        : exp === "high_school"
          ? "After 12th"
          : "Career path";
  const stages: Stage[] = exp === "school" ? (school ? schoolPath(school) : []) : career.careerPath;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.12 }}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">{title}</p>
      <ol className="mt-5 space-y-0">
        {stages.map((stage, i) => (
          <li key={stage.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "mt-1 h-3 w-3 rounded-full ring-4",
                  stage.status === "current" ? "ring-accent/20" : "ring-transparent"
                )}
                style={{ backgroundColor: NODE[i % NODE.length] }}
              />
              {i < stages.length - 1 && (
                <span
                  className="w-0.5 flex-1"
                  style={{ backgroundColor: `${NODE[i % NODE.length]}33` }}
                />
              )}
            </div>
            <div className={cn("pb-6", i === stages.length - 1 && "pb-0")}>
              <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: NODE[i % NODE.length] }}>
                {stage.year}
              </p>
              <p className="mt-0.5 text-sm font-bold text-foreground-heading">{stage.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted">{stage.subtitle}</p>
            </div>
          </li>
        ))}
      </ol>
    </motion.section>
  );
}
