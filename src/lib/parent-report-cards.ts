import { parentSupabase } from "./parent-supabase";
import type { ReportCardData, ReportCardSubjectRow } from "@/components/parent/ReportCard";

interface MarkRow {
  id: string;
  subject: string;
  marks_obtained: number | null;
  max_marks: number | null;
  is_absent: boolean | null;
  remarks: string | null;
  academic_year: string | null;
  exam_type_id: string | null;
  class_name: string | null;
  section: string | null;
}

interface ExamType {
  id: string;
  name: string;
  academic_year: string | null;
  display_order: number | null;
}

export interface GradeRule {
  grade: string;
  min_percentage: number;
  max_percentage: number;
}

// Falls back to these bands only when the organization has no active grade_scales rows
// covering the given percentage (grade_scales is the DB-driven equivalent of a "grade_config" table).
export function computeGradeForPercentage(pct: number | null, gradeRules: GradeRule[]): string | null {
  if (pct == null) return null;
  const r = gradeRules.find((g) => pct >= Number(g.min_percentage) && pct <= Number(g.max_percentage));
  if (r) return r.grade;
  if (gradeRules.length > 0) return null;
  if (pct >= 90) return "O";
  if (pct >= 80) return "A+";
  if (pct >= 70) return "A";
  if (pct >= 60) return "B+";
  if (pct >= 50) return "B";
  if (pct >= 40) return "C";
  return "Fail";
}

export interface ReportCardSummary {
  exam_type_id: string;
  exam_name: string;
  academic_year: string | null;
  display_order: number | null;
  subject_count: number;
  total_obtained: number;
  total_max: number;
  percentage: number | null;
  overall_grade: string | null;
  result_status: "Pass" | "Fail" | null;
  latest_at: string;
}

export interface ReportCardBundle {
  summaries: ReportCardSummary[];
  build: (examTypeId: string) => ReportCardData | null;
  gradeRules: GradeRule[];
}

export async function loadReportCards(args: {
  studentId: string;
  organizationId: string;
  student: {
    name: string;
    admission_number: string | null;
    roll_number: string | null;
    class: string | null;
    section: string | null;
    father_name: string | null;
    mother_name: string | null;
    academic_year: string | null;
  };
  schoolName: string;
  schoolLogoUrl: string | null;
}): Promise<ReportCardBundle> {
  const { studentId, organizationId, student, schoolName, schoolLogoUrl } = args;
  const audit = import.meta.env.DEV;

  const [marksRes, examTypesRes, gradesRes] = await Promise.all([
    parentSupabase
      .from("marks_entries")
      .select("id, subject, marks_obtained, max_marks, is_absent, remarks, academic_year, exam_type_id, class_name, section, created_at")
      .eq("student_id", studentId)
      .eq("organization_id", organizationId)
      .eq("is_archived", false)
      .order("created_at", { ascending: false }),
    parentSupabase
      .from("exam_types")
      .select("id, name, academic_year, display_order")
      .eq("organization_id", organizationId),
    parentSupabase
      .from("grade_scales")
      .select("grade, min_percentage, max_percentage")
      .eq("organization_id", organizationId)
      .eq("is_active", true)
      .order("display_order", { ascending: true }),
  ]);
  if (audit) {
    console.info("[parent-report-cards:audit] raw query result", {
      studentId,
      organizationId,
      filters: { student_id: studentId, organization_id: organizationId, is_archived: false },
      marksRows: marksRes.data?.length ?? 0,
      marksError: marksRes.error?.message ?? null,
      examTypesRows: examTypesRes.data?.length ?? 0,
      examTypesError: examTypesRes.error?.message ?? null,
      gradeScalesRows: gradesRes.data?.length ?? 0,
      gradeScalesError: gradesRes.error?.message ?? null,
    });
  }

  const marks = ((marksRes.data ?? []) as Array<MarkRow & { created_at: string }>);
  const examTypes = (examTypesRes.data ?? []) as ExamType[];
  const gradeRules = (gradesRes.data ?? []) as GradeRule[];
  const examMap = new Map(examTypes.map((e) => [e.id, e]));

  const computeGrade = (pct: number | null): string | null => computeGradeForPercentage(pct, gradeRules);

  // Group marks by exam_type_id
  const groups = new Map<string, Array<MarkRow & { created_at: string }>>();
  for (const m of marks) {
    if (!m.exam_type_id) continue;
    const arr = groups.get(m.exam_type_id) ?? [];
    arr.push(m);
    groups.set(m.exam_type_id, arr);
  }

  const summaries: ReportCardSummary[] = [];
  for (const [examTypeId, items] of groups) {
    const ex = examMap.get(examTypeId);
    if (!ex) continue;
    let obt = 0, max = 0;
    for (const m of items) {
      if (m.max_marks == null || Number(m.max_marks) <= 0) continue;
      max += Number(m.max_marks);
      if (!m.is_absent && m.marks_obtained != null) {
        obt += Number(m.marks_obtained);
      }
    }
    const pct = max > 0 ? Math.round((obt / max) * 100) : null;
    const allPass = items.every((m) => {
      if (m.is_absent) return false;
      if (m.marks_obtained == null || m.max_marks == null || Number(m.max_marks) === 0) return true;
      return (Number(m.marks_obtained) / Number(m.max_marks)) * 100 >= 33;
    });
    summaries.push({
      exam_type_id: examTypeId,
      exam_name: ex.name,
      academic_year: ex.academic_year ?? items[0]?.academic_year ?? null,
      display_order: ex.display_order ?? 0,
      subject_count: items.length,
      total_obtained: obt,
      total_max: max,
      percentage: pct,
      overall_grade: computeGrade(pct),
      result_status: pct == null ? null : (allPass ? "Pass" : "Fail"),
      latest_at: items.reduce((acc, m) => (m.created_at > acc ? m.created_at : acc), items[0].created_at),
    });
  }
  summaries.sort((a, b) => (b.latest_at > a.latest_at ? 1 : -1));
  if (audit) {
    console.info("[parent-report-cards:audit] transformed result", {
      studentId,
      rawMarksRows: marks.length,
      groupedExamCount: groups.size,
      summariesCount: summaries.length,
      subjectsCount: new Set(marks.map((m) => m.subject)).size,
      skippedWithoutExamType: marks.filter((m) => !m.exam_type_id).length,
      skippedMissingExamType: Array.from(groups.keys()).filter((id) => !examMap.has(id)).length,
    });
  }

  const build = (examTypeId: string): ReportCardData | null => {
    const items = groups.get(examTypeId);
    const ex = examMap.get(examTypeId);
    if (!items || !ex) return null;
    const summary = summaries.find((s) => s.exam_type_id === examTypeId);
    if (!summary) return null;

    const subjects: ReportCardSubjectRow[] = items
      .slice()
      .sort((a, b) => a.subject.localeCompare(b.subject))
      .map((m) => {
        const pct = !m.is_absent && m.marks_obtained != null && m.max_marks && Number(m.max_marks) > 0
          ? (Number(m.marks_obtained) / Number(m.max_marks)) * 100 : null;
        return {
          subject: m.subject,
          marks_obtained: m.marks_obtained,
          max_marks: m.max_marks,
          is_absent: m.is_absent,
          grade: computeGrade(pct != null ? Math.round(pct) : null),
          remarks: m.remarks,
        };
      });

    const teacherRemarks = items.map((m) => m.remarks).filter(Boolean).slice(0, 1)[0] ?? null;
    const classLabel = student.class
      ? `${student.class}${student.section ? " - " + student.section : ""}`
      : (items[0]?.class_name ? `${items[0].class_name}${items[0].section ? " - " + items[0].section : ""}` : null);

    return {
      exam_name: ex.name,
      academic_year: summary.academic_year,
      student_name: student.name,
      admission_number: student.admission_number,
      roll_number: student.roll_number,
      class_label: classLabel,
      parent_name: student.father_name || student.mother_name || null,
      school_name: schoolName,
      school_logo_url: schoolLogoUrl,
      subjects,
      subject_count: summary.subject_count,
      total_obtained: summary.total_obtained,
      total_max: summary.total_max,
      percentage: summary.percentage,
      overall_grade: summary.overall_grade,
      rank: null,
      teacher_remarks: teacherRemarks,
      result_status: summary.result_status,
      issued_on: summary.latest_at,
    };
  };

  return { summaries, build, gradeRules };
}
