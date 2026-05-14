-- Allow parents to view their child's organization, settings, and fee structure
CREATE POLICY "Parents can view their organization"
ON public.organizations
FOR SELECT
TO public
USING (public.is_parent(auth.uid()) AND id = public.get_parent_org_id(auth.uid()));

CREATE POLICY "Parents can view their organization settings"
ON public.organization_settings
FOR SELECT
TO public
USING (public.is_parent(auth.uid()) AND organization_id = public.get_parent_org_id(auth.uid()));

CREATE POLICY "Parents can view fee structure for their org"
ON public.fee_structure
FOR SELECT
TO public
USING (public.is_parent(auth.uid()) AND organization_id = public.get_parent_org_id(auth.uid()));