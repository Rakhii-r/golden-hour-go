import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Loader2, ShieldCheck } from "lucide-react";
import { parentSupabase } from "@/lib/parent-supabase";
import { useParentAuth } from "@/hooks/use-parent-auth";
import { RequireParentAuth } from "@/components/parent/RequireParentAuth";

export const Route = createFileRoute("/parent/change-password")({
  head: () => ({ meta: [{ title: "Change Password — Parent Portal" }] }),
  component: () => (
    <RequireParentAuth>
      <ChangePasswordView />
    </RequireParentAuth>
  ),
});

function ChangePasswordView() {
  const navigate = useNavigate();
  const { user, refreshStudent } = useParentAuth();
  const [pwd, setPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (pwd.length < 8) return setError("Password must be at least 8 characters.");
    if (pwd !== confirm) return setError("Passwords do not match.");
    setSubmitting(true);
    try {
      const { error: upErr } = await parentSupabase.auth.updateUser({ password: pwd });
      if (upErr) throw upErr;
      if (user) {
        await parentSupabase
          .from("parent_accounts")
          .update({ must_change_password: false })
          .eq("user_id", user.id);
      }
      await refreshStudent();
      navigate({ to: "/parent/dashboard" });
    } catch (err: any) {
      setError(err?.message ?? "Could not update password.");
    } finally {
      setSubmitting(false);
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
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold">Set a new password</h1>
          <p className="mt-1 text-sm parent-muted">For your security, please change your default password.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">New password</label>
            <input
              type="password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              className="glass-input w-full px-4 py-3"
              placeholder="At least 8 characters"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Confirm password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="glass-input w-full px-4 py-3"
              placeholder="Re-enter password"
            />
          </div>
          {error && (
            <div className="rounded-xl border border-red-200/40 bg-red-500/20 px-3 py-2 text-sm">{error}</div>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="glass-btn flex w-full items-center justify-center gap-2 px-4 py-3 font-semibold disabled:opacity-60"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Update password
          </button>
        </form>
      </motion.div>
    </div>
  );
}