import { useCallback, useEffect, useMemo, useState } from "react";
import { parentSupabase } from "@/lib/parent-supabase";

export type NotificationCategory =
  | "attendance"
  | "fee"
  | "circular"
  | "message"
  | "exam"
  | "other";

export interface ParentNotification {
  id: string;
  user_id: string;
  organization_id: string;
  title: string;
  message: string;
  type: string;
  category: NotificationCategory;
  read: boolean;
  action_url: string | null;
  created_at: string;
  metadata: Record<string, unknown> | null;
}

export function categorize(type: string | null | undefined): NotificationCategory {
  const t = (type ?? "").toLowerCase();
  if (t.includes("fee") || t.includes("payment") || t.includes("invoice")) return "fee";
  if (t.includes("attendance") || t.includes("absent") || t.includes("present")) return "attendance";
  if (t.includes("circular") || t.includes("announce") || t.includes("notice")) return "circular";
  if (t.includes("message") || t.includes("chat") || t.includes("communication")) return "message";
  if (t.includes("exam") || t.includes("marks") || t.includes("result") || t.includes("report")) return "exam";
  return "other";
}

export const CATEGORY_LABELS: Record<NotificationCategory, string> = {
  attendance: "Attendance",
  fee: "Fees",
  circular: "Circulars",
  message: "Messages",
  exam: "Exams",
  other: "Other",
};

interface NotificationsRow {
  id: string;
  user_id: string;
  organization_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean | null;
  action_url: string | null;
  created_at: string | null;
  metadata: Record<string, unknown> | null;
}

function mapRow(r: NotificationsRow): ParentNotification {
  return {
    id: r.id,
    user_id: r.user_id,
    organization_id: r.organization_id,
    title: r.title,
    message: r.message,
    type: r.type,
    category: categorize(r.type),
    read: !!r.read,
    action_url: r.action_url,
    created_at: r.created_at ?? new Date().toISOString(),
    metadata: r.metadata ?? null,
  };
}

export function useParentNotifications(userId: string | null | undefined, limit = 100) {
  const [items, setItems] = useState<ParentNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!userId) {
      setItems([]);
      setLoading(false);
      return;
    }
    const { data, error } = await parentSupabase
      .from("notifications")
      .select("id, user_id, organization_id, title, message, type, read, action_url, created_at, metadata")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (!error && data) {
      setItems((data as NotificationsRow[]).map(mapRow));
    }
    setLoading(false);
  }, [userId, limit]);

  useEffect(() => {
    setLoading(true);
    void fetchAll();
  }, [fetchAll]);

  // Realtime
  useEffect(() => {
    if (!userId) return;
    const channel = parentSupabase
      .channel(`parent-notifs-${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        () => void fetchAll(),
      )
      .subscribe();
    return () => {
      void parentSupabase.removeChannel(channel);
    };
  }, [userId, fetchAll]);

  const unreadCount = useMemo(() => items.filter((i) => !i.read).length, [items]);

  const markRead = useCallback(
    async (id: string) => {
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, read: true } : i)));
      await parentSupabase.from("notifications").update({ read: true }).eq("id", id);
    },
    [],
  );

  const markAllRead = useCallback(async () => {
    if (!userId) return;
    setItems((prev) => prev.map((i) => ({ ...i, read: true })));
    await parentSupabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", userId)
      .eq("read", false);
  }, [userId]);

  return { items, loading, unreadCount, markRead, markAllRead, refetch: fetchAll };
}
