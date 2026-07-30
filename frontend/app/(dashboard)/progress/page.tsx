"use client";

import { Award, TrendingUp } from "lucide-react";
import { FadeIn } from "@/components/motion/FadeIn";
import { WeeklyGrowthChart, SkillRadarChart } from "@/components/charts/DashboardCharts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockAchievements, mockRadarData, mockWeeklyGrowth } from "@/lib/mock-data";

export default function ProgressPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <FadeIn>
        <h1 className="text-2xl font-extrabold">Progress & Achievements</h1>
        <p className="text-muted">Track your learning journey over time.</p>
      </FadeIn>

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Learning Hours", value: "74h" },
          { label: "Milestones", value: "5/7" },
          { label: "Skill Growth", value: "+27%" },
          { label: "Interview Avg", value: "82%" },
        ].map((s, i) => (
          <FadeIn key={s.label} delay={i * 0.05}>
            <Card><CardContent className="p-6"><p className="text-sm text-muted">{s.label}</p><p className="mt-1 text-2xl font-extrabold text-foreground-heading">{s.value}</p></CardContent></Card>
          </FadeIn>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card><CardHeader><CardTitle>Skill Growth</CardTitle></CardHeader><CardContent><SkillRadarChart data={mockRadarData} /></CardContent></Card>
        <Card><CardHeader><CardTitle>Weekly Activity</CardTitle></CardHeader><CardContent><WeeklyGrowthChart data={mockWeeklyGrowth} /></CardContent></Card>
      </div>

      <FadeIn>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Award className="h-5 w-5 text-accent" /> Achievements & Badges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {mockAchievements.map((a) => (
                <div key={a.title} className={`flex items-start gap-3 rounded-[14px] border p-4 ${a.earned ? "border-accent/20 bg-accent/5" : "border-border opacity-60"}`}>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${a.earned ? "bg-primary text-white" : "bg-background-secondary"}`}>
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm">{a.title}</p>
                      {a.earned && <Badge>Earned</Badge>}
                    </div>
                    <p className="text-xs text-muted mt-1">{a.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
