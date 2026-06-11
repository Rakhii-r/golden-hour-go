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
      item_ids,
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

    // Use trusted server-side order amount; never trust client-supplied amount.
    const payAmount = Number(order.amount);
    const today = new Date().toISOString().slice(0, 10);


    // Resolve parent term + override (for academic_year + billing_type)
    const { data: term } = await supabase
      .from("student_fee_terms")
      .select("id, term_number, term_amount, paid_amount, academic_year, student_fee_override_id")
      .eq("id", order.installment_id)
      .maybeSingle();
    const academicYear =
      term?.academic_year ??
      `${new Date().getFullYear()}-${String((new Date().getFullYear() + 1) % 100).padStart(2, "0")}`;

    // Resolve billing_type from the parent override so school and daycare
    // payments are recorded with the correct billing_type and receipt prefix.
    let billingType: "term_wise" | "daycare" = "term_wise";
    if (term?.student_fee_override_id) {
      const { data: ov } = await supabase
        .from("student_fee_overrides")
        .select("billing_type")
        .eq("id", term.student_fee_override_id)
        .maybeSingle();
      if ((ov as { billing_type?: string } | null)?.billing_type === "daycare") {
        billingType = "daycare";
      }
    }
    const receiptPrefix = billingType === "daycare" ? "DF" : "SF";

    // Allocate payAmount to selected items (in order) or proportionally to all
    // items in the term when item_ids isn't provided.
    let targetItems: Array<{ id: string; final_amount: number; paid_amount: number; balance: number; fee_head_id: string | null }> = [];
    if (Array.isArray(item_ids) && item_ids.length > 0) {
      const { data: rows } = await supabase
        .from("student_fee_term_items")
        .select("id, final_amount, paid_amount, fee_head_id, student_id")
        .in("id", item_ids);
      for (const r of (rows ?? [])) {
        if (r.student_id !== order.student_id) continue;
        const total = Number(r.final_amount ?? 0);
        const paid = Number(r.paid_amount ?? 0);
        targetItems.push({
          id: r.id as string,
          final_amount: total,
          paid_amount: paid,
          balance: Math.max(0, total - paid),
          fee_head_id: (r.fee_head_id as string | null) ?? null,
        });
      }
    } else {
      const { data: rows } = await supabase
        .from("student_fee_term_items")
        .select("id, final_amount, paid_amount, fee_head_id")
        .eq("student_fee_term_id", order.installment_id);
      for (const r of (rows ?? [])) {
        const total = Number(r.final_amount ?? 0);
        const paid = Number(r.paid_amount ?? 0);
        const bal = Math.max(0, total - paid);
        if (bal <= 0) continue;
        targetItems.push({
          id: r.id as string,
          final_amount: total,
          paid_amount: paid,
          balance: bal,
          fee_head_id: (r.fee_head_id as string | null) ?? null,
        });
      }
    }

    // Allocate sequentially (full pay each until amount is exhausted)
    let remaining = payAmount;
    const allocations: Array<{ item: typeof targetItems[number]; amount: number }> = [];
    for (const it of targetItems) {
      if (remaining <= 0.001) break;
      const give = Math.min(it.balance, remaining);
      if (give <= 0) continue;
      allocations.push({ item: it, amount: Number(give.toFixed(2)) });
      remaining = Number((remaining - give).toFixed(2));
    }

    // Persist: one fee_payments row per allocated fee head (or one row if no items)
    if (allocations.length > 0) {
      const rows = allocations.map((a, idx) => ({
        student_id: order.student_id,
        organization_id: order.organization_id,
        amount: a.amount,
        payment_mode: "razorpay",
        payment_date: today,
        transaction_id: razorpay_payment_id,
        installment_id: order.installment_id,
        status: "completed",
        academic_year: academicYear,
        receipt_number: `${receiptPrefix}-${razorpay_payment_id.slice(-10)}-${idx + 1}`,
        term_number: term?.term_number ?? null,
        fee_head_id: a.item.fee_head_id,
        billing_type: billingType,
      }));
      const { error: payErr } = await supabase.from("fee_payments").insert(rows);
      if (payErr) {
        console.error("fee_payments insert failed", payErr);
        return json({ error: "Payment recording failed. Please contact support." }, 500);
      }

      // Update each item's paid_amount
      for (const a of allocations) {
        const newPaid = Number((a.item.paid_amount + a.amount).toFixed(2));
        await supabase
          .from("student_fee_term_items")
          .update({ paid_amount: newPaid })
          .eq("id", a.item.id);
      }
    } else {
      // Fallback: no items — single payment row
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
        receipt_number: `${receiptPrefix}-${razorpay_payment_id.slice(-10)}`,
        term_number: term?.term_number ?? null,
        billing_type: billingType,
      });
      if (payErr) {
        console.error("fee_payments insert failed", payErr);
        return json({ error: "Payment recording failed. Please contact support." }, 500);
      }

    }

    await supabase
      .from("razorpay_orders")
      .update({ status: "paid", razorpay_payment_id })
      .eq("id", order.id);

    // Update parent term totals (best-effort if no trigger handles it)
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

    // ── Receipt + notification side-effects (best-effort; never fail payment) ──
    const primaryReceipt =
      allocations.length > 0
        ? `${receiptPrefix}-${razorpay_payment_id.slice(-10)}-1`
        : `${receiptPrefix}-${razorpay_payment_id.slice(-10)}`;
    try {
      const { data: stu } = await supabase
        .from("students_or_clients")
        .select("id, name, admission_number, class, section")
        .eq("id", order.student_id)
        .maybeSingle();
      const studentName = (stu as { name?: string } | null)?.name ?? "Student";
      const studentClass = (stu as { class?: string } | null)?.class ?? "";
      const studentSection = (stu as { section?: string } | null)?.section ?? "";
      const classLabel = [studentClass, studentSection].filter(Boolean).join(" - ");

      const { data: insertedPay } = await supabase
        .from("fee_payments")
        .select("id, receipt_number")
        .eq("transaction_id", razorpay_payment_id)
        .eq("student_id", order.student_id)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      const feePaymentId = (insertedPay as { id?: string } | null)?.id ?? null;
      const receiptNo =
        (insertedPay as { receipt_number?: string } | null)?.receipt_number ?? primaryReceipt;

      const amountStr = `₹${payAmount.toLocaleString("en-IN")}`;
      const parentActionUrl = `/parent/fees?receipt=${encodeURIComponent(receiptNo)}`;
      const staffActionUrl = feePaymentId ? `/admin/fees/payments/${feePaymentId}` : `/admin/fees`;

      const recipientRows: Array<{
        user_id: string;
        title: string;
        message: string;
        type: string;
        action_url: string;
      }> = [];

      // Parent
      recipientRows.push({
        user_id: userId,
        title: "Fee Payment Successful",
        message: `Student: ${studentName}\nAmount: ${amountStr}\nReceipt No: ${receiptNo}\n\nYour payment has been received successfully.`,
        type: "fee_payment",
        action_url: parentActionUrl,
      });

      // Admin + Accountant
      const { data: staffRoles } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .eq("organization_id", order.organization_id)
        .in("role", ["admin", "accountant"]);
      const adminIds = new Set<string>();
      const accountantIds = new Set<string>();
      for (const r of (staffRoles ?? []) as Array<{ user_id: string; role: string }>) {
        if (r.role === "admin") adminIds.add(r.user_id);
        if (r.role === "accountant") accountantIds.add(r.user_id);
      }
      for (const uid of adminIds) {
        recipientRows.push({
          user_id: uid,
          title: "New Fee Payment Received",
          message: `Student: ${studentName}\nClass: ${classLabel || "—"}\nAmount: ${amountStr}\nReceipt No: ${receiptNo}`,
          type: "fee_payment",
          action_url: staffActionUrl,
        });
      }
      for (const uid of accountantIds) {
        recipientRows.push({
          user_id: uid,
          title: "Online Fee Payment Received",
          message: `Student: ${studentName}\nAmount: ${amountStr}\nReceipt No: ${receiptNo}`,
          type: "fee_payment",
          action_url: staffActionUrl,
        });
      }

      // Optional: class teacher
      const { data: orgSettings } = await supabase
        .from("organization_settings")
        .select("notify_class_teacher_on_payment")
        .eq("organization_id", order.organization_id)
        .maybeSingle();
      if (
        (orgSettings as { notify_class_teacher_on_payment?: boolean } | null)
          ?.notify_class_teacher_on_payment &&
        studentClass &&
        studentSection
      ) {
        const { data: ct } = await supabase
          .from("class_teachers")
          .select("teacher_id")
          .eq("organization_id", order.organization_id)
          .eq("class_name", studentClass)
          .eq("section_name", studentSection)
          .limit(1)
          .maybeSingle();
        const teacherId = (ct as { teacher_id?: string } | null)?.teacher_id;
        if (teacherId) {
          recipientRows.push({
            user_id: teacherId,
            title: "Fee Payment Completed",
            message: `Fee payment completed for student ${studentName}.`,
            type: "fee_payment",
            action_url: staffActionUrl,
          });
        }
      }

      if (recipientRows.length > 0) {
        await supabase.from("notifications").insert(
          recipientRows.map((r) => ({
            user_id: r.user_id,
            organization_id: order.organization_id,
            title: r.title,
            message: r.message,
            type: r.type,
            action_url: r.action_url,
            metadata: {
              receipt_number: receiptNo,
              fee_payment_id: feePaymentId,
              razorpay_payment_id,
              amount: payAmount,
            },
          })),
        );
      }

      await supabase.from("fee_notifications").insert({
        organization_id: order.organization_id,
        student_id: order.student_id,
        installment_id: order.installment_id,
        notification_type: "payment_success",
        channel: "in_app",
        delivery_status: "sent",
        sent_to: userId,
        message_body: `Receipt ${receiptNo} · ${amountStr}`,
      });

      const outboxRows = ["email", "sms", "whatsapp"].map((ch) => ({
        organization_id: order.organization_id,
        recipient_user_id: userId,
        event_type: `fee_payment_success.${ch}`,
        title: "Fee Payment Successful",
        body: `Student: ${studentName}\nAmount: ${amountStr}\nReceipt No: ${receiptNo}`,
        status: "queued",
        data: {
          channel: ch,
          receipt_number: receiptNo,
          fee_payment_id: feePaymentId,
          razorpay_payment_id,
          student_id: order.student_id,
        },
      }));
      await supabase.from("notification_outbox").insert(outboxRows);

      await supabase.from("fee_payment_audit_logs").insert({
        event: "FEE_PAYMENT_SUCCESS",
        organization_id: order.organization_id,
        student_id: order.student_id,
        parent_user_id: userId,
        fee_payment_id: feePaymentId,
        receipt_number: receiptNo,
        razorpay_payment_id,
        amount: payAmount,
        details: {
          installment_id: order.installment_id,
          term_number: term?.term_number ?? null,
          billing_type: billingType,
          allocations_count: allocations.length,
          recipients_notified: recipientRows.length,
        },
      });
    } catch (sideErr) {
      console.error("verify-payment side-effects failed", sideErr);
    }

    return json({ success: true, receipt_number: primaryReceipt });
  } catch (e) {
    console.error("verify-payment error", e);
    return json({ error: "Unable to verify payment. Please contact support." }, 500);
  }

});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
