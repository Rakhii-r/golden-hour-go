import {
  admin,
  corsHeaders,
  findParentAccount,
  getTwilioCreds,
  json,
  maskPhone,
  OTP_TTL_MINUTES,
  toE164,
  twilioAuth,
} from "../_shared/parent-reset.ts";

/**
 * Step 1 of the parent forgot-password flow.
 * Input:  { admissionNumber }
 * Output: { success, maskedPhone, expiresInMinutes }
 * The full mobile number is never returned to the client.
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { admissionNumber } = (await req.json()) as { admissionNumber?: string };
    if (!admissionNumber || !admissionNumber.trim()) {
      return json({ error: "Admission Number is required." }, 400);
    }

    const supabase = admin();

    const { account, error: lookupErr } = await findParentAccount(supabase, admissionNumber);
    if (lookupErr) return json({ error: lookupErr.message }, lookupErr.status);

    if (!account!.recovery_phone || !account!.recovery_phone.trim()) {
      return json({ error: "Registered mobile number not found." }, 400);
    }

    const e164 = toE164(account!.recovery_phone);
    if (!e164) return json({ error: "Registered mobile number not found." }, 400);

    const credsResult = await getTwilioCreds(supabase, account!.organization_id);
    if ("error" in credsResult) {
      return json({ error: credsResult.error.message }, credsResult.error.status);
    }
    const { account_sid, auth_token, verify_sid } = credsResult.creds;

    const twilioRes = await fetch(
      `https://verify.twilio.com/v2/Services/${verify_sid}/Verifications`,
      {
        method: "POST",
        headers: {
          Authorization: twilioAuth(account_sid, auth_token),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ To: e164, Channel: "sms" }),
      },
    );

    if (!twilioRes.ok) {
      const err = await twilioRes.json().catch(() => ({}));
      console.error("Twilio send error", err);
      return json({ error: err?.message ?? "Failed to send OTP" }, 502);
    }

    return json({
      success: true,
      maskedPhone: maskPhone(account!.recovery_phone),
      expiresInMinutes: OTP_TTL_MINUTES,
      message: "OTP sent",
    });
  } catch (e) {
    console.error("send-otp unhandled error", e);
    return json({ error: "Internal server error" }, 500);
  }
});
