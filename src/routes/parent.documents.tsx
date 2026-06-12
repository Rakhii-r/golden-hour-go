import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Download, Eye, FileText, Search, Receipt, Megaphone, FileBadge, Loader2, GraduationCap } from "lucide-react";
import { RequireParentAuth } from "@/components/parent/RequireParentAuth";
import { ParentLayout } from "@/components/parent/ParentLayout";
import { ParentDashboardProvider, useParentDashboardCtx } from "@/hooks/parent-dashboard-context";
import { parentSupabase } from "@/lib/parent-supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FeeReceiptDialog } from "@/components/parent/FeeReceiptDialog";
import type { FeeReceiptData } from "@/components/parent/FeeReceipt";
import { ReportCardDialog } from "@/components/parent/ReportCardDialog";
import type { ReportCardData } from "@/components/parent/ReportCard";
import { loadReportCards, type ReportCardBundle } from "@/lib/parent-report-cards";
import { toast } from "sonner";

export const Route = createFileRoute("/parent/documents")({
  component: DocumentsRoute,
});

type DocCategory = "fee_receipt" | "report_card" | "student_document" | "circular_attachment";

interface DocRow {
  id: string;
  category: DocCategory;
  title: string;
  subtitle: string | null;
  date: string;
  bucket: string | null;
  path: string | null;
  url: string | null;
  meta?: Record<string, unknown>;
}

const CATEGORY_LABEL: Record<DocCategory, string> = {
  fee_receipt: "Fee Receipt",
  report_card: "Report Card",
  student_document: "Student Document",
  circular_attachment: "Circular Attachment",
};

const CATEGORY_ICON: Record<DocCategory, typeof FileText> = {
  fee_receipt: Receipt,
  report_card: GraduationCap,
  student_document: FileBadge,
  circular_attachment: Megaphone,
};

function DocumentsRoute() {
  return (
    <RequireParentAuth>
      <ParentDashboardProvider>
        <ParentLayout>
          <DocumentsPage />
        </ParentLayout>
      </ParentDashboardProvider>
    </RequireParentAuth>
  );
}

function DocumentsPage() {
  const { student, studentId, organization } = useParentDashboardCtx();
  const [rows, setRows] = useState<DocRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<DocCategory | "all">("all");
  const [search, setSearch] = useState("");
  const [downloading, setDownloading] = useState<string | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<FeeReceiptData | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportData, setReportData] = useState<ReportCardData | null>(null);
  const [reportBundle, setReportBundle] = useState<ReportCardBundle | null>(null);

  useEffect(() => {
    if (!studentId || !student?.organization_id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const all: DocRow[] = [];

      // 1. Fee Receipts — fee_payments
      try {
        const { data } = await parentSupabase
          .from("fee_payments")
          .select("id, amount, payment_date, payment_mode, receipt_number, transaction_id, term_number")
          .eq("student_id", studentId)
          .not("receipt_number", "is", null)
          .order("payment_date", { ascending: false })
          .limit(200);
        for (const p of (data ?? []) as Array<{
          id: string; amount: number; payment_date: string; payment_mode: string;
          receipt_number: string; transaction_id: string | null; term_number: number | null;
        }>) {
          all.push({
            id: `fee-${p.id}`,
            category: "fee_receipt",
            title: `Receipt #${p.receipt_number}`,
            subtitle: `₹${Number(p.amount).toLocaleString("en-IN")} · ${p.payment_mode}${p.term_number ? ` · Term ${p.term_number}` : ""}`,
            date: p.payment_date,
            bucket: null,
            path: null,
            url: null,
            meta: { payment: p },
          });
        }
      } catch (e) {
        console.warn("[documents] fee_payments failed", e);
      }

      // 2. Student Documents
      try {
        const { data } = await parentSupabase
          .from("student_documents")
          .select("id, document_type, file_url, issue_date, created_at, notes, approval_status")
          .eq("student_id", studentId)
          .order("created_at", { ascending: false });
        for (const d of (data ?? []) as Array<{
          id: string; document_type: string; file_url: string | null;
          issue_date: string | null; created_at: string; notes: string | null; approval_status: string | null;
        }>) {
          if (!d.file_url) continue;
          all.push({
            id: `sd-${d.id}`,
            category: "student_document",
            title: d.document_type,
            subtitle: d.notes ?? d.approval_status ?? null,
            date: d.issue_date ?? d.created_at.slice(0, 10),
            bucket: "student-documents",
            path: d.file_url,
            url: null,
          });
        }
      } catch (e) {
        console.warn("[documents] student_documents failed", e);
      }

      // 3. Circular Attachments
      try {
        const { data } = await parentSupabase
          .from("circulars")
          .select("id, title, description, attachment_url, created_at, status, target_roles, is_archived")
          .eq("organization_id", student.organization_id)
          .eq("is_archived", false)
          .not("attachment_url", "is", null)
          .order("created_at", { ascending: false })
          .limit(100);
        for (const c of (data ?? []) as Array<{
          id: string; title: string; description: string | null; attachment_url: string | null;
          created_at: string; status: string | null; target_roles: string[] | null;
        }>) {
          if (!c.attachment_url) continue;
          if (c.target_roles && c.target_roles.length > 0) {
            const ok = c.target_roles.some((r) => ["parent", "parents", "all"].includes(r.toLowerCase()));
            if (!ok) continue;
          }
          all.push({
            id: `cir-${c.id}`,
            category: "circular_attachment",
            title: c.title,
            subtitle: c.description,
            date: c.created_at.slice(0, 10),
            bucket: "circulars",
            path: c.attachment_url,
            url: null,
          });
        }
      } catch (e) {
        console.warn("[documents] circulars failed", e);
      }

      // 4. Report Cards — derived from marks_entries grouped by exam_type
      try {
        if (student && organization) {
          const bundle = await loadReportCards({
            studentId,
            organizationId: student.organization_id,
            student: {
              name: student.name ?? "Student",
              admission_number: student.admission_number ?? null,
              roll_number: student.roll_number ?? null,
              class: student.class ?? null,
              section: student.section ?? null,
              father_name: student.father_name ?? null,
              mother_name: student.mother_name ?? null,
              academic_year: student.academic_year ?? null,
            },
            schoolName: organization.name ?? "School",
            schoolLogoUrl: organization.logo_url ?? null,
          });
          if (!cancelled) setReportBundle(bundle);
          for (const s of bundle.summaries) {
            all.push({
              id: `rc-${s.exam_type_id}`,
              category: "report_card",
              title: `Report Card — ${s.exam_name}`,
              subtitle: `${s.subject_count} subjects · ${s.percentage != null ? `${s.percentage}%` : "—"}${s.overall_grade ? ` · Grade ${s.overall_grade}` : ""}${s.result_status ? ` · ${s.result_status}` : ""}`,
              date: s.latest_at.slice(0, 10),
              bucket: null,
              path: null,
              url: null,
              meta: { exam_type_id: s.exam_type_id },
            });
          }
        }
      } catch (e) {
        console.warn("[documents] report_cards failed", e);
      }

      if (!cancelled) {
        all.sort((a, b) => (a.date < b.date ? 1 : -1));
        setRows(all);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [studentId, student?.organization_id]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (filter !== "all" && r.category !== filter) return false;
      if (!q) return true;
      return (
        r.title.toLowerCase().includes(q) ||
        (r.subtitle ?? "").toLowerCase().includes(q) ||
        CATEGORY_LABEL[r.category].toLowerCase().includes(q)
      );
    });
  }, [rows, filter, search]);

  const getSignedUrl = async (bucket: string, path: string): Promise<string | null> => {
    const { data, error } = await parentSupabase.storage.from(bucket).createSignedUrl(path, 60 * 10);
    if (error) {
      toast.error(error.message || "Unable to generate file link");
      return null;
    }
    return data?.signedUrl ?? null;
  };

  const handleView = async (row: DocRow) => {
    if (row.category === "fee_receipt") {
      const p = (row.meta?.payment ?? null) as null | {
        id: string; amount: number; payment_date: string; payment_mode: string;
        receipt_number: string; transaction_id: string | null; term_number: number | null;
      };
      if (!p || !student || !organization) return;
      setReceiptData({
        receipt_number: p.receipt_number,
        transaction_id: p.transaction_id,
        payment_date: p.payment_date,
        amount: Number(p.amount),
        payment_mode: p.payment_mode,
        fee_head_name: null,
        term_number: p.term_number,
        academic_year: student.academic_year ?? null,
        student_name: student.name ?? "Student",
        admission_number: student.admission_number ?? null,
        class_label: student.class
          ? `${student.class}${student.section ? " - " + student.section : ""}`
          : null,
        parent_name: student.father_name || student.mother_name || null,
        school_name: organization.name ?? "School",
        school_logo_url: organization.logo_url ?? null,
      });
      setReceiptOpen(true);
      return;
    }
    if (row.category === "report_card") {
      const examTypeId = (row.meta?.exam_type_id ?? null) as string | null;
      if (!examTypeId || !reportBundle) return;
      const data = reportBundle.build(examTypeId);
      if (!data) {
        toast.error("Unable to build report card");
        return;
      }
      setReportData(data);
      setReportOpen(true);
      return;
    }
    if (!row.bucket || !row.path) return;
    setDownloading(row.id);
    const url = await getSignedUrl(row.bucket, row.path);
    setDownloading(null);
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleDownload = async (row: DocRow) => {
    if (row.category === "fee_receipt" || row.category === "report_card") {
      handleView(row);
      return;
    }
    if (!row.bucket || !row.path) return;
    setDownloading(row.id);
    try {
      const url = await getSignedUrl(row.bucket, row.path);
      if (!url) return;
      const res = await fetch(url);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      const fname = row.path.split("/").pop() || `${row.title}.bin`;
      a.download = fname;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Download failed");
    } finally {
      setDownloading(null);
    }
  };

  const counts = useMemo(() => {
    const c: Record<DocCategory | "all", number> = {
      all: rows.length, fee_receipt: 0, report_card: 0, student_document: 0, circular_attachment: 0,
    };
    for (const r of rows) c[r.category]++;
    return c;
  }, [rows]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
        <p className="text-sm text-gray-500">Receipts, certificates, and shared files for your child.</p>
      </div>

      {/* Filter + search */}
      <Card>
        <CardContent className="p-4 flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search documents…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filter} onValueChange={(v) => setFilter(v as DocCategory | "all")}>
            <SelectTrigger className="w-full md:w-[220px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Documents ({counts.all})</SelectItem>
              <SelectItem value="fee_receipt">Fee Receipts ({counts.fee_receipt})</SelectItem>
              <SelectItem value="student_document">Student Documents ({counts.student_document})</SelectItem>
              <SelectItem value="circular_attachment">Circular Attachments ({counts.circular_attachment})</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* List */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-12 text-sm text-gray-500">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading documents…
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="mx-auto h-10 w-10 text-gray-300" />
              <p className="mt-3 text-sm text-gray-500">No documents found.</p>
            </div>
          ) : (
            <ul className="divide-y">
              {filtered.map((row) => {
                const Icon = CATEGORY_ICON[row.category];
                return (
                  <li key={row.id} className="flex items-center gap-4 p-4 hover:bg-gray-50">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#155EEF]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold text-gray-900">{row.title}</p>
                        <Badge variant="secondary" className="text-[10px]">
                          {CATEGORY_LABEL[row.category]}
                        </Badge>
                      </div>
                      {row.subtitle && (
                        <p className="truncate text-xs text-gray-500">{row.subtitle}</p>
                      )}
                      <p className="text-[11px] text-gray-400">{formatDate(row.date)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleView(row)}
                        disabled={downloading === row.id}
                      >
                        <Eye className="h-4 w-4 mr-1" /> View
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleDownload(row)}
                        disabled={downloading === row.id}
                      >
                        {downloading === row.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-1" /> Download
                          </>
                        )}
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <FeeReceiptDialog open={receiptOpen} onOpenChange={setReceiptOpen} data={receiptData} />
    </div>
  );
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    });
  } catch {
    return iso;
  }
}
