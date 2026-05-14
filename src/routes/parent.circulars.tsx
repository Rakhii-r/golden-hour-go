import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Megaphone } from "lucide-react";
import { RequireParentAuth } from "@/components/parent/RequireParentAuth";
import { ParentLayout } from "@/components/parent/ParentLayout";
import {
  ParentDashboardProvider,
  useParentDashboardCtx,
} from "@/hooks/parent-dashboard-context";
import { Skeleton } from "@/components/ui/skeleton";
import { parentSupabase } from "@/lib/parent-supabase";

export const Route = createFileRoute("/parent/circulars")({
  head: () => ({
    meta: [
      { title: "Circulars — Parent Portal" },
      { name: "description", content: "School announcements and circulars." },
    ],
  }),
  component: () => (
    <RequireParentAuth>
      <ParentDashboardProvider>
        <ParentLayout>
          <CircularsPage />
        </ParentLayout>
      </ParentDashboardProvider>
    </RequireParentAuth>
  ),
});

interface CircularRow {
  id: string;
  title: string;
  description: string | null;
  scheduled_at: string | null;
  created_at: string;
  target_classes: string[] | null;
  target_roles: string[] | null;
  status: string | null;
  is_archived: boolean | null;
}

const fmtDate = (s: string | null) => {
  if (!s) return "—";
  try {
    return new Date(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return s;
  }
};

function CircularsPage() {
  const { student } = useParentDashboardCtx();
  const [rows, setRows] = useState<CircularRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!student?.organization_id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data } = await parentSupabase
        .from("circulars")
        .select("id, title, description, scheduled_at, created_at, target_classes, target_roles, status, is_archived")
        .eq("organization_id", student.organization_id)
        .eq("is_archived", false)
        .order("created_at", { ascending: false });
      if (cancelled) return;
      const all = (data ?? []) as CircularRow[];
      const filtered = all.filter((r) => {
        if (r.status && r.status.toLowerCase() === "draft") return false;
        if (r.target_roles && r.target_roles.length > 0) {
          const ok = r.target_roles.some((x) => ["parent", "parents", "all"].includes(x.toLowerCase()));
          if (!ok) return false;
        }
        if (r.target_classes && r.target_classes.length > 0 && student.class) {
          if (!r.target_classes.includes(student.class)) return false;
        }
        return true;
      });
      setRows(filtered);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [student?.organization_id, student?.class]);

  return (
    <div className="space-y-5">
      <div className="glass-strong border-l-4 border-l-primary p-6">
        <h1 className="text-xl font-semibold text-secondary md:text-2xl">Circulars & Announcements</h1>
        <p className="mt-1 parent-muted">Stay updated with school notices.</p>
      </div>

      <div className="glass p-5">
        {loading ? (
          <Skeleton className="h-32 w-full" />
        ) : rows.length === 0 ? (
          <p className="text-sm parent-muted">No circulars at the moment.</p>
        ) : (
          <ul className="space-y-3">
            {rows.map((c) => (
              <li key={c.id} className="rounded-xl border border-border p-4 transition hover:bg-muted/30">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Megaphone className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-medium text-foreground">{c.title}</p>
                      <span className="shrink-0 text-xs parent-muted">{fmtDate(c.scheduled_at ?? c.created_at)}</span>
                    </div>
                    {c.description && (
                      <p className="mt-1 text-sm parent-muted whitespace-pre-wrap">{c.description}</p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
