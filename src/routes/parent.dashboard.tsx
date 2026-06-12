import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Wallet,
  GraduationCap,
  ClipboardList,
  Megaphone,
  AlertCircle,
  CreditCard,
  Calendar,
  ArrowRight,
  Star,
  MessageSquare,
  Bell as BellIcon,
} from "lucide-react";
import { useParentNotifications } from "@/hooks/use-parent-notifications";
import { RequireParentAuth } from "@/components/parent/RequireParentAuth";
import { ParentLayout } from "@/components/parent/ParentLayout";
import {
  ParentDashboardProvider,
  useParentDashboardCtx,
} from "@/hooks/parent-dashboard-context";
import { useParentAuth } from "@/hooks/use-parent-auth";
import { useParentUnreadCount } from "@/hooks/use-parent-messaging";
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

/* ── Helpers ──────────────────────────────────────────────────── */
const fmtCurrency = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(n || 0));

const fmtDate = (s: string | null) => {
  if (!s) return null;
  try {
    return new Date(s).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return s;
  }
};

/* ── Welcome Banner ───────────────────────────────────────────── */
function WelcomeBanner({
  parentName,
  studentName,
  studentClass,
  section,
  admissionNumber,
}: {
  parentName: string;
  studentName: string;
  studentClass?: string | null;
  section?: string | null;
  admissionNumber?: string | null;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="relative overflow-hidden rounded-3xl"
      style={{
        background: "linear-gradient(135deg, #155EEF 0%, #2563EB 55%, #3B82F6 100%)",
        minHeight: "180px",
      }}
    >
      {/* Decorative circles */}
      <div className="pointer-events-none absolute -bottom-12 -right-12 h-60 w-60 rounded-full bg-white/5" />
      <div className="pointer-events-none absolute -top-16 right-36 h-48 w-48 rounded-full bg-white/5" />
      <div className="pointer-events-none absolute top-4 right-16 h-20 w-20 rounded-full bg-white/8" />

      <div className="relative z-10 flex items-center justify-between p-7 sm:p-8">
        {/* Text */}
        <div>
          <p className="mb-1 text-sm font-medium text-blue-200">Welcome back,</p>
          <h1 className="mb-3 text-2xl font-bold text-white sm:text-3xl">
            {parentName} <span>👋</span>
          </h1>
          <p className="text-sm text-blue-100">
            Viewing{" "}
            <span className="font-semibold text-white">{studentName}</span>
            {studentClass
              ? ` — Class ${studentClass}${section ? ` • ${section}` : ""}`
              : ""}
            {admissionNumber ? ` • Adm. ${admissionNumber}` : ""}
          </p>
        </div>

        {/* School illustration */}
        <div className="hidden h-44 w-52 shrink-0 md:block">
          <BannerSchoolSVG />
        </div>
      </div>
    </motion.div>
  );
}

/* ── Circular progress ring (for fees) ───────────────────────── */
function CircularProgress({ percent }: { percent: number }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(Math.max(percent, 0), 100) / 100) * c;
  return (
    <div className="relative flex h-[88px] w-[88px] shrink-0 items-center justify-center">
      <svg width="88" height="88" className="-rotate-90">
        <circle cx="44" cy="44" r={r} fill="none" stroke="#E2E8F0" strokeWidth="8" />
        <circle
          cx="44"
          cy="44"
          r={r}
          fill="none"
          stroke="#155EEF"
          strokeWidth="8"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-sm font-bold leading-none text-[#155EEF]">{percent}%</p>
        <p className="mt-0.5 text-[10px] text-gray-400">Paid</p>
      </div>
    </div>
  );
}

/* ── Fees Card ────────────────────────────────────────────────── */
function FeesCard({
  fees,
  loading,
}: {
  fees: { pending: number; paid: number; total: number; nextDueDate: string | null } | null;
  loading: boolean;
}) {
  const paidPercent = fees?.total ? Math.round((fees.paid / fees.total) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 }}
      className="glass parent-card-hover flex flex-col p-5"
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#155EEF]">
          <Wallet className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">Pending Fees</p>
          <p className="text-xs text-gray-400">Payment overview</p>
        </div>
      </div>

      {loading ? (
        <Skeleton className="mb-2 h-8 w-32" />
      ) : (
        <p className="mb-1 text-2xl font-bold text-gray-900">
          {fees ? fmtCurrency(fees.pending) : "—"}
        </p>
      )}

      <div className="mt-2 flex items-center justify-between gap-3">
        <div className="flex-1 space-y-1">
          {loading ? (
            <>
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-28" />
            </>
          ) : fees ? (
            <>
              <p className="text-xs text-gray-500">
                Paid{" "}
                <span className="font-medium text-gray-700">{fmtCurrency(fees.paid)}</span>{" "}
                of {fmtCurrency(fees.total)}
              </p>
              {fees.nextDueDate && (
                <p className="text-xs text-gray-500">
                  Next due:{" "}
                  <span className="font-medium text-gray-700">
                    {fmtDate(fees.nextDueDate)}
                  </span>
                </p>
              )}
            </>
          ) : (
            <p className="text-xs text-gray-400">No data available</p>
          )}
        </div>
        {!loading && fees && <CircularProgress percent={paidPercent} />}
      </div>

      {fees && fees.pending > 0 && (
        <Link
          to="/parent/fees"
          className="glass-btn mt-4 flex items-center justify-center gap-2 px-4 py-2.5 text-sm"
        >
          <CreditCard className="h-4 w-4" />
          Pay Now
        </Link>
      )}
    </motion.div>
  );
}

/* ── Marks Card ───────────────────────────────────────────────── */
function MarksCard({
  marks,
  loading,
}: {
  marks: {
    averagePercent: number | null;
    recent: Array<{
      subject: string;
      marks_obtained: number | null;
      max_marks: number | null;
      is_absent: boolean;
    }>;
  } | null;
  loading: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="glass parent-card-hover flex flex-col p-5"
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
          <Star className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">Latest Marks</p>
          <p className="text-xs text-gray-400">
            {marks?.recent.length
              ? `Across ${marks.recent.length} recent assessment${marks.recent.length > 1 ? "s" : ""}`
              : "No data yet"}
          </p>
        </div>
      </div>

      {loading ? (
        <Skeleton className="mb-3 h-12 w-24" />
      ) : (
        <div className="mb-3">
          <span className="text-4xl font-extrabold text-gray-900">
            {marks?.averagePercent != null ? `${marks.averagePercent}%` : "—"}
          </span>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full rounded-lg" />
          ))}
        </div>
      ) : marks?.recent.length ? (
        <div className="flex-1 space-y-2">
          {marks.recent.slice(0, 3).map((m, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2"
            >
              <span className="truncate text-xs font-medium text-gray-700">{m.subject}</span>
              <span className="ml-2 shrink-0 text-xs font-semibold text-gray-900">
                {m.is_absent
                  ? "Absent"
                  : m.marks_obtained != null && m.max_marks != null
                  ? `${m.marks_obtained}/${m.max_marks}`
                  : "—"}
              </span>
            </div>
          ))}
        </div>
      ) : null}

      <Link
        to="/parent/marks"
        className="mt-4 flex items-center justify-center gap-2 rounded-xl border-2 border-[#155EEF]/25 px-4 py-2 text-sm font-semibold text-[#155EEF] transition hover:bg-[#155EEF]/5"
      >
        View All Marks
        <ArrowRight className="h-4 w-4" />
      </Link>
    </motion.div>
  );
}

/* ── Assignments Card ─────────────────────────────────────────── */
function AssignmentsCard({
  assignments,
  loading,
}: {
  assignments: Array<{ id: string; title: string; due_date: string | null }>;
  loading: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="glass parent-card-hover p-5"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-500">
            <ClipboardList className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">Assignments</p>
            <p className="text-xs text-gray-400">Upcoming tasks</p>
          </div>
        </div>
        <Link
          to="/parent/assignments"
          className="flex items-center gap-1 text-xs font-semibold text-[#155EEF] transition hover:underline"
        >
          View All <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {loading ? (
        <div className="space-y-2">
          <Skeleton className="mb-3 h-8 w-24" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-xl" />
          ))}
        </div>
      ) : assignments.length ? (
        <>
          <div className="mb-3 flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-gray-900">{assignments.length}</span>
            <span className="text-sm text-gray-400">Upcoming</span>
          </div>
          <div className="space-y-2">
            {assignments.slice(0, 3).map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2.5"
              >
                <span className="truncate text-xs font-medium text-gray-700">{a.title}</span>
                <span className="ml-2 flex shrink-0 items-center gap-1 text-[11px] text-gray-400">
                  <Calendar className="h-3 w-3" />
                  {fmtDate(a.due_date) ?? "—"}
                </span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="text-sm text-gray-400">No upcoming assignments.</p>
      )}
    </motion.div>
  );
}

/* ── Announcements Card ───────────────────────────────────────── */
function AnnouncementsCard({
  circulars,
  loading,
}: {
  circulars: Array<{
    id: string;
    title: string;
    scheduled_at?: string | null;
    created_at: string;
  }>;
  loading: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="glass parent-card-hover p-5"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
            <Megaphone className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">Announcements</p>
            <p className="text-xs text-gray-400">School updates</p>
          </div>
        </div>
        <Link
          to="/parent/circulars"
          className="flex items-center gap-1 text-xs font-semibold text-[#155EEF] transition hover:underline"
        >
          View All <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {loading ? (
        <div className="space-y-2">
          <Skeleton className="mb-3 h-8 w-24" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-xl" />
          ))}
        </div>
      ) : circulars.length ? (
        <>
          <div className="mb-3 flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-gray-900">{circulars.length}</span>
            <span className="text-sm text-gray-400">Recent updates</span>
          </div>
          <div className="space-y-2">
            {circulars.slice(0, 3).map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2.5"
              >
                <span className="truncate text-xs font-medium text-gray-700">{c.title}</span>
                <span className="ml-2 flex shrink-0 items-center gap-1 text-[11px] text-gray-400">
                  <Calendar className="h-3 w-3" />
                  {fmtDate(c.scheduled_at ?? c.created_at)}
                </span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="text-sm text-gray-400">No announcements yet.</p>
      )}
    </motion.div>
  );
}

/* ── Messages Card ────────────────────────────────────────────── */
function MessagesCard() {
  const { user } = useParentAuth();
  const { student } = useParentDashboardCtx();
  const unreadCount = useParentUnreadCount(user?.id ?? null, student?.organization_id ?? null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.22 }}
      className="glass parent-card-hover p-5"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#155EEF]">
            <MessageSquare className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#155EEF] px-1 text-[9px] font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">Messages</p>
            <p className="text-xs text-gray-400">Teacher communication</p>
          </div>
        </div>
        <Link
          to="/parent/communication"
          className="flex items-center gap-1 text-xs font-semibold text-[#155EEF] transition hover:underline"
        >
          Open <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {unreadCount > 0 ? (
        <div className="flex items-center gap-3 rounded-xl bg-blue-50 px-4 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#155EEF]">
            <MessageSquare className="h-4 w-4 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-gray-800">
              {unreadCount} unread message{unreadCount > 1 ? "s" : ""}
            </p>
            <p className="text-xs text-gray-500">Tap to view replies from teachers</p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-400">No new messages. Tap to start a conversation.</p>
      )}

      <Link
        to="/parent/communication"
        className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-[#155EEF] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1a56db]"
      >
        <MessageSquare className="h-4 w-4" />
        Open Messages
      </Link>
    </motion.div>
  );
}

/* ── Dashboard Content ────────────────────────────────────────── */
function DashboardContent() {
  const { student, fees, marks, assignments, circulars, loading, error } =
    useParentDashboardCtx();

  const parentName = student?.father_name || student?.mother_name || "Parent";
  const studentName = student?.name ?? "your child";

  return (
    <div className="space-y-5">
      {/* Hero banner */}
      <WelcomeBanner
        parentName={parentName}
        studentName={studentName}
        studentClass={student?.class}
        section={student?.section}
        admissionNumber={student?.admission_number}
      />

      {/* Student profile */}
      <StudentProfileCard student={student} loading={loading} />

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Row 1: Attendance (2fr) + Fees + Marks */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <AttendanceCalendar
            studentId={student?.id ?? null}
            organizationId={student?.organization_id ?? null}
          />
        </div>
        <FeesCard fees={fees} loading={loading && !fees} />
        <MarksCard marks={marks} loading={loading && !marks} />
      </div>

      {/* Row 2: Assignments + Announcements + Messages */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        <AssignmentsCard assignments={assignments} loading={loading && !assignments.length} />
        <AnnouncementsCard circulars={circulars} loading={loading && !circulars.length} />
        <MessagesCard />
      </div>

      {/* Row 3: Recent Notifications */}
      <RecentNotificationsCard />
    </div>
  );
}

/* ── Recent Notifications widget ─────────────────────────────── */
function RecentNotificationsCard() {
  const { user } = useParentAuth();
  const { items, loading } = useParentNotifications(user?.id ?? null, 5);
  const recent = items.slice(0, 5);
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#155EEF]/10 text-[#155EEF]">
            <BellIcon className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Recent Notifications</h3>
            <p className="text-[11px] text-gray-500">Latest alerts and updates</p>
          </div>
        </div>
        <Link
          to="/parent/notifications"
          className="flex items-center gap-1 text-xs font-semibold text-[#155EEF] hover:underline"
        >
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : recent.length === 0 ? (
        <p className="py-6 text-center text-xs text-gray-500">No notifications yet</p>
      ) : (
        <ul className="space-y-2">
          {recent.map((n) => (
            <li key={n.id}>
              <Link
                to="/parent/notifications"
                className={`flex items-start gap-3 rounded-xl p-3 transition hover:bg-gray-50 ${
                  n.read ? "" : "bg-blue-50/50"
                }`}
              >
                <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-[#155EEF]" style={{ opacity: n.read ? 0.2 : 1 }} />
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-sm ${n.read ? "text-gray-700" : "font-semibold text-gray-900"}`}>
                    {n.title}
                  </p>
                  <p className="mt-0.5 line-clamp-1 text-xs text-gray-500">{n.message}</p>
                </div>
                <span className="shrink-0 text-[10px] text-gray-400">
                  {new Date(n.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ── Banner school illustration SVG ──────────────────────────── */
function BannerSchoolSVG() {
  return (
    <svg
      viewBox="0 0 220 160"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full"
      aria-hidden="true"
    >
      {/* Clouds */}
      <ellipse cx="32"  cy="22"  rx="26" ry="13" fill="rgba(255,255,255,0.28)" />
      <ellipse cx="56"  cy="15"  rx="20" ry="10" fill="rgba(255,255,255,0.22)" />
      <ellipse cx="174" cy="26"  rx="22" ry="10" fill="rgba(255,255,255,0.22)" />
      <ellipse cx="196" cy="20"  rx="16" ry="8"  fill="rgba(255,255,255,0.18)" />
      {/* Trees left */}
      <rect   x="12"  y="110" width="9" height="42" fill="rgba(255,255,255,0.28)" rx="2" />
      <ellipse cx="16.5" cy="100" rx="20" ry="24" fill="rgba(255,255,255,0.33)" />
      {/* Trees right */}
      <rect   x="199" y="110" width="9" height="42" fill="rgba(255,255,255,0.28)" rx="2" />
      <ellipse cx="203.5" cy="100" rx="20" ry="24" fill="rgba(255,255,255,0.33)" />
      {/* Building body */}
      <rect x="60" y="78" width="100" height="82" fill="rgba(255,255,255,0.22)" rx="4" />
      {/* Roof */}
      <polygon points="54,78 110,44 166,78" fill="rgba(255,255,255,0.32)" />
      {/* Flag pole */}
      <rect x="109" y="30" width="2.5" height="18" fill="rgba(255,255,255,0.6)" />
      <polygon points="111.5,30 126,36 111.5,42" fill="rgba(255,255,255,0.8)" />
      {/* Clock */}
      <circle cx="110" cy="62" r="9" fill="rgba(255,255,255,0.42)" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" />
      {/* Windows */}
      <rect x="70"  y="92" width="18" height="18" rx="3" fill="rgba(255,255,255,0.38)" />
      <rect x="101" y="92" width="18" height="18" rx="3" fill="rgba(255,255,255,0.38)" />
      <rect x="132" y="92" width="18" height="18" rx="3" fill="rgba(255,255,255,0.38)" />
      {/* Door */}
      <rect x="97" y="124" width="26" height="36" rx="13" fill="rgba(255,255,255,0.38)" />
      {/* Ground */}
      <rect x="0" y="154" width="220" height="6" rx="3" fill="rgba(255,255,255,0.18)" />
    </svg>
  );
}
