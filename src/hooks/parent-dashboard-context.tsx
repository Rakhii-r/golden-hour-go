import { createContext, useContext, type ReactNode } from "react";
import { useParentDashboard } from "@/hooks/use-parent-dashboard";

type Ctx = ReturnType<typeof useParentDashboard>;

const ParentDashboardContext = createContext<Ctx | null>(null);

export function ParentDashboardProvider({ children }: { children: ReactNode }) {
  const value = useParentDashboard();
  return (
    <ParentDashboardContext.Provider value={value}>{children}</ParentDashboardContext.Provider>
  );
}

export function useParentDashboardCtx() {
  const ctx = useContext(ParentDashboardContext);
  if (!ctx) throw new Error("useParentDashboardCtx must be used within ParentDashboardProvider");
  return ctx;
}