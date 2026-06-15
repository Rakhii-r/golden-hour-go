import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GraduationCap, Download } from "lucide-react";
import { RequireParentAuth } from "@/components/parent/RequireParentAuth";
import { ParentLayout } from "@/components/parent/ParentLayout";
import {
  ParentDashboardProvider,
  useParentDashboardCtx,
} from "@/hooks/parent-dashboard-context";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { loadReportCards, type ReportCardSummary } from "@/lib/parent-report-cards";
import type { ReportCardData } from "@/components/parent/ReportCard";
import { ReportCardDialog } from "@/components/parent/ReportCardDialog";

export const Route = createFileRoute("/parent/marks")({
  head: () => ({
    meta: [
      { title: "Marks — Parent Portal" },
      { name: "description", content: "View your child's marks across assessments." },
    ],
  }),
  component: () => (
    <RequireParentAuth>
      <ParentDashboardProvider>
        <ParentLayout>
          <MarksPage />
        </ParentLayout>
      </ParentDashboardProvider>
    </RequireParentAuth>
  ),
});

function MarksPage() {
  const { student, studentId, organizationId, organization } = useParentDashboardCtx();
  const [summaries, setSummaries] = useState<ReportCardSummary[]>([]);
  const [cards, setCards] = useState<Record<string, ReportCardData | null>>({});
  const [loading, setLoading] = useState(true);
  const [openCard, setOpenCard] = useState<ReportCardData | null>(null);


  useEffect(() => {
    const effectiveStudentId = studentId ?? student?.id ?? null;
    const effectiveOrganizationId = organizationId ?? student?.organization_id ?? null;
    if (!student || !effectiveStudentId || !effectiveOrganizationId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      console.info("[parent-marks:audit] loading report cards", {
        effectiveStudentId,
        dashboardStudentId: studentId,
        studentRecordId: student?.id ?? null,
        effectiveOrganizationId,
        studentOrganizationId: student?.organization_id ?? null,
        admissionNumber: student?.admission_number ?? null,
        class: student?.class ?? null,
        section: student?.section ?? null,
        academicYear: student?.academic_year ?? null,
      });
      const bundle = await loadReportCards({
        studentId: effectiveStudentId,
        organizationId: effectiveOrganizationId,
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
      });
      if (cancelled) return;
      setSummaries(bundle.summaries);
      const built: Record<string, ReportCardData | null> = {};
      for (const s of bundle.summaries) built[s.exam_type_id] = bundle.build(s.exam_type_id);
      console.info("[parent-marks:audit] transformed stats", {
        returnedSummaries: bundle.summaries.length,
        builtCards: Object.values(built).filter(Boolean).length,
        totalObtained: bundle.summaries.reduce((a, s) => a + s.total_obtained, 0),
        totalMax: bundle.summaries.reduce((a, s) => a + s.total_max, 0),
        subjectsRecorded: new Set(Object.values(built).flatMap((c) => c?.subjects.map((m) => m.subject) ?? [])).size,
      });
      setCards(built);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [studentId, organizationId, student?.id, student?.organization_id, organization?.name, organization?.logo_url]);

  const allSubjects = Object.values(cards).flatMap((c) => c?.subjects ?? []);
  const totalObt = summaries.reduce((a, s) => a + s.total_obtained, 0);
  const totalMax = summaries.reduce((a, s) => a + s.total_max, 0);
  const overall = totalMax > 0 ? Math.round((totalObt / totalMax) * 100) : null;
  const subjectsRecorded = new Set(allSubjects.map((s) => s.subject)).size;

  return (
    <div className="space-y-5">
      <div className="glass-strong border-l-4 border-l-primary p-6">
        <h1 className="text-xl font-semibold text-secondary md:text-2xl">Marks & Grades</h1>
        <p className="mt-1 parent-muted">All assessment results for {student?.name ?? "your child"}.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="glass p-5">
          <p className="text-sm parent-muted">Overall Average</p>
          {loading ? <Skeleton className="mt-2 h-8 w-20" /> : (
            <p className="mt-2 text-2xl font-bold text-secondary">{overall != null ? `${overall}%` : "—"}</p>
          )}
        </div>
        <div className="glass p-5">
          <p className="text-sm parent-muted">Total Assessments</p>
          {loading ? <Skeleton className="mt-2 h-8 w-20" /> : (
            <p className="mt-2 text-2xl font-bold text-secondary">{summaries.length}</p>
          )}
        </div>
        <div className="glass p-5">
          <p className="text-sm parent-muted">Subjects Recorded</p>
          {loading ? <Skeleton className="mt-2 h-8 w-20" /> : (
            <p className="mt-2 text-2xl font-bold text-secondary">{subjectsRecorded}</p>
          )}
        </div>
      </div>

      {loading ? (
        <div className="glass p-5"><Skeleton className="h-32 w-full" /></div>
      ) : summaries.length === 0 ? (
        <div className="glass p-6 text-center text-sm parent-muted">No marks recorded yet.</div>
      ) : (
        summaries.map((s) => {
          const card = cards[s.exam_type_id];
          if (!card) return null;
          return (
            <div key={s.exam_type_id} className="glass p-5">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-secondary">
                  <GraduationCap className="h-4 w-4" /> {s.exam_name}
                </h2>
                {s.academic_year && (
                  <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-xs parent-muted">
                    {s.academic_year}
                  </span>
                )}
                {s.percentage != null && (
                  <span className="text-xs parent-muted">
                    {s.total_obtained}/{s.total_max} · {s.percentage}% {s.overall_grade ? `· ${s.overall_grade}` : ""}
                  </span>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="ml-auto"
                  onClick={() => setOpenCard(card)}
                >
                  <Download className="mr-1.5 h-4 w-4" /> Download Report Card
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left parent-muted">
                    <tr>
                      <th className="py-2 pr-3">Subject</th>
                      <th className="py-2 pr-3">Marks</th>
                      <th className="py-2 pr-3">%</th>
                      <th className="py-2 pr-3">Grade</th>
                      <th className="py-2 pr-3">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {card.subjects.map((m, i) => {
                      const pct = !m.is_absent && m.marks_obtained != null && m.max_marks && Number(m.max_marks) > 0
                        ? Math.round((Number(m.marks_obtained) / Number(m.max_marks)) * 100)
                        : null;
                      return (
                        <tr key={`${m.subject}-${i}`} className="border-t border-border">
                          <td className="py-2 pr-3">{m.subject}</td>
                          <td className="py-2 pr-3">
                            {m.is_absent ? <span className="text-destructive">Absent</span> : `${m.marks_obtained ?? "—"} / ${m.max_marks ?? "—"}`}
                          </td>
                          <td className="py-2 pr-3">{pct != null ? `${pct}%` : "—"}</td>
                          <td className="py-2 pr-3">{m.grade ?? "—"}</td>
                          <td className="py-2 pr-3 text-xs parent-muted">
                            {m.remarks?.trim() || "No Remarks"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })
      )}

      <ReportCardDialog
        open={openCard !== null}
        onOpenChange={(o) => !o && setOpenCard(null)}
        data={openCard}
      />
    </div>
  );
}
