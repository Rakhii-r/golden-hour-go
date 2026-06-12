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
  Bell,
  Search,
  Headphones,
  ChevronDown,
  MessageSquare,
} from "lucide-react";
import { useParentAuth } from "@/hooks/use-parent-auth";
import { useParentDashboardCtx } from "@/hooks/parent-dashboard-context";
import { useParentUnreadCount } from "@/hooks/use-parent-messaging";
import { useParentNotifications } from "@/hooks/use-parent-notifications";

const NAV = [
  { to: "/parent/dashboard",    label: "Overview",      icon: LayoutDashboard },
  { to: "/parent/timetable",    label: "Timetable",     icon: CalendarDays    },
  { to: "/parent/attendance",   label: "Attendance",    icon: CalendarCheck   },
  { to: "/parent/fees",         label: "Fees",          icon: Wallet          },
  { to: "/parent/marks",        label: "Marks",         icon: GraduationCap   },
  { to: "/parent/assignments",  label: "Assignments",   icon: ClipboardList   },
  { to: "/parent/communication",label: "Communication", icon: MessageSquare   },
  { to: "/parent/circulars",    label: "Circulars",     icon: Megaphone       },
  { to: "/parent/profile",      label: "Profile",       icon: User            },
] as const;

// Mobile shows Overview, Attendance, Communication, Fees, Profile
const MOBILE_NAV_INDICES = [0, 2, 6, 3, 8] as const;

function getInitials(name: string | null | undefined): string {
  if (!name) return "P";
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function ParentLayout({ children }: { children: React.ReactNode }) {
  const { logout, user } = useParentAuth();
  const { student, organization, circulars } = useParentDashboardCtx();
  const unreadCount = useParentUnreadCount(user?.id ?? null, student?.organization_id ?? null);
  const { unreadCount: notifUnread } = useParentNotifications(user?.id ?? null, 50);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (to: string) => location.pathname === to;
  const parentName = student?.father_name || student?.mother_name || "Parent";
  const parentInitials = getInitials(parentName);
  const notifCount = notifUnread;
  // Suppress unused warning while preserving original API for future use
  void circulars;

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/parent" });
  };

  return (
    <div className="parent-portal">

      {/* ── Fixed Top Navbar ─────────────────────────────────────── */}
      <header
        className="fixed left-0 right-0 top-0 z-40 flex h-[72px] items-center gap-4 px-6"
        style={{ background: "linear-gradient(90deg, #155EEF 0%, #1d6ef5 100%)" }}
      >
        {/* Left: Logo + School name */}
        <div className="flex w-[220px] shrink-0 items-center gap-3">
          {organization?.logo_url ? (
            <img
              src={organization.logo_url}
              alt={organization.name ?? "School"}
              className="h-9 w-9 rounded-xl object-cover ring-2 ring-white/30"
            />
          ) : (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20">
              <Logo className="h-5 w-5 text-white" />
            </div>
          )}
          <div className="hidden min-w-0 sm:block">
            <p className="truncate text-sm font-bold leading-tight text-white">
              {organization?.name ?? "School"}
            </p>
            <p className="text-[11px] leading-tight text-blue-200">Parent Portal</p>
          </div>
        </div>

        {/* Center: Search bar */}
        <div className="mx-auto hidden max-w-xl flex-1 md:block">
          <div className="relative">
            <input
              type="text"
              placeholder="Search anything..."
              readOnly
              className="w-full rounded-full border border-white/20 bg-white/15 py-2.5 pl-5 pr-12 text-sm text-white placeholder-blue-200 backdrop-blur transition focus:border-white/40 focus:bg-white/25 focus:outline-none"
            />
            <Search className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-200" />
          </div>
        </div>

        {/* Right: Bell + Avatar + Logout */}
        <div className="ml-auto flex items-center gap-3">
          {/* Notification bell */}
          <Link
            to="/parent/notifications"
            className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/15 transition hover:bg-white/25"
            aria-label="Notifications"
          >
            <Bell className="h-[18px] w-[18px] text-white" />
            {notifCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {notifCount > 9 ? "9+" : notifCount}
              </span>
            )}
          </Link>

          {/* Avatar + parent name */}
          <div className="hidden items-center gap-2.5 rounded-full bg-white/15 px-3 py-1.5 sm:flex">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/30 text-[11px] font-bold text-white">
              {parentInitials}
            </div>
            <div className="hidden text-left lg:block">
              <p className="text-xs font-semibold leading-tight text-white">{parentName}</p>
              <p className="text-[10px] leading-tight text-blue-200">Parent</p>
            </div>
            <ChevronDown className="h-3 w-3 text-blue-200" />
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="hidden items-center gap-2 rounded-xl border border-white/30 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/15 sm:flex"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden lg:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* ── Body: sidebar + main ──────────────────────────────────── */}
      <div className="flex pt-[72px]">

        {/* Desktop Sidebar */}
        <aside className="sticky top-[72px] hidden h-[calc(100vh-72px)] w-[240px] shrink-0 flex-col overflow-y-auto border-r border-[#E2E8F0] bg-white shadow-[2px_0_16px_rgba(0,0,0,0.04)] md:flex">
          {/* Nav items */}
          <nav className="flex-1 space-y-1 p-4">
            {NAV.map((item) => {
              const active = isActive(item.to);
              const isCommunication = item.to === "/parent/communication";
              const badge = isCommunication && unreadCount > 0 ? unreadCount : 0;
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  className={`flex w-full items-center gap-3 rounded-[14px] px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    active
                      ? "parent-sidebar-active"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <item.icon
                    className={`h-[18px] w-[18px] shrink-0 ${
                      active ? "text-white" : "text-gray-400"
                    }`}
                  />
                  <span className="flex-1">{item.label}</span>
                  {badge > 0 && (
                    <span className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
                      active ? "bg-white/30 text-white" : "bg-[#155EEF] text-white"
                    }`}>
                      {badge > 9 ? "9+" : badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* School illustration */}
          <div
            className="mx-4 mb-3 overflow-hidden rounded-2xl"
            style={{ background: "linear-gradient(135deg, #EEF2FF 0%, #DBEAFE 100%)" }}
          >
            <SidebarSchoolSVG />
          </div>

          {/* Support card */}
          <div
            className="mx-4 mb-5 rounded-2xl p-4"
            style={{ background: "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)" }}
          >
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#155EEF]/10">
                <Headphones className="h-4 w-4 text-[#155EEF]" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800">Need Help?</p>
                <p className="mt-0.5 text-[11px] leading-snug text-gray-500">
                  Contact school admin for any assistance.
                </p>
              </div>
            </div>
            <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#155EEF] py-2 text-xs font-semibold text-white transition hover:bg-[#1a56db]">
              <Headphones className="h-3 w-3" />
              Contact Us
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1 pb-24 md:pb-8">
          <div className="p-5 md:p-6">
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
          </div>
        </main>
      </div>

      {/* ── Mobile bottom nav ─────────────────────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#E2E8F0] bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.06)] md:hidden">
        <div className="flex items-center justify-around px-2 py-2">
          {MOBILE_NAV_INDICES.map((idx) => {
            const item = NAV[idx];
            const active = isActive(item.to);
            const isCommunication = item.to === "/parent/communication";
            const badge = isCommunication && unreadCount > 0 ? unreadCount : 0;
            return (
              <Link
                key={item.label}
                to={item.to}
                className={`relative flex flex-col items-center gap-0.5 rounded-xl px-3 py-2 text-[10px] transition ${
                  active ? "font-semibold text-[#155EEF]" : "text-gray-400"
                }`}
              >
                <div className="relative">
                  <item.icon
                    className={`h-5 w-5 ${active ? "text-[#155EEF]" : "text-gray-400"}`}
                  />
                  {badge > 0 && (
                    <span className="absolute -right-2 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#155EEF] px-1 text-[9px] font-bold text-white">
                      {badge > 9 ? "9+" : badge}
                    </span>
                  )}
                </div>
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

/* ── Sidebar school illustration SVG ─────────────────────────── */
function SidebarSchoolSVG() {
  return (
    <svg
      viewBox="0 0 208 90"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="sidebarSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#DBEAFE" />
          <stop offset="100%" stopColor="#EFF6FF" />
        </linearGradient>
      </defs>
      <rect width="208" height="90" fill="url(#sidebarSky)" />
      {/* Clouds */}
      <ellipse cx="35" cy="14" rx="22" ry="10" fill="white" opacity="0.8" />
      <ellipse cx="55" cy="10" rx="16" ry="8"  fill="white" opacity="0.65" />
      <ellipse cx="168" cy="18" rx="18" ry="8" fill="white" opacity="0.65" />
      <ellipse cx="185" cy="13" rx="13" ry="6" fill="white" opacity="0.55" />
      {/* Tree left */}
      <rect   x="12" y="58" width="7" height="28" fill="#93C5FD" rx="2" />
      <ellipse cx="15.5" cy="52" rx="15" ry="17" fill="#60A5FA" />
      {/* Tree right */}
      <rect   x="189" y="58" width="7" height="28" fill="#93C5FD" rx="2" />
      <ellipse cx="192.5" cy="52" rx="15" ry="17" fill="#60A5FA" />
      {/* Building body */}
      <rect x="58" y="42" width="92" height="48" fill="#BFDBFE" rx="3" />
      {/* Roof */}
      <polygon points="52,42 104,16 156,42" fill="#93C5FD" />
      {/* Flag */}
      <rect x="103" y="8" width="2" height="11" fill="#60A5FA" />
      <polygon points="105,8 116,12 105,16" fill="#3B82F6" />
      {/* Clock */}
      <circle cx="104" cy="30" r="7" fill="#DBEAFE" stroke="#93C5FD" strokeWidth="1.5" />
      {/* Windows */}
      <rect x="68" y="52" width="14" height="13" rx="2" fill="#DBEAFE" />
      <rect x="97" y="52" width="14" height="13" rx="2" fill="#DBEAFE" />
      <rect x="126" y="52" width="14" height="13" rx="2" fill="#DBEAFE" />
      {/* Door */}
      <rect x="93" y="68" width="22" height="22" rx="11" fill="#93C5FD" />
      {/* Ground strip */}
      <rect x="0" y="85" width="208" height="5" fill="#BFDBFE" />
    </svg>
  );
}
