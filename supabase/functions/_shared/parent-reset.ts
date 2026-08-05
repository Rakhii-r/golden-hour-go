import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export function admin() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

/** Digits only. */
function digits(s: string): string {
  return s.replace(/\D/g, "");
}

/** Mask all but the last 3 digits: 9876543210 -> XXXXXXX210 */
export function maskPhone(raw: string): string {
  const d = digits(raw);
  if (d.length <= 3) return d;
  return "X".repeat(d.length - 3) + d.slice(-3);
}

/** Convert a stored phone into E.164 (assumes +91 for 10-digit Indian numbers). */
export function toE164(raw: string): string | null {
  let d = digits(raw);
  if (raw.trim().startsWith("+")) return `+${d}`;
  if (d.length === 10) return `+91${d}`;
  if (d.length === 11 && d.startsWith("0")) return `+91${d.slice(1)}`;
  if (d.length >= 11 && d.length <= 15) return `+${d}`;
  return null;
}

export type ParentAccount = {
  id: string;
  user_id: string | null;
  organization_id: string;
  admission_number: string | null;
  recovery_phone: string | null;
};

/** Find the parent account for an admission number / login id. */
export async function findParentAccount(
  supabase: ReturnType<typeof admin>,
  admissionNumber: string,
): Promise<{ account?: ParentAccount; error?: { message: string; status: number } }> {
  const needle = admissionNumber.trim();
  if (!needle) return { error: { message: "Admission Number is required.", status: 400 } };

  const { data: rows, error } = await supabase
    .from("parent_accounts")
    .select("id, user_id, organization_id, admission_number, recovery_phone")
    .ilike("admission_number", needle)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("parent_accounts lookup error", error);
    return { error: { message: "Database error", status: 500 } };
  }

  const account = (rows ?? []).find((r) => r.user_id) ?? (rows ?? [])[0];
  if (!account) return { error: { message: "Parent account not found.", status: 404 } };
  return { account: account as ParentAccount };
}

/** Per-organization Twilio Verify credentials. */
export async function getTwilioCreds(
  supabase: ReturnType<typeof admin>,
  organizationId: string,
): Promise<
  | { creds: { account_sid: string; auth_token: string; verify_sid: string } }
  | { error: { message: string; status: number } }
> {
  const { data, error } = await supabase
    .from("integration_credentials")
    .select("credentials")
    .eq("organization_id", organizationId)
    .eq("platform", "twilio_whatsapp")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Creds lookup error", error);
    return { error: { message: "Database error", status: 500 } };
  }

  const creds = (data?.credentials ?? {}) as Record<string, string>;
  if (!creds.account_sid || !creds.auth_token || !creds.verify_sid) {
    return { error: { message: "OTP not configured for this organization", status: 400 } };
  }
  return {
    creds: {
      account_sid: creds.account_sid,
      auth_token: creds.auth_token,
      verify_sid: creds.verify_sid,
    },
  };
}

export function twilioAuth(account_sid: string, auth_token: string) {
  return "Basic " + btoa(`${account_sid}:${auth_token}`);
}

export async function sha256(value: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function randomToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export const OTP_TTL_MINUTES = Number(Deno.env.get("PARENT_OTP_TTL_MINUTES") ?? "5");
export const RESET_TOKEN_TTL_MINUTES = 10;
export const MAX_OTP_ATTEMPTS = 5;
