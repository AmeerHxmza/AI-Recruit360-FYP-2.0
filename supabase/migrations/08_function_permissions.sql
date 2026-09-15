-- Supabase grants some function privileges directly to API roles by default.
-- Revoke those grants explicitly, not only the inherited PUBLIC grant.
BEGIN;
ALTER FUNCTION public.handle_updated_at() SET search_path = public, pg_temp;
REVOKE EXECUTE ON FUNCTION public.handle_updated_at() FROM PUBLIC, anon, authenticated;

DROP POLICY IF EXISTS "Public active jobs" ON public.jobs;
CREATE POLICY "Anonymous active jobs" ON public.jobs FOR SELECT TO anon USING (status = 'active');
CREATE POLICY "Authenticated visible jobs" ON public.jobs FOR SELECT TO authenticated
USING (status = 'active' OR public.is_org_member(organization_id));

REVOKE EXECUTE ON FUNCTION public.create_organization(TEXT, TEXT) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_user_org_role(UUID) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_org_member(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_organization(TEXT, TEXT), public.get_user_org_role(UUID), public.is_org_member(UUID) TO authenticated, service_role;

-- Retain the original dashboard API for compatibility under caller RLS.
ALTER FUNCTION public.get_dashboard_summary(UUID) SECURITY INVOKER;
REVOKE EXECUTE ON FUNCTION public.get_dashboard_summary(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_dashboard_summary(UUID) TO authenticated, service_role;
COMMIT;
