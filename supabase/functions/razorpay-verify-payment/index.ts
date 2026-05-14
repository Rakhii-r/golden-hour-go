import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { createHmac } from "node:crypto";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      installment_id,
      amount,
    } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !installment_id) {
      return json({ error: "Missing parameters" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Auth: parent
    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userRes } = await userClient.auth.getUser();
    if (!userRes?.user) return json({ error: "Unauthorized" }, 401);
    const userId = userRes.user.id;

    const { data: pa } = await supabase
      .from("parent_accounts")
      .select("student_id")
      .eq("user_id", userId)
      .maybeSingle();
    if (!pa?.student_id) return json({ error: "No student linked" }, 403);

    // Order must exist and belong to this student
    const { data: order } = await supabase
      .from("razorpay_orders")
      .select("id, organization_id, student_id, installment_id, amount, status")
      .eq("razorpay_order_id", razorpay_order_id)
      .maybeSingle();
    if (!order) return json({ error: "Order not found" }, 404);
    if (order.student_id !== pa.student_id || order.installment_id !== installment_id) {
      return json({ error: "Forbidden" }, 403);
    }

    // Razorpay secret
    const { data: credsRows } = await supabase
      .from("integration_credentials")
      .select("credentials")
      .eq("organization_id", order.organization_id)
      .eq("platform", "razorpay")
      .order("created_at", { ascending: false })
      .limit(1);
    const key_secret = credsRows?.[0]?.credentials?.key_secret;
    if (!key_secret) return json({ error: "Razorpay not configured" }, 400);

    // Verify signature
    const expected = createHmac("sha256", key_secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");
    if (expected !== razorpay_signature) {
      await supabase.from("razorpay_orders").update({ status: "signature_failed" }).eq("id", order.id);
      return json({ error: "Invalid signature" }, 400);
    }

    // Idempotency
    const { data: existing } = await supabase
      .from("fee_payments")
      .select("id")
      .eq("transaction_id", razorpay_payment_id)
      .maybeSingle();
    if (existing) {
      return json({ success: true, duplicate: true });
    }

    const payAmount = Number(amount ?? order.amount);
    const today = new Date().toISOString().slice(0, 10);
    const academicYear = `${new Date().getFullYear()}-${String((new Date().getFullYear() + 1) % 100).padStart(2, "0")}`;

    const { error: payErr } = await supabase.from("fee_payments").insert({
      student_id: order.student_id,
      organization_id: order.organization_id,
      amount: payAmount,
      payment_mode: "razorpay",
      payment_date: today,
      transaction_id: razorpay_payment_id,
      installment_id: order.installment_id,
      status: "completed",
      academic_year: academicYear,
      receipt_number: `RZP-${razorpay_payment_id.slice(-10)}`,
    });
    if (payErr) {
      console.error("fee_payments insert failed", payErr);
      return json({ error: payErr.message }, 500);
    }

    await supabase
      .from("razorpay_orders")
      .update({ status: "paid", razorpay_payment_id })
      .eq("id", order.id);

    // Best-effort term update if no trigger handles it
    const { data: term } = await supabase
      .from("student_fee_terms")
      .select("term_amount, paid_amount")
      .eq("id", order.installment_id)
      .maybeSingle();
    if (term) {
      const newPaid = Number(term.paid_amount ?? 0) + payAmount;
      const newBalance = Math.max(0, Number(term.term_amount ?? 0) - newPaid);
      await supabase
        .from("student_fee_terms")
        .update({
          paid_amount: newPaid,
          balance_amount: newBalance,
          status: newBalance <= 0.01 ? "paid" : "partial",
        })
        .eq("id", order.installment_id);
    }

    return json({ success: true });
  } catch (e) {
    console.error("verify-payment error", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}