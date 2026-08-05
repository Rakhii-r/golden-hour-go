import {
  admin,
  corsHeaders,
  findParentAccount,
  getTwilioCreds,
  json,
  maskPhone,
  randomToken,
  RESET_TOKEN_TTL_MINUTES,
  sha256,
  toE164,
  twilioAuth,
} from "../_shared/parent-reset.ts";

/**
 * Step 2 of the parent forgot-password flow: verify the OTP only.
 * Input:  { admissionNumber, code }
 * Output: { success, resetToken, maskedPhone }
 * No password is accepted here — the caller must exchange the short-lived
 * resetToken at reset-parent-password to set the new password.
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { admissionNumber, code } = (await req.json()) as {
      admissionNumber?: string;
      code?: string;
    };

    if (!admissionNumber || !admissionNumber.trim()) {
      return json({ error: "Admission Number is required." }, 400);
    }
    if (!code || !/^\d{4,8}$/.test(code.trim())) {
      return json({ error: "Invalid OTP." }, 400);
    }

    const supabase = admin();

    const { account, error: lookupErr } = await findParentAccount(supabase, admissionNumber);
    if (lookupErr) return json({ error: lookupErr.message }, lookupErr.status);
    if (!account!.user_id) {
      return json({ error: "No user account linked to this admission number." }, 404);
    }
    if (!account!.recovery_phone) {
      return json({ error: "Registered mobile number not found." }, 400);
    }

    const e164 = toE164(account!.recovery_phone);
    if (!e164) return json({ error: "Registered mobile number not found." }, 400);

    const credsResult = await getTwilioCreds(supabase, account!.organization_id);
    if ("error" in credsResult) {
      return json({ error: credsResult.error.message }, credsResult.error.status);
    }
    const { account_sid, auth_token, verify_sid } = credsResult.creds;

    const checkRes = await fetch(
      `https://verify.twilio.com/v2/Services/${verify_sid}/VerificationCheck`,
      {
        method: "POST",
        headers: {
          Authorization: twilioAuth(account_sid, auth_token),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ To: e164, Code: code.trim() }),
      },
    );

    const checkData = await checkRes.json().catch(() => ({}));

    if (checkRes.status === 404) {
      return json({ error: "OTP has expired. Please request a new OTP." }, 400);
    }
    if (checkRes.status === 429 || checkData?.code === 60202) {
      return json({ error: "Too many attempts. Please request a new OTP." }, 429);
    }
    if (!checkRes.ok || checkData.status !== "approved") {
      return json({ error: "Invalid OTP." }, 400);
    }

    // Issue a short-lived, single-use reset token bound to this parent account.
    const token = randomToken();
    const tokenHash = await sha256(token);
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60_000).toISOString();

    // Invalidate any previous outstanding tokens for this account.
    await supabase
      .from("parent_password_resets")
      .update({ consumed_at: new Date().toISOString() })
      .eq("parent_account_id", account!.id)
      .is("consumed_at", null);

    const { error: insertErr } = await supabase.from("parent_password_resets").insert({
      parent_account_id: account!.id,
      otp_hash: tokenHash,
      channel: "sms",
      destination: maskPhone(account!.recovery_phone),
      expires_at: expiresAt,
    });

    if (insertErr) {
      console.error("reset token insert error", insertErr);
      return json({ error: "Could not start password reset. Please try again." }, 500);
    }

    return json({
      success: true,
      resetToken: token,
      maskedPhone: maskPhone(account!.recovery_phone),
      expiresInMinutes: RESET_TOKEN_TTL_MINUTES,
    });
  } catch (e) {
    console.error("verify-otp unhandled error", e);
    return json({ error: "Internal server error" }, 500);
  }
});
