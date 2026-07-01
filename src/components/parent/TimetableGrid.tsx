import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { parentSupabase } from "@/lib/parent-supabase";
import {
  TimetableGrid as CrmTimetableGrid,
  type TimetableEntry,
  type PeriodType,
  type PeriodSlot,
} from "@/components/timetable/TimetableGrid";

interface PeriodRow {
  id: string;
  start_time: string;
  end_time: string;
  slot_order: number;
  slot_label: string | null;
  is_break: boolean;
  is_lunch: boolean;
}

// Ported verbatim from the CRM (edu-grow-connect) src/pages/dashboard/StudentTimetable.tsx
// so the Parent Portal renders identically to the CRM's read-only student timetable —
// same rows, same Period N numbering, same Break/Lunch fallback text.
function buildPeriodSlots(periods: PeriodRow[]): PeriodSlot[] {
  const sorted = [...periods].sort((a, b) => a.slot_order - b.slot_order);
  let teachingCounter = 0;
  return sorted.map((p, idx) => {
    const isTeaching = !p.is_break && !p.is_lunch;
    if (isTeaching) teachingCounter += 1;
    const stored = (p.slot_label || "").trim();
    const isGenericPeriodLabel = /^Period\s+\d+$/i.test(stored);
    const usableLabel = stored && !(isGenericPeriodLabel && !isTeaching) ? stored : "";
    const fallback = p.is_lunch ? "Lunch" : p.is_break ? "Break" : `Period ${teachingCounter}`;
    return {
      start_time: p.start_time,
      end_time: p.end_time,
      label: usableLabel || fallback,
      is_break: p.is_break,
      is_lunch: p.is_lunch,
      index: idx,
    };
  });
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
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [periodSlots, setPeriodSlots] = useState<PeriodSlot[]>([]);
  const [loading, setLoading] = useState(true);

  const classIdentifier = className
    ? `${className} - ${sectionName || ""}`.replace(/ - $/, "")
    : "";

  const fetchTimetable = useCallback(async () => {
    if (!organizationId || !className) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // Mirrors the CRM's Timetable.tsx fetchData: all timetables rows for the
      // org, filtered client-side by class_name (same as TimetableGrid's own
      // selectedClass filter), then teacher names joined from profiles.
      const { data: timetableData } = await parentSupabase
        .from("timetables")
        .select("*")
        .eq("organization_id", organizationId)
        .order("day_of_week")
        .order("start_time");

      const classRows = (timetableData || []).filter(
        (t: any) => t.class_name === classIdentifier,
      );

      const teacherIds = [...new Set(classRows.map((t: any) => t.teacher_id).filter(Boolean))] as string[];
      let teacherMap = new Map<string, string>();
      if (teacherIds.length > 0) {
        const { data: td } = await parentSupabase.from("profiles").select("id, name").in("id", teacherIds);
        teacherMap = new Map(td?.map((t: any) => [t.id, t.name]) || []);
      }

      setTimetable(
        classRows.map((t: any) => ({
          ...t,
          teacher_name: t.teacher_id ? teacherMap.get(t.teacher_id) || undefined : undefined,
          period_type: (t.period_type || "CLASS") as PeriodType,
        })),
      );

      // Mirrors the CRM's Timetable.tsx fetchPeriods: class-specific override
      // slots take precedence over org-wide default slots.
      const { data: slotData } = await parentSupabase
        .from("timetable_time_slots")
        .select("*")
        .eq("organization_id", organizationId)
        .order("slot_order")
        .order("start_time");

      const allSlots = slotData || [];
      const classSlots = allSlots.filter(
        (s: any) =>
          (s.class_name || "").trim().toLowerCase() === (className || "").trim().toLowerCase() &&
          (s.section_name || "").trim().toLowerCase() === (sectionName || "").trim().toLowerCase(),
      );
      const orgSlots = allSlots.filter((s: any) => s.class_name === null);
      const source = classSlots.length > 0 ? classSlots : orgSlots;

      setPeriodSlots(
        buildPeriodSlots(
          source.map((s: any) => ({
            id: s.id,
            start_time: s.start_time,
            end_time: s.end_time,
            slot_order: s.slot_order,
            slot_label: s.slot_label,
            is_break: s.is_break ?? false,
            is_lunch: s.is_lunch ?? false,
          })),
        ),
      );
    } finally {
      setLoading(false);
    }
  }, [organizationId, className, sectionName, classIdentifier]);

  useEffect(() => {
    fetchTimetable();
  }, [fetchTimetable]);

  const noop = () => {};

  if (!className) {
    return <div className="glass p-6 text-sm parent-muted">No class assigned to this student.</div>;
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Weekly Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : (
          <CrmTimetableGrid
            entries={timetable}
            selectedClass={classIdentifier}
            isAllSectionsView={false}
            onCellClick={noop}
            onDelete={noop}
            readonly
            enableDragDrop={false}
            periodSlots={periodSlots}
          />
        )}
      </CardContent>
    </Card>
  );
}
