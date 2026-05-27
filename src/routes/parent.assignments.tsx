import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ClipboardList, Calendar, Download, FileText, FileImage, File as FileIcon, Loader2 } from "lucide-react";
import { RequireParentAuth } from "@/components/parent/RequireParentAuth";
import { ParentLayout } from "@/components/parent/ParentLayout";
import {
  ParentDashboardProvider,
  useParentDashboardCtx,
} from "@/hooks/parent-dashboard-context";
import { Skeleton } from "@/components/ui/skeleton";
import { parentSupabase } from "@/lib/parent-supabase";
import { toast } from "sonner";

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
  file_url: string | null;
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

const fileNameFromPath = (p: string) => {
  try {
    const name = decodeURIComponent(p.split("/").pop() ?? p);
    return name.replace(/^\d+[-_]?/, "") || name;
  } catch {
    return p;
  }
};

const extOf = (p: string) => (p.split(".").pop() ?? "").toLowerCase();

const IconForExt = ({ path }: { path: string }) => {
  const e = extOf(path);
  if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(e))
    return <FileImage className="h-4 w-4 text-primary" />;
  if (["pdf", "doc", "docx", "txt", "rtf"].includes(e))
    return <FileText className="h-4 w-4 text-primary" />;
  return <FileIcon className="h-4 w-4 text-primary" />;
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
        .select("id, title, subject, due_date, description, section_name, class_name, file_url, created_at")
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

function AttachmentRow({ path }: { path: string }) {
  const [busy, setBusy] = useState(false);
  const handleDownload = async () => {
    setBusy(true);
    try {
      const { data, error } = await parentSupabase.storage
        .from("assignments")
        .createSignedUrl(path, 60 * 10, { download: fileNameFromPath(path) });
      if (error || !data?.signedUrl) {
        toast.error("Unable to open file. Please try again.");
        return;
      }
      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    } catch {
      toast.error("Unable to open file.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2">
      <div className="flex min-w-0 items-center gap-2">
        <IconForExt path={path} />
        <span className="truncate text-sm text-foreground">{fileNameFromPath(path)}</span>
        <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase parent-muted">
          {extOf(path) || "file"}
        </span>
      </div>
      <button
        type="button"
        onClick={handleDownload}
        disabled={busy}
        className="inline-flex shrink-0 items-center gap-1 rounded-md bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
        Download
      </button>
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
          {items.map((a) => {
            const attachments = (a.file_url ?? "")
              .split(/[\n,]+/)
              .map((s) => s.trim())
              .filter(Boolean);
            return (
              <li
                key={a.id}
                className={`rounded-xl border border-border p-4 transition hover:bg-muted/30 ${muted ? "opacity-80" : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">{a.title}</p>
                    {a.subject && <p className="text-xs parent-muted">{a.subject}</p>}
                    {a.description && <p className="mt-2 text-sm parent-muted line-clamp-3">{a.description}</p>}
                  </div>
                  <div className="flex shrink-0 items-center gap-1 rounded-lg bg-primary/10 px-2 py-1 text-xs text-primary">
                    <Calendar className="h-3 w-3" /> {fmtDate(a.due_date)}
                  </div>
                </div>
                <div className="mt-3 border-t border-border pt-3">
                  <p className="mb-2 text-xs font-medium parent-muted">Attachments</p>
                  {attachments.length === 0 ? (
                    <p className="text-xs parent-muted">No attachments</p>
                  ) : (
                    <div className="space-y-2">
                      {attachments.map((p) => (
                        <AttachmentRow key={p} path={p} />
                      ))}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
