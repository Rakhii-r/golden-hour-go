import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/access-denied")({
  head: () => ({ meta: [{ title: "Access Denied" }] }),
  component: () => (
    <div className="parent-portal flex min-h-screen items-center justify-center px-4">
      <div className="glass-strong max-w-md p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-bold">Access denied</h1>
        <p className="mt-2 text-sm parent-muted">
          You don't have permission to view this page.
        </p>
        <Link to="/parent" className="glass-btn mt-6 inline-block px-4 py-2 font-medium">
          Go to Parent Login
        </Link>
      </div>
    </div>
  ),
});