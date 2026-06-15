import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Megaphone, Paperclip, Download, ExternalLink, Loader2 } from "lucide-react";
import { RequireParentAuth } from "@/components/parent/RequireParentAuth";
import { ParentLayout } from "@/components/parent/ParentLayout";
import {
  ParentDashboardProvider,
  useParentDashboardCtx,
} from "@/hooks/parent-dashboard-context";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { parentSupabase } from "@/lib/parent-supabase";
import { toast } from "sonner";

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
  attachment_url: string | null;
  scheduled_at: string | null;
  created_at: string;
  target_classes: string[] | null;
  target_roles: string[] | null;
  status: string | null;
  is_archived: boolean | null;
}

const fmtDateTime = (s: string | null) => {
  if (!s) return "—";
  try {
    return new Date(s).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return s;
  }
};

// Circulars.attachment_url stores a STORAGE PATH inside the private
// "circulars" bucket (e.g. "<org-id>/0.123.pdf"), NOT a public URL.
// Linking to it as a raw href navigates the browser to a relative app URL
// and returns HTML / encoded text — what the user sees as "unreadable
// coded content". We must mint a signed URL from the "circulars" bucket.
const fileNameFromPath = (p: string) => {
  try {
    const last = p.split(/[\\/]/).pop() ?? p;
    return decodeURIComponent(last) || "attachment";
  } catch {
    return "attachment";
  }
};

function CircularsPage() {
  const { student } = useParentDashboardCtx();
  const [rows, setRows] = useState<CircularRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<CircularRow | null>(null);

  useEffect(() => {
    if (!student?.organization_id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);

      // Resolve current parent auth user to look up explicit recipient mappings.
      const { data: userData } = await parentSupabase.auth.getUser();
      const uid = userData?.user?.id ?? null;

      // 1) Explicit recipient mappings for this parent (preferred path).
      let recipientIds: string[] = [];
      if (uid) {
        const { data: recipRows } = await parentSupabase
          .from("circular_recipients")
          .select("circular_id")
          .eq("user_id", uid);
        recipientIds = ((recipRows ?? []) as Array<{ circular_id: string }>)
          .map((r) => r.circular_id)
          .filter(Boolean);
      }

      // 2) Role-targeted circulars (parent / all) — covers backfilled rows
      //    where recipient mapping may not exist yet. RLS already restricts
      //    visibility to parent/all targets within the parent's org.
      const { data: roleRows } = await parentSupabase
        .from("circulars")
        .select(
          "id, title, description, attachment_url, scheduled_at, created_at, target_classes, target_roles, status, is_archived",
        )
        .eq("organization_id", student.organization_id)
        .eq("is_archived", false)
        .order("created_at", { ascending: false });

      let byRecipient: CircularRow[] = [];
      if (recipientIds.length > 0) {
        const { data: recipCirculars } = await parentSupabase
          .from("circulars")
          .select(
            "id, title, description, attachment_url, scheduled_at, created_at, target_classes, target_roles, status, is_archived",
          )
          .in("id", recipientIds)
          .eq("is_archived", false);
        byRecipient = (recipCirculars ?? []) as CircularRow[];
      }

      if (cancelled) return;

      const merged = new Map<string, CircularRow>();
      for (const c of byRecipient) merged.set(c.id, c);
      for (const c of (roleRows ?? []) as CircularRow[]) {
        if (!merged.has(c.id)) merged.set(c.id, c);
      }

      const filtered = Array.from(merged.values()).filter((r) => {
        if (r.status && r.status.toLowerCase() === "draft") return false;
        // Visibility: only parent-targeted or all-role circulars.
        if (r.target_roles && r.target_roles.length > 0) {
          const ok = r.target_roles.some((x) =>
            ["parent", "parents", "all"].includes(x.toLowerCase()),
          );
          if (!ok) return false;
        }
        if (r.target_classes && r.target_classes.length > 0 && student.class) {
          if (!r.target_classes.includes(student.class)) return false;
        }
        return true;
      });

      filtered.sort((a, b) => {
        const ad = new Date(a.scheduled_at ?? a.created_at).getTime();
        const bd = new Date(b.scheduled_at ?? b.created_at).getTime();
        return bd - ad;
      });

      setRows(filtered);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [student?.organization_id, student?.class]);

  const selectedFileName = useMemo(
    () => (selected?.attachment_url ? fileNameFromUrl(selected.attachment_url) : null),
    [selected?.attachment_url],
  );

  return (
    <div className="space-y-5">
      <div className="glass-strong border-l-4 border-l-primary p-6">
        <h1 className="text-xl font-semibold text-secondary md:text-2xl">
          Circulars & Announcements
        </h1>
        <p className="mt-1 parent-muted">Stay updated with school notices.</p>
      </div>

      <div className="glass p-5">
        {loading ? (
          <Skeleton className="h-32 w-full" />
        ) : rows.length === 0 ? (
          <p className="text-sm parent-muted">No circulars at the moment.</p>
        ) : (
          <ul className="space-y-3">
            {rows.map((c) => {
              const preview =
                c.description && c.description.length > 160
                  ? `${c.description.slice(0, 160)}…`
                  : c.description;
              return (
                <li
                  key={c.id}
                  className="cursor-pointer rounded-xl border border-border p-4 transition hover:bg-muted/30"
                  onClick={() => setSelected(c)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Megaphone className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-medium text-foreground">{c.title}</p>
                        <span className="shrink-0 text-xs parent-muted">
                          {fmtDateTime(c.scheduled_at ?? c.created_at)}
                        </span>
                      </div>
                      {preview && (
                        <p className="mt-1 text-sm parent-muted whitespace-pre-wrap">
                          {preview}
                        </p>
                      )}
                      {c.attachment_url && (
                        <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-primary">
                          <Paperclip className="h-3.5 w-3.5" />
                          Attachment
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="pr-6">{selected?.title}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <p className="text-xs parent-muted">
                {fmtDateTime(selected.scheduled_at ?? selected.created_at)}
              </p>
              {selected.description ? (
                <p className="whitespace-pre-wrap text-sm text-foreground">
                  {selected.description}
                </p>
              ) : (
                <p className="text-sm parent-muted">No additional details.</p>
              )}
              {selected.attachment_url && (
                <div className="rounded-xl border border-border p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Paperclip className="h-4 w-4 text-primary" />
                    <span className="truncate">{selectedFileName}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="outline">
                      <a
                        href={selected.attachment_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="mr-1.5 h-4 w-4" />
                        View
                      </a>
                    </Button>
                    <Button asChild size="sm">
                      <a
                        href={selected.attachment_url}
                        download={selectedFileName ?? ""}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Download className="mr-1.5 h-4 w-4" />
                        Download
                      </a>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
