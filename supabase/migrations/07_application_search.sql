BEGIN;
CREATE OR REPLACE FUNCTION public.search_workspace_applications(_org UUID,_stage TEXT DEFAULT 'All',_search TEXT DEFAULT '',_page INTEGER DEFAULT 1,_size INTEGER DEFAULT 50)
RETURNS SETOF JSONB LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path = public, pg_temp AS $$
BEGIN
 IF NOT public.is_org_member(_org) THEN RAISE EXCEPTION 'Workspace access denied'; END IF;
 RETURN QUERY SELECT to_jsonb(a)||jsonb_build_object('candidateName',c.full_name,'candidateEmail',c.email,'jobTitle',j.title,'jobDepartment',j.department)
 FROM public.applications a JOIN public.candidates c ON c.id=a.candidate_id AND c.organization_id=_org JOIN public.jobs j ON j.id=a.job_id AND j.organization_id=_org
 WHERE a.organization_id=_org AND (lower(_stage)='all' OR a.status=lower(_stage)) AND (trim(_search)='' OR position(lower(trim(_search)) IN lower(concat_ws(' ',c.full_name,c.email,j.title,j.department)))>0)
 ORDER BY a.applied_at DESC,a.id DESC LIMIT LEAST(GREATEST(_size,1),100) OFFSET ((GREATEST(_page,1)-1)::bigint*LEAST(GREATEST(_size,1),100));
END; $$;
REVOKE ALL ON FUNCTION public.search_workspace_applications(UUID,TEXT,TEXT,INTEGER,INTEGER) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.search_workspace_applications(UUID,TEXT,TEXT,INTEGER,INTEGER) TO authenticated;
COMMIT;
