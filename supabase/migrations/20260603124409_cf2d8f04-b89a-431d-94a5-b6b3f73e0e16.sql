
CREATE POLICY "Parents can view their organization"
ON public.organizations
FOR SELECT
TO authenticated
USING (id = public.get_parent_org_id(auth.uid()));

CREATE POLICY "Parents can view their org settings"
ON public.organization_settings
FOR SELECT
TO authenticated
USING (organization_id = public.get_parent_org_id(auth.uid()));
