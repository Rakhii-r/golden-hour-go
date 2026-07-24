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

// Vibrant birthday palette for the hero banner (purple / pink / magenta / gold)
const CONFETTI_COLORS = ["#FFD93D", "#FF6BCB", "#8B5CF6", "#EC4899", "#22D3EE", "#F472B6", "#FBBF24"];
const BALLOON_COLORS = ["#EC4899", "#3B82F6", "#FBBF24", "#F472B6", "#60A5FA", "#F59E0B"];

function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 4,
        duration: 5 + Math.random() * 4,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        size: 6 + Math.random() * 7,
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
        { left: 3, top: 8, color: BALLOON_COLORS[0], delay: 0, size: 44 },
        { left: 12, top: 22, color: BALLOON_COLORS[1], delay: 0.6, size: 36 },
        { left: 22, top: 6, color: BALLOON_COLORS[2], delay: 1.1, size: 40 },
        { left: 60, top: 12, color: BALLOON_COLORS[3], delay: 0.3, size: 38 },
        { left: 72, top: 4, color: BALLOON_COLORS[4], delay: 0.9, size: 42 },
        { left: 92, top: 18, color: BALLOON_COLORS[5], delay: 1.4, size: 40 },
      ] as const,
    [],
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {balloons.map((b, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: `${b.left}%`,
            top: `${b.top}%`,
            animation: `bd-float 5s ease-in-out ${b.delay}s infinite`,
          }}
        >
          <div
            className="rounded-full shadow-xl"
            style={{
              width: b.size,
              height: b.size * 1.2,
              background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.7), ${b.color} 65%)`,
            }}
          />
          <div className="mx-auto h-8 w-px bg-white/40" />
        </div>
      ))}
    </div>
  );
}

function Ribbons() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 800 240"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path d="M0,60 Q200,10 400,80 T800,50" stroke="#FBBF24" strokeWidth="3" fill="none" opacity="0.7" />
      <path d="M0,180 Q200,220 400,150 T800,200" stroke="#F472B6" strokeWidth="3" fill="none" opacity="0.7" />
      <path d="M0,120 Q200,80 400,140 T800,110" stroke="#22D3EE" strokeWidth="2" fill="none" opacity="0.5" />
    </svg>
  );
}

function Sparkle({ style }: { style: React.CSSProperties }) {
  return (
    <Sparkles
      className="absolute text-yellow-200 drop-shadow"
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
          50% { opacity: 1; transform: scale(1.25); }
        }
      `}</style>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl"
        style={{
          background:
            "linear-gradient(120deg, #4C1D95 0%, #7C3AED 30%, #C026D3 60%, #EC4899 100%)",
          minHeight: 240,
          boxShadow: "0 25px 60px -20px rgba(124, 58, 237, 0.55)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 20% 30%, rgba(216,180,254,0.35), transparent 50%), radial-gradient(circle at 80% 70%, rgba(244,114,182,0.35), transparent 55%)",
          }}
        />
        <Ribbons />
        <Confetti />
        <Balloons />
        <Sparkle style={{ top: "18%", left: "42%", width: 18, height: 18, animation: "bd-shimmer 2s ease-in-out infinite" }} />
        <Sparkle style={{ top: "62%", left: "48%", width: 14, height: 14, animation: "bd-shimmer 2.5s ease-in-out 0.5s infinite" }} />
        <Sparkle style={{ top: "28%", right: "38%", width: 20, height: 20, animation: "bd-shimmer 3s ease-in-out 1s infinite" }} />
        <Sparkle style={{ bottom: "20%", left: "30%", width: 16, height: 16, animation: "bd-shimmer 2.2s ease-in-out 0.8s infinite" }} />

        <div className="relative z-10 flex flex-col items-start gap-5 p-6 sm:p-8 md:flex-row md:items-center">
          <div className="shrink-0">
            {student.photo_url ? (
              <img
                src={student.photo_url ?? undefined}
                alt={student.name ?? ""}
                className="h-28 w-28 rounded-full border-4 border-white object-cover shadow-2xl ring-4 ring-yellow-300/60 sm:h-32 sm:w-32"
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-white bg-white/20 text-4xl font-bold text-white shadow-2xl ring-4 ring-yellow-300/60 sm:h-32 sm:w-32">
                {(student.name ?? "?").charAt(0)}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 text-white">
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-yellow-300 px-3 py-1 text-xs font-bold text-[#7C2D12] shadow-md">
              <Cake className="h-3.5 w-3.5" /> Happy Birthday!
            </div>
            <h1 className="mb-2 text-2xl font-extrabold tracking-tight drop-shadow-lg sm:text-3xl md:text-4xl">
              {student.name ?? "Student"} 🎂
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-white/90 sm:text-base">
              Wishing you a day filled with happiness, love and lots of sweet moments! 🎉
            </p>
            <p className="mt-1 text-xs text-white/80 sm:text-sm">
              From all of us at <span className="font-semibold">{schoolName}</span> ❤️
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onOpenGreeting}
                className="inline-flex items-center gap-2 rounded-full bg-yellow-300 px-5 py-2.5 text-sm font-bold text-[#7C2D12] shadow-lg transition hover:scale-105 hover:bg-yellow-200"
              >
                <Gift className="h-4 w-4" /> View Birthday Card
              </button>
              <button
                type="button"
                onClick={onOpenGreeting}
                className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white shadow-sm backdrop-blur-sm transition hover:bg-white/20"
              >
                Continue to Dashboard
              </button>
            </div>
          </div>

          <div className="hidden shrink-0 md:block text-7xl drop-shadow-2xl" aria-hidden="true">
            🎂
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
