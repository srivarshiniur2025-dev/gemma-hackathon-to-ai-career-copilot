import type { TimelineEvent } from "@/lib/dashboard-data";

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function addDaysISO(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function eventDate(event: TimelineEvent, fallback = todayISO()): string {
  return event.date || fallback;
}

export function eventsOnDate(events: TimelineEvent[], iso: string): TimelineEvent[] {
  return events
    .filter((event) => eventDate(event) === iso)
    .sort((a, b) => a.startHour - b.startHour);
}

export function datesWithEvents(events: TimelineEvent[]): Set<string> {
  return new Set(events.map((event) => eventDate(event)));
}

export function monthCells(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1);
  const pad = first.getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < pad; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function formatLongDate(iso: string): string {
  return parseISODate(iso).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function weekStartingMonday(from = new Date()): string[] {
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const day = d.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + offset);
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(d);
    x.setDate(d.getDate() + i);
    return toISODate(x);
  });
}
