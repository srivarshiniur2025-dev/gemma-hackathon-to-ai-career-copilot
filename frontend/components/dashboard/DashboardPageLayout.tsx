"use client";

import { motion } from "framer-motion";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";
import { DashboardWeekFocus } from "@/components/dashboard/DashboardWeekFocus";
import { CareerPathCard } from "@/components/dashboard/CareerPathCard";
import { SkillsInsightsPanel } from "@/components/dashboard/SkillsInsightsPanel";
import { TrackHero } from "@/components/dashboard/TrackHero";
import { MetricCardsGrid } from "@/components/dashboard/MetricCards";
import { StreakCard } from "@/components/dashboard/StreakCard";
import { StatisticsGrid } from "@/components/dashboard/StatisticsGrid";
import { ProductivityChart } from "@/components/dashboard/ProductivityChart";

export function DashboardPageLayout() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex h-full min-h-[calc(100vh-24px)] flex-col overflow-hidden rounded-[28px] border border-border bg-[#F7F8FC] shadow-[0_2px_12px_rgba(24,24,27,0.04)] md:min-h-[calc(100vh-32px)]"
    >
      <DashboardNavbar />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl space-y-6 px-5 py-6 sm:px-7 sm:py-8">
          <TrackHero />
          <MetricCardsGrid />
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-[24px] border border-white bg-white p-5 shadow-[0_8px_28px_rgba(24,24,27,0.05)] sm:p-6">
              <DashboardWeekFocus />
            </div>
            <div className="space-y-4">
              <StreakCard />
              <StatisticsGrid />
            </div>
          </div>
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[24px] border border-white bg-white p-5 shadow-[0_8px_28px_rgba(24,24,27,0.05)] sm:p-6">
              <CareerPathCard />
            </div>
            <div className="space-y-4">
              <div className="rounded-[24px] border border-white bg-white p-5 shadow-[0_8px_28px_rgba(24,24,27,0.05)] sm:p-6">
                <SkillsInsightsPanel />
              </div>
              <ProductivityChart />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
