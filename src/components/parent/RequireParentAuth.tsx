import { useEffect } from "react";
import { useNavigate, useLocation } from "@tanstack/react-router";
import { useParentAuth } from "@/hooks/use-parent-auth";

export function RequireParentAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, mustChangePassword, loading } = useParentAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      navigate({ to: "/parent" });
      return;
    }
    if (mustChangePassword && location.pathname !== "/parent/change-password") {
      navigate({ to: "/parent/change-password" });
    }
  }, [isAuthenticated, mustChangePassword, loading, navigate, location.pathname]);

  if (loading) {
    return (
      <div className="parent-portal flex min-h-screen items-center justify-center">
        <div className="glass px-6 py-4 parent-muted">Loading…</div>
      </div>
    );
  }
  if (!isAuthenticated) return null;
  return <>{children}</>;
}