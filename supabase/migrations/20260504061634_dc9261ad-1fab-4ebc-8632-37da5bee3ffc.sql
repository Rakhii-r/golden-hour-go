
CREATE TABLE IF NOT EXISTS public.razorpay_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  student_id UUID NOT NULL,
  installment_id UUID NOT NULL,
  razorpay_order_id TEXT NOT NULL UNIQUE,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'created',
  receipt TEXT,
  razorpay_payment_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rzp_orders_installment ON public.razorpay_orders(installment_id);
CREATE INDEX IF NOT EXISTS idx_rzp_orders_student ON public.razorpay_orders(student_id);
CREATE INDEX IF NOT EXISTS idx_rzp_orders_org ON public.razorpay_orders(organization_id);

ALTER TABLE public.razorpay_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Parents can view their own razorpay orders" ON public.razorpay_orders;
CREATE POLICY "Parents can view their own razorpay orders"
ON public.razorpay_orders
FOR SELECT
TO authenticated
USING (
  public.is_parent(auth.uid())
  AND student_id = public.get_parent_student_id(auth.uid())
);
