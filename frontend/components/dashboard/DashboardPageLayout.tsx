"use client";

import { motion } from "framer-motion";
import { CareerPathCard } from "@/components/dashboard/CareerPathCard";
import { DashboardAnalyticsPanel } from "@/components/dashboard/DashboardAnalyticsPanel";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";
import { DashboardProfileHeader } from "@/components/dashboard/DashboardProfileHeader";
import { LearningTimeline } from "@/components/dashboard/LearningTimeline";

export function DashboardPageLayout() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex h-full min-h-[calc(100vh-24px)] flex-col overflow-hidden rounded-[28px] border border-border bg-[#FAFAFA] shadow-[0_2px_12px_rgba(24,24,27,0.04)] lg:flex-row md:min-h-[calc(100vh-32px)]"
    >
      <div className="flex min-h-0 flex-1 flex-col-reverse lg:flex-row">
        <DashboardAnalyticsPanel />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-white order-1 lg:order-2">
          <DashboardNavbar />
          <DashboardProfileHeader />
          <CareerPathCard />
          <LearningTimeline />
        </div>
      </div>
    </motion.div>
  );
}
