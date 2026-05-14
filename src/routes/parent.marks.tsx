import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GraduationCap } from "lucide-react";
import { RequireParentAuth } from "@/components/parent/RequireParentAuth";
import { ParentLayout } from "@/components/parent/ParentLayout";
import {
  ParentDashboardProvider,
  useParentDashboardCtx,
} from "@/hooks/parent-dashboard-context";
import { Skeleton } from "@/components/ui/skeleton";
import { parentSupabase } from "@/lib/parent-supabase";

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

interface MarkRow {
  id: string;
  subject: string;
  marks_obtained: number | null;
  max_marks: number | null;
  is_absent: boolean | null;
  exam_name: string | null;
  exam_type: string | null;
  grade: string | null;
  remarks: string | null;
  created_at: string;
}

function MarksPage() {
  const { student } = useParentDashboardCtx();
  const [rows, setRows] = useState<MarkRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!student?.id || !student?.organization_id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data } = await parentSupabase
        .from("marks_entries")
        .select("id, subject, marks_obtained, max_marks, is_absent, exam_name, exam_type, grade, remarks, created_at")
        .eq("student_id", student.id)
        .eq("organization_id", student.organization_id)
        .order("created_at", { ascending: false });
      if (cancelled) return;
      setRows((data ?? []) as MarkRow[]);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [student?.id, student?.organization_id]);

  // Group by exam_name
  const groups = rows.reduce<Record<string, MarkRow[]>>((acc, r) => {
    const k = r.exam_name ?? "Other";
    (acc[k] ||= []).push(r);
    return acc;
  }, {});

  const overall = (() => {
    let obt = 0;
    let max = 0;
    for (const r of rows) {
      if (r.is_absent) continue;
      if (r.marks_obtained != null && r.max_marks != null && Number(r.max_marks) > 0) {
        obt += Number(r.marks_obtained);
        max += Number(r.max_marks);
      }
    }
    return max > 0 ? Math.round((obt / max) * 100) : null;
  })();

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
            <p className="mt-2 text-2xl font-bold text-secondary">{Object.keys(groups).length}</p>
          )}
        </div>
        <div className="glass p-5">
          <p className="text-sm parent-muted">Subjects Recorded</p>
          {loading ? <Skeleton className="mt-2 h-8 w-20" /> : (
            <p className="mt-2 text-2xl font-bold text-secondary">{new Set(rows.map((r) => r.subject)).size}</p>
          )}
        </div>
      </div>

      {loading ? (
        <div className="glass p-5"><Skeleton className="h-32 w-full" /></div>
      ) : rows.length === 0 ? (
        <div className="glass p-6 text-center text-sm parent-muted">No marks recorded yet.</div>
      ) : (
        Object.entries(groups).map(([examName, items]) => (
          <div key={examName} className="glass p-5">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-secondary">
              <GraduationCap className="h-4 w-4" /> {examName}
              {items[0]?.exam_type && (
                <span className="ml-2 rounded-full border border-border bg-muted px-2 py-0.5 text-xs capitalize parent-muted">
                  {items[0].exam_type}
                </span>
              )}
            </h2>
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
                  {items.map((m) => {
                    const pct = !m.is_absent && m.marks_obtained != null && m.max_marks && Number(m.max_marks) > 0
                      ? Math.round((Number(m.marks_obtained) / Number(m.max_marks)) * 100)
                      : null;
                    return (
                      <tr key={m.id} className="border-t border-border">
                        <td className="py-2 pr-3">{m.subject}</td>
                        <td className="py-2 pr-3">
                          {m.is_absent ? <span className="text-destructive">Absent</span> : `${m.marks_obtained ?? "—"} / ${m.max_marks ?? "—"}`}
                        </td>
                        <td className="py-2 pr-3">{pct != null ? `${pct}%` : "—"}</td>
                        <td className="py-2 pr-3">{m.grade ?? "—"}</td>
                        <td className="py-2 pr-3 text-xs parent-muted">{m.remarks ?? "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
