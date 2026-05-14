import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ClipboardList, Calendar } from "lucide-react";
import { RequireParentAuth } from "@/components/parent/RequireParentAuth";
import { ParentLayout } from "@/components/parent/ParentLayout";
import {
  ParentDashboardProvider,
  useParentDashboardCtx,
} from "@/hooks/parent-dashboard-context";
import { Skeleton } from "@/components/ui/skeleton";
import { parentSupabase } from "@/lib/parent-supabase";

export const Route = createFileRoute("/parent/assignments")({
  head: () => ({
    meta: [
      { title: "Assignments — Parent Portal" },
      { name: "description", content: "View assigned homework and projects." },
    ],
  }),
  component: () => (
    <RequireParentAuth>
      <ParentDashboardProvider>
        <ParentLayout>
          <AssignmentsPage />
        </ParentLayout>
      </ParentDashboardProvider>
    </RequireParentAuth>
  ),
});

interface AssignmentRow {
  id: string;
  title: string;
  subject: string | null;
  due_date: string | null;
  description: string | null;
  section_name: string | null;
  created_at: string;
}

const fmtDate = (s: string | null) => {
  if (!s) return "—";
  try {
    return new Date(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return s;
  }
};

function AssignmentsPage() {
  const { student } = useParentDashboardCtx();
  const [rows, setRows] = useState<AssignmentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!student?.organization_id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      let q = parentSupabase
        .from("assignments")
        .select("id, title, subject, due_date, description, section_name, class_name, created_at")
        .eq("organization_id", student.organization_id)
        .order("due_date", { ascending: true, nullsFirst: false });
      if (student.class) q = q.eq("class_name", student.class);
      const { data } = await q;
      if (cancelled) return;
      let list = (data ?? []) as AssignmentRow[];
      if (student.section) {
        list = list.filter((r) => !r.section_name || r.section_name === student.section);
      }
      setRows(list);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [student?.organization_id, student?.class, student?.section]);

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = rows.filter((r) => !r.due_date || r.due_date >= today);
  const past = rows.filter((r) => r.due_date && r.due_date < today);

  return (
    <div className="space-y-5">
      <div className="glass-strong border-l-4 border-l-primary p-6">
        <h1 className="text-xl font-semibold text-secondary md:text-2xl">Assignments</h1>
        <p className="mt-1 parent-muted">Homework and projects assigned to your child's class.</p>
      </div>

      <Section title="Upcoming" items={upcoming} loading={loading} empty="No upcoming assignments." />
      <Section title="Past" items={past} loading={loading} empty="No past assignments." muted />
    </div>
  );
}

function Section({
  title,
  items,
  loading,
  empty,
  muted,
}: {
  title: string;
  items: AssignmentRow[];
  loading: boolean;
  empty: string;
  muted?: boolean;
}) {
  return (
    <div className="glass p-5">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-secondary">
        <ClipboardList className="h-4 w-4" /> {title}{" "}
        <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs parent-muted">{items.length}</span>
      </h2>
      {loading ? (
        <Skeleton className="h-24 w-full" />
      ) : items.length === 0 ? (
        <p className="text-sm parent-muted">{empty}</p>
      ) : (
        <ul className="space-y-3">
          {items.map((a) => (
            <li
              key={a.id}
              className={`rounded-xl border border-border p-4 transition hover:bg-muted/30 ${muted ? "opacity-80" : ""}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-foreground">{a.title}</p>
                  {a.subject && <p className="text-xs parent-muted">{a.subject}</p>}
                  {a.description && <p className="mt-2 text-sm parent-muted line-clamp-2">{a.description}</p>}
                </div>
                <div className="flex shrink-0 items-center gap-1 rounded-lg bg-primary/10 px-2 py-1 text-xs text-primary">
                  <Calendar className="h-3 w-3" /> {fmtDate(a.due_date)}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
