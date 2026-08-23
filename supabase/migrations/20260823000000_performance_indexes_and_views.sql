-- ============================================================
-- AI-RECRUIT360 PERFORMANCE OPTIMIZATION & AGGREGATION MIGRATION
-- Migration Version: 20260823000000
-- ============================================================

BEGIN;

-- 1. HIGH-FREQUENCY COMPOSITE INDEXES FOR FAST FILTERING & SORTING
CREATE INDEX IF NOT EXISTS idx_jobs_org_status_created
  ON public.jobs (organization_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_candidates_org_created
  ON public.candidates (organization_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_applications_org_status_applied
  ON public.applications (organization_id, status, applied_at DESC);

CREATE INDEX IF NOT EXISTS idx_applications_job_org
  ON public.applications (job_id, organization_id);

CREATE INDEX IF NOT EXISTS idx_cv_screenings_org_score
  ON public.cv_screenings (organization_id, match_score);

CREATE INDEX IF NOT EXISTS idx_ai_activity_org_created
  ON public.ai_activity_logs (organization_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_interviews_org_status
  ON public.interviews (organization_id, status);

-- 2. ATOMIC DASHBOARD AGGREGATION RPC FUNCTION
-- Calculates metrics, funnel, recent applications, and AI summary in a single query execution.
CREATE OR REPLACE FUNCTION public.get_dashboard_summary(_org_id UUID)
RETURNS JSONB AS $$
DECLARE
  _active_jobs INT := 0;
  _total_candidates INT := 0;
  _total_applications INT := 0;
  _total_interviews INT := 0;
  _shortlisted_count INT := 0;
  _ai_analyses_count INT := 0;
  
  _funnel JSONB := '{}'::jsonb;
  _recent_apps JSONB := '[]'::jsonb;
  _ai_summary JSONB := '{}'::jsonb;
  _result JSONB;
BEGIN
  -- Verify caller membership
  IF NOT public.is_org_member(_org_id) THEN
    RAISE EXCEPTION 'Access denied to organization workspace data.';
  END IF;

  -- 1. Counts
  SELECT COUNT(*) INTO _active_jobs
  FROM public.jobs
  WHERE organization_id = _org_id AND status = 'active';

  SELECT COUNT(*) INTO _total_candidates
  FROM public.candidates
  WHERE organization_id = _org_id;

  SELECT COUNT(*) INTO _total_applications
  FROM public.applications
  WHERE organization_id = _org_id;

  SELECT COUNT(*) INTO _total_interviews
  FROM public.interviews
  WHERE organization_id = _org_id;

  SELECT COUNT(*) INTO _shortlisted_count
  FROM public.applications
  WHERE organization_id = _org_id AND status = 'shortlisted';

  SELECT COUNT(*) INTO _ai_analyses_count
  FROM public.cv_screenings
  WHERE organization_id = _org_id;

  -- 2. Funnel Stage Aggregation
  SELECT jsonb_build_object(
    'total', COUNT(*),
    'applied', COUNT(*) FILTER (WHERE status = 'applied'),
    'screening', COUNT(*) FILTER (WHERE status = 'screening'),
    'interview', COUNT(*) FILTER (WHERE status = 'interview'),
    'evaluation', COUNT(*) FILTER (WHERE status = 'evaluation'),
    'shortlisted', COUNT(*) FILTER (WHERE status = 'shortlisted'),
    'rejected', COUNT(*) FILTER (WHERE status = 'rejected'),
    'hired', COUNT(*) FILTER (WHERE status = 'hired')
  ) INTO _funnel
  FROM public.applications
  WHERE organization_id = _org_id;

  -- 3. Recent 5 Applications with Candidate & Job Details
  SELECT COALESCE(jsonb_agg(sub), '[]'::jsonb) INTO _recent_apps
  FROM (
    SELECT 
      a.id,
      a.status,
      a.applied_at AS "createdAt",
      COALESCE(c.full_name, 'Applicant') AS "candidateName",
      COALESCE(c.email, 'N/A') AS "candidateEmail",
      COALESCE(j.title, 'Job Position') AS "jobTitle"
    FROM public.applications a
    LEFT JOIN public.candidates c ON c.id = a.candidate_id
    LEFT JOIN public.jobs j ON j.id = a.job_id
    WHERE a.organization_id = _org_id
    ORDER BY a.applied_at DESC
    LIMIT 5
  ) sub;

  -- 4. AI Screening Metrics Summary
  SELECT jsonb_build_object(
    'averageScore', COALESCE(ROUND(AVG(match_score)), 0),
    'strongMatches', COUNT(*) FILTER (WHERE match_score >= 85),
    'potentialMatches', COUNT(*) FILTER (WHERE match_score >= 70 AND match_score < 85),
    'needsReview', COUNT(*) FILTER (WHERE match_score < 70),
    'totalAnalyses', COUNT(*)
  ) INTO _ai_summary
  FROM public.cv_screenings
  WHERE organization_id = _org_id;

  -- Build final JSON payload
  _result := jsonb_build_object(
    'metrics', jsonb_build_object(
      'activeJobs', _active_jobs,
      'totalCandidates', _total_candidates,
      'totalApplications', _total_applications,
      'totalInterviews', _total_interviews,
      'shortlistedCount', _shortlisted_count,
      'aiAnalysesCount', _ai_analyses_count
    ),
    'funnel', _funnel,
    'recentApplications', _recent_apps,
    'aiSummary', _ai_summary
  );

  RETURN _result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public, pg_temp;

GRANT EXECUTE ON FUNCTION public.get_dashboard_summary(UUID) TO anon, authenticated, service_role;

COMMIT;
