"use client";

import { ArrowRight, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { useCareerProfile } from "@/contexts/CareerProfileContext";
import { cn } from "@/lib/utils";

export function CareerPathCard() {
  const { career, displayName } = useCareerProfile();

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.12 }}
      className="mx-4 mb-4 rounded-[22px] border border-border bg-[#FAFAFA] p-5 sm:mx-6"
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-foreground-heading">Predicted career path</h2>
          <p className="text-xs text-muted">
            Gemma forecast for {displayName.split(" ")[0]} · {career.targetRole}
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-medium text-accent shadow-sm">
          <MapPin className="h-3 w-3" />
          AI forecast
        </span>
      </div>

      <div className="relative flex flex-col gap-0 sm:flex-row sm:items-stretch sm:gap-0">
        {career.careerPath.map((stage, i) => (
          <div key={stage.id} className="relative flex flex-1 flex-col items-center sm:flex-row">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.08 }}
              className={cn(
                "w-full rounded-[18px] border p-4 text-center sm:text-left",
                stage.status === "current"
                  ? "border-accent/30 bg-white shadow-[0_2px_12px_rgba(13,148,136,0.08)]"
                  : "border-border/80 bg-white/80"
              )}
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-accent">
                {stage.year}
              </p>
              <p className="mt-1 text-sm font-bold text-foreground-heading">{stage.title}</p>
              <p className="mt-0.5 text-xs text-muted">{stage.subtitle}</p>
            </motion.div>
            {i < career.careerPath.length - 1 && (
              <ArrowRight className="my-2 h-4 w-4 shrink-0 rotate-90 text-muted sm:mx-1 sm:rotate-0" />
            )}
          </div>
        ))}
      </div>
    </motion.section>
  );
}
