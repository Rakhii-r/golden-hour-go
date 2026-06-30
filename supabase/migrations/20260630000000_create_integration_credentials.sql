-- Creates the integration_credentials table used by razorpay-create-order and
-- razorpay-verify-payment edge functions to look up per-org payment keys.
CREATE TABLE IF NOT EXISTS public.integration_credentials (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  platform         text NOT NULL,
  credentials      jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at       timestamptz NOT NULL DEFAULT now(),

  UNIQUE (organization_id, platform)
);

ALTER TABLE public.integration_credentials ENABLE ROW LEVEL SECURITY;

-- Edge functions use the service-role key which bypasses RLS.
-- Block all other access so Razorpay secrets are never exposed to clients.
CREATE POLICY "deny_all_client_access" ON public.integration_credentials
  USING (false);
