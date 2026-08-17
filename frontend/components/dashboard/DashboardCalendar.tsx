"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { MonthCalendar } from "@/components/calendar/MonthCalendar";
import { useCareerProfile } from "@/contexts/CareerProfileContext";
import { eventsOnDate, formatLongDate, todayISO } from "@/lib/calendar";

export function DashboardCalendar() {
  const { career } = useCareerProfile();
  const today = todayISO();
  const now = useMemo(() => new Date(), []);
  const [month, setMonth] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const [selected, setSelected] = useState(today);
  const dayEvents = eventsOnDate(career.plannerEvents, selected);

  return (
    <section className="mx-4 mb-4 sm:mx-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-bold text-foreground-heading">
          <CalendarDays className="h-5 w-5 text-accent" />
          Calendar
        </h2>
        <Link href="/planner" className="text-xs font-medium text-accent hover:underline">
          Open full calendar →
        </Link>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
        <MonthCalendar
          year={month.year}
          month={month.month}
          selected={selected}
          events={career.plannerEvents}
          compact
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
        <div className="rounded-[22px] border border-border bg-[#FAFAFA] p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-accent">
            {formatLongDate(selected)}
          </p>
          {dayEvents.length === 0 ? (
            <p className="mt-3 text-sm text-muted">No blocks yet. Add one on the calendar page.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {dayEvents.map((event) => (
                <li key={event.id} className="rounded-xl bg-white px-3 py-2 text-sm" style={{ borderLeft: `3px solid ${event.dotColor}` }}>
                  <p className="font-semibold text-foreground-heading">{event.title}</p>
                  <p className="text-xs text-muted">
                    {event.startTime} – {event.endTime}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
