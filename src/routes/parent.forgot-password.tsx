import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { KeyRound, ArrowLeft, CheckCircle2, Loader2, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { PARENT_SUPABASE_URL } from "@/lib/parent-supabase";

export const Route = createFileRoute("/parent/forgot-password")({
  head: () => ({ meta: [{ title: "Reset Password — Parent Portal" }] }),
  component: ForgotPassword,
});

const SEND_OTP_URL = `${PARENT_SUPABASE_URL}/functions/v1/send-otp`;
const VERIFY_OTP_URL = `${PARENT_SUPABASE_URL}/functions/v1/verify-otp`;
const RESET_PASSWORD_URL = `${PARENT_SUPABASE_URL}/functions/v1/reset-parent-password`;

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

type Step = "identify" | "otp" | "password" | "done";

function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("identify");

  // Step 1 — identify the account
  const [admissionNumber, setAdmissionNumber] = useState("");
  const [maskedPhone, setMaskedPhone] = useState("");
  const [sendLoading, setSendLoading] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  // Step 2 — verify OTP
  const [code, setCode] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState("");

  // Step 3 — new password
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  const requestOtp = async (isResend: boolean) => {
    const setLoading = isResend ? setResendLoading : setSendLoading;
    setLoading(true);
    setResendMsg(null);
    if (isResend) setVerifyError(null);
    else setSendError(null);
    try {
      const { ok, data } = await postJson(SEND_OTP_URL, {
        admissionNumber: admissionNumber.trim(),
      });
      if (!ok) {
        const msg = data?.error ?? data?.message ?? "Failed to send OTP. Please try again.";
        if (isResend) setVerifyError(msg);
        else setSendError(msg);
        return;
      }
      setMaskedPhone(data?.maskedPhone ?? "");
      if (isResend) {
        setResendMsg("A new OTP has been sent to your registered mobile number.");
        setCode("");
      } else {
        setStep("otp");
      }
    } catch {
      const msg = "OTP service is not reachable. Please try again in a moment.";
      if (isResend) setVerifyError(msg);
      else setSendError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleIdentifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!admissionNumber.trim()) {
      setSendError("Please enter your Admission Number / Login ID.");
      return;
    }
    await requestOtp(false);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyError(null);
    setResendMsg(null);
    if (code.length !== 6) {
      setVerifyError("Please enter the 6-digit OTP.");
      return;
    }
    setVerifyLoading(true);
    try {
      const { ok, data } = await postJson(VERIFY_OTP_URL, {
        admissionNumber: admissionNumber.trim(),
        code,
      });
      if (!ok) {
        setVerifyError(data?.error ?? data?.message ?? "Invalid OTP.");
        return;
      }
      setResetToken(data?.resetToken ?? "");
      setStep("password");
    } catch {
      setVerifyError("OTP service is not reachable. Please try again in a moment.");
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    if (newPassword.length < 8) {
      setResetError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError("Passwords do not match.");
      return;
    }
    setResetLoading(true);
    try {
      const { ok, data } = await postJson(RESET_PASSWORD_URL, {
        admissionNumber: admissionNumber.trim(),
        resetToken,
        newPassword,
      });
      if (!ok) {
        setResetError(data?.error ?? data?.message ?? "Failed to update password.");
        return;
      }
      setStep("done");
    } catch {
      setResetError("Password reset service is not reachable. Please try again in a moment.");
    } finally {
      setResetLoading(false);
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
          {step === "identify" && (
            <motion.div
              key="identify"
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
                  Enter your Admission Number to receive an OTP on your registered mobile number.
                </p>
              </div>

              <form onSubmit={handleIdentifySubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Admission Number / Login ID
                  </label>
                  <input
                    autoFocus
                    value={admissionNumber}
                    onChange={(e) => setAdmissionNumber(e.target.value)}
                    placeholder="e.g. ADM2025001"
                    className="glass-input w-full px-4 py-3"
                  />
                  <p className="mt-1 text-xs parent-muted">
                    The OTP is sent only to the mobile number registered for this account.
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
                  <ShieldCheck className="h-7 w-7" />
                </div>
                <h1 className="text-2xl font-bold">Verify OTP</h1>
                <p className="mt-1 text-sm parent-muted">
                  An OTP has been sent to your registered mobile number:{" "}
                  <span className="font-medium text-foreground">{maskedPhone}</span>
                </p>
              </div>

              <form onSubmit={handleVerify} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Admission Number</label>
                  <input
                    value={admissionNumber}
                    readOnly
                    className="glass-input w-full px-4 py-3 opacity-70"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">Registered Mobile</label>
                  <input
                    value={maskedPhone}
                    readOnly
                    className="glass-input w-full px-4 py-3 opacity-70"
                  />
                </div>

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
                  {verifyLoading ? "Verifying…" : "Verify OTP"}
                </button>

                <p className="text-center text-sm parent-muted">
                  Didn't receive it?{" "}
                  <button
                    type="button"
                    onClick={() => requestOtp(true)}
                    disabled={resendLoading}
                    className="font-medium underline-offset-4 hover:underline disabled:opacity-60"
                  >
                    {resendLoading ? "Resending…" : "Resend OTP"}
                  </button>
                </p>
              </form>
            </motion.div>
          )}

          {step === "password" && (
            <motion.div
              key="password"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <div className="mb-6 flex flex-col items-center text-center">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <KeyRound className="h-7 w-7" />
                </div>
                <h1 className="text-2xl font-bold">Set new password</h1>
                <p className="mt-1 text-sm parent-muted">
                  OTP verified for {admissionNumber}. Choose a new password.
                </p>
              </div>

              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">New Password</label>
                  <div className="relative">
                    <input
                      autoFocus
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

                {resetError && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-red-200/40 bg-red-500/20 px-3 py-2 text-sm"
                  >
                    {resetError}
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={resetLoading}
                  className="glass-btn flex w-full items-center justify-center gap-2 px-4 py-3 font-semibold disabled:opacity-60"
                >
                  {resetLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {resetLoading ? "Resetting…" : "Reset Password"}
                </button>
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
                Password updated successfully. Please log in with your new password.
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
