import { parentSupabase } from "./parent-supabase";
import { computeGradeForPercentage, type GradeRule } from "./parent-report-cards";
import { getAttendanceForMonth, getHolidaysForMonth } from "./parent-data";

// Ported verbatim from the CRM's groupExamColumns() (F:\edu-grow-connect\src\lib\final-result-themes.ts)
// so FA/SA classification matches the CRM's "Classic" theme exactly.
const isSA = (label: string) => /\bsa\b|^sa[\s\-_]?\d|summative|semester|mid[\s\-_]?term|midterm|half[\s\-_]?yearly|halfyearly|final|annual|term[\s\-_]?\d|term\s+(end|exam)/i.test(label);

const ATTENDANCE_MONTHS = [
  "June", "July", "August", "September", "October", "November", "December",
  "January", "February", "March", "April", "May",
];

interface MarkRow {
  subject: string;
  marks_obtained: number | null;
  max_marks: number | null;
  is_absent: boolean | null;
  remarks: string | null;
  exam_type_id: string | null;
}

interface ExamTypeRow {
  id: string;
  name: string;
  display_order: number | null;
  max_marks: number;
}

export interface ConsolidatedExamColumn {
  id: string;
  label: string;
  maxMarks: number;
  group: "FA" | "SA";
}

export interface ConsolidatedCell {
  entered: boolean;
  obtained: number | null;
  isAbsent: boolean;
  grade: string | null;
  gpa: string | null;
}

export interface ConsolidatedSubjectRow {
  subject: string;
  cells: Record<string, ConsolidatedCell>;
  totalObtained: number;
  totalMax: number;
}

export interface ConsolidatedAttendanceMonth {
  label: string;
  working: number;
  present: number;
}

export interface ConsolidatedReportCardData {
  schoolName: string;
  schoolLogoUrl: string | null;
  academicYear: string;
  studentName: string;
  admissionNumber: string | null;
  rollNumber: string | null;
  dateOfBirth: string | null;
  classLabel: string | null;
  examColumns: ConsolidatedExamColumn[];
  subjects: ConsolidatedSubjectRow[];
  columnTotals: Record<string, number>;
  totalObtained: number;
  totalMax: number;
  overallPercentage: number | null;
  overallGrade: string | null;
  gpa: string | null;
  result: "PASS" | "FAIL" | null;
  teacherRemarks: string | null;
  attendance: {
    months: ConsolidatedAttendanceMonth[];
    totalWorking: number;
    totalPresent: number;
    totalAbsent: number;
  };
  issuedOn: string;
}

async function loadAttendanceForAcademicYear(
  organizationId: string,
  studentId: string,
  academicYear: string | null,
): Promise<ConsolidatedReportCardData["attendance"]> {
  const startYearMatch = academicYear?.match(/\d{4}/);
  const startYear = startYearMatch ? Number(startYearMatch[0]) : new Date().getFullYear();
  const today = new Date().toISOString().slice(0, 10);

  const monthSpecs = ATTENDANCE_MONTHS.map((label, i) => ({
    label,
    year: i < 7 ? startYear : startYear + 1, // June..Dec => startYear, Jan..May => startYear+1
    month: (5 + i) % 12, // June=5 ... May=4 (0-indexed)
  }));

  const results = await Promise.all(
    monthSpecs.map(async ({ label, year, month }) => {
      const [records, holidays] = await Promise.all([
        getAttendanceForMonth(studentId, organizationId, year, month).catch(() => []),
        getHolidaysForMonth(organizationId, year, month).catch(() => []),
      ]);
      const recMap = new Map(records.map((r) => [r.date, r]));
      const holSet = new Set(holidays.map((h) => h.date));
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      let working = 0;
      let present = 0;
      for (let d = 1; d <= daysInMonth; d++) {
        const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        if (iso > today) continue;
        const weekday = new Date(year, month, d).getDay();
        if (weekday === 0) continue;
        if (holSet.has(iso)) continue;
        working++;
        const rec = recMap.get(iso);
        if (rec && (rec.status === "present" || rec.status === "late")) present++;
      }
      return { label, working, present };
    }),
  );

  const totalWorking = results.reduce((a, m) => a + m.working, 0);
  const totalPresent = results.reduce((a, m) => a + m.present, 0);
  return { months: results, totalWorking, totalPresent, totalAbsent: totalWorking - totalPresent };
}

export async function loadConsolidatedReportCard(args: {
  studentId: string;
  organizationId: string;
  student: {
    name: string;
    admission_number: string | null;
    roll_number: string | null;
    class: string | null;
    section: string | null;
    date_of_birth: string | null;
    academic_year: string | null;
  };
  schoolName: string;
  schoolLogoUrl: string | null;
}): Promise<ConsolidatedReportCardData> {
  const { studentId, organizationId, student, schoolName, schoolLogoUrl } = args;

  const [marksRes, examTypesRes, gradesRes] = await Promise.all([
    parentSupabase
      .from("marks_entries")
      .select("subject, marks_obtained, max_marks, is_absent, remarks, exam_type_id")
      .eq("student_id", studentId)
      .eq("organization_id", organizationId)
      .eq("is_archived", false),
    parentSupabase
      .from("exam_types")
      .select("id, name, display_order, max_marks")
      .eq("organization_id", organizationId),
    parentSupabase
      .from("grade_scales")
      .select("grade, min_percentage, max_percentage")
      .eq("organization_id", organizationId)
      .eq("is_active", true)
      .order("display_order", { ascending: true }),
  ]);

  const marks = (marksRes.data ?? []) as MarkRow[];
  const examTypes = (examTypesRes.data ?? []) as ExamTypeRow[];
  const gradeRules = (gradesRes.data ?? []) as GradeRule[];
  const examMap = new Map(examTypes.map((e) => [e.id, e]));

  // Only include assessments that actually have at least one mark entry for this student.
  const usedExamIds = new Set(marks.map((m) => m.exam_type_id).filter((id): id is string => !!id));
  const usedExamTypes = examTypes
    .filter((e) => usedExamIds.has(e.id))
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0) || a.name.localeCompare(b.name));

  const examColumns: ConsolidatedExamColumn[] = usedExamTypes.map((e) => ({
    id: e.id,
    label: e.name,
    maxMarks: Number(e.max_marks) || 0,
    group: isSA(e.name) ? "SA" : "FA",
  }));

  const marksByExamSubject = new Map<string, MarkRow>();
  for (const m of marks) {
    if (!m.exam_type_id) continue;
    marksByExamSubject.set(`${m.exam_type_id}::${m.subject}`, m);
  }

  const subjectNames = Array.from(new Set(marks.map((m) => m.subject))).sort((a, b) => a.localeCompare(b));

  const computeGrade = (pct: number | null) => computeGradeForPercentage(pct, gradeRules);

  const subjects: ConsolidatedSubjectRow[] = subjectNames.map((subject) => {
    const cells: Record<string, ConsolidatedCell> = {};
    let totalObtained = 0;
    let totalMax = 0;
    for (const col of examColumns) {
      const row = marksByExamSubject.get(`${col.id}::${subject}`);
      if (!row) {
        cells[col.id] = { entered: false, obtained: null, isAbsent: false, grade: null, gpa: null };
        continue;
      }
      const maxMarks = row.max_marks != null && Number(row.max_marks) > 0 ? Number(row.max_marks) : null;
      const isAbsent = !!row.is_absent;
      const obtained = isAbsent ? null : row.marks_obtained;
      const pct = !isAbsent && obtained != null && maxMarks != null ? (Number(obtained) / maxMarks) * 100 : null;
      cells[col.id] = {
        entered: true,
        obtained,
        isAbsent,
        grade: computeGrade(pct != null ? Math.round(pct) : null),
        gpa: pct != null ? (pct / 10).toFixed(1) : null,
      };
      if (maxMarks != null) {
        totalMax += maxMarks;
        if (!isAbsent && obtained != null) totalObtained += Number(obtained);
      }
    }
    return { subject, cells, totalObtained, totalMax };
  });

  const columnTotals: Record<string, number> = {};
  for (const col of examColumns) {
    columnTotals[col.id] = subjects.reduce((sum, s) => {
      const c = s.cells[col.id];
      return sum + (c.entered && !c.isAbsent && c.obtained != null ? Number(c.obtained) : 0);
    }, 0);
  }

  const totalObtained = subjects.reduce((a, s) => a + s.totalObtained, 0);
  const totalMax = subjects.reduce((a, s) => a + s.totalMax, 0);
  const overallPercentage = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : null;
  const overallGrade = computeGrade(overallPercentage);
  const gpa = overallPercentage != null ? (overallPercentage / 10).toFixed(1) : null;
  const result: "PASS" | "FAIL" | null = overallPercentage == null ? null : (overallPercentage >= 40 ? "PASS" : "FAIL");
  const teacherRemarks = marks.map((m) => m.remarks).filter(Boolean).slice(0, 1)[0] ?? null;

  const attendance = await loadAttendanceForAcademicYear(organizationId, studentId, student.academic_year);

  const classLabel = student.class
    ? `${student.class}${student.section ? " - " + student.section : ""}`
    : null;

  return {
    schoolName,
    schoolLogoUrl,
    academicYear: student.academic_year ?? "—",
    studentName: student.name,
    admissionNumber: student.admission_number,
    rollNumber: student.roll_number,
    dateOfBirth: student.date_of_birth,
    classLabel,
    examColumns,
    subjects,
    columnTotals,
    totalObtained,
    totalMax,
    overallPercentage,
    overallGrade,
    gpa,
    result,
    teacherRemarks,
    attendance,
    issuedOn: new Date().toISOString(),
  };
}
