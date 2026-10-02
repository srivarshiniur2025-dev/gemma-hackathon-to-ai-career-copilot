"use client";

import { motion } from "framer-motion";
import { SchoolDashboard } from "@/components/dashboard/SchoolDashboard";
import { TrackDashboard } from "@/components/dashboard/TrackDashboard";
import { useCareerProfile } from "@/contexts/CareerProfileContext";
import { experienceForProfile } from "@/lib/learner-track";

export function DashboardPageLayout() {
  const { profile } = useCareerProfile();
  const exp = experienceForProfile(profile);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex h-full min-h-[calc(100vh-24px)] flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#071012] shadow-[0_2px_24px_rgba(0,0,0,0.25)] md:min-h-[calc(100vh-32px)]"
    >
      <div className="min-h-0 flex-1 overflow-y-auto">
        {exp === "school" ? <SchoolDashboard /> : <TrackDashboard key={exp} track={exp} />}
      </div>
    </motion.div>
  );
}
