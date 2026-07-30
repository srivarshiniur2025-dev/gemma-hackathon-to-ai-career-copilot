"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Logo } from "@/components/brand/Logo";
import { SkillsInsightsPanel } from "@/components/dashboard/SkillsInsightsPanel";
import { StatisticsGrid } from "@/components/dashboard/StatisticsGrid";
import { StreakCard } from "@/components/dashboard/StreakCard";

const MetricCardsGrid = dynamic(
  () => import("@/components/dashboard/MetricCards").then((m) => m.MetricCardsGrid),
  { ssr: false, loading: () => <div className="grid h-48 grid-cols-2 gap-3 animate-pulse rounded-[22px] bg-[#F4F4F5]" /> }
);
const ProductivityChart = dynamic(
  () => import("@/components/dashboard/ProductivityChart").then((m) => m.ProductivityChart),
  { ssr: false, loading: () => <div className="mt-6 h-36 animate-pulse rounded-[18px] bg-[#F4F4F5]" /> }
);

export function DashboardAnalyticsPanel() {
  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="order-2 flex w-full shrink-0 flex-col overflow-y-auto border-t border-border bg-[#FAFAFA] p-6 lg:order-1 lg:w-[340px] lg:border-t-0 lg:border-r xl:w-[380px]"
    >
      <Link href="/" className="mb-6 inline-flex">
        <Logo size="sm" showTagline={false} />
      </Link>

      <MetricCardsGrid />
      <StatisticsGrid />
      <StreakCard />
      <SkillsInsightsPanel />
      <ProductivityChart />
    </motion.aside>
  );
}
