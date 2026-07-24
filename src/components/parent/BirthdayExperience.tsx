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

const CONFETTI_COLORS = ["#F59E0B", "#EC4899", "#8B5CF6", "#10B981", "#3B82F6", "#EF4444"];

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
        { left: 4, color: "#F59E0B", delay: 0 },
        { left: 14, color: "#EC4899", delay: 0.6 },
        { left: 88, color: "#8B5CF6", delay: 0.3 },
        { left: 95, color: "#3B82F6", delay: 1.2 },
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
          <div className="mx-auto h-8 w-px bg-white/40" />
        </div>
      ))}
    </div>
  );
}

function Sparkle({ style }: { style: React.CSSProperties }) {
  return (
    <Sparkles
      className="absolute text-yellow-200"
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
        className="relative overflow-hidden rounded-3xl"
        style={{
          background:
            "linear-gradient(135deg, #7C3AED 0%, #DB2777 50%, #F59E0B 100%)",
          minHeight: 220,
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
                src={student.photo_url}
                alt={student.name}
                className="h-28 w-28 rounded-full border-4 border-white/90 object-cover shadow-2xl sm:h-32 sm:w-32"
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-white/90 bg-white/20 text-4xl font-bold text-white shadow-2xl sm:h-32 sm:w-32">
                {student.name.charAt(0)}
              </div>
            )}
          </div>

          {/* Text */}
          <div className="min-w-0 flex-1">
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold text-yellow-900 shadow-md">
              <Cake className="h-3.5 w-3.5" /> Happy Birthday!
            </div>
            <h1 className="mb-2 text-2xl font-extrabold text-white drop-shadow-md sm:text-3xl md:text-4xl">
              {student.name} 🎂
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-white/95 sm:text-base">
              Wishing you a day filled with happiness, success, laughter, and
              beautiful memories.
            </p>
            <p className="mt-1 text-xs text-white/85 sm:text-sm">
              With love from the <span className="font-semibold">{schoolName}</span> Family ❤️
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onOpenGreeting}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-pink-600 shadow-lg transition hover:scale-105"
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
        background: "linear-gradient(135deg, #FDF2F8 0%, #FCE7F3 50%, #FEF3C7 100%)",
        border: "1px solid #FBCFE8",
      }}
    >
      <div className="pointer-events-none absolute -right-4 -top-4 h-16 w-14">
        <div className="h-10 w-8 rounded-full" style={{ background: "radial-gradient(circle at 30% 30%, #fff, #EC4899)" }} />
        <div className="mx-auto h-6 w-px bg-pink-300" />
      </div>
      <div className="pointer-events-none absolute -bottom-2 -left-2 h-14 w-12">
        <div className="h-9 w-7 rounded-full" style={{ background: "radial-gradient(circle at 30% 30%, #fff, #F59E0B)" }} />
      </div>
      <div className="relative flex items-center gap-4">
        <div className="text-5xl">🎂</div>
        <div>
          <h3 className="text-base font-bold text-pink-700">Birthday Wishes</h3>
          <p className="mt-1 text-sm text-gray-700">
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
            background: "linear-gradient(160deg, #FDF2F8 0%, #FEF3C7 100%)",
          }}
        >
          <AnimatePresence>
            {open && (
              <>
                <Confetti />
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="absolute right-3 top-3 z-20 rounded-full bg-white/80 p-1.5 text-gray-600 shadow hover:bg-white"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </>
            )}
          </AnimatePresence>

          <div className="relative z-10 flex flex-col items-center px-6 py-8 text-center">
            {/* School header */}
            <div className="mb-4 flex items-center gap-2">
              {organization?.logo_url ? (
                <img src={organization.logo_url} alt={schoolName} className="h-10 w-10 rounded-full object-cover" />
              ) : null}
              <span className="text-sm font-semibold text-gray-700">{schoolName}</span>
            </div>

            {/* Student photo */}
            {student.photo_url ? (
              <img
                src={student.photo_url}
                alt={student.name}
                className="mb-4 h-24 w-24 rounded-full border-4 border-white object-cover shadow-lg"
              />
            ) : (
              <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-pink-200 text-3xl font-bold text-pink-700 shadow-lg">
                {student.name.charAt(0)}
              </div>
            )}

            <div className="mb-1 text-4xl">🎉🎂🎈</div>
            <h2 className="text-2xl font-extrabold text-pink-600">Happy Birthday!</h2>
            <p className="mt-1 text-xl font-bold text-gray-900">{student.name}</p>
            {classSection && <p className="mt-0.5 text-sm text-gray-600">{classSection}</p>}

            <div className="mt-5 space-y-3 text-sm text-gray-700">
              <div className="rounded-xl bg-white/70 p-3 text-left shadow-sm">
                <p className="mb-1 text-xs font-bold uppercase tracking-wide text-pink-600">Principal's Wishes</p>
                <p>
                  Dear {student.name}, on your special day, we wish you continued success in your studies and all your dreams to come true. Keep shining!
                </p>
              </div>
              <div className="rounded-xl bg-white/70 p-3 text-left shadow-sm">
                <p className="mb-1 text-xs font-bold uppercase tracking-wide text-purple-600">Teachers' Wishes</p>
                <p>
                  Your teachers wish you a fantastic birthday filled with love, laughter, and joyful memories. You make our classroom brighter every day!
                </p>
              </div>
            </div>

            <p className="mt-6 text-xs italic text-gray-500">— With love, the {schoolName} Family ❤️</p>
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
