import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Wallet,
  GraduationCap,
  ClipboardList,
  Megaphone,
  AlertCircle,
  CreditCard,
} from "lucide-react";
import { RequireParentAuth } from "@/components/parent/RequireParentAuth";
import { ParentLayout } from "@/components/parent/ParentLayout";
import {
  ParentDashboardProvider,
  useParentDashboardCtx,
} from "@/hooks/parent-dashboard-context";
import { Skeleton } from "@/components/ui/skeleton";
import { StudentProfileCard } from "@/components/parent/StudentProfileCard";
import { AttendanceCalendar } from "@/components/parent/AttendanceCalendar";

export const Route = createFileRoute("/parent/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Parent Portal" },
      { name: "description", content: "View your child's school information at a glance." },
    ],
  }),
  component: () => (
    <RequireParentAuth>
      <ParentDashboardProvider>
        <ParentLayout>
          <DashboardContent />
        </ParentLayout>
      </ParentDashboardProvider>
    </RequireParentAuth>
  ),
});

const fmtCurrency = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(
    Math.round(n || 0),
  );

const fmtDate = (s: string | null) => {
  if (!s) return null;
  try {
    return new Date(s).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return s;
  }
};

function DashboardContent() {
  const { student, attendance, fees, marks, assignments, circulars, loading, error } =
    useParentDashboardCtx();

  const parentName = student?.father_name || student?.mother_name || "Parent";
  const studentName = student?.name ?? "your child";

  return (
    <div className="space-y-5">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-strong border-l-4 border-l-primary p-6"
      >
        <h1 className="text-xl font-semibold text-secondary md:text-2xl">
          Welcome, {parentName}
        </h1>
        <p className="mt-1 parent-muted">
          Viewing <span className="font-medium text-foreground">{studentName}</span>
          {student?.class
            ? ` — Class ${student.class}${student.section ? ` • ${student.section}` : ""}`
            : ""}
          {student?.admission_number ? ` • Adm. ${student.admission_number}` : ""}
        </p>
      </motion.section>

      <StudentProfileCard student={student} loading={loading} />

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Row 1: Attendance calendar (2fr) + Fees + Marks */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <AttendanceCalendar
            studentId={student?.id ?? null}
            organizationId={student?.organization_id ?? null}
          />
        </div>

        <DashCard
          title="Pending Fees"
          icon={Wallet}
          loading={loading && !fees}
          delay={0.05}
          value={fees ? fmtCurrency(fees.pending) : "—"}
          subtitle={
            fees
              ? `Paid ${fmtCurrency(fees.paid)} of ${fmtCurrency(fees.total)}${
                  fees.nextDueDate ? ` • Next ${fmtDate(fees.nextDueDate)}` : ""
                }`
              : "No data available"
          }
          footer={
            fees && fees.pending > 0 ? (
              <Link
                to="/parent/fees"
                className="glass-btn mt-4 inline-flex items-center gap-2 px-3 py-1.5 text-xs"
              >
                <CreditCard className="h-3.5 w-3.5" />
                Pay Now
              </Link>
            ) : null
          }
        />

        <DashCard
          title="Latest Marks"
          icon={GraduationCap}
          loading={loading && !marks}
          delay={0.1}
          value={marks?.averagePercent != null ? `${marks.averagePercent}%` : "—"}
          subtitle={
            marks?.recent.length
              ? `Across ${marks.recent.length} recent assessment${marks.recent.length > 1 ? "s" : ""}`
              : "No data available"
          }
          footer={
            marks?.recent.length ? (
              <ul className="mt-3 space-y-1 text-xs parent-muted">
                {marks.recent.slice(0, 3).map((m, i) => (
                  <li key={i} className="flex items-center justify-between gap-2">
                    <span className="truncate">{m.subject}</span>
                    <span>
                      {m.is_absent
                        ? "Absent"
                        : m.marks_obtained != null && m.max_marks != null
                          ? `${m.marks_obtained}/${m.max_marks}`
                          : "—"}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null
          }
        />
      </div>

      {/* Row 2: Assignments + Announcements */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <DashCard
          title="Assignments"
          icon={ClipboardList}
          loading={loading && !assignments.length}
          delay={0.15}
          value={String(assignments.length || 0)}
          subtitle={assignments.length ? "Upcoming" : "No data available"}
          footer={
            assignments.length ? (
              <ul className="mt-3 space-y-1 text-xs parent-muted">
                {assignments.slice(0, 3).map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-2">
                    <span className="truncate">{a.title}</span>
                    <span className="shrink-0">{fmtDate(a.due_date) ?? "—"}</span>
                  </li>
                ))}
              </ul>
            ) : null
          }
        />

        <DashCard
          title="Announcements"
          icon={Megaphone}
          loading={loading && !circulars.length}
          delay={0.2}
          value={String(circulars.length || 0)}
          subtitle={circulars.length ? "Recent updates" : "No data available"}
          footer={
            circulars.length ? (
              <ul className="mt-3 space-y-1 text-xs parent-muted">
                {circulars.slice(0, 3).map((c) => (
                  <li key={c.id} className="flex items-center justify-between gap-2">
                    <span className="truncate">{c.title}</span>
                    <span className="shrink-0">{fmtDate(c.scheduled_at ?? c.created_at)}</span>
                  </li>
                ))}
              </ul>
            ) : null
          }
        />
      </div>
    </div>
  );
}

function DashCard({
  title,
  icon: Icon,
  value,
  subtitle,
  loading,
  delay,
  footer,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  subtitle: string;
  loading: boolean;
  delay: number;
  footer?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ scale: 1.02 }}
      className="glass p-5 transition-shadow hover:shadow-lg"
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-sm parent-muted">{title}</p>
          {loading ? (
            <Skeleton className="mt-2 h-9 w-24" />
          ) : (
            <p className="mt-2 text-3xl font-bold text-secondary">{value}</p>
          )}
          {loading ? (
            <Skeleton className="mt-2 h-3 w-40" />
          ) : (
            <p className="mt-1 text-xs parent-muted">{subtitle}</p>
          )}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {footer}
    </motion.div>
  );
}
