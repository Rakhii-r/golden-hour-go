import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  CalendarCheck,
  Wallet,
  GraduationCap,
  ClipboardList,
  Megaphone,
  User,
  LogOut,
  CalendarDays,
  GraduationCap as Logo,
} from "lucide-react";
import { useParentAuth } from "@/hooks/use-parent-auth";
import { useParentDashboardCtx } from "@/hooks/parent-dashboard-context";

const NAV = [
  { to: "/parent/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/parent/timetable", label: "Timetable", icon: CalendarDays },
  { to: "/parent/attendance", label: "Attendance", icon: CalendarCheck },
  { to: "/parent/fees", label: "Fees", icon: Wallet },
  { to: "/parent/marks", label: "Marks", icon: GraduationCap },
  { to: "/parent/assignments", label: "Assignments", icon: ClipboardList },
  { to: "/parent/circulars", label: "Circulars", icon: Megaphone },
  { to: "/parent/profile", label: "Profile", icon: User },
] as const;

export function ParentLayout({ children }: { children: React.ReactNode }) {
  const { logout } = useParentAuth();
  const { student, organization } = useParentDashboardCtx();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (to: string) => location.pathname === to;

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/parent" });
  };

  return (
    <div className="parent-portal">
      {/* Header */}
      <header className="sticky top-0 z-30 px-4 pt-4">
        <div className="glass-strong mx-auto flex w-full items-center justify-between gap-3 px-4 py-3 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            {organization?.logo_url ? (
              <img
                src={organization.logo_url}
                alt={`${organization.name ?? "School"} logo`}
                className="h-10 w-10 rounded-full object-cover ring-1 ring-border"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Logo className="h-5 w-5" />
              </div>
            )}
            <div className="hidden min-w-0 sm:block">
              <p className="truncate font-semibold text-secondary leading-tight">
                {organization?.name ?? "School"}
              </p>
              <p className="text-xs parent-muted leading-tight">Parent Portal</p>
            </div>
          </div>
          <div className="min-w-0 text-center">
            <div className="truncate font-semibold text-secondary">{student?.name ?? "Student"}</div>
            <div className="truncate text-xs parent-muted">
              {student?.class
                ? `Class ${student.class}${student.section ? ` • ${student.section}` : ""}`
                : "Class —"}
              {student?.admission_number ? ` • ${student.admission_number}` : ""}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <div className="mx-auto flex w-full gap-5 px-4 pb-28 pt-6 md:pb-10">
        {/* Desktop sidebar */}
        <aside className="sticky top-24 hidden h-fit w-56 shrink-0 md:block">
          <nav className="glass space-y-1 p-2">
            {NAV.map((item) => {
              const active = isActive(item.to);
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                    active
                      ? "parent-sidebar-active font-medium"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main */}
        <main className="min-w-0 flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-3 left-3 right-3 z-30 md:hidden">
        <div className="glass-strong flex items-center justify-around px-2 py-2">
          {NAV.slice(0, 5).map((item) => {
            const active = isActive(item.to);
            return (
              <Link
                key={item.label}
                to={item.to}
                className={`flex flex-col items-center gap-0.5 rounded-lg px-2 py-1 text-[10px] transition ${
                  active ? "text-primary font-medium" : "parent-muted"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
