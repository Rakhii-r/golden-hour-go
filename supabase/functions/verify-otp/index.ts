import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Strip non-digits and keep the last 10 digits (the Indian subscriber number).
// Works for E.164 (+919800000114 → "9800000114"), clean local (9800000114 → "9800000114"),
// and trunk-prefixed local (0810673899 → "0810673899").
function last10(s: string): string {
  return s.replace(/\D/g, "").slice(-10);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { phone, code, newPassword } = await req.json() as {
      phone?: string;
      code?: string;
      newPassword?: string;
    };

    if (!phone || !/^\+[1-9]\d{6,14}$/.test(phone)) {
      return json({ error: "Phone must be in E.164 format (e.g. +919876543210)" }, 400);
    }
    if (!code || code.trim().length === 0) {
      return json({ error: "OTP code is required" }, 400);
    }
    if (!newPassword || newPassword.length < 8) {
      return json({ error: "New password must be at least 8 characters" }, 400);
    }

    const incomingLast10 = last10(phone);

    // SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY always come from env (Supabase's own keys).
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Look up parent first — we need organization_id to fetch per-org Twilio creds.
    // ilike '%last10' pre-filter + code-side last-10 comparison handles stored formats
    // and duplicate rows (same phone, multiple children share same user_id).
    const { data: rows, error: dbErr } = await supabase
      .from("parent_accounts")
      .select("user_id, recovery_phone, organization_id")
      .ilike("recovery_phone", `%${incomingLast10}`);

    if (dbErr) {
      console.error("DB lookup error", dbErr);
      return json({ error: "Database error" }, 500);
    }

    const match = (rows ?? []).find(
      (r) => r.recovery_phone != null && last10(r.recovery_phone) === incomingLast10,
    );

    if (!match?.user_id) {
      return json({ error: "No user account linked to this phone number" }, 404);
    }

    // ── Per-org Twilio creds ──────────────────────────────────────────────────
    // Failure points:
    //   1. No row in integration_credentials for this org → 400
    //   2. Row exists but verify_sid / account_sid / auth_token is empty → 400
    //   3. DB error on the creds query → 500
    const { data: credsRow, error: credsErr } = await supabase
      .from("integration_credentials")
      .select("credentials")
      .eq("organization_id", match.organization_id)
      .eq("platform", "twilio_whatsapp")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (credsErr) {
      console.error("Creds lookup error", credsErr);
      return json({ error: "Database error" }, 500);
    }

    const creds = (credsRow?.credentials ?? {}) as Record<string, string>;
    const { account_sid, auth_token, verify_sid } = creds;

    if (!account_sid || !auth_token || !verify_sid) {
      return json({ error: "OTP not configured for this organization" }, 400);
    }
    // ─────────────────────────────────────────────────────────────────────────

    // Verify OTP with Twilio — only proceed to password reset on "approved".
    const checkRes = await fetch(
      `https://verify.twilio.com/v2/Services/${verify_sid}/VerificationCheck`,
      {
        method: "POST",
        headers: {
          Authorization: "Basic " + btoa(`${account_sid}:${auth_token}`),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ To: phone, Code: code }),
      },
    );

    const checkData = await checkRes.json();
    if (!checkRes.ok || checkData.status !== "approved") {
      return json({ error: "Invalid or expired OTP" }, 400);
    }

    // SERVICE_ROLE key (from env) is used here — never exposed to the client.
    const { error: authErr } = await supabase.auth.admin.updateUserById(
      match.user_id,
      { password: newPassword },
    );

    if (authErr) {
      console.error("Auth update error", authErr);
      return json({ error: "Failed to update password" }, 500);
    }

    // Force-invalidate all existing sessions so the parent must re-login with the new password.
    // A failure here is non-fatal — the password was already changed successfully.
    const { error: signOutErr } = await supabase.auth.admin.signOut(match.user_id, { scope: "global" });
    if (signOutErr) console.error("Session invalidation error (non-fatal)", signOutErr);

    return json({ success: true, message: "Password updated successfully" });
  } catch (e) {
    console.error("verify-otp unhandled error", e);
    return json({ error: "Internal server error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
