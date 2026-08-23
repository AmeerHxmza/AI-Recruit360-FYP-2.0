-- Update the get_dashboard_summary RPC to filter out inactive/rejected applications
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

  -- Only count candidates who have at least one active application (not completely rejected/knocked out across all jobs)
  SELECT COUNT(DISTINCT a.candidate_id) INTO _total_candidates
  FROM public.applications a
  WHERE a.organization_id = _org_id 
    AND a.status NOT IN ('rejected', 'knocked_out', 'assessment_failed');

  SELECT COUNT(*) INTO _total_applications
  FROM public.applications
  WHERE organization_id = _org_id 
    AND status NOT IN ('rejected', 'knocked_out', 'assessment_failed');

  SELECT COUNT(*) INTO _total_interviews
  FROM public.interviews i
  JOIN public.applications a ON a.id = i.application_id
  WHERE a.organization_id = _org_id 
    AND a.status NOT IN ('rejected', 'knocked_out', 'assessment_failed')
    AND i.status NOT IN ('abandoned', 'failed');

  SELECT COUNT(*) INTO _shortlisted_count
  FROM public.applications
  WHERE organization_id = _org_id AND status = 'shortlisted';

  SELECT COUNT(*) INTO _ai_analyses_count
  FROM public.cv_screenings
  WHERE organization_id = _org_id;

  -- 2. Funnel Stage Aggregation (exclude negatives from total)
  SELECT jsonb_build_object(
    'total', COUNT(*),
    'applied', COUNT(*) FILTER (WHERE status = 'applied'),
    'screening', COUNT(*) FILTER (WHERE status = 'screening'),
    'interview', COUNT(*) FILTER (WHERE status = 'interview'),
    'evaluation', COUNT(*) FILTER (WHERE status = 'evaluation'),
    'shortlisted', COUNT(*) FILTER (WHERE status = 'shortlisted'),
    'hired', COUNT(*) FILTER (WHERE status = 'hired')
  ) INTO _funnel
  FROM public.applications
  WHERE organization_id = _org_id 
    AND status NOT IN ('rejected', 'knocked_out', 'assessment_failed');

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
      AND a.status NOT IN ('rejected', 'knocked_out', 'assessment_failed')
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
