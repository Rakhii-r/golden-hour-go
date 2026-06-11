## Fee Receipt & Notification System — Implementation Plan

Building on existing infrastructure (`fee_payments`, `fee_payment_receipt_view`, `notifications`, `fee_notifications`, `notification_outbox`). No new payment tables.

### Part A — Database (single migration)

1. **Audit log table** `fee_payment_audit_logs` (event, student_id, parent_user_id, organization_id, amount, receipt_number, razorpay_payment_id, fee_payment_id, details jsonb, created_at) + GRANTs + RLS (admin/accountant read in org, service_role all).
2. **Teacher-notification toggle** column on `organization_settings`: `notify_class_teacher_on_payment boolean default false`.
3. **RLS helper**: ensure parents can SELECT their own rows in `notifications` (already exists per audit) and can SELECT `fee_payment_receipt_view` for their student — add a SELECT policy on the view's underlying tables if missing (verify only; skip if covered).
4. No changes to `fee_payments`, `fee_notifications`, `notification_outbox`.

### Part B — Edge function `razorpay-verify-payment`

After successful payment insert, in a best-effort block (failures logged, never block success response):

- Resolve student → class/section, parent user_id(s) from `parent_accounts`, admin/accountant users via `user_roles` for the org, optional class teacher via `class_teachers` when toggle on.
- Insert one `notifications` row per recipient (parent, admins, accountants, optional teacher) with title/message/type=`fee_payment`, action_url=`/parent/fees?receipt={receipt_number}` for parent and `/admin/fees/payments/{id}` for staff.
- Insert `fee_notifications` row tagged `payment_success`.
- Insert `notification_outbox` rows for `email` (parent), `sms` (parent), `whatsapp` (parent), status=`queued`. No dispatch.
- Insert `fee_payment_audit_logs` row.

### Part C — Receipt UI (Parent Portal)

- New component `src/components/parent/FeeReceipt.tsx` — branded A4 layout using `fee_payment_receipt_view` data: school name + logo (from `organizations`), receipt no, txn id, date, student, admission no, class/section, parent name, fee head, term, amount, payment method, academic year, QR (txn id).
- New component `src/components/parent/FeeReceiptDialog.tsx` — modal wrapper with **View / Download PDF / Print** actions. PDF via `html2canvas` + `jspdf` (add deps).
- `src/routes/parent.fees.tsx`:
  - Recent Transactions table → add Action column (View / PDF / Print) per row.
  - Add 4th tab **Receipts** with table `Receipt No | Date | Amount | Term | Status | Action`.
  - After Razorpay success callback → auto-open receipt dialog with the new `receipt_number`.

### Part D — Admin Portal

- Add **Fee Payment Activity** section to existing admin fees page (locate during implementation): list latest `fee_payment_receipt_view` rows for org with Student / Parent / Amount / Receipt No / Date / Method, click → receipt dialog.

### Part E — Accountant Portal

- Add **Online Payments** view filtered to `payment_mode='razorpay'`: Receipt No / Student / Amount / Status / Txn ID + download.

### Part F — Test cases (manual)

1. Pay via Razorpay → receipt dialog appears with correct data.
2. PDF download produces valid file with school branding.
3. Print opens system dialog with receipt layout.
4. Parent sees notification row + Receipts tab entry.
5. Admin + accountant users see notification + payment in their portal.
6. With teacher toggle ON, class teacher gets notification; OFF, no row.
7. `notification_outbox` has 3 queued rows (email/sms/whatsapp) per payment.
8. `fee_payment_audit_logs` row exists with correct ids.
9. Re-verify of same payment (idempotency) does not duplicate notifications.

### Technical notes

- PDF deps: `jspdf`, `html2canvas`.
- All notification inserts wrapped in try/catch — never fail the verify response.
- Idempotency: notifications only inserted on first (non-duplicate) verification.
- Admin/accountant admin pages: I'll inspect existing routes during build to add sections in the right place rather than create new routes.

Proceed?