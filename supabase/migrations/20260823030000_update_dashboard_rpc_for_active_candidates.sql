-- Update the get_dashboard_summary RPC to filter out inactive/rejected applications
CREATE OR REPLACE FUNCTION public.get_dashboard_summary(_org_id UUID)
RETURNS JSONB AS $$
DECLARE
  _result JSONB;
BEGIN
  -- Verify caller membership
  IF NOT public.is_org_member(_org_id) THEN
    RAISE EXCEPTION 'Access denied to organization workspace data.';
  END IF;

  WITH dashboard_data AS (
    SELECT
      (SELECT COUNT(*) FROM public.jobs WHERE organization_id = _org_id AND status = 'active') as active_jobs,
      (SELECT COUNT(*) FROM public.cv_screenings WHERE organization_id = _org_id) as ai_analyses_count
  ),
  app_data AS (
    SELECT 
      id,
      status, 
      candidate_id
    FROM public.applications
    WHERE organization_id = _org_id
  ),
  filtered_apps AS (
    SELECT * FROM app_data 
    WHERE status NOT IN ('rejected', 'knocked_out', 'assessment_failed')
  ),
  recent_apps AS (
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
      AND a.status NOT IN ('rejected', 'knocked_out', 'assessment_failed')
    ORDER BY a.applied_at DESC
    LIMIT 5
  ),
  interview_data AS (
    SELECT COUNT(i.id) as interview_count
    FROM public.interviews i
    JOIN filtered_apps a ON a.id = i.application_id
    WHERE i.status NOT IN ('abandoned', 'failed')
  ),
  ai_metrics AS (
    SELECT 
      COALESCE(ROUND(AVG(match_score)), 0) as averageScore,
      COUNT(*) FILTER (WHERE match_score >= 85) as strongMatches,
      COUNT(*) FILTER (WHERE match_score >= 70 AND match_score < 85) as potentialMatches,
      COUNT(*) FILTER (WHERE match_score < 70) as needsReview,
      COUNT(*) as totalAnalyses
    FROM public.cv_screenings
    WHERE organization_id = _org_id
  )
  SELECT jsonb_build_object(
    'metrics', jsonb_build_object(
      'activeJobs', (SELECT active_jobs FROM dashboard_data),
      'totalCandidates', (SELECT COUNT(DISTINCT candidate_id) FROM filtered_apps),
      'totalApplications', (SELECT COUNT(*) FROM filtered_apps),
      'totalInterviews', (SELECT interview_count FROM interview_data),
      'shortlistedCount', (SELECT COUNT(*) FROM app_data WHERE status = 'shortlisted'),
      'aiAnalysesCount', (SELECT ai_analyses_count FROM dashboard_data)
    ),
    'funnel', jsonb_build_object(
      'total', (SELECT COUNT(*) FROM filtered_apps),
      'applied', (SELECT COUNT(*) FROM filtered_apps WHERE status = 'applied'),
      'screening', (SELECT COUNT(*) FROM filtered_apps WHERE status = 'screening'),
      'interview', (SELECT COUNT(*) FROM filtered_apps WHERE status = 'interview'),
      'evaluation', (SELECT COUNT(*) FROM filtered_apps WHERE status = 'evaluation'),
      'shortlisted', (SELECT COUNT(*) FROM app_data WHERE status = 'shortlisted'),
      'hired', (SELECT COUNT(*) FROM filtered_apps WHERE status = 'hired')
    ),
    'recentApplications', COALESCE((SELECT jsonb_agg(r) FROM recent_apps r), '[]'::jsonb),
    'aiSummary', (SELECT jsonb_build_object(
      'averageScore', averageScore,
      'strongMatches', strongMatches,
      'potentialMatches', potentialMatches,
      'needsReview', needsReview,
      'totalAnalyses', totalAnalyses
    ) FROM ai_metrics)
  ) INTO _result;

  RETURN _result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public, pg_temp;
