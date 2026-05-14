import { createClient } from "@supabase/supabase-js";

export const PARENT_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
export const PARENT_SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

export const parentSupabase = createClient(PARENT_SUPABASE_URL, PARENT_SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
    storageKey: "edugrow-parent-auth",
  },
});

export const admissionToEmail = (admissionNo: string) => `${admissionNo.trim().toUpperCase()}@parent.edugrow.internal`;
