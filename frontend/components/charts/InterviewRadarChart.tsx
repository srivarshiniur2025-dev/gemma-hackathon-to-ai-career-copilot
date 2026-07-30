"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";

const CHART = {
  grid: "#E4E4E7",
  tick: "#71717A",
  primary: "#0D9488",
};

export function InterviewRadarChart({
  data,
}: {
  data: { metric: string; score: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <RadarChart data={data}>
        <PolarGrid stroke={CHART.grid} />
        <PolarAngleAxis dataKey="metric" tick={{ fill: CHART.tick, fontSize: 12 }} />
        <Radar dataKey="score" stroke={CHART.primary} fill={CHART.primary} fillOpacity={0.15} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
