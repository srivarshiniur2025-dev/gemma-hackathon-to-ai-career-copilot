"use client";

import { Bar, BarChart, ResponsiveContainer } from "recharts";

export function ProductivityBarChart({ data }: { data: { hours: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <Bar dataKey="hours" fill="#0D9488" radius={[6, 6, 0, 0]} animationDuration={900} />
      </BarChart>
    </ResponsiveContainer>
  );
}
