import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Cake, Sparkles, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { StudentInfo, OrganizationInfo } from "@/lib/parent-data";

/** Returns true if `dob` (YYYY-MM-DD) matches today's month + day in local time. */
export function isBirthdayToday(dob?: string | null): boolean {
  if (!dob) return false;
  const d = new Date(dob);
  if (isNaN(d.getTime())) return false;
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

// Warm pastel birthday palette (does not touch app blue theme)
const CONFETTI_COLORS = ["#F6D365", "#FFBFA3", "#FDE4C7", "#F5C6A0", "#FFD9B8", "#E8B473"];

function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 4,
        duration: 5 + Math.random() * 4,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        size: 6 + Math.random() * 6,
        rotate: Math.random() * 360,
      })),
    [],
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="absolute -top-4 block rounded-sm"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 1.4,
            background: p.color,
            transform: `rotate(${p.rotate}deg)`,
            animation: `bd-confetti ${p.duration}s linear ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

function Balloons() {
  const balloons = useMemo(
    () =>
      [
        { left: 4, color: "#F6D365", delay: 0 },
        { left: 14, color: "#FFBFA3", delay: 0.6 },
        { left: 88, color: "#F5C6A0", delay: 0.3 },
        { left: 95, color: "#E8B473", delay: 1.2 },
      ] as const,
    [],
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {balloons.map((b, i) => (
        <div
          key={i}
          className="absolute top-4"
          style={{
            left: `${b.left}%`,
            animation: `bd-float 5s ease-in-out ${b.delay}s infinite`,
          }}
        >
          <div
            className="h-12 w-10 rounded-full shadow-lg"
            style={{ background: `radial-gradient(circle at 30% 30%, #fff8, ${b.color})` }}
          />
          <div className="mx-auto h-8 w-px bg-[#E8B473]/40" />
        </div>
      ))}
    </div>
  );
}

function Sparkle({ style }: { style: React.CSSProperties }) {
  return (
    <Sparkles
      className="absolute text-[#F6D365]"
      style={style}
      aria-hidden="true"
    />
  );
}

/** Big hero banner shown when it's the student's birthday. */
export function BirthdayBanner({
  student,
  organization,
  onOpenGreeting,
}: {
  student: StudentInfo;
  organization: OrganizationInfo | null;
  onOpenGreeting: () => void;
}) {
  const schoolName = organization?.name ?? "your school";

  return (
    <>
      <style>{`
        @keyframes bd-confetti {
          0% { transform: translateY(-10%) rotate(0deg); opacity: 1; }
          100% { transform: translateY(600px) rotate(720deg); opacity: 0; }
        }
        @keyframes bd-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-14px); }
        }
        @keyframes bd-shimmer {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl border border-[#F3D9BF]"
        style={{
          background:
            "linear-gradient(135deg, #FFFDF8 0%, #FFF7F1 40%, #FFF0E6 100%)",
          minHeight: 220,
          boxShadow: "0 20px 50px -20px rgba(232, 180, 115, 0.35)",
        }}
      >
        <Confetti />
        <Balloons />
        <Sparkle style={{ top: "20%", left: "40%", width: 18, height: 18, animation: "bd-shimmer 2s ease-in-out infinite" }} />
        <Sparkle style={{ top: "60%", left: "55%", width: 14, height: 14, animation: "bd-shimmer 2.5s ease-in-out 0.5s infinite" }} />
        <Sparkle style={{ top: "30%", right: "30%", width: 20, height: 20, animation: "bd-shimmer 3s ease-in-out 1s infinite" }} />

        <div className="relative z-10 flex flex-col items-start gap-5 p-6 sm:p-8 md:flex-row md:items-center">
          {/* Student photo */}
          <div className="shrink-0">
            {student.photo_url ? (
              <img
                src={student.photo_url ?? undefined}
                alt={student.name ?? ""}
                className="h-28 w-28 rounded-full border-4 border-white object-cover shadow-2xl ring-2 ring-[#F6D365]/50 sm:h-32 sm:w-32"
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-white bg-[#FFF0E6] text-4xl font-bold text-[#B7791F] shadow-2xl sm:h-32 sm:w-32">
                {(student.name ?? "?").charAt(0)}
              </div>
            )}
          </div>

          {/* Text */}
          <div className="min-w-0 flex-1">
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-[#F6D365] px-3 py-1 text-xs font-bold text-[#7C4A03] shadow-md">
              <Cake className="h-3.5 w-3.5" /> Happy Birthday!
            </div>
            <h1 className="mb-2 text-2xl font-extrabold text-[#4A2E10] sm:text-3xl md:text-4xl">
              {student.name ?? "Student"} 🎂
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-[#6B4A2B] sm:text-base">
              Wishing you a day filled with happiness, success, laughter, and
              beautiful memories.
            </p>
            <p className="mt-1 text-xs text-[#8A6A46] sm:text-sm">
              With love from the <span className="font-semibold">{schoolName}</span> Family ❤️
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onOpenGreeting}
                className="inline-flex items-center gap-2 rounded-xl bg-[#F6D365] px-4 py-2.5 text-sm font-bold text-[#7C4A03] shadow-lg transition hover:scale-105 hover:bg-[#F0C34C]"
              >
                <Gift className="h-4 w-4" /> View Birthday Greeting
              </button>
            </div>
          </div>

          {/* Cake illustration */}
          <div className="hidden shrink-0 md:block" aria-hidden="true">
            <CakeIllustration />
          </div>
        </div>
      </motion.div>
    </>
  );
}

/** Birthday wishes widget displayed alongside dashboard cards. */
export function BirthdayWishesWidget({ studentName }: { studentName: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="relative overflow-hidden rounded-2xl p-5"
      style={{
        background: "linear-gradient(135deg, #FFFDF8 0%, #FFF5E9 50%, #FFF0E6 100%)",
        border: "1px solid #F3D9BF",
      }}
    >
      <div className="pointer-events-none absolute -right-4 -top-4 h-16 w-14">
        <div className="h-10 w-8 rounded-full" style={{ background: "radial-gradient(circle at 30% 30%, #fff, #FFBFA3)" }} />
        <div className="mx-auto h-6 w-px bg-[#F3D9BF]" />
      </div>
      <div className="pointer-events-none absolute -bottom-2 -left-2 h-14 w-12">
        <div className="h-9 w-7 rounded-full" style={{ background: "radial-gradient(circle at 30% 30%, #fff, #F6D365)" }} />
      </div>
      <div className="relative flex items-center gap-4">
        <div className="text-5xl">🎂</div>
        <div>
          <h3 className="text-base font-bold text-[#B7791F]">Birthday Wishes</h3>
          <p className="mt-1 text-sm text-[#6B4A2B]">
            Happy Birthday, <span className="font-semibold">{studentName}</span>! May this year bring you lots of joy, good health, and success!
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/** Greeting card dialog with school logo, student photo & wishes. */
export function BirthdayGreetingDialog({
  open,
  onOpenChange,
  student,
  organization,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  student: StudentInfo;
  organization: OrganizationInfo | null;
}) {
  const schoolName = organization?.name ?? "Your School";
  const classSection = [student.class, student.section].filter(Boolean).join(" - ");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg overflow-hidden p-0 [&>button]:hidden">
        <div
          className="relative overflow-hidden"
          style={{
            background: "linear-gradient(160deg, #FFFDF8 0%, #FFF5E9 50%, #FFF0E6 100%)",
          }}
        >
          <AnimatePresence>
            {open && (
              <>
                <Confetti />
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="absolute right-3 top-3 z-20 rounded-full bg-white/90 p-1.5 text-[#6B4A2B] shadow hover:bg-white"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </>
            )}
          </AnimatePresence>

          <div className="relative z-10 flex flex-col px-6 py-7 sm:px-8">
            {/* School header — prominent logo + name in one row */}
            <div className="mb-6 flex items-center gap-4 rounded-2xl border border-[#F3D9BF] bg-white/70 px-4 py-3 shadow-sm backdrop-blur-sm">
              {organization?.logo_url ? (
                <img
                  src={organization.logo_url}
                  alt={schoolName}
                  className="h-16 w-16 shrink-0 rounded-full border-2 border-[#F6D365] object-cover shadow-md sm:h-20 sm:w-20"
                />
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-[#F6D365] bg-[#FFF0E6] text-2xl font-bold text-[#B7791F] shadow-md sm:h-20 sm:w-20">
                  {schoolName.charAt(0)}
                </div>
              )}
              <h3 className="min-w-0 flex-1 text-left text-xl font-extrabold uppercase tracking-wide text-[#4A2E10] sm:text-2xl">
                {schoolName}
              </h3>
            </div>

            {/* Student section — centered */}
            <div className="flex flex-col items-center text-center">
              {student.photo_url ? (
                <img
                  src={student.photo_url ?? undefined}
                  alt={student.name ?? ""}
                  className="mb-4 h-24 w-24 rounded-full border-4 border-white object-cover shadow-lg ring-2 ring-[#F6D365]/60"
                />
              ) : (
                <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-[#FFF0E6] text-3xl font-bold text-[#B7791F] shadow-lg">
                  {(student.name ?? "?").charAt(0)}
                </div>
              )}

              <div className="mb-1 text-4xl">🎉🎂🎈</div>
              <h2 className="text-2xl font-extrabold text-[#C2410C]">Happy Birthday!</h2>
              <p className="mt-1 text-xl font-bold text-[#4A2E10]">{student.name}</p>
              {classSection && <p className="mt-0.5 text-sm text-[#8A6A46]">{classSection}</p>}
            </div>

            <div className="mt-5 space-y-3 text-sm text-[#4A2E10]">
              <div className="rounded-xl border border-[#F3D9BF] bg-white p-4 text-left shadow-sm">
                <p className="mb-1 text-xs font-bold uppercase tracking-wide text-[#B7791F]">Principal's Wishes</p>
                <p className="text-[#4A2E10]/85">
                  Dear {student.name}, on your special day, we wish you continued success in your studies and all your dreams to come true. Keep shining!
                </p>
              </div>
              <div className="rounded-xl border border-[#F3D9BF] bg-white p-4 text-left shadow-sm">
                <p className="mb-1 text-xs font-bold uppercase tracking-wide text-[#C2410C]">Teachers' Wishes</p>
                <p className="text-[#4A2E10]/85">
                  Your teachers wish you a fantastic birthday filled with love, laughter, and joyful memories. You make our classroom brighter every day!
                </p>
              </div>
            </div>

            <p className="mt-6 text-center text-xs italic text-[#8A6A46]">— With love, the {schoolName} Family ❤️</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CakeIllustration() {
  return (
    <div className="text-7xl drop-shadow-lg" aria-hidden="true">
      🎂
    </div>
  );
}

/** Convenience wrapper that hooks state together. */
export function BirthdayExperience({
  student,
  organization,
}: {
  student: StudentInfo;
  organization: OrganizationInfo | null;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <BirthdayBanner
        student={student}
        organization={organization}
        onOpenGreeting={() => setOpen(true)}
      />
      <BirthdayGreetingDialog
        open={open}
        onOpenChange={setOpen}
        student={student}
        organization={organization}
      />
    </>
  );
}
