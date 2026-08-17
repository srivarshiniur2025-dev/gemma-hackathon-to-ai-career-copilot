"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { datesWithEvents, monthCells, todayISO, toISODate, WEEKDAYS } from "@/lib/calendar";
import type { TimelineEvent } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";

type MonthCalendarProps = {
  year: number;
  month: number;
  selected: string;
  events: TimelineEvent[];
  onSelect: (iso: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  compact?: boolean;
};

export function MonthCalendar({
  year,
  month,
  selected,
  events,
  onSelect,
  onPrevMonth,
  onNextMonth,
  compact = false,
}: MonthCalendarProps) {
  const today = todayISO();
  const marked = datesWithEvents(events);
  const cells = monthCells(year, month);
  const label = new Date(year, month, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" });

  return (
    <div className={cn("rounded-[22px] border border-border bg-white", compact ? "p-4" : "p-5")}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className={cn("font-heading font-bold text-foreground-heading", compact ? "text-sm" : "text-base")}>
          {label}
        </h3>
        <div className="flex gap-1">
          <button
            type="button"
            aria-label="Previous month"
            onClick={onPrevMonth}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-muted-secondary transition-colors hover:bg-background-hover"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Next month"
            onClick={onNextMonth}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-muted-secondary transition-colors hover:bg-background-hover"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((day) => (
          <span key={day} className="pb-1 text-[10px] font-semibold uppercase tracking-wide text-muted">
            {day}
          </span>
        ))}
        {cells.map((cell, i) => {
          if (!cell) return <span key={`empty-${i}`} />;
          const iso = toISODate(cell);
          const isSelected = iso === selected;
          const isToday = iso === today;
          const hasEvents = marked.has(iso);
          return (
            <button
              key={iso}
              type="button"
              onClick={() => onSelect(iso)}
              className={cn(
                "relative flex h-9 cursor-pointer items-center justify-center rounded-xl text-sm font-medium transition-colors duration-200",
                isSelected
                  ? "bg-accent text-white"
                  : isToday
                    ? "bg-accent/10 text-accent"
                    : "text-foreground-heading hover:bg-background-hover"
              )}
            >
              {cell.getDate()}
              {hasEvents && (
                <span
                  className={cn(
                    "absolute bottom-1 h-1 w-1 rounded-full",
                    isSelected ? "bg-white" : "bg-accent"
                  )}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
