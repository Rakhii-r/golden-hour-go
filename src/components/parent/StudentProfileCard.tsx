import { motion } from "framer-motion";
import {
  User,
  Phone,
  MapPin,
  Bus,
  Droplet,
  IdCard,
  Calendar,
  GraduationCap,
  Hash,
  BookOpen,
} from "lucide-react";
import type { StudentInfo } from "@/lib/parent-data";
import { Skeleton } from "@/components/ui/skeleton";

function calcAge(dob: string | null): string | null {
  if (!dob) return null;
  const d = new Date(dob);
  if (isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return `${age} yrs`;
}

function fmtDate(s: string | null): string | null {
  if (!s) return null;
  try {
    return new Date(s).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return s;
  }
}

function maskAadhaar(last4: string | null): string {
  if (!last4) return "—";
  return `XXXX XXXX ${last4}`;
}

function initial(name: string | null): string {
  if (!name) return "S";
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] ?? "S").toUpperCase();
}

/* ── Field ───────────────────────────────────────────────────── */
function Field({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
        {Icon && <Icon className="h-3 w-3 text-gray-300" />}
        <span>{label}</span>
      </div>
      <div
        className="mt-1 truncate text-sm font-semibold text-gray-800"
        title={typeof value === "string" ? value : undefined}
      >
        {value || <span className="font-normal text-gray-300">—</span>}
      </div>
    </div>
  );
}

/* ── Main component ───────────────────────────────────────────── */
export function StudentProfileCard({
  student,
  loading,
}: {
  student: StudentInfo | null;
  loading: boolean;
}) {
  if (loading && !student) {
    return (
      <div className="glass p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          <div className="flex flex-col items-center gap-3 md:items-start">
            <Skeleton className="h-28 w-28 rounded-full" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-20" />
          </div>
          <div className="grid flex-1 grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="h-3 w-20" />
                <Skeleton className="mt-2 h-4 w-32" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!student) return null;

  const age = calcAge(student.date_of_birth);
  const dobLabel = fmtDate(student.date_of_birth);
  const dob = dobLabel ? (age ? `${dobLabel} (${age})` : dobLabel) : null;
  const classSection = [student.class, student.section].filter(Boolean).join(" • ") || null;
  const transport = student.transport_opted
    ? [student.transport_route, student.transport_stop].filter(Boolean).join(" / ") || "Opted"
    : "Not opted";
  const status = (student.status ?? "active").toLowerCase();
  const isActive = ["active", "admitted", "enrolled"].includes(status);

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass p-6"
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        {/* Avatar block */}
        <div className="flex flex-col items-center gap-3 md:w-36 md:shrink-0 md:items-start">
          <div
            className="relative h-24 w-24 overflow-hidden rounded-full ring-4 ring-[#155EEF]/15"
            style={{
              background: "linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)",
            }}
          >
            {student.photo_url ? (
              <img
                src={student.photo_url}
                alt={student.name ?? "Student"}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-[#155EEF]">
                {initial(student.name)}
              </div>
            )}
          </div>
          <div className="flex flex-col items-center gap-1.5 md:items-start">
            <h2 className="text-base font-bold text-gray-900">{student.name ?? "—"}</h2>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                isActive
                  ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isActive ? "bg-emerald-500" : "bg-gray-400"
                }`}
              />
              {isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        {/* Divider (desktop) */}
        <div className="hidden w-px self-stretch bg-gray-100 md:block" />

        {/* Fields grid */}
        <div className="grid flex-1 grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field icon={Hash}          label="Admission No"    value={student.admission_number} />
          <Field icon={Hash}          label="Roll No"         value={student.roll_number} />
          <Field icon={GraduationCap} label="Class & Section" value={classSection} />
          <Field icon={BookOpen}      label="Academic Year"   value={student.academic_year} />
          <Field icon={User}          label="Gender"          value={student.gender} />
          <Field icon={Calendar}      label="Date of Birth"   value={dob} />
          <Field icon={User}          label="Father's Name"   value={student.father_name} />
          <Field icon={User}          label="Mother's Name"   value={student.mother_name} />
          <Field icon={Droplet}       label="Blood Group"     value={student.blood_group} />
          <Field icon={Phone}         label="Phone (POC)"     value={student.phone} />
          <Field icon={Bus}           label="Transport"       value={transport} />
          <Field icon={IdCard}        label="Aadhaar No."     value={maskAadhaar(student.aadhaar_last_four)} />
          <div className="col-span-2 lg:col-span-4">
            <Field icon={MapPin} label="Address" value={student.address} />
          </div>
        </div>
      </div>
    </motion.section>
  );
}
