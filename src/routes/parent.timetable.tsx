import { createFileRoute } from "@tanstack/react-router";
import { RequireParentAuth } from "@/components/parent/RequireParentAuth";
import { ParentLayout } from "@/components/parent/ParentLayout";
import {
  ParentDashboardProvider,
  useParentDashboardCtx,
} from "@/hooks/parent-dashboard-context";
import { TimetableGrid } from "@/components/parent/TimetableGrid";

export const Route = createFileRoute("/parent/timetable")({
  head: () => ({
    meta: [
      { title: "Timetable — Parent Portal" },
      { name: "description", content: "View your child's weekly class timetable." },
    ],
  }),
  component: () => (
    <RequireParentAuth>
      <ParentDashboardProvider>
        <ParentLayout>
          <TimetableContent />
        </ParentLayout>
      </ParentDashboardProvider>
    </RequireParentAuth>
  ),
});

function TimetableContent() {
  const { student, loading } = useParentDashboardCtx();
  if (loading && !student) {
    return <div className="glass p-6 text-sm parent-muted">Loading…</div>;
  }
  return (
    <div className="space-y-5">
      <div className="glass-strong border-l-4 border-l-primary p-6">
        <h1 className="text-xl font-semibold text-secondary md:text-2xl">Class Timetable</h1>
        <p className="mt-1 parent-muted">
          Weekly schedule for{" "}
          <span className="font-medium text-foreground">{student?.name ?? "your child"}</span>
          {student?.class
            ? ` — Class ${student.class}${student.section ? ` • ${student.section}` : ""}`
            : ""}
        </p>
      </div>

      <TimetableGrid
        organizationId={student?.organization_id ?? null}
        className={student?.class ?? null}
        sectionName={student?.section ?? null}
      />
    </div>
  );
}