"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { GEMMA_FULL_LABEL } from "@/lib/gemma";
import { FadeIn } from "@/components/motion/FadeIn";
import { GemmaBadge, GemmaBanner } from "@/components/gemma/GemmaBrand";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SkillRadarChart, WeeklyGrowthChart } from "@/components/charts/DashboardCharts";
import { mockDashboardStats, mockRadarData, mockWeeklyGrowth } from "@/lib/mock-data";

const statCards = [
  { label: "Current Skill Score", value: `${mockDashboardStats.skillScore}%`, href: "/assessment" },
  { label: "Learning Progress", value: `${mockDashboardStats.learningProgress}%`, href: "/roadmap" },
  { label: "Internships Matched", value: String(mockDashboardStats.internshipsMatched), href: "/internships" },
  { label: "Resume ATS Score", value: `${mockDashboardStats.resumeAtsScore}%`, href: "/resume" },
];

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <FadeIn>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-muted-secondary flex items-center gap-1">
              <Sparkles className="h-4 w-4 text-accent" /> {GEMMA_FULL_LABEL}
            </p>
            <h1 className="mt-1 text-2xl font-extrabold md:text-3xl text-foreground-heading">Career Dashboard</h1>
            <p className="mt-1 text-muted">Your progress at a glance.</p>
          </div>
          <Link href="/assessment"><Button className="gap-2">Continue Assessment <ArrowRight className="h-4 w-4" /></Button></Link>
        </div>
      </FadeIn>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((s, i) => (
          <FadeIn key={s.label} delay={i * 0.05}>
            <Link href={s.href}>
              <Card className="transition-shadow hover:card-shadow-lg cursor-pointer">
                <CardContent className="p-6">
                  <p className="text-sm text-muted">{s.label}</p>
                  <p className="mt-2 text-3xl font-extrabold text-foreground-heading">{s.value}</p>
                </CardContent>
              </Card>
            </Link>
          </FadeIn>
        ))}
      </div>

      <FadeIn delay={0.2}>
        <GemmaBanner />
      </FadeIn>

      <div className="grid gap-6 lg:grid-cols-2">
        <FadeIn delay={0.1}>
          <Card>
            <CardHeader><CardTitle>Skill Radar · Gemma assessed</CardTitle></CardHeader>
            <CardContent><SkillRadarChart data={mockRadarData} /></CardContent>
          </Card>
        </FadeIn>
        <FadeIn delay={0.15}>
          <Card>
            <CardHeader><CardTitle>Weekly Growth</CardTitle></CardHeader>
            <CardContent><WeeklyGrowthChart data={mockWeeklyGrowth} /></CardContent>
          </Card>
        </FadeIn>
      </div>
    </div>
  );
}
