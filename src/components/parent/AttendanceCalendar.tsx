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
  { label: string; dot: string; text: string; bg: string; cell: string }
> = {
  present: {
    label: "Present",
    dot:  "bg-emerald-500",
    text: "text-emerald-700",
    bg:   "bg-emerald-50",
    cell: "bg-emerald-50 border-emerald-100 text-emerald-800",
  },
  absent: {
    label: "Absent",
    dot:  "bg-red-500",
    text: "text-red-700",
    bg:   "bg-red-50",
    cell: "bg-red-50 border-red-100 text-red-800",
  },
  leave: {
    label: "Leave",
    dot:  "bg-yellow-500",
    text: "text-yellow-700",
    bg:   "bg-yellow-50",
    cell: "bg-yellow-50 border-yellow-100 text-yellow-800",
  },
  late: {
    label: "Late",
    dot:  "bg-orange-500",
    text: "text-orange-700",
    bg:   "bg-orange-50",
    cell: "bg-orange-50 border-orange-100 text-orange-800",
  },
  other: {
    label: "—",
    dot:  "bg-gray-300",
    text: "text-gray-500",
    bg:   "bg-gray-50",
    cell: "bg-gray-50 border-gray-100 text-gray-500",
  },
};

const HOLIDAY_META = {
  label: "Holiday",
  dot:  "bg-blue-500",
  text: "text-blue-700",
  bg:   "bg-blue-50",
  cell: "bg-blue-50 border-blue-100 text-blue-700",
};
const SUNDAY_META = {
  label: "Sunday",
  dot:  "bg-gray-300",
  text: "text-gray-400",
  bg:   "bg-gray-50",
  cell: "bg-gray-50/50 border-gray-100 text-gray-300",
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
  const [year, setYear]       = useState(now.getFullYear());
  const [month, setMonth]     = useState(now.getMonth());
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
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [studentId, organizationId, year, month]);

  const byDate = useMemo(() => {
    const m = new Map<string, AttendanceDayRecord>();
    for (const r of records) m.set(r.date, r);
    return m;
  }, [records]);

  const today = todayIso();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const effectiveByDate = useMemo(() => {
    const map = new Map<string, AttendanceDayRecord>();
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = isoFor(year, month, d);
      if (iso > today) continue;
      const weekday = new Date(year, month, d).getDay();
      if (weekday === 0) continue;
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
    let present = 0, absent = 0, leave = 0, late = 0;
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
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else setMonth(month - 1);
  };
  const goNext = () => {
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else setMonth(month + 1);
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
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#155EEF]">
            <CalendarDays className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-800">Attendance Calendar</h2>
            <p className="text-xs text-gray-400">Daily attendance for the month</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goPrev}
            aria-label="Previous month"
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#E2E8F0] bg-white text-gray-500 transition hover:bg-gray-50 hover:text-gray-800"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[130px] text-center text-sm font-semibold text-[#155EEF]">
            {fmtMonth(year, month)}
          </span>
          <button
            onClick={goNext}
            aria-label="Next month"
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#E2E8F0] bg-white text-gray-500 transition hover:bg-gray-50 hover:text-gray-800"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StatChip label="Attendance" value={`${stats.pct}%`}          accent="text-[#155EEF]" bg="bg-blue-50" />
        <StatChip label="Present"    value={String(stats.present)}    accent="text-emerald-600" bg="bg-emerald-50" />
        <StatChip label="Absent"     value={String(stats.absent)}     accent="text-red-600" bg="bg-red-50" />
        <StatChip label="Leave"      value={String(stats.leave)}      accent="text-yellow-600" bg="bg-yellow-50" />
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-400">
        <Legend dot="bg-emerald-500" label="Present" />
        <Legend dot="bg-red-500"     label="Absent"  />
        <Legend dot="bg-yellow-500"  label="Leave"   />
        {stats.late > 0 && <Legend dot="bg-orange-500" label="Late" />}
      </div>

      {/* Day headers */}
      <div className="mt-4 grid grid-cols-7 text-center text-[11px] font-semibold uppercase tracking-wide text-gray-400">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-1">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      {loading ? (
        <div className="mt-1 grid grid-cols-7 gap-1">
          {Array.from({ length: 42 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="mt-1 grid grid-cols-7 gap-1">
          {cells.map((day, idx) => {
            if (day === null) return <div key={idx} className="h-12" />;
            const iso = isoFor(year, month, day);
            const rec = effectiveByDate.get(iso);
            const isSunday  = new Date(year, month, day).getDay() === 0;
            const isHoliday = holidays.has(iso);
            const isToday   = iso === today;

            const meta = rec
              ? STATUS_META[rec.status]
              : isHoliday ? HOLIDAY_META
              : isSunday  ? SUNDAY_META
              : null;

            const cellClass = isToday
              ? "border-[#155EEF] bg-[#155EEF]/5 text-[#155EEF]"
              : meta?.cell ?? "border-[#E2E8F0] bg-white text-gray-700 hover:bg-gray-50";

            return (
              <button
                key={idx}
                onClick={() => setOpenDate(iso)}
                className={`flex h-12 flex-col items-center justify-center rounded-xl border text-sm transition ${cellClass}`}
              >
                <span className={`font-semibold ${isToday ? "text-[#155EEF]" : ""}`}>
                  {day}
                </span>
                <span
                  className={`mt-0.5 h-1.5 w-1.5 rounded-full ${
                    meta ? meta.dot : "bg-transparent"
                  }`}
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Day detail dialog */}
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
            <div className={`rounded-xl p-4 ${selectedMeta.bg}`}>
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${selectedMeta.dot}`} />
                <span className={`text-sm font-semibold ${selectedMeta.text}`}>
                  {selectedMeta.label}
                </span>
              </div>
              {selected.subject && (
                <p className="mt-2 text-xs text-gray-700">
                  <span className="text-gray-400">Subject: </span>
                  {selected.subject}
                </p>
              )}
              {selected.notes && (
                <p className="mt-1 text-xs text-gray-700">
                  <span className="text-gray-400">Notes: </span>
                  {selected.notes}
                </p>
              )}
            </div>
          ) : selectedMeta ? (
            <div className={`rounded-xl p-4 ${selectedMeta.bg}`}>
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${selectedMeta.dot}`} />
                <span className={`text-sm font-semibold ${selectedMeta.text}`}>
                  {selectedMeta.label}
                </span>
              </div>
              {selectedHoliday && (
                <p className="mt-2 text-xs text-gray-700">{selectedHoliday}</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No school day.</p>
          )}
        </DialogContent>
      </Dialog>
    </motion.section>
  );
}

/* ── Sub-components ────────────────────────────────────────────── */
function StatChip({
  label,
  value,
  accent,
  bg,
}: {
  label: string;
  value: string;
  accent: string;
  bg: string;
}) {
  return (
    <div className={`rounded-xl border border-[#E2E8F0] ${bg} px-3 py-2`}>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">{label}</p>
      <p className={`text-xl font-extrabold ${accent}`}>{value}</p>
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
