"use client";

import { motion } from "framer-motion";
import { useCareerProfile } from "@/contexts/CareerProfileContext";
import { experienceForProfile } from "@/lib/learner-track";
import { cn } from "@/lib/utils";

const NODE = ["#0D9488", "#2563EB", "#8B5CF6", "#F59E0B", "#EC4899"];

export function CareerPathCard() {
  const { career, profile } = useCareerProfile();
  const exp = experienceForProfile(profile);
  const title =
    exp === "neet"
      ? "Runway"
      : exp === "school"
        ? "Path"
        : exp === "high_school"
          ? "After 12th"
          : "Career path";

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.12 }}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">{title}</p>
      <ol className="mt-5 space-y-0">
        {career.careerPath.map((stage, i) => (
          <li key={stage.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "mt-1 h-3 w-3 rounded-full ring-4",
                  stage.status === "current" ? "ring-accent/20" : "ring-transparent"
                )}
                style={{ backgroundColor: NODE[i % NODE.length] }}
              />
              {i < career.careerPath.length - 1 && (
                <span
                  className="w-0.5 flex-1"
                  style={{ backgroundColor: `${NODE[i % NODE.length]}33` }}
                />
              )}
            </div>
            <div className={cn("pb-6", i === career.careerPath.length - 1 && "pb-0")}>
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
