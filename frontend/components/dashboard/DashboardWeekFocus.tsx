"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useCareerProfile } from "@/contexts/CareerProfileContext";
import {
  datesWithEvents,
  eventsOnDate,
  parseISODate,
  todayISO,
  weekStartingMonday,
} from "@/lib/calendar";
import { cn } from "@/lib/utils";

export function DashboardWeekFocus() {
  const { career } = useCareerProfile();
  const today = todayISO();
  const week = useMemo(() => weekStartingMonday(), []);
  const [selected, setSelected] = useState(today);
  const marked = datesWithEvents(career.plannerEvents);
  const dayEvents = eventsOnDate(career.plannerEvents, selected);

  return (
    <section>
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">This week</p>
          <h2 className="mt-1 font-heading text-xl font-bold text-foreground-heading">Where your time goes</h2>
        </div>
        <Link href="/planner" className="text-sm font-semibold text-accent hover:underline">
          Full calendar
        </Link>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {week.map((iso) => {
          const d = parseISODate(iso);
          const isSelected = iso === selected;
          const isToday = iso === today;
          return (
            <button
              key={iso}
              type="button"
              onClick={() => setSelected(iso)}
              className={cn(
                "flex cursor-pointer flex-col items-center rounded-2xl py-3 transition-colors duration-200",
                isSelected
                  ? "bg-gradient-to-br from-[#0D9488] to-[#0F766E] text-white shadow-md"
                  : isToday
                    ? "bg-[#CCFBF1] text-accent"
                    : "bg-[#F4F4F5] text-foreground-heading hover:bg-[#E4E4E7]"
              )}
            >
              <span className={cn("text-[10px] font-semibold uppercase", isSelected ? "text-white/80" : "text-muted")}>
                {d.toLocaleDateString(undefined, { weekday: "short" })}
              </span>
              <span className="mt-1 text-lg font-bold">{d.getDate()}</span>
              {marked.has(iso) && (
                <span className={cn("mt-1 h-1 w-1 rounded-full", isSelected ? "bg-white" : "bg-accent")} />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
          {parseISODate(selected).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
        </p>
        {dayEvents.length === 0 ? (
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
            Nothing parked here yet. Keep the day light, or add a block on the calendar.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {dayEvents.map((event, i) => (
              <motion.li
                key={event.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4"
              >
                <span className="w-16 shrink-0 text-xs font-medium text-muted">{event.startTime}</span>
                <div className="flex-1 rounded-2xl px-4 py-3" style={{ backgroundColor: event.bgColor }}>
                  <p className="text-sm font-semibold text-foreground-heading">{event.title}</p>
                  <p className="text-xs text-muted">{event.endTime}</p>
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
