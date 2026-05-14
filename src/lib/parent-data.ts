import { parentSupabase } from "@/lib/parent-supabase";

export interface StudentInfo {
  id: string;
  organization_id: string;
  name: string | null;
  admission_number: string | null;
  class: string | null;
  section: string | null;
  roll_number: string | null;
  father_name: string | null;
  mother_name: string | null;
  photo_url: string | null;
  academic_year: string | null;
  gender: string | null;
  date_of_birth: string | null;
  blood_group: string | null;
  phone: string | null;
  address: string | null;
  transport_opted: boolean | null;
  transport_route: string | null;
  transport_stop: string | null;
  aadhaar_last_four: string | null;
  status: string | null;
}

export interface OrganizationInfo {
  id: string;
  name: string | null;
  logo_url: string | null;
}

export async function getOrganization(
  organizationId: string,
): Promise<OrganizationInfo | null> {
  const [orgRes, settingsRes] = await Promise.all([
    parentSupabase.from("organizations").select("id, name").eq("id", organizationId).maybeSingle(),
    parentSupabase
      .from("organization_settings")
      .select("logo_url, school_name")
      .eq("organization_id", organizationId)
      .maybeSingle(),
  ]);
  const org = orgRes.data as { id: string; name: string | null } | null;
  const settings = settingsRes.data as { logo_url: string | null; school_name: string | null } | null;
  if (!org && !settings) return null;
  return {
    id: organizationId,
    name: settings?.school_name || org?.name || null,
    logo_url: settings?.logo_url ?? null,
  };
}

export interface AttendanceSummary {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  percentage: number;
}

export type AttendanceStatus = "present" | "absent" | "leave" | "late" | "other";

export interface AttendanceDayRecord {
  date: string;
  status: AttendanceStatus;
  rawStatus: string | null;
  notes: string | null;
  subject: string | null;
}

export interface HolidayRecord {
  date: string;
  name: string;
}

export interface FeeSummary {
  total: number;
  paid: number;
  pending: number;
  nextDueDate: string | null;
}

export interface MarksSummary {
  recent: Array<{
    subject: string;
    marks_obtained: number | null;
    max_marks: number | null;
    is_absent: boolean;
  }>;
  averagePercent: number | null;
}

export interface AssignmentItem {
  id: string;
  title: string;
  subject: string | null;
  due_date: string | null;
  description: string | null;
}

export interface CircularItem {
  id: string;
  title: string;
  description: string | null;
  scheduled_at: string | null;
  created_at: string;
}

export interface TimetableSlot {
  id: string;
  slot_label: string | null;
  slot_order: number;
  start_time: string;
  end_time: string;
  is_break: boolean;
  is_lunch: boolean;
}

export interface TimetableEntry {
  id: string;
  day_of_week: string;
  subject: string;
  start_time: string;
  end_time: string;
  teacher_id: string | null;
  teacher_name?: string | null;
  period_type?: string | null;
}

export interface TimetableData {
  slots: TimetableSlot[];
  entries: TimetableEntry[];
}

export async function getTimetable(
  organizationId: string,
  className: string,
  sectionName: string | null,
): Promise<TimetableData> {
  // class_name in DB is combined like "Class 1 - A". Try combined first, then class-only.
  const combined = sectionName ? `${className} - ${sectionName}` : className;
  const candidates = Array.from(new Set([combined, className]));

  // Time slots (rows)
  const slotsRes = await parentSupabase
    .from("timetable_time_slots")
    .select("id, slot_label, slot_order, start_time, end_time, is_break, is_lunch, class_name")
    .eq("organization_id", organizationId)
    .in("class_name", candidates)
    .order("slot_order", { ascending: true });
  if (slotsRes.error) throw slotsRes.error;
  let slotRows = (slotsRes.data ?? []) as Array<TimetableSlot & { class_name: string }>;
  // Prefer combined match if available
  const slotCombined = slotRows.filter((s) => s.class_name === combined);
  if (slotCombined.length > 0) slotRows = slotCombined;

  // Entries (subjects per day)
  const entriesRes = await parentSupabase
    .from("timetables")
    .select("id, day_of_week, subject, start_time, end_time, teacher_id, period_type, class_name")
    .eq("organization_id", organizationId)
    .in("class_name", candidates);
  if (entriesRes.error) throw entriesRes.error;
  let entryRows = (entriesRes.data ?? []) as Array<TimetableEntry & { class_name: string }>;
  const entryCombined = entryRows.filter((e) => e.class_name === combined);
  if (entryCombined.length > 0) entryRows = entryCombined;

  // Resolve teacher names
  const teacherIds = Array.from(
    new Set(entryRows.map((e) => e.teacher_id).filter((x): x is string => !!x)),
  );
  if (teacherIds.length > 0) {
    const { data: profs } = await parentSupabase
      .from("profiles")
      .select("id, name")
      .in("id", teacherIds);
    const nameMap = new Map<string, string>(
      ((profs ?? []) as Array<{ id: string; name: string | null }>).map((p) => [p.id, p.name ?? ""]),
    );
    entryRows = entryRows.map((e) => ({
      ...e,
      teacher_name: e.teacher_id ? (nameMap.get(e.teacher_id) ?? null) : null,
    }));
  }

  return {
    slots: slotRows.map((s) => ({
      id: s.id,
      slot_label: s.slot_label,
      slot_order: s.slot_order,
      start_time: s.start_time,
      end_time: s.end_time,
      is_break: !!s.is_break,
      is_lunch: !!s.is_lunch,
    })),
    entries: entryRows,
  };
}

const PRESENT_STATUSES = ["present", "p", "Present"];
const ABSENT_STATUSES = ["absent", "a", "Absent"];
const LATE_STATUSES = ["late", "l", "Late"];
const LEAVE_STATUSES = ["leave", "on_leave", "on leave", "lv"];

export function classifyAttendance(status: string | null | undefined): AttendanceStatus {
  const s = (status ?? "").toLowerCase().trim();
  if (!s) return "other";
  if (PRESENT_STATUSES.map((x) => x.toLowerCase()).includes(s)) return "present";
  if (ABSENT_STATUSES.map((x) => x.toLowerCase()).includes(s)) return "absent";
  if (LATE_STATUSES.map((x) => x.toLowerCase()).includes(s)) return "late";
  if (LEAVE_STATUSES.includes(s)) return "leave";
  return "other";
}

export async function getAttendanceForMonth(
  studentId: string,
  organizationId: string,
  year: number,
  month: number,
): Promise<AttendanceDayRecord[]> {
  const start = new Date(Date.UTC(year, month, 1)).toISOString().slice(0, 10);
  const end = new Date(Date.UTC(year, month + 1, 0)).toISOString().slice(0, 10);
  const { data, error } = await parentSupabase
    .from("attendance")
    .select("date, status, notes, subject")
    .eq("student_id", studentId)
    .eq("organization_id", organizationId)
    .gte("date", start)
    .lte("date", end)
    .order("date", { ascending: true });
  if (error) throw error;
  const rows = (data ?? []) as Array<{
    date: string;
    status: string | null;
    notes: string | null;
    subject: string | null;
  }>;
  const priority: Record<AttendanceStatus, number> = {
    absent: 4,
    leave: 3,
    late: 2,
    present: 1,
    other: 0,
  };
  const map = new Map<string, AttendanceDayRecord>();
  for (const r of rows) {
    const cls = classifyAttendance(r.status);
    const rec: AttendanceDayRecord = {
      date: r.date,
      status: cls,
      rawStatus: r.status,
      notes: r.notes,
      subject: r.subject,
    };
    const existing = map.get(r.date);
    if (!existing || priority[cls] > priority[existing.status]) map.set(r.date, rec);
  }
  return Array.from(map.values());
}

export async function getHolidaysForMonth(
  organizationId: string,
  year: number,
  month: number,
): Promise<HolidayRecord[]> {
  const start = new Date(Date.UTC(year, month, 1)).toISOString().slice(0, 10);
  const end = new Date(Date.UTC(year, month + 1, 0)).toISOString().slice(0, 10);
  const { data, error } = await parentSupabase
    .from("holidays")
    .select("holiday_date, holiday_name, is_active")
    .eq("organization_id", organizationId)
    .eq("is_active", true)
    .gte("holiday_date", start)
    .lte("holiday_date", end);
  if (error) return [];
  return ((data ?? []) as Array<{ holiday_date: string; holiday_name: string }>).map((h) => ({
    date: h.holiday_date,
    name: h.holiday_name,
  }));
}

export async function getStudentData(studentId: string): Promise<StudentInfo | null> {
  const { data, error } = await parentSupabase
    .from("students_or_clients")
    .select(
      "id, organization_id, name, admission_number, class, section, roll_number, father_name, mother_name, photo_url, academic_year, gender, date_of_birth, blood_group, phone, address, transport_opted, transport_route, transport_stop, aadhaar_last_four, status",
    )
    .eq("id", studentId)
    .maybeSingle();
  if (error) throw error;
  return (data as StudentInfo) ?? null;
}

export async function getStudentByAdmissionNo(admissionNo: string): Promise<StudentInfo | null> {
  const { data, error } = await parentSupabase
    .from("students_or_clients")
    .select(
      "id, organization_id, name, admission_number, class, section, roll_number, father_name, mother_name, photo_url, academic_year, gender, date_of_birth, blood_group, phone, address, transport_opted, transport_route, transport_stop, aadhaar_last_four, status",
    )
    .ilike("admission_number", admissionNo.trim())
    .maybeSingle();
  if (error) throw error;
  return (data as StudentInfo) ?? null;
}

export async function getAttendanceSummary(
  studentId: string,
  organizationId: string,
): Promise<AttendanceSummary> {
  // Use current month with working-days logic (Mon–Sat, minus holidays, up to today).
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.toISOString().slice(0, 10);

  const [records, holidays] = await Promise.all([
    getAttendanceForMonth(studentId, organizationId, year, month).catch(() => []),
    getHolidaysForMonth(organizationId, year, month).catch(() => []),
  ]);
  const recMap = new Map(records.map((r) => [r.date, r]));
  const holSet = new Set(holidays.map((h) => h.date));

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let present = 0;
  let absent = 0;
  let late = 0;
  let leave = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    if (iso > today) continue;
    const weekday = new Date(year, month, d).getDay();
    if (weekday === 0) continue;
    if (holSet.has(iso)) continue;
    const rec = recMap.get(iso);
    if (!rec) {
      absent++;
    } else if (rec.status === "present") present++;
    else if (rec.status === "absent") absent++;
    else if (rec.status === "late") late++;
    else if (rec.status === "leave") leave++;
  }
  const total = present + absent + late + leave;
  const percentage = total === 0 ? 0 : Math.round(((present + late) / total) * 100);
  return { totalDays: total, presentDays: present, absentDays: absent, lateDays: late, percentage };
}

export async function getFeeSummary(
  studentId: string,
  organizationId: string,
): Promise<FeeSummary> {
  // PRIMARY: read student_fee_terms scoped to the LATEST override (matches CRM, which
  // shows only the active/most-recent override — not the sum of historical overrides).
  let terms: FeeTermRow[] = [];
  const { data: latestOverride } = await parentSupabase
    .from("student_fee_overrides")
    .select("id")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const latestOverrideId = (latestOverride as { id?: string } | null)?.id ?? null;
  if (latestOverrideId) {
    const { data: ovTerms } = await parentSupabase
      .from("student_fee_terms")
      .select(
        "term_amount, paid_amount, due_amount, due_date, status, late_fee_paid, balance_amount",
      )
      .eq("student_fee_override_id", latestOverrideId);
    terms = (ovTerms ?? []) as FeeTermRow[];
  }
  // Secondary fallback: any term directly tied to the student (legacy rows).
  if (!terms || terms.length === 0) {
    terms = await fetchStudentFeeTerms(studentId);
  }

  // (legacy fallback removed — primary now scopes to latest override directly)

  let total = 0;
  let paid = 0;
  let pending = 0;
  let nextDueDate: string | null = null;

  if (terms && terms.length > 0) {
    const today = new Date().toISOString().slice(0, 10);
    for (const t of terms) {
      total += Number(t.term_amount ?? 0);
      paid += Number(t.paid_amount ?? 0);
      const remaining =
        t.balance_amount != null
          ? Number(t.balance_amount)
          : t.due_amount != null
            ? Number(t.due_amount)
            : Number(t.term_amount ?? 0) - Number(t.paid_amount ?? 0);
      if (remaining > 0) {
        pending += remaining;
        if (t.due_date && t.due_date >= today) {
          if (!nextDueDate || t.due_date < nextDueDate) nextDueDate = t.due_date;
        }
      }
    }
  } else {
    // FINAL FALLBACK: derive from fee_structure for the student's class.
    const { data: student } = await parentSupabase
      .from("students_or_clients")
      .select("class, section, academic_year")
      .eq("id", studentId)
      .maybeSingle();
    const cls = (student as { class?: string | null } | null)?.class ?? null;
    if (cls) {
      let q = parentSupabase
        .from("fee_structure")
        .select("tuition_fee, base_annual_fee, monthly_fee, billing_type, section, academic_year")
        .eq("organization_id", organizationId)
        .eq("class", cls);
      const { data: rows } = await q;
      const list = (rows ?? []) as Array<{
        tuition_fee: number | null;
        base_annual_fee: number | null;
        monthly_fee: number | null;
        billing_type: string | null;
        section: string | null;
        academic_year: string | null;
      }>;
      const sec = (student as { section?: string | null } | null)?.section ?? null;
      const yr = (student as { academic_year?: string | null } | null)?.academic_year ?? null;
      // Prefer matching section + academic year if available, else first row.
      const match =
        list.find((r) => (!sec || !r.section || r.section === sec) && (!yr || !r.academic_year || r.academic_year === yr)) ??
        list[0];
      if (match) {
        const annual =
          Number(match.tuition_fee ?? 0) ||
          Number(match.base_annual_fee ?? 0) ||
          Number(match.monthly_fee ?? 0) * 12;
        total = annual;
        pending = annual;
      }
    }
  }

  return { total, paid, pending, nextDueDate };
}

type FeeTermRow = {
  term_amount: number | null;
  paid_amount: number | null;
  due_amount: number | null;
  balance_amount: number | null;
  due_date: string | null;
  status: string | null;
};

async function fetchStudentFeeTerms(studentId: string): Promise<FeeTermRow[]> {
  const { data } = await parentSupabase
    .from("student_fee_terms")
    .select(
      "term_amount, paid_amount, due_amount, due_date, status, late_fee_paid, balance_amount",
    )
    .eq("student_id", studentId);
  return (data ?? []) as FeeTermRow[];
}

export async function getMarksSummary(
  studentId: string,
  organizationId: string,
): Promise<MarksSummary> {
  const { data, error } = await parentSupabase
    .from("marks_entries")
    .select("subject, marks_obtained, max_marks, is_absent, created_at")
    .eq("student_id", studentId)
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) throw error;
  const rows = (data ?? []) as Array<{
    subject: string;
    marks_obtained: number | null;
    max_marks: number | null;
    is_absent: boolean | null;
    created_at: string;
  }>;
  let totalObt = 0;
  let totalMax = 0;
  for (const r of rows) {
    if (r.is_absent) continue;
    if (r.marks_obtained != null && r.max_marks != null && Number(r.max_marks) > 0) {
      totalObt += Number(r.marks_obtained);
      totalMax += Number(r.max_marks);
    }
  }
  const averagePercent = totalMax > 0 ? Math.round((totalObt / totalMax) * 100) : null;
  return {
    recent: rows.slice(0, 5).map((r) => ({
      subject: r.subject,
      marks_obtained: r.marks_obtained,
      max_marks: r.max_marks,
      is_absent: !!r.is_absent,
    })),
    averagePercent,
  };
}

export async function getAssignments(
  organizationId: string,
  className: string | null,
  sectionName: string | null,
): Promise<AssignmentItem[]> {
  let q = parentSupabase
    .from("assignments")
    .select("id, title, subject, due_date, description, class_name, section_name, organization_id")
    .eq("organization_id", organizationId)
    .order("due_date", { ascending: true, nullsFirst: false })
    .limit(20);
  if (className) q = q.eq("class_name", className);
  const { data, error } = await q;
  if (error) throw error;
  let rows = (data ?? []) as Array<AssignmentItem & { section_name: string | null }>;
  if (sectionName) {
    rows = rows.filter((r) => !r.section_name || r.section_name === sectionName);
  }
  // Prefer upcoming first
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = rows.filter((r) => !r.due_date || r.due_date >= today);
  return (upcoming.length ? upcoming : rows).slice(0, 5);
}

export async function getCirculars(
  organizationId: string,
  className: string | null,
): Promise<CircularItem[]> {
  const { data, error } = await parentSupabase
    .from("circulars")
    .select("id, title, description, scheduled_at, created_at, target_classes, target_roles, status, is_archived")
    .eq("organization_id", organizationId)
    .eq("is_archived", false)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) throw error;
  const rows = (data ?? []) as Array<
    CircularItem & {
      target_classes: string[] | null;
      target_roles: string[] | null;
      status: string | null;
    }
  >;
  const filtered = rows.filter((r) => {
    if (r.status && !["sent", "published", "active"].includes(r.status.toLowerCase())) {
      // accept anything non-draft
      if (r.status.toLowerCase() === "draft") return false;
    }
    if (r.target_roles && r.target_roles.length > 0) {
      const ok = r.target_roles.some((x) => ["parent", "parents", "all"].includes(x.toLowerCase()));
      if (!ok) return false;
    }
    if (r.target_classes && r.target_classes.length > 0 && className) {
      if (!r.target_classes.includes(className)) return false;
    }
    return true;
  });
  return filtered.slice(0, 5).map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    scheduled_at: r.scheduled_at,
    created_at: r.created_at,
  }));
}