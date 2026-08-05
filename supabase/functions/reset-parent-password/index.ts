import {
  admin,
  corsHeaders,
  findParentAccount,
  json,
  sha256,
} from "../_shared/parent-reset.ts";

/**
 * Step 3 of the parent forgot-password flow: set the new password.
 * Input:  { admissionNumber, resetToken, newPassword }
 * Requires a valid, unexpired, unconsumed reset token issued by verify-otp.
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { admissionNumber, resetToken, newPassword } = (await req.json()) as {
      admissionNumber?: string;
      resetToken?: string;
      newPassword?: string;
    };

    if (!admissionNumber || !admissionNumber.trim() || !resetToken) {
      return json({ error: "Verification session missing. Please restart the reset." }, 400);
    }
    if (!newPassword || newPassword.length < 8 || newPassword.length > 72) {
      return json({ error: "New password must be at least 8 characters." }, 400);
    }

    const supabase = admin();

    const { account, error: lookupErr } = await findParentAccount(supabase, admissionNumber);
    if (lookupErr) return json({ error: lookupErr.message }, lookupErr.status);
    if (!account!.user_id) {
      return json({ error: "No user account linked to this admission number." }, 404);
    }

    const tokenHash = await sha256(resetToken);
    const { data: session, error: sessionErr } = await supabase
      .from("parent_password_resets")
      .select("id, expires_at, consumed_at")
      .eq("parent_account_id", account!.id)
      .eq("otp_hash", tokenHash)
      .is("consumed_at", null)
      .maybeSingle();

    if (sessionErr) {
      console.error("reset session lookup error", sessionErr);
      return json({ error: "Database error" }, 500);
    }
    if (!session) {
      return json({ error: "Verification session invalid. Please request a new OTP." }, 401);
    }
    if (new Date(session.expires_at).getTime() < Date.now()) {
      return json({ error: "Verification session expired. Please request a new OTP." }, 401);
    }

    const { error: authErr } = await supabase.auth.admin.updateUserById(account!.user_id, {
      password: newPassword,
    });
    if (authErr) {
      console.error("Auth update error", authErr);
      return json({ error: "Failed to update password" }, 500);
    }

    // Consume the token immediately so it cannot be reused.
    await supabase
      .from("parent_password_resets")
      .update({ consumed_at: new Date().toISOString() })
      .eq("id", session.id);

    await supabase
      .from("parent_accounts")
      .update({ must_change_password: false })
      .eq("id", account!.id);

    const { error: signOutErr } = await supabase.auth.admin.signOut(account!.user_id, {
      scope: "global",
    });
    if (signOutErr) console.error("Session invalidation error (non-fatal)", signOutErr);

    return json({
      success: true,
      message: "Password updated successfully. Please log in with your new password.",
    });
  } catch (e) {
    console.error("reset-parent-password unhandled error", e);
    return json({ error: "Internal server error" }, 500);
  }
});
