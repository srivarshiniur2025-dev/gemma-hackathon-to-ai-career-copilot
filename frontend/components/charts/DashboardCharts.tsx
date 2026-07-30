"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const CHART = {
  grid: "#E4E4E7",
  tick: "#71717A",
  primary: "#0D9488",
  secondary: "#14B8A6",
  border: "#E4E4E7",
};

export function SkillRadarChart({ data }: { data: { skill: string; score: number; fullMark: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={data}>
        <PolarGrid stroke={CHART.grid} />
        <PolarAngleAxis dataKey="skill" tick={{ fill: CHART.tick, fontSize: 12 }} />
        <Radar name="Score" dataKey="score" stroke={CHART.primary} fill={CHART.primary} fillOpacity={0.15} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

export function WeeklyGrowthChart({ data }: { data: { week: string; hours: number; score: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} />
        <XAxis dataKey="week" tick={{ fill: CHART.tick, fontSize: 12 }} />
        <YAxis tick={{ fill: CHART.tick, fontSize: 12 }} />
        <Tooltip contentStyle={{ borderRadius: 14, border: `1px solid ${CHART.border}` }} />
        <Line type="monotone" dataKey="score" stroke={CHART.primary} strokeWidth={2} dot={{ fill: CHART.primary }} />
        <Line
          type="monotone"
          dataKey="hours"
          stroke={CHART.secondary}
          strokeWidth={2}
          strokeDasharray="4 4"
          dot={{ fill: CHART.secondary }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function ProgressBarChart({ data }: { data: Record<string, number> }) {
  const chartData = Object.entries(data).map(([name, value]) => ({ name, value }));
  return (
    <div className="space-y-3">
      {chartData.map(({ name, value }) => (
        <div key={name}>
          <div className="mb-1 flex justify-between text-sm">
            <span className="font-medium text-foreground-heading">{name}</span>
            <span className="text-muted">{value}%</span>
          </div>
          <div className="h-2 rounded-full bg-background-secondary">
            <div className="h-2 rounded-full bg-accent transition-all duration-700" style={{ width: `${value}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
