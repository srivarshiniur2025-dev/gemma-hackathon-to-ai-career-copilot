"use client";

import { Award, Flame, TrendingUp } from "lucide-react";
import { FadeIn } from "@/components/motion/FadeIn";
import { WeeklyGrowthChart, SkillRadarChart } from "@/components/charts/DashboardCharts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCareerProfile } from "@/contexts/CareerProfileContext";

export default function ProgressPage() {
  const { career, skillScore } = useCareerProfile();

  const radarData = career.skillLevels.map((s) => ({
    skill: s.name.length > 10 ? `${s.name.slice(0, 9)}…` : s.name,
    score: s.level,
    fullMark: 100,
  }));

  const weeklyData = career.weeklyActivity.map((d) => ({
    week: d.day,
    hours: d.hours,
    score: Math.min(100, Math.round(d.hours * 12 + skillScore * 0.3)),
  }));

  const totalHours = Math.round(career.weeklyActivity.reduce((s, d) => s + d.hours, 0));

  const achievements = [
    {
      title: "First Assessment",
      desc: "Complete your Gemma skill certification",
      earned: career.assessmentCount > 0,
    },
    {
      title: "7-Day Streak",
      desc: "Learn consistently for a week",
      earned: career.streak.longestStreak >= 7,
    },
    {
      title: "Resume Ready",
      desc: "Generate an ATS-optimized resume",
      earned: career.resumeVersions > 0,
    },
    {
      title: "Interview Pro",
      desc: "Score 80%+ on a mock interview",
      earned: (career.interviewScore ?? 0) >= 80,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <FadeIn>
        <h1 className="text-2xl font-extrabold text-foreground-heading">Progress & Achievements</h1>
        <p className="text-muted">Your personalized learning journey — powered by Gemma.</p>
      </FadeIn>

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Learning Hours", value: `${totalHours}h` },
          { label: "Skill Score", value: `${skillScore}%` },
          { label: "Day Streak", value: `${career.streak.count}` },
          {
            label: "Interview Avg",
            value: career.interviewScore != null ? `${career.interviewScore}%` : "—",
          },
        ].map((s, i) => (
          <FadeIn key={s.label} delay={i * 0.05}>
            <Card className="border-border/80 shadow-sm">
              <CardContent className="p-6">
                <p className="text-sm text-muted">{s.label}</p>
                <p className="mt-1 text-2xl font-extrabold text-foreground-heading">{s.value}</p>
              </CardContent>
            </Card>
          </FadeIn>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle>Skill radar</CardTitle>
          </CardHeader>
          <CardContent>
            {radarData.length > 2 ? (
              <SkillRadarChart data={radarData} />
            ) : (
              <p className="py-12 text-center text-sm text-muted">
                Complete an assessment to see your skill radar.
              </p>
            )}
          </CardContent>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle>Weekly activity</CardTitle>
          </CardHeader>
          <CardContent>
            <WeeklyGrowthChart data={weeklyData} />
          </CardContent>
        </Card>
      </div>

      <FadeIn>
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-accent" /> Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {achievements.map((a) => (
                <div
                  key={a.title}
                  className={`flex items-start gap-3 rounded-[14px] border p-4 ${
                    a.earned ? "border-accent/20 bg-accent/5" : "border-border opacity-60"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      a.earned ? "bg-primary text-white" : "bg-background-secondary"
                    }`}
                  >
                    {a.earned ? (
                      <Flame className="h-5 w-5" />
                    ) : (
                      <TrendingUp className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{a.title}</p>
                      {a.earned && <Badge>Earned</Badge>}
                    </div>
                    <p className="mt-1 text-xs text-muted">{a.desc}</p>
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
