import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { parentSupabase, admissionToEmail } from "@/lib/parent-supabase";
import { useParentAuth } from "@/hooks/use-parent-auth";

export const Route = createFileRoute("/parent/")({
  head: () => ({
    meta: [
      { title: "Parent Login — ASR Parent Portal" },
      { name: "description", content: "Sign in to the ASR Parent Portal." },
    ],
  }),
  component: ParentLogin,
});

function ParentLogin() {
  const navigate = useNavigate();
  const { isAuthenticated, mustChangePassword, loading: authLoading } = useParentAuth();
  const [admission, setAdmission] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (isAuthenticated) {
      navigate({ to: mustChangePassword ? "/parent/change-password" : "/parent/dashboard" });
    }
  }, [isAuthenticated, mustChangePassword, authLoading, navigate]);

  const onSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError(null);
    if (!admission.trim() || !password) {
      setError("Please enter your admission number and password.");
      return;
    }
    setSubmitting(true);
    try {
      const { error: signErr } = await parentSupabase.auth.signInWithPassword({
        email: admissionToEmail(admission),
        password,
      });
      if (signErr) throw signErr;
      // navigation handled by effect
    } catch (err: any) {
      setError(
        err?.message?.toLowerCase().includes("invalid")
          ? "Invalid admission number or password."
          : err?.message ?? "Unable to sign in. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="parent-portal flex min-h-screen items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="glass-strong grid w-full max-w-4xl overflow-hidden p-0 md:grid-cols-2"
      >
        <div className="relative hidden items-center justify-center overflow-hidden bg-[#EFF4FF] p-10 md:flex">
          <img
            src="/parent portal ui pic.png"
            alt="Student learning"
            className="relative h-72 w-72 object-contain drop-shadow-lg"
          />
        </div>

        <div className="p-8 sm:p-10">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">
              Sign in to <span style={{ color: "var(--parent-primary)" }}>ASR Parent Portal</span>
            </h1>
            <p className="mt-1 text-sm parent-muted">Continue your child's learning journey</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Admission Number *</label>
              <input
                autoFocus
                value={admission}
                onChange={(e) => setAdmission(e.target.value.toUpperCase())}
                placeholder="e.g. 26LUS0105"
                className="glass-input w-full px-4 py-3 tracking-wider"
                autoCapitalize="characters"
                spellCheck={false}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Password *</label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
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

            <div className="flex items-center justify-between text-sm">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-border bg-card accent-primary"
                />
                <span className="parent-muted">Remember me</span>
              </label>
              <Link to="/parent/forgot-password" className="font-medium underline-offset-4 hover:underline">
                Forgot password?
              </Link>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-red-200/40 bg-red-500/20 px-3 py-2 text-sm"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="glass-btn flex w-full items-center justify-center gap-2 px-4 py-3 font-semibold disabled:opacity-60"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {submitting ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs parent-muted">
            Trouble signing in? Contact your school administrator.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

