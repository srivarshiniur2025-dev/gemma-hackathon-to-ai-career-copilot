"use client";

import { MoreHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import { timelineHours, weeklyTimelineEvents } from "@/lib/dashboard-data";

function formatHour(hour: number) {
  if (hour === 0) return "12 AM";
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return "12 PM";
  return `${hour - 12} PM`;
}

function TimelineEventCard({
  event,
  index,
}: {
  event: (typeof weeklyTimelineEvents)[number];
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.15 + index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2, boxShadow: "0 4px 16px rgba(24,24,27,0.08)" }}
      className="flex cursor-pointer items-center justify-between rounded-[18px] border border-transparent px-4 py-3 transition-shadow duration-200"
      style={{ backgroundColor: event.bgColor }}
    >
      <div className="flex items-center gap-3">
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: event.dotColor }}
        />
        <div>
          <p className="text-sm font-semibold text-foreground-heading">{event.title}</p>
          <p className="text-xs text-muted">
            {event.startTime} – {event.endTime}
          </p>
        </div>
      </div>
      <button
        type="button"
        aria-label={`Options for ${event.title}`}
        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:bg-white/60"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

export function LearningTimeline() {
  const eventsByHour = new Map(
    weeklyTimelineEvents.map((e) => [e.startHour, e])
  );

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="flex-1 overflow-y-auto px-4 pb-6 sm:px-6"
    >
      <h2 className="mb-5 text-lg font-bold text-foreground-heading">
        This Week&apos;s Career Plan
      </h2>

      <div className="space-y-1">
        {timelineHours.map((hour, rowIndex) => {
          const event = eventsByHour.get(hour);
          return (
            <div key={hour} className="grid grid-cols-[56px_1fr] gap-3 sm:grid-cols-[72px_1fr]">
              <span className="pt-3 text-xs font-medium text-muted">{formatHour(hour)}</span>
              <div className="min-h-[52px] py-1">
                {event ? (
                  <TimelineEventCard event={event} index={rowIndex} />
                ) : (
                  <div className="h-full rounded-[18px] border border-dashed border-border/60" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </motion.section>
  );
}
