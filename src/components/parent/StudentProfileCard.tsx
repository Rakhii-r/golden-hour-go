import { useState } from "react";
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
  Pencil,
  MessageSquarePlus,
  ShieldAlert,
  HeartPulse,
  FileText,
  Loader2,
} from "lucide-react";
import {
  updateOwnStudentProfile,
  submitParentSuggestion,
  type StudentInfo,
  type MedicalRecord,
} from "@/lib/parent-data";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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

const EMPTY_MEDICAL: Required<MedicalRecord> = {
  allergies: "",
  conditions: "",
  medications: "",
  doctor_name: "",
  doctor_phone: "",
  notes: "",
};

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

function TextInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-gray-200 px-3 py-1.5 text-sm"
      />
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
  const [editing, setEditing] = useState(false);
  const [addressInput, setAddressInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [guardianName, setGuardianName] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [guardianEmail, setGuardianEmail] = useState("");
  const [guardianRelation, setGuardianRelation] = useState("");
  const [medical, setMedical] = useState<Required<MedicalRecord>>(EMPTY_MEDICAL);
  const [saving, setSaving] = useState(false);
  const [suggestion, setSuggestion] = useState("");
  const [submittingSuggestion, setSubmittingSuggestion] = useState(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);
  const [savedOverrides, setSavedOverrides] = useState<Partial<StudentInfo>>({});

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

  const view: StudentInfo = { ...student, ...savedOverrides };

  const startEdit = () => {
    setAddressInput(student.address ?? "");
    setPhoneInput(student.phone ?? "");
    setGuardianName(student.guardian_name ?? "");
    setGuardianPhone(student.guardian_phone ?? "");
    setGuardianEmail(student.guardian_email ?? "");
    setGuardianRelation(student.guardian_relation ?? "");
    setMedical({ ...EMPTY_MEDICAL, ...(student.medical_record ?? {}) });
    setEditing(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      await updateOwnStudentProfile({
        address: addressInput,
        phone: phoneInput,
        guardian_name: guardianName,
        guardian_phone: guardianPhone,
        guardian_email: guardianEmail,
        guardian_relation: guardianRelation,
        medical_record: medical,
      });
      setSavedOverrides((prev) => ({
        ...prev,
        address: addressInput,
        phone: phoneInput,
        guardian_name: guardianName,
        guardian_phone: guardianPhone,
        guardian_email: guardianEmail,
        guardian_relation: guardianRelation,
        medical_record: medical,
      }));
      toast.success("Profile updated.");
      setEditing(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const sendSuggestion = async () => {
    if (submittingSuggestion) return;
    const text = suggestion.trim();
    if (text.length < 10) {
      setSuggestionError("Please write at least 10 characters.");
      return;
    }
    setSuggestionError(null);
    setSubmittingSuggestion(true);
    try {
      await submitParentSuggestion(student.organization_id, student.id, text);
      toast.success("Sent to the school.");
      setSuggestion("");
    } catch {
      setSuggestionError("Failed to send. Please try again.");
      toast.error("Failed to send. Please try again.");
    } finally {
      setSubmittingSuggestion(false);
    }
  };

  const age = calcAge(view.date_of_birth);
  const dobLabel = fmtDate(view.date_of_birth);
  const dob = dobLabel ? (age ? `${dobLabel} (${age})` : dobLabel) : null;
  const classSection = [view.class, view.section].filter(Boolean).join(" • ") || null;
  const transport = view.transport_opted
    ? [view.transport_route, view.transport_stop].filter(Boolean).join(" / ") || "Opted"
    : "Not opted";
  const status = (view.status ?? "active").toLowerCase();
  const isActive = ["active", "admitted", "enrolled"].includes(status);
  const med = view.medical_record ?? {};
  const hasMedicalInfo = Object.values(med).some((v) => v && String(v).trim());

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
            {!editing && (
              <Button size="sm" variant="outline" onClick={startEdit} className="mt-1">
                <Pencil className="mr-1 h-3.5 w-3.5" /> Edit Details
              </Button>
            )}
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
          <Field icon={Bus}           label="Transport"       value={transport} />
          <Field icon={IdCard}        label="Aadhaar No."     value={maskAadhaar(student.aadhaar_last_four)} />
          <Field icon={IdCard}        label="Caste"           value={student.caste} />
          <Field icon={IdCard}        label="PEN Number"      value={student.pen_number} />
          <Field icon={IdCard}        label="APAR ID"         value={student.upper_id} />
          <Field icon={Phone}         label="Phone (POC)"     value={view.phone} />
          <div className="col-span-2 lg:col-span-4">
            <Field icon={MapPin} label="Address" value={view.address} />
          </div>
        </div>
      </div>

      {/* Guardian / Emergency Contact */}
      <div className="mt-6 border-t border-gray-100 pt-5">
        <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
          <ShieldAlert className="h-4 w-4 text-gray-400" />
          Guardian / Emergency Contact
        </div>
        <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field icon={User}  label="Guardian Name"     value={view.guardian_name} />
          <Field icon={Phone} label="Guardian Phone"    value={view.guardian_phone} />
          <Field icon={User}  label="Guardian Email"    value={view.guardian_email} />
          <Field icon={User}  label="Relation"          value={view.guardian_relation} />
        </div>
      </div>

      {/* Medical Information */}
      <div className="mt-6 border-t border-gray-100 pt-5">
        <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
          <HeartPulse className="h-4 w-4 text-gray-400" />
          Medical Information
        </div>
        {student.medical_report_url && (
          <a
            href={student.medical_report_url}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-[#155EEF] hover:underline"
          >
            <FileText className="h-3.5 w-3.5" /> View uploaded medical report
          </a>
        )}
        {hasMedicalInfo ? (
          <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Allergies"      value={med.allergies} />
            <Field label="Conditions"     value={med.conditions} />
            <Field label="Medications"    value={med.medications} />
            <Field label="Doctor Name"    value={med.doctor_name} />
            <Field label="Doctor Phone"   value={med.doctor_phone} />
            <Field label="Notes"          value={med.notes} />
          </div>
        ) : (
          <p className="mt-2 text-xs text-gray-400">No medical information on file. Click Edit Details to add it.</p>
        )}
      </div>

      {/* Unified edit panel */}
      {editing && (
        <div className="mt-6 space-y-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <TextInput label="Phone (POC)" value={phoneInput} onChange={setPhoneInput} />
            <TextInput label="Address" value={addressInput} onChange={setAddressInput} />
          </div>
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Guardian / Emergency Contact</div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <TextInput label="Guardian Name" value={guardianName} onChange={setGuardianName} />
            <TextInput label="Guardian Phone" value={guardianPhone} onChange={setGuardianPhone} />
            <TextInput label="Guardian Email" value={guardianEmail} onChange={setGuardianEmail} />
            <TextInput label="Relation" value={guardianRelation} onChange={setGuardianRelation} />
          </div>
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Medical Information</div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <TextInput label="Allergies" value={medical.allergies} onChange={(v) => setMedical({ ...medical, allergies: v })} />
            <TextInput label="Conditions" value={medical.conditions} onChange={(v) => setMedical({ ...medical, conditions: v })} />
            <TextInput label="Medications" value={medical.medications} onChange={(v) => setMedical({ ...medical, medications: v })} />
            <TextInput label="Doctor Name" value={medical.doctor_name} onChange={(v) => setMedical({ ...medical, doctor_name: v })} />
            <TextInput label="Doctor Phone" value={medical.doctor_phone} onChange={(v) => setMedical({ ...medical, doctor_phone: v })} />
            <TextInput label="Notes" value={medical.notes} onChange={(v) => setMedical({ ...medical, notes: v })} />
          </div>
          <div className="flex gap-2 pt-1">
            <Button size="sm" disabled={saving} onClick={save}>{saving ? "Saving…" : "Save"}</Button>
            <Button size="sm" variant="outline" disabled={saving} onClick={() => setEditing(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Suggestion box */}
      <div className="mt-6 border-t border-gray-100 pt-5">
        <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
          <MessageSquarePlus className="h-4 w-4 text-gray-400" />
          Suggestion / Note to School
        </div>
        <p className="mt-0.5 text-xs text-gray-400">
          e.g. "Please give a tablet to my child daily at 1 PM." Anything you'd like the school to know.
        </p>
        <textarea
          value={suggestion}
          onChange={(e) => setSuggestion(e.target.value)}
          rows={3}
          className="mt-2 w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
          placeholder="Write your note here…"
        />
        {suggestionError && (
          <p className="mt-1.5 text-xs font-medium text-red-600">{suggestionError}</p>
        )}
        <Button size="sm" className="mt-2" disabled={submittingSuggestion} onClick={sendSuggestion}>
          {submittingSuggestion && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
          {submittingSuggestion ? "Sending…" : "Send to School"}
        </Button>
      </div>
    </motion.section>
  );
}
