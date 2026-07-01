import { forwardRef } from "react";

export interface ReportCardSubjectRow {
  subject: string;
  marks_obtained: number | null;
  max_marks: number | null;
  is_absent: boolean | null;
  grade: string | null;
  remarks: string | null;
}

export interface ReportCardData {
  exam_name: string;
  academic_year: string | null;
  student_name: string;
  admission_number: string | null;
  roll_number: string | null;
  class_label: string | null;
  parent_name: string | null;
  school_name: string;
  school_logo_url: string | null;
  subjects: ReportCardSubjectRow[];
  subject_count: number;
  total_obtained: number;
  total_max: number;
  percentage: number | null;
  overall_grade: string | null;
  rank: number | null;
  teacher_remarks: string | null;
  result_status: "Pass" | "Fail" | null;
  issued_on: string;
}

export const ReportCard = forwardRef<HTMLDivElement, { data: ReportCardData }>(
  function ReportCard({ data }, ref) {
    const fmtDate = (s: string) => {
      try {
        return new Date(s).toLocaleDateString("en-IN", {
          day: "2-digit", month: "short", year: "numeric",
        });
      } catch { return s; }
    };

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
        <div style={{ display: "flex", alignItems: "center", gap: 16, paddingBottom: 16, borderBottom: "2px solid #2563eb" }}>
          {data.school_logo_url ? (
            <img src={data.school_logo_url} alt={data.school_name} crossOrigin="anonymous"
              style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover" }} />
          ) : (
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#2563eb", color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 22 }}>
              {data.school_name.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{data.school_name}</div>
            <div style={{ color: "#6b7280", fontSize: 13 }}>Student Report Card</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, color: "#6b7280" }}>Issued On</div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{fmtDate(data.issued_on)}</div>
          </div>
        </div>

        {/* Exam banner */}
        <div style={{ marginTop: 18, padding: "10px 14px", background: "#eff6ff", borderRadius: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontWeight: 700, color: "#1e3a8a" }}>{data.exam_name}</div>
          <div style={{ fontSize: 12, color: "#1e3a8a" }}>Academic Year: <b>{data.academic_year ?? "—"}</b></div>
        </div>

        {/* Student meta */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px", marginTop: 20 }}>
          <Field label="Student Name" value={data.student_name} />
          <Field label="Admission No." value={data.admission_number ?? "—"} />
          <Field label="Class & Section" value={data.class_label ?? "—"} />
          <Field label="Roll No." value={data.roll_number ?? "—"} />
          <Field label="Parent / Guardian" value={data.parent_name ?? "—"} />
          <Field label="Rank" value={data.rank != null ? `#${data.rank}` : "—"} />
        </div>

        {/* Marks table */}
        <div style={{ marginTop: 24 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Subject-wise Performance</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f3f4f6" }}>
                <th style={th}>Subject</th>
                <th style={{ ...th, textAlign: "right" }}>Max</th>
                <th style={{ ...th, textAlign: "right" }}>Obtained</th>
                <th style={{ ...th, textAlign: "right" }}>%</th>
                <th style={{ ...th, textAlign: "center" }}>Grade</th>
                <th style={th}>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {data.subjects.map((s, i) => {
                const pct = !s.is_absent && s.marks_obtained != null && s.max_marks && Number(s.max_marks) > 0
                  ? Math.round((Number(s.marks_obtained) / Number(s.max_marks)) * 100) : null;
                return (
                  <tr key={i}>
                    <td style={td}>{s.subject}</td>
                    <td style={{ ...td, textAlign: "right" }}>{s.max_marks ?? "—"}</td>
                    <td style={{ ...td, textAlign: "right" }}>
                      {s.is_absent ? <span style={{ color: "#dc2626" }}>Absent</span> : (s.marks_obtained ?? "—")}
                    </td>
                    <td style={{ ...td, textAlign: "right" }}>{pct != null ? `${pct}%` : "—"}</td>
                    <td style={{ ...td, textAlign: "center", fontWeight: 600 }}>{s.grade ?? "—"}</td>
                    <td style={{ ...td, fontSize: 12, color: "#6b7280" }}>{s.remarks ?? "—"}</td>
                  </tr>
                );
              })}
              <tr style={{ background: "#f9fafb" }}>
                <td style={{ ...td, fontWeight: 700 }}>Total</td>
                <td style={{ ...td, textAlign: "right", fontWeight: 700 }}>{data.total_max || "—"}</td>
                <td style={{ ...td, textAlign: "right", fontWeight: 700 }}>{data.total_obtained || "—"}</td>
                <td style={{ ...td, textAlign: "right", fontWeight: 700, color: "#059669" }}>
                  {data.percentage != null ? `${data.percentage}%` : "—"}
                </td>
                <td style={{ ...td, textAlign: "center", fontWeight: 700 }}>{data.overall_grade ?? "—"}</td>
                <td style={td}>—</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Overall Summary */}
        <div style={{ marginTop: 24 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Overall Summary</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            <SummaryTile label="Total Subjects" value={String(data.subject_count)} />
            <SummaryTile label="Marks Obtained" value={String(data.total_obtained)} />
            <SummaryTile label="Max Marks" value={String(data.total_max)} />
            <SummaryTile label="Overall %" value={data.percentage != null ? `${data.percentage}%` : "—"} />
            <SummaryTile label="Grade" value={data.overall_grade ?? "—"} />
            <SummaryTile
              label="Result"
              value={data.result_status ?? "—"}
              accent={data.result_status === "Fail" ? "#dc2626" : "#059669"}
            />
          </div>
        </div>

        {/* Result + remarks */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 22 }}>
          <div style={{ border: "1px solid #e5e7eb", borderRadius: 6, padding: 14 }}>
            <div style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5 }}>Result</div>
            <div style={{ marginTop: 4, fontSize: 18, fontWeight: 700, color: data.result_status === "Fail" ? "#dc2626" : "#059669" }}>
              {data.result_status ?? "—"}
            </div>
            <div style={{ marginTop: 8, fontSize: 12, color: "#6b7280" }}>
              Percentage: <b style={{ color: "#111827" }}>{data.percentage != null ? `${data.percentage}%` : "—"}</b><br />
              Grade: <b style={{ color: "#111827" }}>{data.overall_grade ?? "—"}</b>
            </div>
          </div>
          <div style={{ border: "1px solid #e5e7eb", borderRadius: 6, padding: 14 }}>
            <div style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5 }}>Teacher Remarks</div>
            <div style={{ marginTop: 6, fontSize: 13, color: "#111827", minHeight: 40 }}>
              {data.teacher_remarks ?? "—"}
            </div>
          </div>
        </div>

        {/* Signatures */}
        <div style={{ marginTop: 36, display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6b7280" }}>
          <Sig label="Class Teacher" />
          <Sig label="Principal" />
          <Sig label="Parent" />
        </div>

        <div style={{ marginTop: 24, fontSize: 11, color: "#9ca3af", textAlign: "center" }}>
          This is a system-generated report card.
        </div>
      </div>
    );
  },
);

const th: React.CSSProperties = {
  textAlign: "left", padding: "10px 12px", borderBottom: "1px solid #e5e7eb",
  fontWeight: 600, color: "#374151",
};
const td: React.CSSProperties = {
  padding: "9px 12px", borderBottom: "1px solid #f3f4f6",
};

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontWeight: 600 }}>{value}</div>
    </div>
  );
}

function SummaryTile({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 6, padding: "10px 12px", textAlign: "center" }}>
      <div style={{ fontSize: 10, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
      <div style={{ marginTop: 4, fontSize: 16, fontWeight: 700, color: accent ?? "#111827" }}>{value}</div>
    </div>
  );
}

function Sig({ label }: { label: string }) {
  return (
    <div style={{ textAlign: "center", width: 180 }}>
      <div style={{ borderTop: "1px solid #9ca3af", paddingTop: 4 }}>{label}</div>
    </div>
  );
}
