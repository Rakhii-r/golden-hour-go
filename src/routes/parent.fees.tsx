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
  Eye,
  Download,
  Printer,
  FileText,
} from "lucide-react";
import { RequireParentAuth } from "@/components/parent/RequireParentAuth";
import { ParentLayout } from "@/components/parent/ParentLayout";
import { ParentDashboardProvider, useParentDashboardCtx } from "@/hooks/parent-dashboard-context";
import { Skeleton } from "@/components/ui/skeleton";
import { parentSupabase, PARENT_SUPABASE_PUBLISHABLE_KEY, PARENT_SUPABASE_URL } from "@/lib/parent-supabase";
import { toast } from "sonner";
import { FeeReceiptDialog } from "@/components/parent/FeeReceiptDialog";
import type { FeeReceiptData } from "@/components/parent/FeeReceipt";
import { FeeStatementDialog } from "@/components/parent/FeeStatementDialog";
import type { FeeStatementData, FeeStatementPayment } from "@/components/parent/FeeStatement";


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
  receipt_number?: string;
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

// A "RawTerm" is a virtual row representing one fee-head's slice within one
// parent term (student_fee_terms row). When per-head items are not available,
// it represents the whole parent term itself.
interface RawTerm {
  id: string;                  // virtual id (item id, or parent term id as fallback)
  parent_term_id: string;      // student_fee_terms.id (used by Razorpay)
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
  parent_term_balance: number; // remaining for the whole parent term
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
  monthKey: string;
  monthLabel: string;
  entries: Array<{ due_date: string; label: string; amount: number }>;
  total: number;
}

interface FeePayment {
  id: string;
  amount: number | null;
  payment_date: string | null;
  payment_mode: string | null;
  receipt_number: string | null;
  transaction_id: string | null;
  status: string | null;
  term_number: number | null;
  fee_head_id: string | null;
  fee_head_name?: string | null;
  late_fee_amount: number | null;
  discount_amount: number | null;
  notes: string | null;
}

interface TermGroup {
  parentTermId: string;
  termNumber: number;
  installmentName: string | null;
  dueDate: string | null;
  status: string;
  total: number;
  paid: number;
  pending: number;
  rows: RawTerm[]; // one per fee-head (or single synthetic row)
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

function groupByTerm(terms: RawTerm[]): TermGroup[] {
  const map = new Map<string, TermGroup>();
  for (const t of terms) {
    const key = t.parent_term_id;
    if (!map.has(key)) {
      map.set(key, {
        parentTermId: t.parent_term_id,
        termNumber: t.term_number,
        installmentName: t.installment_name,
        dueDate: t.due_date,
        status: "pending",
        total: 0,
        paid: 0,
        pending: 0,
        rows: [],
      });
    }
    const g = map.get(key)!;
    g.total += Number(t.term_amount);
    g.paid += Number(t.paid_amount);
    g.pending += termBalance(t);
    g.rows.push(t);
  }
  for (const g of map.values()) {
    g.status = g.pending <= 0.01 ? "paid" : g.paid > 0 ? "partial" : "pending";
  }
  return Array.from(map.values()).sort((a, b) => a.termNumber - b.termNumber);
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

type Tab = "details" | "structure" | "transactions" | "receipts";
type StructureView = "default" | "duedate";
type Section = "school" | "daycare";

function FeesPage() {
  const { student, studentId, organization, reload } = useParentDashboardCtx();
  const [section, setSection] = useState<Section>("school");
  const [availableSections, setAvailableSections] = useState<{ school: boolean; daycare: boolean }>({
    school: true,
    daycare: false,
  });
  const [activeTab, setActiveTab] = useState<Tab>("details");
  const [structureView, setStructureView] = useState<StructureView>("default");
  const [terms, setTerms] = useState<RawTerm[]>([]);
  const [payments, setPayments] = useState<FeePayment[]>([]);
  const [allReceipts, setAllReceipts] = useState<FeePayment[]>([]);
  const [receiptsLoading, setReceiptsLoading] = useState(true);
  const [receiptsError, setReceiptsError] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  // Per-term selected item ids (student_fee_term_items.id)
  const [selectedItems, setSelectedItems] = useState<Record<string, Set<string>>>({});
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<FeeReceiptData | null>(null);
  const [statementOpen, setStatementOpen] = useState(false);
  const [statementData, setStatementData] = useState<FeeStatementData | null>(null);
  const [statementFileName, setStatementFileName] = useState<string>("Fee-Statement");
  const [selectedTermNumber, setSelectedTermNumber] = useState<string>("");

  const openReceipt = (p: FeePayment) => {
    if (!student || !organization) return;
    setReceiptData({
      receipt_number: p.receipt_number ?? "—",
      transaction_id: p.transaction_id,
      payment_date: p.payment_date,
      amount: Number(p.amount ?? 0),
      payment_mode: p.payment_mode,
      fee_head_name: p.fee_head_name ?? null,
      term_number: p.term_number ?? null,
      academic_year: null,
      student_name: student.name ?? "Student",
      admission_number: student.admission_number ?? null,
      class_label: student.class
        ? `${student.class}${student.section ? " - " + student.section : ""}`
        : null,
      parent_name: null,
      school_name: organization.name ?? "School",
      school_logo_url: organization.logo_url ?? null,
    });
    setReceiptOpen(true);
  };


  const toggleItemSelection = (parentTermId: string, itemId: string) =>
    setSelectedItems((prev) => {
      const next = { ...prev };
      const set = new Set(next[parentTermId] ?? []);
      set.has(itemId) ? set.delete(itemId) : set.add(itemId);
      next[parentTermId] = set;
      return next;
    });

  const toggleExpand = (key: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  // Detect which fee sections (school / daycare) the student has.
  useEffect(() => {
    if (!studentId) return;
    let cancelled = false;
    (async () => {
      const { data } = await parentSupabase
        .from("student_fee_overrides")
        .select("id, billing_type, status, archived_at")
        .eq("student_id", studentId)
        .is("archived_at", null)
        .neq("status", "cancelled");
      if (cancelled) return;
      const rows = (data ?? []) as Array<{ id: string; billing_type: string | null }>;
      const school = rows.some((r) => r.billing_type !== "daycare");
      const daycare = rows.some((r) => r.billing_type === "daycare");
      setAvailableSections({ school: school || !daycare, daycare });
      // If only daycare exists, switch to it.
      if (!school && daycare) setSection("daycare");
    })();
    return () => {
      cancelled = true;
    };
  }, [studentId]);

  // Loads terms (latest override) + per-fee-head items + payments. Mirrors CRM.
  const loadFeeData = async (signal?: { cancelled: boolean }) => {
    if (!studentId) return;

    // 1. Pick the LATEST override for the active section. School = anything
    //    that isn't billing_type='daycare' (covers null/term_wise); Daycare =
    //    billing_type='daycare'.
    let overrideQuery = parentSupabase
      .from("student_fee_overrides")
      .select("id, billing_type")
      .eq("student_id", studentId)
      .is("archived_at", null)
      .neq("status", "cancelled")
      .order("created_at", { ascending: false });
    if (section === "daycare") {
      overrideQuery = overrideQuery.eq("billing_type", "daycare");
    } else {
      overrideQuery = overrideQuery.or("billing_type.is.null,billing_type.neq.daycare");
    }
    const { data: latestOverride } = await overrideQuery.limit(1).maybeSingle();
    const overrideId = (latestOverride as { id?: string } | null)?.id ?? null;

    // 2. Parent terms (student_fee_terms). NOTE: this table has no fee_head_id /
    //    installment_order columns in this schema — selecting them returns 400.
    type ParentTermRow = {
      id: string;
      installment_name: string | null;
      term_amount: number | string;
      paid_amount: number | string;
      balance_amount: number | string | null;
      due_amount: number | string | null;
      due_date: string | null;
      status: string | null;
      term_number: number;
    };
    const TERM_COLS =
      "id, installment_name, term_amount, paid_amount, balance_amount, due_amount, due_date, status, term_number";

    let parentTerms: ParentTermRow[] = [];
    if (overrideId) {
      const { data } = await parentSupabase
        .from("student_fee_terms")
        .select(TERM_COLS)
        .eq("student_fee_override_id", overrideId)
        .order("term_number", { ascending: true });
      parentTerms = (data ?? []) as ParentTermRow[];
    }
    // Legacy fallback (school only) — terms tied directly to student with no override.
    if (parentTerms.length === 0 && section === "school") {
      const { data } = await parentSupabase
        .from("student_fee_terms")
        .select(TERM_COLS)
        .eq("student_id", studentId)
        .is("student_fee_override_id", null)
        .order("term_number", { ascending: true });
      parentTerms = (data ?? []) as ParentTermRow[];
    }


    // 3. Per-fee-head splits (student_fee_term_items) — mirrors CRM "per Fee Head".
    type ItemRow = {
      id: string;
      student_fee_term_id: string | null;
      fee_head_id: string | null;
      fee_head_name: string | null;
      final_amount: number | string | null;
      paid_amount: number | string | null;
    };
    let items: ItemRow[] = [];
    if (parentTerms.length > 0) {
      const termIds = parentTerms.map((t) => t.id);
      const { data: itemRows } = await parentSupabase
        .from("student_fee_term_items")
        .select("id, student_fee_term_id, fee_head_id, fee_head_name, final_amount, paid_amount")
        .in("student_fee_term_id", termIds);
      items = (itemRows ?? []) as ItemRow[];
    }

    // 4. Resolve fee_heads metadata (display_order, is_recurring).
    const headIds = Array.from(
      new Set(items.map((i) => i.fee_head_id).filter((x): x is string => !!x)),
    );
    const feeHeadMap = new Map<string, FeeHead>();
    if (headIds.length > 0) {
      const { data: headRows } = await parentSupabase
        .from("fee_heads")
        .select("id, fee_head_name, display_order, is_recurring")
        .in("id", headIds);
      for (const h of (headRows ?? []) as FeeHead[]) feeHeadMap.set(h.id, h);
    }

    // 5. Build virtual RawTerm rows: one per (parent term × item). Falls back
    //    to one synthetic row per parent term when no items exist.
    const itemsByTerm = new Map<string, ItemRow[]>();
    for (const it of items) {
      if (!it.student_fee_term_id) continue;
      const arr = itemsByTerm.get(it.student_fee_term_id) ?? [];
      arr.push(it);
      itemsByTerm.set(it.student_fee_term_id, arr);
    }

    const merged: RawTerm[] = [];
    for (const pt of parentTerms) {
      const remaining =
        pt.balance_amount != null
          ? Number(pt.balance_amount)
          : pt.due_amount != null
            ? Number(pt.due_amount)
            : Math.max(0, Number(pt.term_amount) - Number(pt.paid_amount));
      const its = itemsByTerm.get(pt.id) ?? [];
      if (its.length === 0) {
        merged.push({
          id: pt.id,
          parent_term_id: pt.id,
          fee_head_id: null,
          installment_name: pt.installment_name,
          term_amount: Number(pt.term_amount),
          paid_amount: Number(pt.paid_amount),
          balance_amount: pt.balance_amount != null ? Number(pt.balance_amount) : null,
          due_amount: pt.due_amount != null ? Number(pt.due_amount) : null,
          due_date: pt.due_date,
          status: pt.status ?? "pending",
          installment_order: null,
          term_number: pt.term_number,
          fee_heads: null,
          parent_term_balance: remaining,
        });
      } else {
        for (const it of its) {
          const total = Number(it.final_amount ?? 0);
          const paid = Number(it.paid_amount ?? 0);
          const bal = Math.max(0, total - paid);
          merged.push({
            id: it.id,
            parent_term_id: pt.id,
            fee_head_id: it.fee_head_id,
            installment_name: pt.installment_name,
            term_amount: total,
            paid_amount: paid,
            balance_amount: bal,
            due_amount: null,
            due_date: pt.due_date,
            status: bal <= 0 ? "paid" : paid > 0 ? "partial" : "pending",
            installment_order: null,
            term_number: pt.term_number,
            fee_heads:
              (it.fee_head_id ? feeHeadMap.get(it.fee_head_id) : undefined) ??
              (it.fee_head_name
                ? { id: it.fee_head_id ?? it.id, fee_head_name: it.fee_head_name, display_order: 99, is_recurring: true }
                : null),
            parent_term_balance: remaining,
          });
        }
      }
    }

    // 6. Payments (recent transactions) — scoped to THIS section's terms via
    //    installment_id so school and daycare payments never mix.
    const termIds = parentTerms.map((t) => t.id);
    let payRows: Array<FeePayment & { is_deleted: boolean | null }> = [];
    if (termIds.length > 0) {
      const { data: p } = await parentSupabase
        .from("fee_payments")
        .select(
          "id, amount, payment_date, payment_mode, receipt_number, transaction_id, status, is_deleted, term_number, fee_head_id, late_fee_amount, discount_amount, notes, installment_id",
        )
        .eq("student_id", studentId)
        .in("installment_id", termIds)
        .order("payment_date", { ascending: false });
      payRows = ((p ?? []) as Array<FeePayment & { is_deleted: boolean | null }>).filter(
        (x) => !x.is_deleted,
      );
    }
    const payHeadIds = Array.from(
      new Set(payRows.map((r) => r.fee_head_id).filter((x): x is string => !!x)),
    );
    const missingHeadIds = payHeadIds.filter((id) => !feeHeadMap.has(id));
    if (missingHeadIds.length > 0) {
      const { data: extra } = await parentSupabase
        .from("fee_heads")
        .select("id, fee_head_name, display_order, is_recurring")
        .in("id", missingHeadIds);
      for (const h of (extra ?? []) as FeeHead[]) feeHeadMap.set(h.id, h);
    }
    const enrichedPayments: FeePayment[] = payRows.map((r) => ({
      ...r,
      fee_head_name: r.fee_head_id ? (feeHeadMap.get(r.fee_head_id)?.fee_head_name ?? null) : null,
    }));

    if (signal?.cancelled) return;
    setTerms(merged);
    setPayments(enrichedPayments);
  };

  useEffect(() => {
    if (!studentId) return;
    const signal = { cancelled: false };
    setPageLoading(true);
    loadFeeData(signal).finally(() => {
      if (!signal.cancelled) setPageLoading(false);
    });
    return () => {
      signal.cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId, section]);

  // Payments are scoped to the current section by linking through their
  // installment_id → student_fee_terms → student_fee_overrides.billing_type.
  // We already filtered terms by section, so further filter the payments list.
  const reloadAll = async () => {
    await loadFeeData();
    await reload();
  };


  // Razorpay handler. If itemIds provided, only those fee heads will be paid
  // and allocated by the verify function. Otherwise the whole term is paid.
  const handlePay = async (
    parentTermId: string,
    amount: number,
    descriptor: string,
    itemIds?: string[],
  ) => {
    if (!student) return;
    if (!amount || amount <= 0) { toast.info("Nothing to pay."); return; }
    const payKey = itemIds && itemIds.length > 0 ? `${parentTermId}:${itemIds.join(",")}` : parentTermId;
    setPayingId(payKey);
    try {
      const ok = await loadRazorpay();
      if (!ok) throw new Error("Failed to load Razorpay");
      const data = await invokeParentFunction<RazorpayOrderResponse>("razorpay-create-order", {
        installment_id: parentTermId,
        amount,
        ...(itemIds && itemIds.length > 0 ? { item_ids: itemIds } : {}),
      });
      const rzp = new window.Razorpay({
        key: data.key_id,
        order_id: data.order_id,
        amount: data.amount,
        currency: data.currency,
        name: organization?.name ?? "School",
        image: organization?.logo_url ?? undefined,
        description: descriptor,
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
              installment_id: parentTermId,
              amount,
              ...(itemIds && itemIds.length > 0 ? { item_ids: itemIds } : {}),
            });
            if (!vData.success) throw new Error("Verification failed");
            toast.success("Payment successful");
            setSelectedItems((prev) => {
              const next = { ...prev };
              delete next[parentTermId];
              return next;
            });
            await reloadAll();
            // Auto-show the receipt for the just-paid transaction
            if (vData.receipt_number && student && organization) {
              setReceiptData({
                receipt_number: vData.receipt_number,
                transaction_id: response.razorpay_payment_id,
                payment_date: new Date().toISOString().slice(0, 10),
                amount,
                payment_mode: "razorpay",
                fee_head_name: descriptor,
                term_number: null,
                academic_year: null,
                student_name: student.name ?? "Student",
                admission_number: student.admission_number ?? null,
                class_label: student.class
                  ? `${student.class}${student.section ? " - " + student.section : ""}`
                  : null,
                parent_name: null,
                school_name: organization.name ?? "School",
                school_logo_url: organization.logo_url ?? null,
              });
              setReceiptOpen(true);
            }

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
  const termGroups = groupByTerm(terms);

  // Per-section totals computed from this section's terms only — never mixed.
  const totalFees = terms.reduce((s, t) => s + Number(t.term_amount), 0);
  const paidFees = terms.reduce((s, t) => s + Number(t.paid_amount), 0);
  const pendingFees = terms.reduce((s, t) => s + termBalance(t), 0);
  const nextDueDate = (() => {
    const today = new Date().toISOString().slice(0, 10);
    const upcoming = termGroups
      .filter((g) => g.pending > 0.01 && g.dueDate)
      .map((g) => g.dueDate!)
      .filter((d) => d >= today)
      .sort();
    return upcoming[0] ?? null;
  })();

  const sectionLabel = section === "daycare" ? "Daycare Fees" : "School Fees";

  const TABS: Array<{ key: Tab; label: string; icon: React.ReactNode }> = [
    { key: "details", label: "Fee Details", icon: <Wallet className="h-4 w-4" /> },
    { key: "structure", label: "Fee Structure", icon: <LayoutList className="h-4 w-4" /> },
    { key: "transactions", label: "Recent Transactions", icon: <ReceiptText className="h-4 w-4" /> },
    { key: "receipts", label: "Receipts", icon: <FileText className="h-4 w-4" /> },
  ];

  // Receipts: all fee_payments for the student that have a receipt_number,
  // independent of the currently-selected School/Daycare section. Mirrors the
  // exact query used by the Documents → Fee Receipts list so anything visible
  // there also appears here.
  useEffect(() => {
    if (!studentId) return;
    let cancelled = false;
    (async () => {
      setReceiptsLoading(true);
      setReceiptsError(null);
      try {
        const { data, error } = await parentSupabase
          .from("fee_payments")
          .select(
            "id, amount, payment_date, payment_mode, receipt_number, transaction_id, status, is_deleted, term_number, fee_head_id, late_fee_amount, discount_amount, notes, installment_id",
          )
          .eq("student_id", studentId)
          .not("receipt_number", "is", null)
          .order("payment_date", { ascending: false })
          .limit(500);
        if (error) throw error;
        if (cancelled) return;
        const rows = ((data ?? []) as Array<FeePayment & { is_deleted: boolean | null }>)
          .filter((r) => !r.is_deleted)
          .map((r) => ({ ...r, fee_head_name: null as string | null }));
        setAllReceipts(rows);
      } catch (e) {
        if (!cancelled) setReceiptsError(e instanceof Error ? e.message : "Failed to load receipts");
      } finally {
        if (!cancelled) setReceiptsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [studentId]);

  const receiptRows = allReceipts;



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

      {/* ── Section selector (School vs Daycare) — only when both exist ── */}
      {availableSections.daycare && availableSections.school && (
        <div className="inline-flex rounded-xl border border-border bg-muted/30 p-1">
          {([
            { key: "school" as const, label: "School Fees" },
            { key: "daycare" as const, label: "Daycare Fees" },
          ]).map((s) => (
            <button
              key={s.key}
              onClick={() => {
                if (s.key === section) return;
                setSection(s.key);
                setExpanded(new Set());
                setSelectedItems({});
                setActiveTab("details");
              }}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                section === s.key
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Summary cards (scoped to active section) ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <SummaryCard
          label={`Total ${sectionLabel}`}
          value={pageLoading ? "—" : fmt(totalFees)}
          loading={pageLoading}
        />
        <SummaryCard
          label="Paid"
          value={pageLoading ? "—" : fmt(paidFees)}
          loading={pageLoading}
          accent="text-emerald-600"
        />
        <SummaryCard
          label="Pending"
          value={pageLoading ? "—" : fmt(pendingFees)}
          loading={pageLoading}
          accent="text-destructive"
        />
        <div className="glass p-5">
          <p className="text-sm parent-muted">Next Due</p>
          <p className="mt-2 text-base font-semibold text-secondary">
            {nextDueDate ? fmtDate(nextDueDate) : "—"}
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
            ) : termGroups.length === 0 ? (
              <p className="text-sm parent-muted">No fee details found for this student.</p>
            ) : (
              <div className="space-y-3">
                {termGroups.map((tg) => {
                  const key = `term-${tg.parentTermId}`;
                  const isOpen = expanded.has(key);
                  const payable = tg.pending > 0.01;
                  // Only rows backed by real student_fee_term_items (have a fee_head)
                  // can be selected individually. Fallback synthetic rows pay the whole term.
                  const selectableRows = tg.rows.filter((r) => r.fee_head_id);
                  const selectedSet = selectedItems[tg.parentTermId] ?? new Set<string>();
                  const selectedRows = selectableRows.filter((r) => selectedSet.has(r.id));
                  const selectedTotal = selectedRows.reduce((s, r) => s + termBalance(r), 0);
                  const termPayKey = tg.parentTermId;
                  const selectedPayKey = `${tg.parentTermId}:${selectedRows.map((r) => r.id).join(",")}`;
                  return (
                    <div key={key} className="overflow-hidden rounded-xl border border-border">
                      {/* Term header */}
                      <button
                        onClick={() => toggleExpand(key)}
                        className="flex w-full items-center justify-between gap-3 bg-muted/30 px-4 py-3 text-left transition hover:bg-muted/50"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          {isOpen ? (
                            <ChevronDown className="h-4 w-4 shrink-0 text-primary" />
                          ) : (
                            <ChevronRight className="h-4 w-4 shrink-0 parent-muted" />
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-secondary">
                              {tg.installmentName ?? `Term ${tg.termNumber}`}
                            </p>
                            <p className="text-xs parent-muted">
                              Due {fmtDate(tg.dueDate)} · {tg.rows.length} fee head
                              {tg.rows.length !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-4 text-sm">
                          <div className="hidden text-right sm:block">
                            <p className="text-[10px] uppercase parent-muted">Total</p>
                            <p className="font-medium text-secondary">{fmt(tg.total)}</p>
                          </div>
                          <div className="hidden text-right sm:block">
                            <p className="text-[10px] uppercase parent-muted">Paid</p>
                            <p className="text-emerald-600">{fmt(tg.paid)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] uppercase parent-muted">Pending</p>
                            <p className="font-semibold text-destructive">{fmt(tg.pending)}</p>
                          </div>
                          <StatusBadge
                            status={tg.status === "partial" ? "Partial Paid" : tg.status}
                          />
                          {payable && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePay(
                                  tg.parentTermId,
                                  tg.pending,
                                  tg.installmentName ?? `Term ${tg.termNumber}`,
                                );
                              }}
                              disabled={payingId === termPayKey}
                              className="glass-btn ml-1 inline-flex items-center gap-1 px-3 py-1.5 text-xs disabled:opacity-60"
                            >
                              <CreditCard className="h-3 w-3" />
                              {payingId === termPayKey ? "Processing…" : "Pay Full Term"}
                            </button>
                          )}
                        </div>
                      </button>

                      {/* Fee head breakdown inside the term */}
                      {isOpen && (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-t border-border bg-muted/10 text-left text-xs parent-muted">
                                <th className="px-3 py-2 w-8"></th>
                                <th className="px-4 py-2">Fee Head</th>
                                <th className="px-3 py-2 text-right">Total</th>
                                <th className="px-3 py-2 text-right">Paid</th>
                                <th className="px-3 py-2 text-right">Pending</th>
                                <th className="px-3 py-2">Status</th>
                                <th className="px-3 py-2 text-right">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {tg.rows.map((t) => {
                                const bal = termBalance(t);
                                const headName =
                                  t.fee_heads?.fee_head_name ??
                                  t.installment_name ??
                                  `Term ${t.term_number}`;
                                const rowStatus =
                                  bal <= 0.01
                                    ? "paid"
                                    : Number(t.paid_amount) > 0
                                      ? "Partial Paid"
                                      : "pending";
                                const rowPayable = bal > 0.01;
                                const isSelectable = !!t.fee_head_id;
                                const isSelected = selectedSet.has(t.id);
                                const rowPayKey = `${tg.parentTermId}:${t.id}`;
                                return (
                                  <tr key={t.id} className="border-t border-border">
                                    <td className="px-3 py-2.5">
                                      {isSelectable && rowPayable && (
                                        <input
                                          type="checkbox"
                                          checked={isSelected}
                                          onChange={() => toggleItemSelection(tg.parentTermId, t.id)}
                                          className="h-4 w-4 cursor-pointer accent-primary"
                                          aria-label={`Select ${headName}`}
                                        />
                                      )}
                                    </td>
                                    <td className="px-4 py-2.5 font-medium">{headName}</td>
                                    <td className="px-3 py-2.5 text-right">
                                      {fmt(Number(t.term_amount))}
                                    </td>
                                    <td className="px-3 py-2.5 text-right text-emerald-600">
                                      {fmt(Number(t.paid_amount))}
                                    </td>
                                    <td className="px-3 py-2.5 text-right font-medium text-destructive">
                                      {fmt(bal)}
                                    </td>
                                    <td className="px-3 py-2.5">
                                      <StatusBadge status={rowStatus} />
                                    </td>
                                    <td className="px-3 py-2.5 text-right">
                                      {isSelectable && rowPayable && (
                                        <button
                                          onClick={() =>
                                            handlePay(tg.parentTermId, bal, headName, [t.id])
                                          }
                                          disabled={payingId === rowPayKey}
                                          className="glass-btn inline-flex items-center gap-1 px-2.5 py-1 text-xs disabled:opacity-60"
                                        >
                                          <CreditCard className="h-3 w-3" />
                                          {payingId === rowPayKey ? "…" : "Pay Now"}
                                        </button>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                              <tr className="border-t-2 border-border bg-muted/20 font-semibold">
                                <td className="px-3 py-2.5" />
                                <td className="px-4 py-2.5">Term Total</td>
                                <td className="px-3 py-2.5 text-right">{fmt(tg.total)}</td>
                                <td className="px-3 py-2.5 text-right text-emerald-600">
                                  {fmt(tg.paid)}
                                </td>
                                <td className="px-3 py-2.5 text-right text-destructive">
                                  {fmt(tg.pending)}
                                </td>
                                <td className="px-3 py-2.5" />
                                <td className="px-3 py-2.5" />
                              </tr>
                            </tbody>
                          </table>
                          {/* Selection footer */}
                          {selectableRows.length > 0 && payable && (
                            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-muted/10 px-4 py-3 text-sm">
                              <div>
                                <span className="parent-muted">Selected Total: </span>
                                <span className="font-semibold text-secondary">
                                  {fmt(selectedTotal)}
                                </span>
                                <span className="ml-2 text-xs parent-muted">
                                  ({selectedRows.length} fee head
                                  {selectedRows.length !== 1 ? "s" : ""})
                                </span>
                              </div>
                              <button
                                onClick={() =>
                                  handlePay(
                                    tg.parentTermId,
                                    selectedTotal,
                                    `${tg.installmentName ?? `Term ${tg.termNumber}`} — ${selectedRows.length} fee head${selectedRows.length !== 1 ? "s" : ""}`,
                                    selectedRows.map((r) => r.id),
                                  )
                                }
                                disabled={
                                  selectedRows.length === 0 ||
                                  selectedTotal <= 0 ||
                                  payingId === selectedPayKey
                                }
                                className="glass-btn inline-flex items-center gap-1 px-3 py-1.5 text-xs disabled:opacity-60"
                              >
                                <CreditCard className="h-3 w-3" />
                                {payingId === selectedPayKey ? "Processing…" : "Pay Selected"}
                              </button>
                            </div>
                          )}
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
              /* Default View — grouped by TERM with fee head breakdown */
              <div className="space-y-5">
                {termGroups.map((tg) => {
                  return (
                    <div key={tg.parentTermId} className="rounded-xl border border-border overflow-hidden">
                      <div className="flex flex-wrap items-center justify-between gap-2 bg-muted/30 px-4 py-3">
                        <div>
                          <p className="font-semibold text-secondary">
                            {tg.installmentName ?? `Term ${tg.termNumber}`}
                          </p>
                          <p className="text-xs parent-muted">
                            Due Date: {fmtDate(tg.dueDate)}
                            
                          </p>
                        </div>
                        <span className="text-sm font-bold text-primary">{fmt(tg.total)}</span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-t border-border text-left text-xs parent-muted">
                              <th className="px-4 py-2">Fee Head</th>
                              <th className="px-3 py-2">Category</th>
                              <th className="px-3 py-2 text-right">Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {tg.rows.map((t) => {
                              const head = t.fee_heads;
                              return (
                                <tr key={t.id} className="border-t border-border">
                                  <td className="px-4 py-2.5">
                                    {head?.fee_head_name ?? t.installment_name ?? `Term ${t.term_number}`}
                                    {head && !head.is_recurring && (
                                      <span className="ml-2 rounded-full bg-muted px-1.5 py-0.5 text-[10px] parent-muted">
                                        one-time
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-3 py-2.5 parent-muted text-xs">
                                    {head?.is_recurring ? "Recurring" : head ? "One-time" : "—"}
                                  </td>
                                  <td className="px-3 py-2.5 text-right font-medium">
                                    {fmt(Number(t.term_amount))}
                                  </td>
                                </tr>
                              );
                            })}
                            <tr className="border-t-2 border-border bg-muted/20 font-semibold">
                              <td className="px-4 py-2.5" colSpan={2}>Total</td>
                              <td className="px-3 py-2.5 text-right text-primary">{fmt(tg.total)}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
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
                      <th className="pb-2 pr-4">Fee Head</th>
                      <th className="pb-2 pr-4">Term</th>
                      <th className="pb-2 pr-4">Mode</th>
                      <th className="pb-2 pr-4">Txn ID</th>
                      <th className="pb-2 pr-4 text-right">Amount</th>
                      <th className="pb-2 pr-4">Status</th>
                      <th className="pb-2 pr-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p.id} className="border-t border-border">
                        <td className="py-2.5 pr-4 whitespace-nowrap">{fmtDate(p.payment_date)}</td>
                        <td className="py-2.5 pr-4 font-mono text-xs">{p.receipt_number ?? "—"}</td>
                        <td className="py-2.5 pr-4">{p.fee_head_name ?? "—"}</td>
                        <td className="py-2.5 pr-4 whitespace-nowrap">
                          {p.term_number ? `Term ${p.term_number}` : "—"}
                        </td>
                        <td className="py-2.5 pr-4 capitalize">{p.payment_mode ?? "—"}</td>
                        <td className="py-2.5 pr-4 font-mono text-[11px] parent-muted max-w-[140px] truncate">
                          {p.transaction_id ?? "—"}
                        </td>
                        <td className="py-2.5 pr-4 text-right font-medium">
                          {fmt(Number(p.amount ?? 0))}
                        </td>
                        <td className="py-2.5 pr-4">
                          <StatusBadge status={p.status} />
                        </td>
                        <td className="py-2.5 pr-4 text-right">
                          {p.receipt_number ? (
                            <button
                              onClick={() => openReceipt(p)}
                              className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-xs hover:bg-muted"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              View
                            </button>
                          ) : (
                            <span className="text-xs parent-muted">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Tab: Receipts ── */}
        {activeTab === "receipts" && (
          <div className="p-5">
            {receiptsLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : receiptsError ? (
              <div className="py-8 text-center">
                <FileText className="mx-auto mb-3 h-8 w-8 parent-muted opacity-40" />
                <p className="text-sm text-destructive">{receiptsError}</p>
              </div>
            ) : receiptRows.length === 0 ? (
              <div className="py-8 text-center">
                <FileText className="mx-auto mb-3 h-8 w-8 parent-muted opacity-40" />
                <p className="text-sm parent-muted">No receipts yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs parent-muted">
                      <th className="pb-2 pr-4">Receipt No</th>
                      <th className="pb-2 pr-4">Date</th>
                      <th className="pb-2 pr-4 text-right">Amount</th>
                      <th className="pb-2 pr-4">Term</th>
                      <th className="pb-2 pr-4">Status</th>
                      <th className="pb-2 pr-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receiptRows.map((p) => (
                      <tr key={p.id} className="border-t border-border">
                        <td className="py-2.5 pr-4 font-mono text-xs">{p.receipt_number}</td>
                        <td className="py-2.5 pr-4 whitespace-nowrap">{fmtDate(p.payment_date)}</td>
                        <td className="py-2.5 pr-4 text-right font-medium">
                          {fmt(Number(p.amount ?? 0))}
                        </td>
                        <td className="py-2.5 pr-4 whitespace-nowrap">
                          {p.term_number ? `Term ${p.term_number}` : "—"}
                        </td>
                        <td className="py-2.5 pr-4">
                          <StatusBadge status={p.status} />
                        </td>
                        <td className="py-2.5 pr-4 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => openReceipt(p)}
                              className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-xs hover:bg-muted"
                              title="View"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              View
                            </button>
                            <button
                              onClick={() => openReceipt(p)}
                              className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-xs hover:bg-muted"
                              title="Download PDF"
                            >
                              <Download className="h-3.5 w-3.5" />
                              PDF
                            </button>
                            <button
                              onClick={() => openReceipt(p)}
                              className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-xs hover:bg-muted"
                              title="Print"
                            >
                              <Printer className="h-3.5 w-3.5" />
                              Print
                            </button>
                          </div>
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

      <FeeReceiptDialog open={receiptOpen} onOpenChange={setReceiptOpen} data={receiptData} />
    </div>
  );
}

