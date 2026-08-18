"use client";

import { FormEvent, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { FadeIn } from "@/components/motion/FadeIn";
import { MonthCalendar } from "@/components/calendar/MonthCalendar";
import { PlannerCopilot } from "@/components/planner/PlannerCopilot";
import { useCareerProfile } from "@/contexts/CareerProfileContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { experienceForProfile, trackCopy } from "@/lib/learner-track";
import {
  addDaysISO,
  eventsOnDate,
  formatLongDate,
  todayISO,
} from "@/lib/calendar";
import type { TimelineEvent } from "@/lib/dashboard-data";

const PRESET_COLORS = [
  { color: "#0D9488", dotColor: "#0D9488", bgColor: "#F0FDFA" },
  { color: "#2563EB", dotColor: "#2563EB", bgColor: "#EFF6FF" },
  { color: "#FB923C", dotColor: "#FB923C", bgColor: "#FFF7ED" },
  { color: "#8B5CF6", dotColor: "#8B5CF6", bgColor: "#F5F3FF" },
];

function defaultTitle(exp: ReturnType<typeof experienceForProfile>) {
  return trackCopy(exp).defaultBlockTitle;
}

function hourLabel(hour: number) {
  const suffix = hour >= 12 ? "PM" : "AM";
  const h = hour % 12 || 12;
  return `${h}:00 ${suffix}`;
}

export default function PlannerPage() {
  const { career, updatePlanner, displayName, profile } = useCareerProfile();
  const exp = experienceForProfile(profile);
  const copy = trackCopy(exp);
  const today = todayISO();
  const now = useMemo(() => new Date(), []);
  const [month, setMonth] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const [selected, setSelected] = useState(today);
  const [title, setTitle] = useState("");
  const [hour, setHour] = useState(18);
  const dayEvents = eventsOnDate(career.plannerEvents, selected);

  function addBlock(e: FormEvent) {
    e.preventDefault();
    const palette = PRESET_COLORS[career.plannerEvents.length % PRESET_COLORS.length];
    const startHour = Number(hour) || 18;
    const newEvent: TimelineEvent = {
      id: `cal-${Date.now()}`,
      title: title.trim() || defaultTitle(exp),
      startTime: hourLabel(startHour),
      endTime: hourLabel(Math.min(23, startHour + 1)),
      startHour,
      durationHours: 1,
      date: selected,
      ...palette,
    };
    updatePlanner([...career.plannerEvents, newEvent]);
    setTitle("");
  }

  function removeEvent(id: string) {
    updatePlanner(career.plannerEvents.filter((event) => event.id !== id));
  }

  function seedWeek() {
    const palette = PRESET_COLORS;
    const titles = copy.seedWeekTitles;
    const blocks = titles.map((title, i) => {
      const colors = palette[i % palette.length];
      return {
        id: `week-${Date.now()}-${i}`,
        title,
        startTime: hourLabel(18),
        endTime: hourLabel(19),
        startHour: 18,
        durationHours: 1,
        date: addDaysISO(today, i),
        ...colors,
      } satisfies TimelineEvent;
    });
    updatePlanner([...career.plannerEvents, ...blocks]);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <FadeIn>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-foreground-heading">{copy.plannerTitle}</h1>
            <p className="mt-1 text-muted">{copy.plannerSubtitle}</p>
          </div>
          <Button variant="outline" size="sm" onClick={seedWeek} className="rounded-xl cursor-pointer">
            Fill this week
          </Button>
        </div>
      </FadeIn>

      <FadeIn delay={0.05}>
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <MonthCalendar
            year={month.year}
            month={month.month}
            selected={selected}
            events={career.plannerEvents}
            onSelect={setSelected}
            onPrevMonth={() =>
              setMonth((m) =>
                m.month === 0 ? { year: m.year - 1, month: 11 } : { year: m.year, month: m.month - 1 }
              )
            }
            onNextMonth={() =>
              setMonth((m) =>
                m.month === 11 ? { year: m.year + 1, month: 0 } : { year: m.year, month: m.month + 1 }
              )
            }
          />

          <div className="rounded-[22px] border border-border bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-accent">{formatLongDate(selected)}</p>
            <h2 className="mt-1 font-heading text-lg font-bold text-foreground-heading">Day plan</h2>

            <ul className="mt-4 space-y-2">
              {dayEvents.length === 0 && (
                <li className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted">
                  Empty day — add a study block below.
                </li>
              )}
              {dayEvents.map((event) => (
                <li
                  key={event.id}
                  className="flex items-center justify-between rounded-[16px] border border-border px-4 py-3"
                  style={{ backgroundColor: event.bgColor }}
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground-heading">{event.title}</p>
                    <p className="text-xs text-muted">
                      {event.startTime} – {event.endTime}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label={`Remove ${event.title}`}
                    onClick={() => removeEvent(event.id)}
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:bg-white/80 hover:text-error"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>

            <form onSubmit={addBlock} className="mt-5 space-y-3 border-t border-border pt-4">
              <Label htmlFor="block-title">New block</Label>
              <Input
                id="block-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={defaultTitle(exp)}
              />
              <div className="flex gap-2">
                <select
                  value={hour}
                  onChange={(e) => setHour(Number(e.target.value))}
                  className="h-11 flex-1 cursor-pointer rounded-[14px] border border-border bg-white px-3 text-sm outline-none focus:border-accent"
                  aria-label="Start hour"
                >
                  {Array.from({ length: 14 }, (_, i) => i + 7).map((h) => (
                    <option key={h} value={h}>
                      {hourLabel(h)}
                    </option>
                  ))}
                </select>
                <Button type="submit" variant="accent" className="gap-1">
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>
            </form>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.08}>
        <PlannerCopilot />
      </FadeIn>
    </div>
  );
}
