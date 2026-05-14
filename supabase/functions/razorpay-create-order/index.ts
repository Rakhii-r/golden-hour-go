import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    let { installment_id, amount } = body as { installment_id?: string; amount?: number };
    if (!amount || amount <= 0) {
      return json({ error: "positive amount required" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Authenticated user (parent)
    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userRes } = await userClient.auth.getUser();
    if (!userRes?.user) return json({ error: "Unauthorized" }, 401);
    const userId = userRes.user.id;

    // Parent → student
    const { data: pa } = await supabase
      .from("parent_accounts")
      .select("student_id, organization_id")
      .eq("user_id", userId)
      .maybeSingle();
    if (!pa?.student_id) return json({ error: "No student linked" }, 403);

    let term: {
      id: string;
      student_id: string;
      organization_id: string;
      balance_amount: number | null;
      term_amount: number | null;
      paid_amount: number | null;
      installment_name: string | null;
      status: string | null;
    } | null = null;

    if (installment_id) {
      const { data: t, error: tErr } = await supabase
        .from("student_fee_terms")
        .select("id, student_id, organization_id, balance_amount, term_amount, paid_amount, installment_name, status")
        .eq("id", installment_id)
        .maybeSingle();
      if (tErr || !t) return json({ error: "Invalid installment" }, 404);
      if (t.student_id !== pa.student_id) return json({ error: "Forbidden" }, 403);
      term = t;
    } else {
      // No installment yet — auto-create an override + a single installment for the full amount.
      const { data: stu } = await supabase
        .from("students_or_clients")
        .select("id, organization_id, class, section, academic_year")
        .eq("id", pa.student_id)
        .maybeSingle();
      if (!stu) return json({ error: "Student not found" }, 404);
      const academicYear =
        stu.academic_year ??
        `${new Date().getFullYear()}-${String((new Date().getFullYear() + 1) % 100).padStart(2, "0")}`;

      // Reuse existing override if one already exists for this student/year
      const { data: existingOv } = await supabase
        .from("student_fee_overrides")
        .select("id")
        .eq("organization_id", stu.organization_id)
        .eq("student_id", stu.id)
        .eq("academic_year", academicYear)
        .maybeSingle();

      let ovIns = existingOv;
      if (!ovIns) {
        const { data: created, error: ovErr } = await supabase
          .from("student_fee_overrides")
          .insert({
            organization_id: stu.organization_id,
            student_id: stu.id,
            academic_year: academicYear,
            class_name: stu.class ?? "",
            section_name: stu.section ?? null,
            original_fee: Number(amount),
            final_payable_amount: Number(amount),
            status: "active",
            billing_type: "term_wise",
            payment_mode: "ANNUAL",
            created_by: userId,
          })
          .select("id")
          .single();
        if (ovErr || !created) {
          console.error("override insert failed", ovErr);
          return json({ error: ovErr?.message ?? "Could not create fee plan" }, 500);
        }
        ovIns = created;
      }

      // Reuse a pending term if one already exists
      const { data: existingTerm } = await supabase
        .from("student_fee_terms")
        .select("id, student_id, organization_id, balance_amount, term_amount, paid_amount, installment_name, status")
        .eq("student_fee_override_id", ovIns.id)
        .neq("status", "paid")
        .order("installment_order", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (existingTerm) {
        term = existingTerm;
        installment_id = existingTerm.id;
      } else {

      const { data: termIns, error: termErr } = await supabase
        .from("student_fee_terms")
        .insert({
          student_fee_override_id: ovIns.id,
          organization_id: stu.organization_id,
          student_id: stu.id,
          term_number: 1,
          installment_order: 1,
          installment_name: "Full Payment",
          term_amount: Number(amount),
          paid_amount: 0,
          balance_amount: Number(amount),
          status: "pending",
          academic_year: academicYear,
        })
        .select("id, student_id, organization_id, balance_amount, term_amount, paid_amount, installment_name, status")
        .single();
      if (termErr || !termIns) {
        console.error("term insert failed", termErr);
        return json({ error: termErr?.message ?? "Could not create installment" }, 500);
      }
      term = termIns;
      installment_id = termIns.id;
    }
    }

    const balance = Number(term.balance_amount ?? Number(term.term_amount ?? 0) - Number(term.paid_amount ?? 0));
    if (Number(amount) > balance + 0.01) {
      return json({ error: "Amount exceeds balance" }, 400);
    }

    // Razorpay credentials
    const { data: credsRows } = await supabase
      .from("integration_credentials")
      .select("credentials")
      .eq("organization_id", term.organization_id)
      .eq("platform", "razorpay")
      .order("created_at", { ascending: false })
      .limit(1);
    const creds = credsRows?.[0]?.credentials ?? null;
    const key_id = creds?.key_id;
    const key_secret = creds?.key_secret;
    if (!key_id || !key_secret) return json({ error: "Razorpay not configured for organization" }, 400);

    const receipt = `inst_${installment_id.slice(0, 8)}_${Date.now()}`.slice(0, 40);
    const rzpRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: "Basic " + btoa(`${key_id}:${key_secret}`),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: Math.round(Number(amount) * 100),
        currency: "INR",
        receipt,
        notes: { installment_id, student_id: term.student_id, organization_id: term.organization_id },
      }),
    });
    const order = await rzpRes.json();
    if (!rzpRes.ok || !order.id) {
      console.error("Razorpay order creation failed:", order);
      return json({ error: order?.error?.description ?? "Razorpay order failed" }, 502);
    }

    await supabase.from("razorpay_orders").insert({
      organization_id: term.organization_id,
      student_id: term.student_id,
      installment_id,
      razorpay_order_id: order.id,
      amount: Number(amount),
      currency: "INR",
      status: "created",
      receipt,
    });

    return json({
      order_id: order.id,
      key_id,
      amount: Math.round(Number(amount) * 100),
      currency: "INR",
      receipt,
      installment_id,
    });
  } catch (e) {
    console.error("create-order error", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}