import { createFileRoute } from "@tanstack/react-router";
import { RequireParentAuth } from "@/components/parent/RequireParentAuth";
import { ParentLayout } from "@/components/parent/ParentLayout";
import {
  ParentDashboardProvider,
  useParentDashboardCtx,
} from "@/hooks/parent-dashboard-context";
import { StudentProfileCard } from "@/components/parent/StudentProfileCard";

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
  const { student, loading } = useParentDashboardCtx();
  return (
    <div className="space-y-5">
      <div className="glass-strong border-l-4 border-l-primary p-6">
        <h1 className="text-xl font-semibold text-secondary md:text-2xl">Student Profile</h1>
        <p className="mt-1 parent-muted">Complete details of your child's school record.</p>
      </div>
      <StudentProfileCard student={student} loading={loading} />
    </div>
  );
}
