import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { KeyRound, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/parent/forgot-password")({
  head: () => ({ meta: [{ title: "Forgot Password — Parent Portal" }] }),
  component: ForgotPassword,
});

function ForgotPassword() {
  const [admission, setAdmission] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="parent-portal flex min-h-screen items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-strong w-full max-w-md p-8"
      >
        <Link to="/parent" className="mb-4 inline-flex items-center gap-1 text-sm parent-muted hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to login
        </Link>
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <KeyRound className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold">Reset password</h1>
          <p className="mt-1 text-sm parent-muted">Enter your admission number to receive an OTP.</p>
        </div>

        {submitted ? (
          <div className="rounded-xl border border-border bg-muted px-4 py-3 text-sm">
            OTP delivery is coming soon. Please contact your school administrator for assistance.
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
            className="space-y-4"
          >
            <div>
              <label className="mb-1.5 block text-sm font-medium">Admission Number</label>
              <input
                value={admission}
                onChange={(e) => setAdmission(e.target.value.toUpperCase())}
                className="glass-input w-full px-4 py-3 tracking-wider"
                placeholder="e.g. 26LUS0105"
              />
            </div>
            <button type="submit" className="glass-btn w-full px-4 py-3 font-semibold">
              Send OTP
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}