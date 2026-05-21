import { useEffect, useState, useCallback } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { parentSupabase } from "@/lib/parent-supabase";

export interface ParentStudent {
  id: string;
  admission_number: string;
  student_id: string;
  organization_id: string;
  must_change_password?: boolean | null;
}

const SELECTED_KEY = "edugrow-parent-selected-student";

// ---- Module-level shared auth store ----
// Keeping this state outside React prevents auth from being re-checked (and the
// "Loading…" screen from flashing) on every client-side navigation, since each
// route remounts its own <RequireParentAuth> wrapper.

interface AuthStoreState {
  session: Session | null;
  user: User | null;
  student: ParentStudent | null;
  loading: boolean;
  initialized: boolean;
}

// Try to seed user/session synchronously from Supabase's localStorage to
// avoid a "Loading…" flash on every hard refresh. Supabase persists the
// session under the storageKey configured in parent-supabase.ts.
const seedFromStorage = (): Partial<AuthStoreState> => {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem("edugrow-parent-auth");
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    const session = (parsed?.currentSession ?? parsed) as Session | null;
    if (session?.user) {
      let cachedStudent: ParentStudent | null = null;
      try {
        const s = window.localStorage.getItem(SELECTED_KEY);
        if (s) cachedStudent = JSON.parse(s);
      } catch {}
      return { session, user: session.user, student: cachedStudent, loading: false };
    }
  } catch {}
  return {};
};

const store: AuthStoreState = {
  session: null,
  user: null,
  student: null,
  loading: true,
  initialized: false,
  ...seedFromStorage(),
};

const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());
const setStore = (patch: Partial<AuthStoreState>) => {
  Object.assign(store, patch);
  notify();
};

const loadStudentForUser = async (uid: string) => {
  const { data } = await parentSupabase
    .from("parent_accounts")
    .select("*")
    .eq("user_id", uid)
    .maybeSingle();
  if (data) {
    setStore({ student: data as ParentStudent });
    try {
      localStorage.setItem(SELECTED_KEY, JSON.stringify(data));
    } catch {}
  } else {
    try {
      const cached = localStorage.getItem(SELECTED_KEY);
      if (cached) setStore({ student: JSON.parse(cached) });
    } catch {}
  }
};

let initPromise: Promise<void> | null = null;
const initAuth = () => {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    // Subscribe FIRST, then getSession (Supabase best practice)
    parentSupabase.auth.onAuthStateChange((_evt, s) => {
      setStore({ session: s, user: s?.user ?? null });
      if (s?.user) {
        setTimeout(() => loadStudentForUser(s.user.id), 0);
      } else {
        setStore({ student: null });
        try {
          localStorage.removeItem(SELECTED_KEY);
        } catch {}
      }
    });

    const { data } = await parentSupabase.auth.getSession();
    const s = data.session;
    setStore({ session: s, user: s?.user ?? null });
    if (s?.user) {
      await loadStudentForUser(s.user.id);
    }
    setStore({ loading: false, initialized: true });
  })();
  return initPromise;
};

export function useParentAuth() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const listener = () => setTick((t) => t + 1);
    listeners.add(listener);
    initAuth();
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const logout = useCallback(async () => {
    await parentSupabase.auth.signOut();
    try {
      localStorage.removeItem(SELECTED_KEY);
    } catch {}
    setStore({ session: null, user: null, student: null });
  }, []);

  const refreshStudent = useCallback(
    () => (store.user ? loadStudentForUser(store.user.id) : Promise.resolve()),
    [],
  );

  return {
    session: store.session,
    user: store.user,
    student: store.student,
    loading: store.loading,
    isAuthenticated: !!store.session,
    mustChangePassword: !!store.student?.must_change_password,
    logout,
    refreshStudent,
  };
}