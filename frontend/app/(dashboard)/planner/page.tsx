"use client";

import { CalendarDays, Plus } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { FadeIn } from "@/components/motion/FadeIn";
import { PlannerCopilot } from "@/components/planner/PlannerCopilot";
import { useCareerProfile } from "@/contexts/CareerProfileContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TimelineEvent } from "@/lib/dashboard-data";
import { weeklyTimelineEvents } from "@/lib/dashboard-data";

const PRESET_COLORS = [
  { color: "#2563EB", dotColor: "#2563EB", bgColor: "#EFF6FF" },
  { color: "#FB923C", dotColor: "#FB923C", bgColor: "#FFF7ED" },
  { color: "#10B981", dotColor: "#10B981", bgColor: "#ECFDF5" },
  { color: "#8B5CF6", dotColor: "#8B5CF6", bgColor: "#F5F3FF" },
];

export default function PlannerPage() {
  const { career, updatePlanner, displayName } = useCareerProfile();

  function resetToDefault() {
    updatePlanner([...weeklyTimelineEvents]);
  }

  function addStudyBlock() {
    const palette = PRESET_COLORS[career.plannerEvents.length % PRESET_COLORS.length];
    const newEvent: TimelineEvent = {
      id: `custom-${Date.now()}`,
      title: "Gemma study block",
      startTime: "2:00",
      endTime: "3:00",
      startHour: 14,
      durationHours: 1,
      ...palette,
    };
    updatePlanner([...career.plannerEvents, newEvent]);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <FadeIn>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-foreground-heading">Career Planner</h1>
            <p className="mt-1 text-muted">
              Personalized weekly plan for {displayName.split(" ")[0]} — synced with your dashboard timeline.
            </p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" className="rounded-xl cursor-pointer">
              View dashboard
            </Button>
          </Link>
        </div>
      </FadeIn>

      <FadeIn delay={0.05}>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CalendarDays className="h-5 w-5 text-accent" />
              This week
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={resetToDefault} className="cursor-pointer rounded-xl">
                Reset
              </Button>
              <Button size="sm" onClick={addStudyBlock} className="gap-1 cursor-pointer rounded-xl bg-accent hover:bg-accent-hover">
                <Plus className="h-4 w-4" />
                Add block
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {career.plannerEvents.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between rounded-[18px] border border-border px-4 py-3"
                style={{ backgroundColor: event.bgColor }}
              >
                <div>
                  <p className="font-semibold text-sm text-foreground-heading">{event.title}</p>
                  <p className="text-xs text-muted">
                    {event.startTime} – {event.endTime}
                  </p>
                </div>
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: event.dotColor }}
                />
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </FadeIn>

      <FadeIn delay={0.08}>
        <PlannerCopilot />
      </FadeIn>

      <FadeIn delay={0.1}>
        <Card className="border-dashed border-accent/30 bg-accent/5">
          <CardContent className="p-5 text-sm text-muted">
            Chat with Gemma about free time and difficulties. Confirm a plan to add those blocks here and on the dashboard timeline.
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
