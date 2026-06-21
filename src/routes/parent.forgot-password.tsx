import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { KeyRound, ArrowLeft, CheckCircle2, Loader2, Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/parent/forgot-password")({
  head: () => ({ meta: [{ title: "Reset Password — Parent Portal" }] }),
  component: ForgotPassword,
});

const SEND_OTP_URL = "https://oucnvrfbvqxbazlvvgwn.supabase.co/functions/v1/send-otp";
const VERIFY_OTP_URL = "https://oucnvrfbvqxbazlvvgwn.supabase.co/functions/v1/verify-otp";

function normalizePhone(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = digits.slice(1);
  if (digits.length === 10) return `+91${digits}`;
  return `+${digits}`;
}

async function postJson(url: string, body: object): Promise<{ ok: boolean; data: any }> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  let data: any;
  try {
    data = await res.json();
  } catch {
    data = {};
  }
  return { ok: res.ok, data };
}

type Step = "phone" | "otp" | "done";

function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("phone");

  // step 1
  const [phone, setPhone] = useState("");
  const [normalizedPhone, setNormalizedPhone] = useState("");
  const [sendLoading, setSendLoading] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  // step 2
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState<string | null>(null);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;
    const normalized = normalizePhone(phone);
    setNormalizedPhone(normalized);
    setSendLoading(true);
    setSendError(null);
    try {
      const { ok, data } = await postJson(SEND_OTP_URL, { phone: normalized });
      if (!ok) {
        setSendError(data?.error ?? data?.message ?? "Failed to send OTP. Please try again.");
        return;
      }
      setStep("otp");
    } catch {
      setSendError("Network error. Please check your connection.");
    } finally {
      setSendLoading(false);
    }
  };

  const handleResend = async () => {
    setResendMsg(null);
    setVerifyError(null);
    setResendLoading(true);
    try {
      const { ok, data } = await postJson(SEND_OTP_URL, { phone: normalizedPhone });
      if (ok) {
        setResendMsg("OTP resent successfully.");
      } else {
        setVerifyError(data?.error ?? data?.message ?? "Failed to resend OTP. Please try again.");
      }
    } catch {
      setVerifyError("Network error. Please check your connection.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyError(null);
    setResendMsg(null);
    if (code.length !== 6) {
      setVerifyError("Please enter the 6-digit OTP.");
      return;
    }
    if (newPassword.length < 8) {
      setVerifyError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setVerifyError("Passwords do not match.");
      return;
    }
    setVerifyLoading(true);
    try {
      const { ok, data } = await postJson(VERIFY_OTP_URL, {
        phone: normalizedPhone,
        code,
        newPassword,
      });
      if (!ok) {
        setVerifyError(data?.error ?? data?.message ?? "Invalid or expired OTP.");
        return;
      }
      setStep("done");
    } catch {
      setVerifyError("Network error. Please check your connection.");
    } finally {
      setVerifyLoading(false);
    }
  };

  return (
    <div className="parent-portal flex min-h-screen items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-strong w-full max-w-md p-8"
      >
        {step !== "done" && (
          <Link
            to="/parent"
            className="mb-4 inline-flex items-center gap-1 text-sm parent-muted hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back to login
          </Link>
        )}

        <AnimatePresence mode="wait">
          {step === "phone" && (
            <motion.div
              key="phone"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <div className="mb-6 flex flex-col items-center text-center">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <KeyRound className="h-7 w-7" />
                </div>
                <h1 className="text-2xl font-bold">Reset password</h1>
                <p className="mt-1 text-sm parent-muted">
                  Enter your recovery phone number to receive an OTP.
                </p>
              </div>

              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Recovery Phone Number</label>
                  <input
                    type="tel"
                    autoFocus
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 7993686427"
                    className="glass-input w-full px-4 py-3"
                  />
                  <p className="mt-1 text-xs parent-muted">
                    10-digit number — +91 will be added automatically.
                  </p>
                </div>

                {sendError && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-red-200/40 bg-red-500/20 px-3 py-2 text-sm"
                  >
                    {sendError}
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={sendLoading}
                  className="glass-btn flex w-full items-center justify-center gap-2 px-4 py-3 font-semibold disabled:opacity-60"
                >
                  {sendLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {sendLoading ? "Sending OTP…" : "Send OTP"}
                </button>
              </form>
            </motion.div>
          )}

          {step === "otp" && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <div className="mb-6 flex flex-col items-center text-center">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <KeyRound className="h-7 w-7" />
                </div>
                <h1 className="text-2xl font-bold">Enter OTP</h1>
                <p className="mt-1 text-sm parent-muted">
                  We sent a 6-digit code to{" "}
                  <span className="font-medium text-foreground">{normalizedPhone}</span>.
                </p>
              </div>

              <form onSubmit={handleVerify} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">6-digit OTP</label>
                  <input
                    autoFocus
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="123456"
                    inputMode="numeric"
                    maxLength={6}
                    className="glass-input w-full px-4 py-3 text-center text-lg tracking-widest"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">New Password</label>
                  <div className="relative">
                    <input
                      type={showPwd ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      className="glass-input w-full px-4 py-3 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground"
                      aria-label="Toggle password visibility"
                    >
                      {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="glass-input w-full px-4 py-3 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground"
                      aria-label="Toggle confirm visibility"
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {verifyError && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-red-200/40 bg-red-500/20 px-3 py-2 text-sm"
                  >
                    {verifyError}
                  </motion.div>
                )}

                {resendMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-green-200/40 bg-green-500/20 px-3 py-2 text-sm text-green-800"
                  >
                    {resendMsg}
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={verifyLoading}
                  className="glass-btn flex w-full items-center justify-center gap-2 px-4 py-3 font-semibold disabled:opacity-60"
                >
                  {verifyLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {verifyLoading ? "Resetting…" : "Reset Password"}
                </button>

                <p className="text-center text-sm parent-muted">
                  Didn't receive it?{" "}
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendLoading}
                    className="font-medium underline-offset-4 hover:underline disabled:opacity-60"
                  >
                    {resendLoading ? "Resending…" : "Resend OTP"}
                  </button>
                </p>
              </form>
            </motion.div>
          )}

          {step === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center text-center"
            >
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500/10 text-green-600">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h1 className="text-2xl font-bold">Password Reset</h1>
              <p className="mt-2 text-sm parent-muted">
                Your password has been reset successfully. You can now sign in with your new
                password.
              </p>
              <button
                onClick={() => navigate({ to: "/parent" })}
                className="glass-btn mt-6 flex items-center justify-center gap-2 px-8 py-3 font-semibold"
              >
                Go to Login
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
