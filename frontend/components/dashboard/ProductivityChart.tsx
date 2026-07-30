"use client";

import { Bar, BarChart, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { useCareerProfile } from "@/contexts/CareerProfileContext";

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
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={career.weeklyActivity}>
            <Bar dataKey="hours" fill="#0D9488" radius={[6, 6, 0, 0]} animationDuration={900} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
