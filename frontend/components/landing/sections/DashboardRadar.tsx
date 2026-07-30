"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";

type RadarPoint = { skill: string; value: number };

export function DashboardRadar({ data }: { data: RadarPoint[] }) {
  return (
    <div className="h-[140px] w-[160px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke="#E4E4E7" />
          <PolarAngleAxis dataKey="skill" tick={{ fontSize: 9, fill: "#A1A1AA" }} />
          <Radar
            dataKey="value"
            stroke="#0D9488"
            fill="#0D9488"
            fillOpacity={0.2}
            strokeWidth={1.5}
            isAnimationActive
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
