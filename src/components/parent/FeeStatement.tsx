import { forwardRef } from "react";

export interface FeeStatementPayment {
  receipt_number: string | null;
  payment_date: string | null;
  payment_mode: string | null;
  fee_head_name?: string | null;
  term_number?: number | null;
  amount: number;
  transaction_id?: string | null;
}

export interface FeeStatementData {
  title: string; // e.g. "Fee Statement" or "Term 2 Receipt"
  subtitle?: string | null;
  student_name: string;
  admission_number?: string | null;
  class_label?: string | null;
  parent_name?: string | null;
  academic_year?: string | null;
  school_name: string;
  school_logo_url?: string | null;
  total_fees: number;
  total_paid: number;
  balance_due: number;
  payments: FeeStatementPayment[];
  generated_at: string; // ISO
}

const fmtINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(
    Math.round(n || 0),
  );

const fmtDate = (s: string | null | undefined) => {
  if (!s) return "—";
  try {
    return new Date(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return s;
  }
};

/**
 * Branded consolidated statement / term receipt, sharing the visual language
 * of <FeeReceipt /> so all parent-facing PDFs look identical to the CRM
 * receipt template.
 */
export const FeeStatement = forwardRef<HTMLDivElement, { data: FeeStatementData }>(
  function FeeStatement({ data }, ref) {
    return (
      <div
        ref={ref}
        style={{
          width: "780px",
          padding: "32px",
          background: "#ffffff",
          color: "#111827",
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: "13px",
          lineHeight: 1.5,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            paddingBottom: "16px",
            borderBottom: "2px solid #2563eb",
          }}
        >
          {data.school_logo_url ? (
            <img
              src={data.school_logo_url}
              alt={data.school_name}
              crossOrigin="anonymous"
              style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "#2563eb",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 22,
              }}
            >
              {data.school_name.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{data.school_name}</div>
            <div style={{ color: "#6b7280", fontSize: 13 }}>{data.title}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: "#6b7280" }}>Generated</div>
            <div style={{ fontWeight: 600, fontSize: 13, color: "#2563eb" }}>
              {fmtDate(data.generated_at)}
            </div>
          </div>
        </div>

        {/* Student grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px 24px",
            marginTop: 22,
          }}
        >
          <Field label="Student Name" value={data.student_name} />
          <Field label="Admission No." value={data.admission_number ?? "—"} />
          <Field label="Class & Section" value={data.class_label ?? "—"} />
          <Field label="Academic Year" value={data.academic_year ?? "—"} />
          {data.parent_name && <Field label="Parent / Guardian" value={data.parent_name} />}
          {data.subtitle && <Field label="Scope" value={data.subtitle} />}
        </div>

        {/* Totals */}
        <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <Stat label="Total Fees" value={fmtINR(data.total_fees)} color="#111827" />
          <Stat label="Total Paid" value={fmtINR(data.total_paid)} color="#059669" />
          <Stat label="Balance Due" value={fmtINR(data.balance_due)} color="#dc2626" />
        </div>

        {/* Payments table */}
        <div style={{ marginTop: 28 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Payment History</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: "#f3f4f6" }}>
                <th style={th}>Receipt No.</th>
                <th style={th}>Date</th>
                <th style={th}>Fee Head</th>
                <th style={th}>Term</th>
                <th style={th}>Mode</th>
                <th style={{ ...th, textAlign: "right" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.payments.length === 0 ? (
                <tr>
                  <td style={{ ...td, textAlign: "center", color: "#6b7280" }} colSpan={6}>
                    No payments recorded.
                  </td>
                </tr>
              ) : (
                data.payments.map((p, i) => (
                  <tr key={i} style={i % 2 ? { background: "#fafafa" } : undefined}>
                    <td style={{ ...td, fontFamily: "monospace" }}>{p.receipt_number ?? "—"}</td>
                    <td style={td}>{fmtDate(p.payment_date)}</td>
                    <td style={td}>{p.fee_head_name ?? "—"}</td>
                    <td style={td}>{p.term_number ? `Term ${p.term_number}` : "—"}</td>
                    <td style={{ ...td, textTransform: "capitalize" }}>{p.payment_mode ?? "—"}</td>
                    <td style={{ ...td, textAlign: "right", fontWeight: 600 }}>{fmtINR(p.amount)}</td>
                  </tr>
                ))
              )}
              <tr style={{ background: "#f9fafb" }}>
                <td style={{ ...td, fontWeight: 700 }} colSpan={5}>
                  Total Paid
                </td>
                <td style={{ ...td, textAlign: "right", fontWeight: 700, color: "#059669" }}>
                  {fmtINR(data.total_paid)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: 32,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: 16,
            borderTop: "1px solid #e5e7eb",
            paddingTop: 16,
          }}
        >
          <div style={{ fontSize: 11, color: "#6b7280", maxWidth: 460 }}>
            This is a system-generated statement and does not require a signature.
            For any discrepancy, please contact the school accounts office.
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ borderTop: "1px solid #9ca3af", width: 180, marginBottom: 4 }} />
            <div style={{ fontSize: 11, color: "#6b7280" }}>Authorized Signatory</div>
          </div>
        </div>
      </div>
    );
  },
);

const th: React.CSSProperties = {
  textAlign: "left",
  padding: "8px 10px",
  borderBottom: "1px solid #e5e7eb",
  fontWeight: 600,
  color: "#374151",
};
const td: React.CSSProperties = {
  padding: "8px 10px",
  borderBottom: "1px solid #f3f4f6",
};

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5 }}>
        {label}
      </div>
      <div style={{ fontWeight: 600 }}>{value}</div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        padding: "12px 14px",
        background: "#fafafa",
      }}
    >
      <div style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5 }}>
        {label}
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, color, marginTop: 4 }}>{value}</div>
    </div>
  );
}
