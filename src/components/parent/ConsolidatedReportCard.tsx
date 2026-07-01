import { forwardRef, Fragment } from "react";
import type { ConsolidatedReportCardData } from "@/lib/parent-consolidated-report-card";

// Colors mirror the CRM's "Classic" theme exactly (F:\edu-grow-connect\src\lib\final-result-themes.ts,
// renderClassic()). document_themes only stores a theme name, not colors/fonts — the CRM hardcodes
// this palette per theme name, so we do the same to achieve visual parity.
const TEAL = "#0d9488";
const TEAL_DEEP = "#115e59";
const TEAL_LIGHT = "#ccfbf1";

interface Props {
  data: ConsolidatedReportCardData;
}

export const ConsolidatedReportCard = forwardRef<HTMLDivElement, Props>(function ConsolidatedReportCard(
  { data },
  ref,
) {
  const fmtDate = (s: string | null) => {
    if (!s) return "—";
    try {
      return new Date(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    } catch {
      return s;
    }
  };

  const fa = data.examColumns.filter((c) => c.group === "FA");
  const sa = data.examColumns.filter((c) => c.group === "SA");

  const th: React.CSSProperties = { padding: "5px", border: `1px solid ${TEAL}`, background: "#fff", color: TEAL_DEEP, fontSize: 11, fontWeight: 700 };
  const thSub: React.CSSProperties = { padding: "3px 2px", border: `1px solid ${TEAL}`, background: TEAL_LIGHT, color: TEAL_DEEP, fontSize: 9, fontWeight: 700 };
  const td: React.CSSProperties = { padding: "6px 2px", border: `1px solid ${TEAL}`, textAlign: "center", fontSize: 10 };

  const subHead = (key: string, maxMarks: number) => (
    <Fragment key={key}>
      <th style={thSub}>{maxMarks} Marks</th>
      <th style={thSub}>Grade</th>
      <th style={thSub}>GPA</th>
    </Fragment>
  );

  const cellsFor = (row: ConsolidatedReportCardData["subjects"][number], cols: typeof fa) =>
    cols.map((c) => {
      const cell = row.cells[c.id];
      const marksText = !cell.entered ? "-" : cell.isAbsent ? "AB" : cell.obtained ?? "-";
      return (
        <Fragment key={c.id}>
          <td style={td}>{marksText}</td>
          <td style={td}>{cell.grade ?? ""}</td>
          <td style={td}>{cell.gpa ?? ""}</td>
        </Fragment>
      );
    });

  const totalCells = (cols: typeof fa) =>
    cols.map((c) => (
      <Fragment key={c.id}>
        <td style={{ ...td, fontWeight: 800, color: TEAL_DEEP }}>{data.columnTotals[c.id] ?? "-"}</td>
        <td style={td}></td>
        <td style={td}></td>
      </Fragment>
    ));

  return (
    <div
      ref={ref}
      style={{
        width: "900px",
        padding: 18,
        background: "#f0fdfa",
        border: `2px solid ${TEAL}`,
        borderRadius: 14,
        fontFamily: "Inter, system-ui, sans-serif",
        color: "#1f2937",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "8px 12px", background: "#fff", border: `1px solid ${TEAL}`, borderRadius: 8 }}>
        {data.schoolLogoUrl ? (
          <img src={data.schoolLogoUrl} alt={data.schoolName} crossOrigin="anonymous"
            style={{ width: 52, height: 52, borderRadius: 8, border: `2px solid ${TEAL_DEEP}`, objectFit: "contain", background: "#fff" }} />
        ) : (
          <div style={{ width: 52, height: 52, borderRadius: 8, border: `2px solid ${TEAL_DEEP}`, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: TEAL_DEEP, fontSize: 20 }}>
            {data.schoolName.slice(0, 1).toUpperCase()}
          </div>
        )}
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: TEAL_DEEP, letterSpacing: 2 }}>{data.schoolName.toUpperCase()}</div>
          <div style={{ fontSize: 10, letterSpacing: 3, color: TEAL, marginTop: 2 }}>
            ACADEMIC YEAR {data.academicYear} — CONSOLIDATED
          </div>
        </div>
        <div style={{ width: 52 }} />
      </div>

      {/* Student details grid */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 10, fontSize: 10, background: "#fff" }}>
        <tbody>
          <tr>
            <td style={{ padding: "5px 8px", border: `1px solid ${TEAL}`, fontWeight: 600, color: TEAL_DEEP, width: "14%" }}>Name of Student</td>
            <td style={{ padding: "5px 8px", border: `1px solid ${TEAL}`, width: "22%" }}>: {data.studentName}</td>
            <td style={{ padding: "5px 8px", border: `1px solid ${TEAL}`, fontWeight: 600, color: TEAL_DEEP, width: "14%" }}>Roll No.</td>
            <td style={{ padding: "5px 8px", border: `1px solid ${TEAL}`, width: "18%" }}>: {data.rollNumber ?? "—"}</td>
            <td style={{ padding: "5px 8px", border: `1px solid ${TEAL}`, fontWeight: 600, color: TEAL_DEEP, width: "14%" }}>Date of Birth</td>
            <td style={{ padding: "5px 8px", border: `1px solid ${TEAL}` }}>: {fmtDate(data.dateOfBirth)}</td>
          </tr>
          <tr>
            <td style={{ padding: "5px 8px", border: `1px solid ${TEAL}`, fontWeight: 600, color: TEAL_DEEP }}>Admission No.</td>
            <td style={{ padding: "5px 8px", border: `1px solid ${TEAL}` }}>: {data.admissionNumber ?? "—"}</td>
            <td style={{ padding: "5px 8px", border: `1px solid ${TEAL}`, fontWeight: 600, color: TEAL_DEEP }}>Class / Section</td>
            <td style={{ padding: "5px 8px", border: `1px solid ${TEAL}` }}>: {data.classLabel ?? "—"}</td>
            <td style={{ padding: "5px 8px", border: `1px solid ${TEAL}`, fontWeight: 600, color: TEAL_DEEP }}>Academic Year</td>
            <td style={{ padding: "5px 8px", border: `1px solid ${TEAL}` }}>: {data.academicYear}</td>
          </tr>
        </tbody>
      </table>

      {/* Consolidated marks table */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 10, background: "#fff" }}>
        <thead>
          <tr>
            <th rowSpan={3} style={{ ...th, width: 140, background: TEAL_LIGHT }}>Subject</th>
            {fa.length > 0 && (
              <th colSpan={fa.length * 3} style={{ ...th, background: TEAL_LIGHT, fontSize: 11, letterSpacing: 1 }}>
                FORMATIVE ASSESSMENT
              </th>
            )}
            {sa.length > 0 && (
              <th colSpan={sa.length * 3} style={{ ...th, background: TEAL_LIGHT, fontSize: 11, letterSpacing: 1 }}>
                SUMMATIVE ASSESSMENT
              </th>
            )}
          </tr>
          <tr>
            {fa.map((c) => (
              <th key={c.id} colSpan={3} style={th}>{c.label.toUpperCase()}</th>
            ))}
            {sa.map((c) => (
              <th key={c.id} colSpan={3} style={th}>{c.label.toUpperCase()}</th>
            ))}
          </tr>
          <tr>
            {fa.map((c) => subHead(c.id, c.maxMarks))}
            {sa.map((c) => subHead(c.id, c.maxMarks))}
          </tr>
        </thead>
        <tbody>
          {data.subjects.map((row) => (
            <tr key={row.subject}>
              <td style={{ padding: "6px 8px", border: `1px solid ${TEAL}`, fontWeight: 600, color: TEAL_DEEP, fontSize: 10 }}>
                {row.subject.toUpperCase()}
              </td>
              {cellsFor(row, fa)}
              {cellsFor(row, sa)}
            </tr>
          ))}
          <tr style={{ background: TEAL_LIGHT }}>
            <td style={{ padding: "6px 8px", border: `1px solid ${TEAL}`, color: TEAL_DEEP, fontWeight: 800, fontSize: 10 }}>
              TOTAL (ALL SUBJECTS)
            </td>
            {totalCells(fa)}
            {totalCells(sa)}
          </tr>
        </tbody>
      </table>

      {/* Attendance */}
      <div style={{ marginTop: 12, border: `1px solid ${TEAL}`, borderRadius: 6, overflow: "hidden", background: "#fff" }}>
        <div style={{ background: TEAL_DEEP, color: "#fff", textAlign: "center", padding: 5, fontWeight: 700, letterSpacing: 6, fontSize: 11 }}>
          A T T E N D A N C E
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ padding: "4px 8px", border: `1px solid ${TEAL}`, background: TEAL_LIGHT, color: TEAL_DEEP, fontSize: 9, textAlign: "left" }}>Month</th>
              {data.attendance.months.map((m) => (
                <th key={m.label} style={{ padding: 3, border: `1px solid ${TEAL}`, background: TEAL_LIGHT, color: TEAL_DEEP, fontSize: 9 }}>{m.label.slice(0, 3)}</th>
              ))}
              <th style={{ padding: 3, border: `1px solid ${TEAL}`, background: TEAL_LIGHT, color: TEAL_DEEP, fontSize: 9 }}>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: "5px 8px", border: `1px solid ${TEAL}`, fontSize: 9, color: TEAL_DEEP, fontWeight: 600 }}>No. of Working Days</td>
              {data.attendance.months.map((m) => (
                <td key={m.label} style={{ padding: 5, border: `1px solid ${TEAL}`, textAlign: "center", fontSize: 9 }}>{m.working}</td>
              ))}
              <td style={{ padding: 5, border: `1px solid ${TEAL}`, textAlign: "center", fontWeight: 700, fontSize: 9 }}>{data.attendance.totalWorking}</td>
            </tr>
            <tr>
              <td style={{ padding: "5px 8px", border: `1px solid ${TEAL}`, fontSize: 9, color: TEAL_DEEP, fontWeight: 600 }}>No. of Days Present</td>
              {data.attendance.months.map((m) => (
                <td key={m.label} style={{ padding: 5, border: `1px solid ${TEAL}`, textAlign: "center", fontSize: 9 }}>{m.present}</td>
              ))}
              <td style={{ padding: 5, border: `1px solid ${TEAL}`, textAlign: "center", fontWeight: 700, fontSize: 9 }}>{data.attendance.totalPresent}</td>
            </tr>
            <tr>
              <td style={{ padding: "5px 8px", border: `1px solid ${TEAL}`, fontSize: 9, color: TEAL_DEEP, fontWeight: 600 }}>No. of Days Absent</td>
              {data.attendance.months.map((m) => (
                <td key={m.label} style={{ padding: 5, border: `1px solid ${TEAL}`, textAlign: "center", fontSize: 9 }}>{m.working - m.present}</td>
              ))}
              <td style={{ padding: 5, border: `1px solid ${TEAL}`, textAlign: "center", fontWeight: 700, fontSize: 9 }}>{data.attendance.totalAbsent}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Results / Remarks / Reopens */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.4fr 1fr", gap: 10, marginTop: 12 }}>
        <div style={{ border: `1px solid ${TEAL}`, borderRadius: 6, background: "#fff", padding: 8, fontSize: 10 }}>
          <div style={{ textAlign: "center", fontWeight: 700, color: TEAL_DEEP, letterSpacing: 2, background: TEAL_LIGHT, padding: 4, borderRadius: 4 }}>RESULTS</div>
          <div style={{ padding: "4px 0" }}><b>Total Marks</b> : {data.totalObtained} / {data.totalMax}</div>
          <div style={{ padding: "4px 0" }}><b>Percentage</b> : {data.overallPercentage != null ? `${data.overallPercentage}%` : "—"}</div>
          <div style={{ padding: "4px 0" }}><b>Grade</b> : {data.overallGrade ?? "—"}</div>
          <div style={{ padding: "4px 0" }}><b>GPA</b> : {data.gpa ?? "—"}</div>
          <div style={{ padding: "4px 0", fontWeight: 700, color: data.result === "FAIL" ? "#dc2626" : "#059669" }}>
            <b>Result</b> : {data.result ?? "—"}
          </div>
        </div>
        <div style={{ border: `1px solid ${TEAL}`, borderRadius: 6, background: "#fff", padding: 8, fontSize: 10 }}>
          <div style={{ textAlign: "center", fontWeight: 700, color: TEAL_DEEP, letterSpacing: 2, background: TEAL_LIGHT, padding: 4, borderRadius: 4 }}>REMARKS</div>
          <div style={{ padding: "6px 4px", minHeight: 60 }}>{data.teacherRemarks ?? ""}</div>
        </div>
        <div style={{ border: `1px solid ${TEAL}`, borderRadius: 6, background: "#fff", padding: 8, textAlign: "center", fontSize: 10 }}>
          <div style={{ color: TEAL_DEEP, fontWeight: 600 }}>School Re-opens on</div>
          <div style={{ marginTop: 18, fontWeight: 800, color: TEAL_DEEP, fontSize: 14 }}>______________</div>
        </div>
      </div>

      {/* Signatures */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24, fontSize: 10, color: TEAL_DEEP }}>
        <div style={{ textAlign: "center", borderTop: `1px solid ${TEAL}`, paddingTop: 4, minWidth: 140 }}>Class Teacher</div>
        <div style={{ textAlign: "center", borderTop: `1px solid ${TEAL}`, paddingTop: 4, minWidth: 140 }}>Parent / Guardian</div>
        <div style={{ textAlign: "center", borderTop: `1px solid ${TEAL}`, paddingTop: 4, minWidth: 140 }}>Principal</div>
      </div>

      <div style={{ marginTop: 14, fontSize: 9, color: "#6b7280", textAlign: "right" }}>
        Generated on {fmtDate(data.issuedOn)}
      </div>
    </div>
  );
});
