import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Coffee, Utensils, BookOpen, Loader2 } from "lucide-react";
import { getTimetable, type TimetableData, type TimetableEntry } from "@/lib/parent-data";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_SHORT: Record<string, string> = {
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
};

function fmtTime(t: string): string {
  if (!t) return "";
  // accept "HH:MM:SS" or "HH:MM"
  const [hStr, mStr] = t.split(":");
  const h = Number(hStr);
  const m = Number(mStr ?? "0");
  if (Number.isNaN(h)) return t;
  const period = h >= 12 ? "PM" : "AM";
  const h12 = ((h + 11) % 12) + 1;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

function timeToMinutes(t: string): number {
  if (!t) return -1;
  const [h, m] = t.split(":").map((x) => Number(x));
  return (h || 0) * 60 + (m || 0);
}

function findEntry(
  entries: TimetableEntry[],
  day: string,
  slotStart: string,
  slotEnd: string,
): TimetableEntry | null {
  const sStart = timeToMinutes(slotStart);
  const sEnd = timeToMinutes(slotEnd);
  const dayLower = day.toLowerCase();
  // Try exact day match (case-insensitive), allow various stored forms
  const dayCandidates = [day, dayLower, DAY_SHORT[day], DAY_SHORT[day]?.toLowerCase()];
  for (const e of entries) {
    const eDay = (e.day_of_week ?? "").trim();
    if (!dayCandidates.some((d) => d && eDay.toLowerCase() === d.toLowerCase())) continue;
    const eStart = timeToMinutes(e.start_time);
    const eEnd = timeToMinutes(e.end_time);
    // overlap check
    if (eStart < sEnd && eEnd > sStart) return e;
  }
  return null;
}

export function TimetableGrid({
  organizationId,
  className,
  sectionName,
}: {
  organizationId: string | null;
  className: string | null;
  sectionName: string | null;
}) {
  const [data, setData] = useState<TimetableData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!organizationId || !className) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    getTimetable(organizationId, className, sectionName)
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load timetable");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [organizationId, className, sectionName]);

  const slots = useMemo(() => data?.slots ?? [], [data]);
  const entries = useMemo(() => data?.entries ?? [], [data]);

  if (loading) {
    return (
      <div className="glass flex items-center justify-center p-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-3 text-sm parent-muted">Loading timetable…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
        {error}
      </div>
    );
  }

  if (!className) {
    return (
      <div className="glass p-6 text-sm parent-muted">No class assigned to this student.</div>
    );
  }

  if (slots.length === 0 && entries.length === 0) {
    return (
      <div className="glass p-8 text-center">
        <BookOpen className="mx-auto h-10 w-10 text-muted-foreground" />
        <p className="mt-3 font-medium text-secondary">No timetable available</p>
        <p className="mt-1 text-sm parent-muted">
          The school has not published a timetable for Class {className}
          {sectionName ? ` • ${sectionName}` : ""} yet.
        </p>
      </div>
    );
  }

  // If no slot rows configured, derive rows from unique entry time ranges
  const derivedSlots =
    slots.length > 0
      ? slots
      : Array.from(
          new Map(
            entries.map((e) => [
              `${e.start_time}-${e.end_time}`,
              {
                id: `${e.start_time}-${e.end_time}`,
                slot_label: null,
                slot_order: timeToMinutes(e.start_time),
                start_time: e.start_time,
                end_time: e.end_time,
                is_break: false,
                is_lunch: false,
              },
            ]),
          ).values(),
        ).sort((a, b) => a.slot_order - b.slot_order);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass overflow-hidden"
    >
      <div className="flex items-center justify-between border-b border-border/60 p-4">
        <div>
          <h2 className="text-lg font-semibold text-secondary">Weekly Timetable</h2>
          <p className="text-xs parent-muted">
            Class {className}
            {sectionName ? ` • Section ${sectionName}` : ""}
          </p>
        </div>
        <div className="hidden gap-3 text-xs parent-muted md:flex">
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-primary" /> Period
          </span>
          <span className="inline-flex items-center gap-1">
            <Coffee className="h-3 w-3" /> Break
          </span>
          <span className="inline-flex items-center gap-1">
            <Utensils className="h-3 w-3" /> Lunch
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-card">
            <tr>
              <th className="sticky left-0 z-20 min-w-[110px] border-b border-r border-border/60 bg-card p-3 text-left text-xs font-semibold uppercase tracking-wide text-secondary">
                Period
              </th>
              {DAYS.map((d) => (
                <th
                  key={d}
                  className="min-w-[140px] border-b border-r border-border/60 bg-card p-3 text-center text-xs font-semibold uppercase tracking-wide text-secondary last:border-r-0"
                >
                  <span className="hidden md:inline">{d}</span>
                  <span className="md:hidden">{DAY_SHORT[d]}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {derivedSlots.map((slot, idx) => {
              const isBreak = slot.is_break || slot.is_lunch;
              return (
                <tr key={slot.id} className={idx % 2 === 0 ? "bg-background/40" : ""}>
                  <td className="sticky left-0 z-10 border-b border-r border-border/60 bg-card p-3 align-top">
                    <div className="font-medium text-secondary">
                      {slot.slot_label ?? `Period ${idx + 1}`}
                    </div>
                    <div className="mt-0.5 text-[11px] parent-muted">
                      {fmtTime(slot.start_time)} – {fmtTime(slot.end_time)}
                    </div>
                  </td>

                  {isBreak ? (
                    <td
                      colSpan={DAYS.length}
                      className="border-b border-border/60 p-3 text-center text-xs font-medium text-primary"
                    >
                      <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1">
                        {slot.is_lunch ? (
                          <Utensils className="h-3.5 w-3.5" />
                        ) : (
                          <Coffee className="h-3.5 w-3.5" />
                        )}
                        {slot.is_lunch ? "Lunch Break" : "Break"}
                      </div>
                    </td>
                  ) : (
                    DAYS.map((day) => {
                      const entry = findEntry(entries, day, slot.start_time, slot.end_time);
                      return (
                        <td
                          key={day}
                          className="border-b border-r border-border/60 p-2 align-top last:border-r-0"
                        >
                          {entry ? (
                            <div className="rounded-lg border border-primary/20 bg-primary/5 p-2 transition hover:border-primary/40 hover:bg-primary/10">
                              <div className="truncate text-sm font-semibold text-secondary">
                                {entry.subject}
                              </div>
                              <div className="mt-0.5 text-[11px] parent-muted">
                                {fmtTime(entry.start_time)} – {fmtTime(entry.end_time)}
                              </div>
                              {entry.teacher_name ? (
                                <div className="mt-1 truncate text-[11px] text-foreground/70">
                                  {entry.teacher_name}
                                </div>
                              ) : null}
                            </div>
                          ) : (
                            <div className="flex h-full min-h-[48px] items-center justify-center text-xs text-muted-foreground">
                              —
                            </div>
                          )}
                        </td>
                      );
                    })
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}