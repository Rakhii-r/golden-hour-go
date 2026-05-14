import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getAttendanceForMonth,
  getHolidaysForMonth,
  type AttendanceDayRecord,
  type AttendanceStatus,
} from "@/lib/parent-data";

interface Props {
  studentId: string | null;
  organizationId: string | null;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const STATUS_META: Record<
  AttendanceStatus,
  { label: string; dot: string; text: string; bg: string }
> = {
  present: {
    label: "Present",
    dot: "bg-emerald-500",
    text: "text-emerald-700",
    bg: "bg-emerald-50",
  },
  absent: {
    label: "Absent",
    dot: "bg-red-500",
    text: "text-red-700",
    bg: "bg-red-50",
  },
  leave: {
    label: "Leave",
    dot: "bg-yellow-500",
    text: "text-yellow-700",
    bg: "bg-yellow-50",
  },
  late: {
    label: "Late",
    dot: "bg-orange-500",
    text: "text-orange-700",
    bg: "bg-orange-50",
  },
  other: {
    label: "—",
    dot: "bg-muted",
    text: "text-muted-foreground",
    bg: "bg-muted/40",
  },
};

const HOLIDAY_META = {
  label: "Holiday",
  dot: "bg-blue-500",
  text: "text-blue-700",
  bg: "bg-blue-50",
};
const SUNDAY_META = {
  label: "Sunday",
  dot: "bg-muted-foreground/40",
  text: "text-muted-foreground",
  bg: "bg-muted/40",
};

const fmtMonth = (y: number, m: number) =>
  new Date(y, m, 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" });

const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const isoFor = (y: number, m: number, d: number) =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

export function AttendanceCalendar({ studentId, organizationId }: Props) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [records, setRecords] = useState<AttendanceDayRecord[]>([]);
  const [holidays, setHolidays] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(false);
  const [openDate, setOpenDate] = useState<string | null>(null);

  useEffect(() => {
    if (!studentId || !organizationId) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([
      getAttendanceForMonth(studentId, organizationId, year, month).catch(() => []),
      getHolidaysForMonth(organizationId, year, month).catch(() => []),
    ])
      .then(([recs, hols]) => {
        if (cancelled) return;
        setRecords(recs);
        const m = new Map<string, string>();
        for (const h of hols) m.set(h.date, h.name);
        setHolidays(m);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [studentId, organizationId, year, month]);

  const byDate = useMemo(() => {
    const m = new Map<string, AttendanceDayRecord>();
    for (const r of records) m.set(r.date, r);
    return m;
  }, [records]);

  const today = todayIso();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Build effective per-day status, marking past working days without records as absent.
  const effectiveByDate = useMemo(() => {
    const map = new Map<string, AttendanceDayRecord>();
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = isoFor(year, month, d);
      if (iso > today) continue;
      const weekday = new Date(year, month, d).getDay();
      if (weekday === 0) continue; // Sunday
      if (holidays.has(iso)) continue;
      const existing = byDate.get(iso);
      if (existing) {
        map.set(iso, existing);
      } else {
        map.set(iso, {
          date: iso,
          status: "absent",
          rawStatus: null,
          notes: "No attendance recorded",
          subject: null,
        });
      }
    }
    return map;
  }, [byDate, holidays, year, month, daysInMonth, today]);

  const stats = useMemo(() => {
    let present = 0;
    let absent = 0;
    let leave = 0;
    let late = 0;
    for (const r of effectiveByDate.values()) {
      if (r.status === "present") present++;
      else if (r.status === "absent") absent++;
      else if (r.status === "leave") leave++;
      else if (r.status === "late") late++;
    }
    const counted = present + absent + leave + late;
    const pct = counted === 0 ? 0 : Math.round(((present + late) / counted) * 100);
    return { present, absent, leave, late, pct, counted };
  }, [effectiveByDate]);

  const firstWeekday = new Date(year, month, 1).getDay();
  const cells: Array<number | null> = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const goPrev = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };
  const goNext = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const selected = openDate ? effectiveByDate.get(openDate) ?? null : null;
  const selectedHoliday = openDate ? holidays.get(openDate) ?? null : null;
  const selectedIsSunday = openDate ? new Date(openDate).getDay() === 0 : false;
  const selectedMeta = selected
    ? STATUS_META[selected.status]
    : selectedHoliday
      ? HOLIDAY_META
      : selectedIsSunday
        ? SUNDAY_META
        : null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CalendarDays className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-secondary">Attendance Calendar</h2>
            <p className="text-xs parent-muted">Daily attendance for the month</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goPrev}
            aria-label="Previous month"
            className="rounded-lg border border-border bg-card p-1.5 text-foreground transition hover:bg-muted"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[140px] text-center text-sm font-medium text-secondary">
            {fmtMonth(year, month)}
          </span>
          <button
            onClick={goNext}
            aria-label="Next month"
            className="rounded-lg border border-border bg-card p-1.5 text-foreground transition hover:bg-muted"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StatChip label="Attendance" value={`${stats.pct}%`} accent="text-primary" />
        <StatChip label="Present" value={String(stats.present)} accent="text-emerald-600" />
        <StatChip label="Absent" value={String(stats.absent)} accent="text-red-600" />
        <StatChip label="Leave" value={String(stats.leave)} accent="text-yellow-600" />
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs parent-muted">
        <Legend dot="bg-emerald-500" label="Present" />
        <Legend dot="bg-red-500" label="Absent" />
        <Legend dot="bg-yellow-500" label="Leave" />
        {stats.late > 0 && <Legend dot="bg-orange-500" label="Late" />}
      </div>

      {/* Calendar grid */}
      <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs font-medium parent-muted">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>

      {loading ? (
        <div className="mt-1 grid grid-cols-7 gap-1">
          {Array.from({ length: 42 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="mt-1 grid grid-cols-7 gap-1">
          {cells.map((day, idx) => {
            if (day === null) return <div key={idx} className="h-14" />;
            const iso = isoFor(year, month, day);
            const rec = effectiveByDate.get(iso);
            const isSunday = new Date(year, month, day).getDay() === 0;
            const isHoliday = holidays.has(iso);
            const isToday = iso === today;
            const meta = rec
              ? STATUS_META[rec.status]
              : isHoliday
                ? HOLIDAY_META
                : isSunday
                  ? SUNDAY_META
                  : null;
            const tint = rec?.status === "absent"
              ? "bg-red-50 border-red-100"
              : rec?.status === "present"
                ? "bg-emerald-50 border-emerald-100"
                : rec?.status === "leave"
                  ? "bg-yellow-50 border-yellow-100"
                  : rec?.status === "late"
                    ? "bg-orange-50 border-orange-100"
                    : isHoliday
                      ? "bg-blue-50 border-blue-100"
                      : "border-border bg-card hover:bg-muted";
            return (
              <button
                key={idx}
                onClick={() => setOpenDate(iso)}
                className={`group flex h-14 flex-col items-center justify-center rounded-lg border text-sm transition ${
                  isToday
                    ? "border-primary/60 bg-primary/5"
                    : tint
                }`}
              >
                <span
                  className={`font-medium ${
                    isToday ? "text-primary" : "text-foreground"
                  }`}
                >
                  {day}
                </span>
                <span
                  className={`mt-1 inline-block h-1.5 w-1.5 rounded-full ${
                    meta ? meta.dot : "bg-transparent"
                  }`}
                />
              </button>
            );
          })}
        </div>
      )}

      <Dialog open={!!openDate} onOpenChange={(v) => !v && setOpenDate(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {openDate
                ? new Date(openDate).toLocaleDateString("en-IN", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : ""}
            </DialogTitle>
            <DialogDescription>Attendance details for this date.</DialogDescription>
          </DialogHeader>
          {selected && selectedMeta ? (
            <div className={`rounded-lg p-4 ${selectedMeta.bg}`}>
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${selectedMeta.dot}`} />
                <span className={`text-sm font-semibold ${selectedMeta.text}`}>
                  {selectedMeta.label}
                </span>
              </div>
              {selected.subject && (
                <p className="mt-2 text-xs text-foreground">
                  <span className="parent-muted">Subject: </span>
                  {selected.subject}
                </p>
              )}
              {selected.notes && (
                <p className="mt-1 text-xs text-foreground">
                  <span className="parent-muted">Notes: </span>
                  {selected.notes}
                </p>
              )}
            </div>
          ) : selectedMeta ? (
            <div className={`rounded-lg p-4 ${selectedMeta.bg}`}>
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${selectedMeta.dot}`} />
                <span className={`text-sm font-semibold ${selectedMeta.text}`}>
                  {selectedMeta.label}
                </span>
              </div>
              {selectedHoliday && (
                <p className="mt-2 text-xs text-foreground">{selectedHoliday}</p>
              )}
            </div>
          ) : (
            <p className="text-sm parent-muted">No school day.</p>
          )}
        </DialogContent>
      </Dialog>
    </motion.section>
  );
}

function StatChip({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2">
      <p className="text-[11px] uppercase tracking-wide parent-muted">{label}</p>
      <p className={`text-lg font-bold ${accent}`}>{value}</p>
    </div>
  );
}

function Legend({ dot, label }: { dot: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      {label}
    </span>
  );
}