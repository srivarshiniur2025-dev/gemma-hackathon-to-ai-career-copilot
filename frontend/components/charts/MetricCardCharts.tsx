"use client";

import {
  Area,
  AreaChart,
  Line,
  LineChart,
  ResponsiveContainer,
} from "recharts";

export function SparklineChart({ data }: { data: { v: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <Line
          type="monotone"
          dataKey="v"
          stroke="rgba(255,255,255,0.9)"
          strokeWidth={2}
          dot={false}
          animationDuration={1200}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function RoadmapAreaChart({ data }: { data: { progress: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <Area
          type="monotone"
          dataKey="progress"
          stroke="rgba(255,255,255,0.9)"
          fill="rgba(255,255,255,0.15)"
          strokeWidth={2}
          animationDuration={1200}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
