"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useCareerProfile } from "@/contexts/CareerProfileContext";

const ProductivityBarChart = dynamic(
  () => import("@/components/charts/ProductivityBarChart").then((m) => m.ProductivityBarChart),
  { ssr: false, loading: () => <div className="h-full w-full animate-pulse rounded bg-[#F4F4F5]" /> }
);

export function ProductivityChart() {
  const { career } = useCareerProfile();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.32 }}
      className="mt-6 rounded-[18px] border border-border bg-white p-4"
    >
      <p className="mb-3 text-xs font-semibold text-foreground-heading">Weekly productivity</p>
      <div className="h-24 w-full">
        <ProductivityBarChart data={career.weeklyActivity} />
      </div>
    </motion.div>
  );
}
