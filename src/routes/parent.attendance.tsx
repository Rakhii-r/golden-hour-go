import { createFileRoute } from "@tanstack/react-router";
import { RequireParentAuth } from "@/components/parent/RequireParentAuth";
import { ParentLayout } from "@/components/parent/ParentLayout";
import {
  ParentDashboardProvider,
  useParentDashboardCtx,
} from "@/hooks/parent-dashboard-context";
import { AttendanceCalendar } from "@/components/parent/AttendanceCalendar";

export const Route = createFileRoute("/parent/attendance")({
  head: () => ({
    meta: [
      { title: "Attendance — Parent Portal" },
      { name: "description", content: "View your child's monthly attendance." },
    ],
  }),
  component: () => (
    <RequireParentAuth>
      <ParentDashboardProvider>
        <ParentLayout>
          <AttendancePage />
        </ParentLayout>
      </ParentDashboardProvider>
    </RequireParentAuth>
  ),
});

function AttendancePage() {
  const { student, loading } = useParentDashboardCtx();
  if (loading && !student) {
    return <div className="glass p-6 text-sm parent-muted">Loading…</div>;
  }
  return (
    <div className="space-y-5">
      <div className="glass-strong border-l-4 border-l-primary p-6">
        <h1 className="text-xl font-semibold text-secondary md:text-2xl">Attendance</h1>
        <p className="mt-1 parent-muted">
          Monthly attendance for{" "}
          <span className="font-medium text-foreground">{student?.name ?? "your child"}</span>
        </p>
      </div>
      <AttendanceCalendar
        studentId={student?.id ?? null}
        organizationId={student?.organization_id ?? null}
      />
    </div>
  );
}
