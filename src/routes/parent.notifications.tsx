import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  CheckCheck,
  Wallet,
  CalendarCheck,
  Megaphone,
  MessageSquare,
  GraduationCap,
  Sparkles,
  Inbox,
  Circle,
} from "lucide-react";
import { RequireParentAuth } from "@/components/parent/RequireParentAuth";
import { ParentLayout } from "@/components/parent/ParentLayout";
import { ParentDashboardProvider } from "@/hooks/parent-dashboard-context";
import { useParentAuth } from "@/hooks/use-parent-auth";
import {
  useParentNotifications,
  CATEGORY_LABELS,
  type NotificationCategory,
  type ParentNotification,
} from "@/hooks/use-parent-notifications";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const Route = createFileRoute("/parent/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications & Alerts — Parent Portal" },
      { name: "description", content: "All your school notifications and alerts in one place." },
    ],
  }),
  component: () => (
    <RequireParentAuth>
      <ParentDashboardProvider>
        <ParentLayout>
          <NotificationsContent />
        </ParentLayout>
      </ParentDashboardProvider>
    </RequireParentAuth>
  ),
});

const CATEGORY_ICONS: Record<NotificationCategory, React.ComponentType<{ className?: string }>> = {
  fee: Wallet,
  attendance: CalendarCheck,
  circular: Megaphone,
  message: MessageSquare,
  exam: GraduationCap,
  other: Sparkles,
};

const CATEGORY_COLORS: Record<NotificationCategory, string> = {
  fee: "bg-emerald-100 text-emerald-700",
  attendance: "bg-amber-100 text-amber-700",
  circular: "bg-blue-100 text-blue-700",
  message: "bg-violet-100 text-violet-700",
  exam: "bg-rose-100 text-rose-700",
  other: "bg-gray-100 text-gray-700",
};

const FILTERS: { value: "all" | NotificationCategory; label: string }[] = [
  { value: "all", label: "All" },
  { value: "attendance", label: CATEGORY_LABELS.attendance },
  { value: "fee", label: CATEGORY_LABELS.fee },
  { value: "circular", label: CATEGORY_LABELS.circular },
  { value: "message", label: CATEGORY_LABELS.message },
  { value: "exam", label: CATEGORY_LABELS.exam },
];

function formatRelative(iso: string): string {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const m = Math.round(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.round(h / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function NotificationsContent() {
  const { user } = useParentAuth();
  const { items, loading, unreadCount, markRead, markAllRead } = useParentNotifications(user?.id ?? null);
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"all" | NotificationCategory>("all");

  const filtered = useMemo(
    () => (filter === "all" ? items : items.filter((i) => i.category === filter)),
    [items, filter],
  );

  const handleOpen = async (n: ParentNotification) => {
    if (!n.read) await markRead(n.id);
    if (n.action_url) {
      if (n.action_url.startsWith("/")) {
        navigate({ to: n.action_url });
      } else {
        window.open(n.action_url, "_blank", "noopener");
      }
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#155EEF]/10 text-[#155EEF]">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold leading-tight text-gray-900">
              Notifications &amp; Alerts
            </h1>
            <p className="text-xs text-gray-500">
              {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
            </p>
          </div>
        </div>
        <button
          onClick={() => void markAllRead()}
          disabled={unreadCount === 0}
          className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <CheckCheck className="h-4 w-4" />
          Mark all as read
        </button>
      </motion.div>

      {/* Filters */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
        <TabsList className="w-full justify-start overflow-x-auto bg-white p-1 shadow-sm">
          {FILTERS.map((f) => {
            const cnt =
              f.value === "all"
                ? items.filter((i) => !i.read).length
                : items.filter((i) => i.category === f.value && !i.read).length;
            return (
              <TabsTrigger key={f.value} value={f.value} className="gap-1.5">
                {f.label}
                {cnt > 0 && (
                  <span className="rounded-full bg-[#155EEF] px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {cnt}
                  </span>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value={filter} className="mt-4">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-2xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState filter={filter} />
          ) : (
            <ul className="space-y-2">
              {filtered.map((n) => {
                const Icon = CATEGORY_ICONS[n.category];
                return (
                  <li key={n.id}>
                    <button
                      onClick={() => void handleOpen(n)}
                      className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition hover:shadow-sm ${
                        n.read
                          ? "border-gray-100 bg-white"
                          : "border-[#155EEF]/20 bg-blue-50/40"
                      }`}
                    >
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${CATEGORY_COLORS[n.category]}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={`truncate text-sm ${
                              n.read ? "font-medium text-gray-700" : "font-semibold text-gray-900"
                            }`}
                          >
                            {n.title}
                          </p>
                          <span className="shrink-0 text-[11px] text-gray-400">
                            {formatRelative(n.created_at)}
                          </span>
                        </div>
                        <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">{n.message}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${CATEGORY_COLORS[n.category]}`}
                          >
                            {CATEGORY_LABELS[n.category]}
                          </span>
                          {!n.read && (
                            <span className="flex items-center gap-1 text-[10px] font-semibold text-[#155EEF]">
                              <Circle className="h-1.5 w-1.5 fill-current" />
                              New
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyState({ filter }: { filter: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
        <Inbox className="h-6 w-6" />
      </div>
      <p className="mt-3 text-sm font-semibold text-gray-700">No notifications</p>
      <p className="mt-1 text-xs text-gray-500">
        {filter === "all"
          ? "You'll see alerts about fees, attendance, circulars and more here."
          : "Nothing in this category yet."}
      </p>
      <Link
        to="/parent/dashboard"
        className="mt-4 rounded-xl bg-[#155EEF] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1a56db]"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
