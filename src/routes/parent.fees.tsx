import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Wallet,
  CreditCard,
  Calendar,
  ChevronDown,
  ChevronRight,
  ReceiptText,
  LayoutList,
  CalendarDays,
} from "lucide-react";
import { RequireParentAuth } from "@/components/parent/RequireParentAuth";
import { ParentLayout } from "@/components/parent/ParentLayout";
import { ParentDashboardProvider, useParentDashboardCtx } from "@/hooks/parent-dashboard-context";
import { Skeleton } from "@/components/ui/skeleton";
import { parentSupabase, PARENT_SUPABASE_PUBLISHABLE_KEY, PARENT_SUPABASE_URL } from "@/lib/parent-supabase";
import { toast } from "sonner";

// ─── Razorpay (unchanged) ───────────────────────────────────────────────────

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const RAZORPAY_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";
function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = RAZORPAY_SCRIPT;
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

interface RazorpayOrderResponse {
  order_id: string;
  key_id: string;
  amount: number;
  currency: string;
  receipt: string;
  installment_id: string;
}
interface VerifyPaymentResponse {
  success: boolean;
  duplicate?: boolean;
}

async function invokeParentFunction<T>(name: string, body: Record<string, unknown>): Promise<T> {
  const { data: sessionData } = await parentSupabase.auth.getSession();
  const token = sessionData.session?.access_token;
  if (!token) throw new Error("Please sign in again before paying fees.");
  const res = await fetch(`${PARENT_SUPABASE_URL}/functions/v1/${name}`, {
    method: "POST",
    headers: {
      apikey: PARENT_SUPABASE_PUBLISHABLE_KEY,
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  const payload = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(payload?.error ?? "Payment request failed");
  return payload as T;
}

// ─── Route ──────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/parent/fees")({
  head: () => ({
    meta: [
      { title: "Fees — Parent Portal" },
      { name: "description", content: "View your child's fees and payment history." },
    ],
  }),
  component: () => (
    <RequireParentAuth>
      <ParentDashboardProvider>
        <ParentLayout>
          <FeesPage />
        </ParentLayout>
      </ParentDashboardProvider>
    </RequireParentAuth>
  ),
});

// ─── Helpers ────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(
    Math.round(n || 0),
  );

const fmtDate = (s: string | null) => {
  if (!s) return "—";
  try {
    return new Date(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return s;
  }
};

const fmtMonthYear = (s: string) => {
  try {
    return new Date(s).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  } catch {
    return s;
  }
};

const monthKey = (due: string | null) => {
  if (!due) return "9999-99"; // undated go last
  return due.slice(0, 7); // "YYYY-MM"
};

// ─── Types ──────────────────────────────────────────────────────────────────

interface FeeHead {
  id: string;
  fee_head_name: string;
  display_order: number;
  is_recurring: boolean;
}

interface RawTerm {
  id: string;
  fee_head_id: string | null;
  installment_name: string | null;
  term_amount: number;
  paid_amount: number;
  balance_amount: number | null;
  due_amount: number | null;
  due_date: string | null;
  status: string;
  installment_order: number | null;
  term_number: number;
  fee_heads: FeeHead | null;
}

interface FeeHeadGroup {
  key: string;
  name: string;
  displayOrder: number;
  total: number;
  paid: number;
  pending: number;
  terms: RawTerm[];
}

interface MonthGroup {
  monthKey: string;        // "2026-06"
  monthLabel: string;      // "June 2026"
  entries: Array<{ due_date: string; label: string; amount: number }>;
  total: number;
}

interface FeePayment {
  id: string;
  amount: number | null;
  payment_date: string | null;
  payment_mode: string | null;
  receipt_number: string | null;
  status: string | null;
}

// ─── Data transformation ────────────────────────────────────────────────────

function termBalance(t: RawTerm): number {
  if (t.balance_amount != null) return Number(t.balance_amount);
  if (t.due_amount != null) return Number(t.due_amount);
  return Math.max(0, Number(t.term_amount) - Number(t.paid_amount));
}

function groupByFeeHead(terms: RawTerm[]): FeeHeadGroup[] {
  const map = new Map<string, FeeHeadGroup>();
  for (const t of terms) {
    const key = t.fee_head_id ?? `__unknown_${t.term_number}`;
    const name = t.fee_heads?.fee_head_name ?? "Fees";
    const order = t.fee_heads?.display_order ?? 99;
    if (!map.has(key)) {
      map.set(key, { key, name, displayOrder: order, total: 0, paid: 0, pending: 0, terms: [] });
    }
    const g = map.get(key)!;
    g.total += Number(t.term_amount);
    g.paid += Number(t.paid_amount);
    g.pending += termBalance(t);
    g.terms.push(t);
  }
  return Array.from(map.values()).sort((a, b) => a.displayOrder - b.displayOrder);
}

function groupByMonth(terms: RawTerm[]): MonthGroup[] {
  const map = new Map<string, MonthGroup>();
  for (const t of terms) {
    const mk = monthKey(t.due_date);
    if (!map.has(mk)) {
      map.set(mk, {
        monthKey: mk,
        monthLabel: t.due_date ? fmtMonthYear(t.due_date) : "Undated",
        entries: [],
        total: 0,
      });
    }
    const g = map.get(mk)!;
    const headName = t.fee_heads?.fee_head_name ?? "Fee";
    const label = t.installment_name ? `${headName} — ${t.installment_name}` : headName;
    g.entries.push({ due_date: t.due_date ?? "", label, amount: Number(t.term_amount) });
    g.total += Number(t.term_amount);
  }
  return Array.from(map.values()).sort((a, b) => a.monthKey.localeCompare(b.monthKey));
}

// ─── Status badge ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string | null }) {
  const s = (status ?? "").toLowerCase();
  const cls =
    s === "paid"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : s === "partial"
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : "bg-red-50 text-red-700 border-red-200";
  return (
    <span className={`inline-block rounded-full border px-2 py-0.5 text-xs capitalize ${cls}`}>
      {status ?? "Pending"}
    </span>
  );
}

// ─── Summary cards ───────────────────────────────────────────────────────────

function SummaryCard({
  label, value, loading, accent,
}: {
  label: string; value: string; loading: boolean; accent?: string;
}) {
  return (
    <div className="glass p-5">
      <p className="text-sm parent-muted">{label}</p>
      {loading ? (
        <Skeleton className="mt-2 h-8 w-28" />
      ) : (
        <p className={`mt-2 text-2xl font-bold ${accent ?? "text-secondary"}`}>{value}</p>
      )}
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

type Tab = "details" | "structure" | "transactions";
type StructureView = "default" | "duedate";

function FeesPage() {
  const { student, studentId, fees, organization, loading, reload } = useParentDashboardCtx();
  const [activeTab, setActiveTab] = useState<Tab>("details");
  const [structureView, setStructureView] = useState<StructureView>("default");
  const [terms, setTerms] = useState<RawTerm[]>([]);
  const [payments, setPayments] = useState<FeePayment[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleExpand = (key: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  useEffect(() => {
    if (!studentId) return;
    let cancelled = false;
    (async () => {
      setPageLoading(true);

      const TERM_COLS = `id, fee_head_id, installment_name, term_amount, paid_amount,
        balance_amount, due_amount, due_date, status, installment_order, term_number`;

      // Use same student_id source as getFeeSummary (parent_accounts.student_id)
      let { data: rawTerms } = await parentSupabase
        .from("student_fee_terms")
        .select(TERM_COLS)
        .eq("student_id", studentId)
        .order("installment_order", { ascending: true, nullsFirst: false });

      // Mirror the exact fallback path used in getFeeSummary
      if (!rawTerms || rawTerms.length === 0) {
        const { data: ov } = await parentSupabase
          .from("student_fee_overrides")
          .select("id")
          .eq("student_id", studentId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        const ovId = (ov as { id?: string } | null)?.id;
        if (ovId) {
          const { data: ovTerms } = await parentSupabase
            .from("student_fee_terms")
            .select(TERM_COLS)
            .eq("student_fee_override_id", ovId)
            .order("installment_order", { ascending: true, nullsFirst: false });
          rawTerms = ovTerms ?? [];
        }
      }

      // Separately fetch fee_heads — fails gracefully if parent has no access
      const feeHeadIds = [
        ...new Set(
          (rawTerms ?? [])
            .map((t: Record<string, unknown>) => t.fee_head_id as string | null)
            .filter((id): id is string => !!id),
        ),
      ];
      const feeHeadMap = new Map<string, FeeHead>();
      if (feeHeadIds.length > 0) {
        const { data: headRows } = await parentSupabase
          .from("fee_heads")
          .select("id, fee_head_name, display_order, is_recurring")
          .in("id", feeHeadIds);
        for (const h of headRows ?? []) {
          feeHeadMap.set((h as FeeHead).id, h as FeeHead);
        }
      }

      // Merge fee_heads into each term client-side
      const mergedTerms: RawTerm[] = (rawTerms ?? []).map((t: Record<string, unknown>) => ({
        ...(t as Omit<RawTerm, "fee_heads">),
        fee_heads: t.fee_head_id ? (feeHeadMap.get(t.fee_head_id as string) ?? null) : null,
      }));

      const { data: p } = await parentSupabase
        .from("fee_payments")
        .select("id, amount, payment_date, payment_mode, receipt_number, status, is_deleted")
        .eq("student_id", studentId)
        .order("payment_date", { ascending: false });

      if (cancelled) return;
      setTerms(mergedTerms);
      setPayments(
        ((p ?? []) as Array<FeePayment & { is_deleted: boolean | null }>).filter((x) => !x.is_deleted),
      );
      setPageLoading(false);
    })();
    return () => { cancelled = true; };
  }, [studentId]);

  const reloadAll = async () => {
    if (!studentId) return;
    const TERM_COLS = `id, fee_head_id, installment_name, term_amount, paid_amount,
      balance_amount, due_amount, due_date, status, installment_order, term_number`;
    const { data: rawTerms } = await parentSupabase
      .from("student_fee_terms")
      .select(TERM_COLS)
      .eq("student_id", studentId)
      .order("installment_order", { ascending: true, nullsFirst: false });

    const feeHeadIds = [
      ...new Set(
        (rawTerms ?? [])
          .map((t: Record<string, unknown>) => t.fee_head_id as string | null)
          .filter((id): id is string => !!id),
      ),
    ];
    const feeHeadMap = new Map<string, FeeHead>();
    if (feeHeadIds.length > 0) {
      const { data: headRows } = await parentSupabase
        .from("fee_heads")
        .select("id, fee_head_name, display_order, is_recurring")
        .in("id", feeHeadIds);
      for (const h of headRows ?? []) {
        feeHeadMap.set((h as FeeHead).id, h as FeeHead);
      }
    }
    const mergedTerms: RawTerm[] = (rawTerms ?? []).map((t: Record<string, unknown>) => ({
      ...(t as Omit<RawTerm, "fee_heads">),
      fee_heads: t.fee_head_id ? (feeHeadMap.get(t.fee_head_id as string) ?? null) : null,
    }));

    setTerms(mergedTerms);
    const { data: p } = await parentSupabase
      .from("fee_payments")
      .select("id, amount, payment_date, payment_mode, receipt_number, status, is_deleted")
      .eq("student_id", studentId)
      .order("payment_date", { ascending: false });
    setPayments(
      ((p ?? []) as Array<FeePayment & { is_deleted: boolean | null }>).filter((x) => !x.is_deleted),
    );
    await reload();
  };

  // ── Razorpay handler (logic unchanged, triggers per term row) ──
  const handlePay = async (term: RawTerm) => {
    if (!student) return;
    const balance = termBalance(term);
    if (!balance || balance <= 0) { toast.info("This installment is already paid."); return; }
    setPayingId(term.id);
    try {
      const ok = await loadRazorpay();
      if (!ok) throw new Error("Failed to load Razorpay");
      const data = await invokeParentFunction<RazorpayOrderResponse>("razorpay-create-order", {
        installment_id: term.id,
        amount: balance,
      });
      const rzp = new window.Razorpay({
        key: data.key_id,
        order_id: data.order_id,
        amount: data.amount,
        currency: data.currency,
        name: organization?.name ?? "School",
        image: organization?.logo_url ?? undefined,
        description: term.fee_heads?.fee_head_name
          ? `${term.fee_heads.fee_head_name} — ${term.installment_name ?? ""}`
          : (term.installment_name ?? "Fee installment"),
        prefill: { name: student.name ?? undefined },
        theme: { color: "#FF6B00" },
        config_id: "config_SmTmClnmVbHhKf",
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const vData = await invokeParentFunction<VerifyPaymentResponse>("razorpay-verify-payment", {
              ...response,
              installment_id: term.id,
              amount: balance,
            });
            if (!vData.success) throw new Error("Verification failed");
            toast.success("Payment successful");
            await reloadAll();
          } catch (e) {
            toast.error(e instanceof Error ? e.message : "Payment verification failed");
          } finally {
            setPayingId(null);
          }
        },
        modal: { ondismiss: () => setPayingId(null) },
      });
      rzp.open();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not start payment");
      setPayingId(null);
    }
  };

  const feeGroups = groupByFeeHead(terms);
  const monthGroups = groupByMonth(terms);

  const TABS: Array<{ key: Tab; label: string; icon: React.ReactNode }> = [
    { key: "details", label: "Fee Details", icon: <Wallet className="h-4 w-4" /> },
    { key: "structure", label: "Fee Structure", icon: <LayoutList className="h-4 w-4" /> },
    { key: "transactions", label: "Recent Transactions", icon: <ReceiptText className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-5">
      {/* ── Page header ── */}
      <div className="glass-strong border-l-4 border-l-primary p-6">
        <div className="flex items-start gap-3">
          {organization?.logo_url && (
            <img
              src={organization.logo_url}
              alt={organization.name ?? "School"}
              className="h-10 w-10 rounded-full object-cover ring-1 ring-border"
            />
          )}
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-secondary md:text-2xl">Fees</h1>
            <p className="mt-0.5 truncate text-sm parent-muted">
              {student?.name ?? ""}
              {student?.class
                ? ` (Class ${student.class}${student.section ? ` - ${student.section}` : ""})`
                : ""}
            </p>
          </div>
        </div>
      </div>

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <SummaryCard label="Total Fees" value={fees ? fmt(fees.total) : "—"} loading={loading && !fees} />
        <SummaryCard
          label="Paid"
          value={fees ? fmt(fees.paid) : "—"}
          loading={loading && !fees}
          accent="text-emerald-600"
        />
        <SummaryCard
          label="Pending"
          value={fees ? fmt(fees.pending) : "—"}
          loading={loading && !fees}
          accent="text-destructive"
        />
        <div className="glass p-5">
          <p className="text-sm parent-muted">Next Due</p>
          <p className="mt-2 text-base font-semibold text-secondary">
            {fees?.nextDueDate ? fmtDate(fees.nextDueDate) : "—"}
          </p>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="glass overflow-hidden">
        {/* Tab bar */}
        <div className="flex border-b border-border">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === t.key
                  ? "border-b-2 border-primary text-primary"
                  : "parent-muted hover:text-foreground"
              }`}
            >
              {t.icon}
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {/* ── Tab: Fee Details ── */}
        {activeTab === "details" && (
          <div className="p-5">
            {pageLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </div>
            ) : feeGroups.length === 0 ? (
              <p className="text-sm parent-muted">No fee details found for this student.</p>
            ) : (
              <div className="space-y-2">
                {/* Fee head breakdown header */}
                <div className="mb-3 hidden grid-cols-[1fr_auto_auto_auto_auto] gap-3 px-4 text-xs font-medium uppercase tracking-wide parent-muted sm:grid">
                  <span>Fee Head</span>
                  <span className="text-right">Total</span>
                  <span className="text-right">Paid</span>
                  <span className="text-right">Pending</span>
                  <span className="text-right">Status</span>
                </div>

                {feeGroups.map((group) => {
                  const isOpen = expanded.has(group.key);
                  const allPaid = group.pending <= 0;
                  return (
                    <div key={group.key} className="overflow-hidden rounded-xl border border-border">
                      {/* Fee head row — clickable header */}
                      <button
                        onClick={() => toggleExpand(group.key)}
                        className="flex w-full items-center justify-between gap-3 bg-muted/30 px-4 py-3 text-left transition hover:bg-muted/50"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          {isOpen ? (
                            <ChevronDown className="h-4 w-4 shrink-0 text-primary" />
                          ) : (
                            <ChevronRight className="h-4 w-4 shrink-0 parent-muted" />
                          )}
                          <span className="font-medium text-foreground">{group.name}</span>
                          <span className="hidden text-xs parent-muted sm:inline">
                            ({group.terms.length} installment{group.terms.length !== 1 ? "s" : ""})
                          </span>
                        </div>
                        <div className="flex shrink-0 items-center gap-4 text-sm">
                          <span className="hidden text-right font-medium text-secondary sm:block">
                            {fmt(group.total)}
                          </span>
                          <span className="hidden text-right text-emerald-600 sm:block">{fmt(group.paid)}</span>
                          <span className="font-semibold text-destructive">{fmt(group.pending)}</span>
                          <StatusBadge status={allPaid ? "paid" : group.paid > 0 ? "partial" : "pending"} />
                        </div>
                      </button>

                      {/* Expanded term rows */}
                      {isOpen && (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-t border-border bg-muted/10 text-left text-xs parent-muted">
                                <th className="px-4 py-2">Installment</th>
                                <th className="px-3 py-2 text-right">Amount</th>
                                <th className="px-3 py-2 text-right">Paid</th>
                                <th className="px-3 py-2 text-right">Balance</th>
                                <th className="px-3 py-2">Due Date</th>
                                <th className="px-3 py-2">Status</th>
                                <th className="px-3 py-2">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {group.terms.map((t) => {
                                const bal = termBalance(t);
                                const payable = bal > 0.01 && (t.status ?? "").toLowerCase() !== "paid";
                                return (
                                  <tr key={t.id} className="border-t border-border">
                                    <td className="px-4 py-2.5 font-medium">
                                      {t.installment_name ?? `Term ${t.term_number}`}
                                    </td>
                                    <td className="px-3 py-2.5 text-right">{fmt(Number(t.term_amount))}</td>
                                    <td className="px-3 py-2.5 text-right text-emerald-600">
                                      {fmt(Number(t.paid_amount))}
                                    </td>
                                    <td className="px-3 py-2.5 text-right font-medium text-destructive">
                                      {fmt(bal)}
                                    </td>
                                    <td className="px-3 py-2.5 whitespace-nowrap parent-muted">
                                      {fmtDate(t.due_date)}
                                    </td>
                                    <td className="px-3 py-2.5">
                                      <StatusBadge status={t.status} />
                                    </td>
                                    <td className="px-3 py-2.5">
                                      {payable ? (
                                        <button
                                          onClick={() => handlePay(t)}
                                          disabled={payingId === t.id}
                                          className="glass-btn inline-flex items-center gap-1 px-3 py-1 text-xs disabled:opacity-60"
                                        >
                                          <CreditCard className="h-3 w-3" />
                                          {payingId === t.id ? "Processing…" : "Pay"}
                                        </button>
                                      ) : (
                                        <span className="text-xs parent-muted">—</span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Tab: Fee Structure ── */}
        {activeTab === "structure" && (
          <div className="p-5">
            {/* Sub-view toggle */}
            <div className="mb-5 flex gap-2">
              <button
                onClick={() => setStructureView("default")}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                  structureView === "default"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-foreground hover:bg-muted"
                }`}
              >
                <LayoutList className="h-3.5 w-3.5" />
                Default View
              </button>
              <button
                onClick={() => setStructureView("duedate")}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                  structureView === "duedate"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-foreground hover:bg-muted"
                }`}
              >
                <CalendarDays className="h-3.5 w-3.5" />
                Due Date Wise
              </button>
            </div>

            {pageLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : terms.length === 0 ? (
              <p className="text-sm parent-muted">No fee structure data available.</p>
            ) : structureView === "default" ? (
              /* Default View — grouped by fee head */
              <div className="space-y-5">
                {feeGroups.map((group) => (
                  <div key={group.key} className="rounded-xl border border-border overflow-hidden">
                    <div className="flex items-center justify-between bg-muted/30 px-4 py-3">
                      <span className="font-semibold text-secondary">{group.name}</span>
                      <span className="text-sm font-bold text-primary">{fmt(group.total)}</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-t border-border text-left text-xs parent-muted">
                            <th className="px-4 py-2">Installment</th>
                            <th className="px-3 py-2 text-right">Amount</th>
                            <th className="px-3 py-2">Due Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.terms.map((t) => (
                            <tr key={t.id} className="border-t border-border">
                              <td className="px-4 py-2.5">
                                {t.installment_name ?? `Term ${t.term_number}`}
                                {t.fee_heads && !t.fee_heads.is_recurring && (
                                  <span className="ml-2 rounded-full bg-muted px-1.5 py-0.5 text-[10px] parent-muted">
                                    one-time
                                  </span>
                                )}
                              </td>
                              <td className="px-3 py-2.5 text-right font-medium">
                                {fmt(Number(t.term_amount))}
                              </td>
                              <td className="px-3 py-2.5 parent-muted">{fmtDate(t.due_date)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Due Date Wise View — grouped by month */
              <div className="space-y-5">
                {monthGroups.map((mg) => (
                  <div key={mg.monthKey} className="rounded-xl border border-border overflow-hidden">
                    <div className="flex items-center justify-between bg-muted/30 px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span className="font-semibold text-secondary">{mg.monthLabel}</span>
                      </div>
                      <span className="text-sm font-bold text-primary">{fmt(mg.total)}</span>
                    </div>
                    <div className="divide-y divide-border">
                      {mg.entries.map((e, i) => (
                        <div key={i} className="flex items-center justify-between px-4 py-2.5">
                          <div>
                            <p className="text-sm">{e.label}</p>
                            {e.due_date && (
                              <p className="text-xs parent-muted">{fmtDate(e.due_date)}</p>
                            )}
                          </div>
                          <span className="text-sm font-medium">{fmt(e.amount)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between border-t border-border bg-muted/20 px-4 py-2">
                      <span className="text-xs font-medium parent-muted uppercase tracking-wide">
                        Month Total
                      </span>
                      <span className="text-sm font-bold text-secondary">{fmt(mg.total)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Tab: Recent Transactions ── */}
        {activeTab === "transactions" && (
          <div className="p-5">
            {pageLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : payments.length === 0 ? (
              <div className="py-8 text-center">
                <ReceiptText className="mx-auto mb-3 h-8 w-8 parent-muted opacity-40" />
                <p className="text-sm parent-muted">No payments recorded yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs parent-muted">
                      <th className="pb-2 pr-4">Date</th>
                      <th className="pb-2 pr-4">Receipt No.</th>
                      <th className="pb-2 pr-4">Mode</th>
                      <th className="pb-2 pr-4 text-right">Amount</th>
                      <th className="pb-2 pr-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p.id} className="border-t border-border">
                        <td className="py-2.5 pr-4 whitespace-nowrap">{fmtDate(p.payment_date)}</td>
                        <td className="py-2.5 pr-4 font-mono text-xs">{p.receipt_number ?? "—"}</td>
                        <td className="py-2.5 pr-4 capitalize">{p.payment_mode ?? "—"}</td>
                        <td className="py-2.5 pr-4 text-right font-medium">{fmt(Number(p.amount ?? 0))}</td>
                        <td className="py-2.5 pr-4">
                          <StatusBadge status={p.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
