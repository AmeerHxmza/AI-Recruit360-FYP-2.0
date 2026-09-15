-- Aggregate in PostgreSQL so totals are not truncated by the API row limit.
BEGIN;
CREATE OR REPLACE FUNCTION public.workspace_dashboard(_org UUID) RETURNS JSONB
LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path = public, pg_temp AS $$
DECLARE result JSONB;
BEGIN
 IF NOT public.is_org_member(_org) THEN RAISE EXCEPTION 'Workspace access denied'; END IF;
 WITH apps AS (SELECT * FROM public.applications WHERE organization_id=_org),
 screenings AS (SELECT * FROM public.cv_screenings WHERE organization_id=_org AND processing_status='completed'),
 sessions AS (SELECT * FROM public.interviews WHERE organization_id=_org),
 recent AS (
 SELECT a.id,a.candidate_id AS "candidateId",c.full_name AS "candidateName",c.email AS "candidateEmail",j.title AS "jobTitle",a.status,a.applied_at AS "createdAt",
 (SELECT s.match_score FROM screenings s WHERE s.application_id=a.id LIMIT 1) AS "cvMatch",
 (SELECT score FROM public.assessments WHERE application_id=a.id AND status='completed' LIMIT 1) AS "assessmentScore",
 (SELECT overall_score FROM sessions WHERE application_id=a.id AND status='completed' ORDER BY created_at DESC LIMIT 1) AS "interviewScore"
 FROM apps a JOIN public.candidates c ON c.id=a.candidate_id AND c.organization_id=_org JOIN public.jobs j ON j.id=a.job_id AND j.organization_id=_org
 ORDER BY a.applied_at DESC,a.id DESC LIMIT 8
 )
 SELECT jsonb_build_object(
 'metrics',jsonb_build_object('activeJobs',(SELECT count(*) FROM public.jobs WHERE organization_id=_org AND status='active'),'totalApplications',(SELECT count(*) FROM apps),'qualifiedCandidates',(SELECT count(*) FROM screenings WHERE recommendation IN ('match','strong_match')),'aiInterviews',(SELECT count(*) FROM sessions WHERE status IN ('pending','in_progress','completed'))),
 'funnel',jsonb_build_object('applied',(SELECT count(*) FROM apps),'screening',(SELECT count(*) FROM screenings),'assessment',(SELECT count(*) FROM public.assessments WHERE organization_id=_org),'interview',(SELECT count(DISTINCT application_id) FROM sessions),'evaluation',(SELECT count(*) FROM public.final_evaluations WHERE organization_id=_org),'shortlisted',(SELECT count(*) FROM apps WHERE status IN ('shortlisted','hired')),'rejected',(SELECT count(*) FROM apps WHERE status='rejected'),'knocked_out',(SELECT count(*) FROM apps WHERE status IN ('knocked_out','assessment_failed')),'total',(SELECT count(*) FROM apps)),
 'recentApplications',COALESCE((SELECT jsonb_agg(to_jsonb(recent)) FROM recent),'[]'::jsonb),
 'aiSummary',jsonb_build_object('totalScreened',(SELECT count(*) FROM screenings),'averageMatchScore',COALESCE((SELECT round(avg(match_score)) FROM screenings),0),'qualifiedCount',(SELECT count(*) FROM screenings WHERE recommendation IN ('match','strong_match')),'knockedOutCount',(SELECT count(*) FROM screenings WHERE recommendation IN ('no_match','borderline')))
 ) INTO result;
 RETURN result;
END; $$;
REVOKE ALL ON FUNCTION public.workspace_dashboard(UUID) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.workspace_dashboard(UUID) TO authenticated;
COMMIT;
