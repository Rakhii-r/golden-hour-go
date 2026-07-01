import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { RequireParentAuth } from "@/components/parent/RequireParentAuth";
import { ParentLayout } from "@/components/parent/ParentLayout";
import {
  ParentDashboardProvider,
  useParentDashboardCtx,
} from "@/hooks/parent-dashboard-context";
import { StudentProfileCard } from "@/components/parent/StudentProfileCard";
import { getAttendanceSummary, type AttendanceSummary } from "@/lib/parent-data";
import { loadReportCards, computeGradeForPercentage } from "@/lib/parent-report-cards";

export const Route = createFileRoute("/parent/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Parent Portal" },
      { name: "description", content: "Student profile and personal details." },
    ],
  }),
  component: () => (
    <RequireParentAuth>
      <ParentDashboardProvider>
        <ParentLayout>
          <ProfilePage />
        </ParentLayout>
      </ParentDashboardProvider>
    </RequireParentAuth>
  ),
});

function ProfilePage() {
  const { student, studentId, organizationId, organization, loading } = useParentDashboardCtx();
  const [attendance, setAttendance] = useState<AttendanceSummary | null>(null);
  const [academic, setAcademic] = useState<{
    overallPct: number | null;
    grade: string | null;
    result: "PASS" | "FAIL" | null;
    subjectCount: number;
  } | null>(null);

  useEffect(() => {
    const sid = studentId ?? student?.id ?? null;
    const oid = organizationId ?? student?.organization_id ?? null;
    if (!student || !sid || !oid) return;
    let cancelled = false;
    getAttendanceSummary(sid, oid).then((a) => { if (!cancelled) setAttendance(a); }).catch(() => {});
    loadReportCards({
      studentId: sid,
      organizationId: oid,
      student: {
        name: student.name ?? "Student",
        admission_number: student.admission_number ?? null,
        roll_number: student.roll_number ?? null,
        class: student.class ?? null,
        section: student.section ?? null,
        father_name: student.father_name ?? null,
        mother_name: student.mother_name ?? null,
        academic_year: student.academic_year ?? null,
      },
      schoolName: organization?.name ?? "School",
      schoolLogoUrl: organization?.logo_url ?? null,
    }).then((bundle) => {
      if (cancelled) return;
      const totalObt = bundle.summaries.reduce((a, s) => a + s.total_obtained, 0);
      const totalMax = bundle.summaries.reduce((a, s) => a + s.total_max, 0);
      const overallPct = totalMax > 0 ? Math.round((totalObt / totalMax) * 100) : null;
      const subjectCount = new Set(
        bundle.summaries.flatMap((s) => bundle.build(s.exam_type_id)?.subjects.map((sub) => sub.subject) ?? []),
      ).size;
      setAcademic({
        overallPct,
        grade: computeGradeForPercentage(overallPct, bundle.gradeRules),
        result: overallPct == null ? null : (overallPct >= 40 ? "PASS" : "FAIL"),
        subjectCount,
      });
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [studentId, organizationId, student?.id, student?.organization_id, organization?.name, organization?.logo_url]);

  return (
    <div className="space-y-5">
      <div className="glass-strong border-l-4 border-l-primary p-6">
        <h1 className="text-xl font-semibold text-secondary md:text-2xl">Student Profile</h1>
        <p className="mt-1 parent-muted">Complete details of your child's school record.</p>
      </div>
      <StudentProfileCard student={student} loading={loading} />

      <div className="glass p-5">
        <p className="mb-3 text-sm font-semibold text-secondary">Attendance Summary</p>
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
          <div>
            <p className="text-sm parent-muted">Present</p>
            <p className="mt-1 text-xl font-bold text-secondary">{attendance ? attendance.presentDays : "—"}</p>
          </div>
          <div>
            <p className="text-sm parent-muted">Absent</p>
            <p className="mt-1 text-xl font-bold text-secondary">{attendance ? attendance.absentDays : "—"}</p>
          </div>
          <div>
            <p className="text-sm parent-muted">Total Days</p>
            <p className="mt-1 text-xl font-bold text-secondary">{attendance ? attendance.totalDays : "—"}</p>
          </div>
          <div>
            <p className="text-sm parent-muted">Percentage</p>
            <p className="mt-1 text-xl font-bold text-secondary">{attendance ? `${attendance.percentage}%` : "—"}</p>
          </div>
        </div>
      </div>

      <div className="glass p-5">
        <p className="mb-3 text-sm font-semibold text-secondary">Academic Performance Summary</p>
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
          <div>
            <p className="text-sm parent-muted">Overall %</p>
            <p className="mt-1 text-xl font-bold text-secondary">{academic?.overallPct != null ? `${academic.overallPct}%` : "—"}</p>
          </div>
          <div>
            <p className="text-sm parent-muted">Grade</p>
            <p className="mt-1 text-xl font-bold text-secondary">{academic?.grade ?? "—"}</p>
          </div>
          <div>
            <p className="text-sm parent-muted">Result</p>
            <p className={`mt-1 text-xl font-bold ${academic?.result === "FAIL" ? "text-destructive" : "text-secondary"}`}>
              {academic?.result ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-sm parent-muted">Total Subjects</p>
            <p className="mt-1 text-xl font-bold text-secondary">{academic ? academic.subjectCount : "—"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
