import { forwardRef } from "react";

export interface FeeReceiptData {
  receipt_number: string;
  transaction_id: string | null;
  payment_date: string | null;
  amount: number;
  payment_mode: string | null;
  fee_head_name?: string | null;
  term_number?: number | null;
  academic_year?: string | null;
  student_name: string;
  admission_number?: string | null;
  class_label?: string | null;
  parent_name?: string | null;
  school_name: string;
  school_logo_url?: string | null;
}

const fmtINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(
    Math.round(n || 0),
  );

const fmtDate = (s: string | null) => {
  if (!s) return "—";
  try {
    return new Date(s).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return s;
  }
};

/**
 * A printable / PDF-friendly fee receipt.
 * Uses plain inline styles so html2canvas + jspdf can rasterize it reliably
 * without depending on Tailwind's runtime.
 */
export const FeeReceipt = forwardRef<HTMLDivElement, { data: FeeReceiptData }>(
  function FeeReceipt({ data }, ref) {
    return (
      <div
        ref={ref}
        style={{
          width: "780px",
          padding: "32px",
          background: "#ffffff",
          color: "#111827",
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: "14px",
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
            <div style={{ fontSize: 22, fontWeight: 700, color: "#111827" }}>
              {data.school_name}
            </div>
            <div style={{ color: "#6b7280", fontSize: 13 }}>Official Fee Payment Receipt</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, color: "#6b7280" }}>Receipt No.</div>
            <div style={{ fontWeight: 700, fontSize: 16, color: "#2563eb" }}>
              {data.receipt_number}
            </div>
          </div>
        </div>

        {/* Meta grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px 24px",
            marginTop: 24,
          }}
        >
          <Field label="Payment Date" value={fmtDate(data.payment_date)} />
          <Field label="Academic Year" value={data.academic_year ?? "—"} />
          <Field label="Student Name" value={data.student_name} />
          <Field label="Admission No." value={data.admission_number ?? "—"} />
          <Field label="Class & Section" value={data.class_label ?? "—"} />
          <Field label="Parent / Guardian" value={data.parent_name ?? "—"} />
        </div>

        {/* Payment table */}
        <div style={{ marginTop: 28 }}>
          <div style={{ fontWeight: 600, marginBottom: 8, color: "#111827" }}>Payment Details</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f3f4f6" }}>
                <th style={th}>Fee Head</th>
                <th style={th}>Term</th>
                <th style={{ ...th, textAlign: "right" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={td}>{data.fee_head_name ?? "Fees"}</td>
                <td style={td}>
                  {data.term_number ? `Term ${data.term_number}` : "—"}
                </td>
                <td style={{ ...td, textAlign: "right", fontWeight: 600 }}>
                  {fmtINR(data.amount)}
                </td>
              </tr>
              <tr style={{ background: "#f9fafb" }}>
                <td style={{ ...td, fontWeight: 700 }} colSpan={2}>
                  Total Paid
                </td>
                <td style={{ ...td, textAlign: "right", fontWeight: 700, color: "#059669" }}>
                  {fmtINR(data.amount)}
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
          }}
        >
          <div style={{ fontSize: 12, color: "#6b7280", maxWidth: 420 }}>
            <div>
              <b>Payment Mode:</b>{" "}
              <span style={{ textTransform: "capitalize" }}>{data.payment_mode ?? "—"}</span>
            </div>
            <div>
              <b>Transaction ID:</b>{" "}
              <span style={{ fontFamily: "monospace" }}>{data.transaction_id ?? "—"}</span>
            </div>
            <div style={{ marginTop: 12 }}>
              This is a system-generated receipt and does not require a signature.
            </div>
          </div>
          <div
            style={{
              border: "1px dashed #9ca3af",
              padding: "8px 14px",
              borderRadius: 8,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 10, color: "#6b7280" }}>Ref</div>
            <div style={{ fontFamily: "monospace", fontSize: 11 }}>
              {data.transaction_id?.slice(-12) ?? data.receipt_number}
            </div>
          </div>
        </div>
      </div>
    );
  },
);

const th: React.CSSProperties = {
  textAlign: "left",
  padding: "10px 12px",
  borderBottom: "1px solid #e5e7eb",
  fontWeight: 600,
  color: "#374151",
};
const td: React.CSSProperties = {
  padding: "10px 12px",
  borderBottom: "1px solid #f3f4f6",
};

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5 }}>
        {label}
      </div>
      <div style={{ fontWeight: 600, color: "#111827" }}>{value}</div>
    </div>
  );
}
