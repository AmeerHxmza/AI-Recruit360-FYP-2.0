-- ============================================================
-- AI-RECRUIT360 CANONICAL DATABASE SCHEMA
-- Purpose: Complete, self-contained schema for local & production deployment.
-- ============================================================

BEGIN;

-- ============================================================
-- 1. EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA extensions;

-- ============================================================
-- 2. HELPER FUNCTIONS
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 3. CORE ARCHITECTURE TABLES
-- ============================================================

-- 3.1 Recruiter Profiles (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  job_title TEXT DEFAULT 'Recruitment Specialist',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.2 Organizations Table
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.3 Organization Memberships
CREATE TABLE IF NOT EXISTS public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'recruiter', 'interviewer', 'viewer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uk_org_user UNIQUE (organization_id, user_id)
);

-- 3.4 Org Membership Helper Function
CREATE OR REPLACE FUNCTION public.is_org_member(_org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members
    WHERE organization_id = _org_id
      AND user_id = auth.uid()
  );
$$;

-- 3.5 Security Audit Logs
CREATE TABLE IF NOT EXISTS public.security_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid(),
  action TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 4. RECRUITMENT PIPELINE TABLES
-- ============================================================

-- 4.1 Jobs Table
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  department TEXT NOT NULL DEFAULT 'Engineering',
  location TEXT NOT NULL DEFAULT 'Remote',
  employment_type TEXT NOT NULL DEFAULT 'Full-time' CHECK (employment_type IN ('Full-time', 'Part-time', 'Contract', 'Internship')),
  experience_level TEXT NOT NULL DEFAULT 'Mid-Level' CHECK (experience_level IN ('Entry', 'Mid-Level', 'Senior', 'Lead', 'Executive')),
  description TEXT NOT NULL,
  requirements TEXT,
  responsibilities TEXT,
  skills_required JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'paused', 'closed')),
  screening_threshold NUMERIC(5,2) NOT NULL DEFAULT 50.00,
  assessment_threshold NUMERIC(5,2) NOT NULL DEFAULT 60.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uk_org_job_slug UNIQUE (organization_id, slug)
);

-- 4.2 Candidates Table
CREATE TABLE IF NOT EXISTS public.candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  portfolio_url TEXT,
  headline TEXT,
  summary TEXT,
  skills JSONB NOT NULL DEFAULT '[]'::jsonb,
  experience_years NUMERIC(4,1) DEFAULT 0.0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uk_org_candidate_email UNIQUE (organization_id, email)
);

-- 4.3 Applications Table
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'applied' CHECK (status IN (
    'applied', 'screening', 'assessment', 'interview', 'evaluation', 
    'shortlisted', 'hired', 'rejected', 'knocked_out', 'extraction_failed', 'assessment_failed'
  )),
  match_score NUMERIC(5,2),
  assessment_score NUMERIC(5,2),
  interview_score NUMERIC(5,2),
  overall_score NUMERIC(5,2),
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uk_job_candidate UNIQUE (job_id, candidate_id)
);

-- 4.4 Candidate Documents Table
CREATE TABLE IF NOT EXISTS public.candidate_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_size INT NOT NULL,
  file_type TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  extracted_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.5 CV Screenings Table
CREATE TABLE IF NOT EXISTS public.cv_screenings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  match_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  skills_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  experience_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  education_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  keyword_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  recommendation TEXT NOT NULL DEFAULT 'no_match' CHECK (recommendation IN ('strong_match', 'match', 'borderline', 'no_match')),
  matched_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
  missing_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
  matched_experience JSONB NOT NULL DEFAULT '[]'::jsonb,
  missing_requirements JSONB NOT NULL DEFAULT '[]'::jsonb,
  evidence JSONB NOT NULL DEFAULT '[]'::jsonb,
  reasoning_summary TEXT NOT NULL DEFAULT '',
  processing_status TEXT NOT NULL DEFAULT 'completed' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uk_screening_application UNIQUE (application_id)
);

-- 4.6 Assessments Table (MCQ Test Sessions)
CREATE TABLE IF NOT EXISTS public.assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'expired')),
  total_questions INT NOT NULL DEFAULT 10,
  score NUMERIC(5,2) DEFAULT 0.00,
  passed BOOLEAN DEFAULT FALSE,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uk_assessment_application UNIQUE (application_id)
);

-- 4.7 Assessment Questions Table
CREATE TABLE IF NOT EXISTS public.assessment_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  question_number INT NOT NULL,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL, -- Array of 4 options [{id: 'A', text: '...'}, ...]
  correct_option TEXT NOT NULL,
  explanation TEXT,
  skill_category TEXT NOT NULL DEFAULT 'General',
  difficulty TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uk_assessment_question_num UNIQUE (assessment_id, question_number)
);

-- 4.8 Assessment Answers Table
CREATE TABLE IF NOT EXISTS public.assessment_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.assessment_questions(id) ON DELETE CASCADE,
  selected_option TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  time_spent_seconds INT DEFAULT 0,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uk_assessment_question_answer UNIQUE (assessment_id, question_id)
);

-- 4.9 Interviews Table (Voice & LiveKit/Simli Sessions)
CREATE TABLE IF NOT EXISTS public.interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'abandoned')),
  overall_score NUMERIC(5,2) DEFAULT 0.00,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  transcript JSONB NOT NULL DEFAULT '[]'::jsonb,
  evaluation_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uk_interview_application UNIQUE (application_id)
);

-- 4.10 Interview Questions Table
CREATE TABLE IF NOT EXISTS public.interview_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id UUID NOT NULL REFERENCES public.interviews(id) ON DELETE CASCADE,
  question_number INT NOT NULL,
  question_text TEXT NOT NULL,
  focus_area TEXT NOT NULL DEFAULT 'General Technical',
  expected_competencies JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uk_interview_q_num UNIQUE (interview_id, question_number)
);

-- 4.11 Interview Responses Table
CREATE TABLE IF NOT EXISTS public.interview_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id UUID NOT NULL REFERENCES public.interviews(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.interview_questions(id) ON DELETE CASCADE,
  candidate_response_text TEXT NOT NULL,
  score NUMERIC(5,2) DEFAULT 0.00,
  feedback TEXT,
  evaluated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uk_interview_q_resp UNIQUE (interview_id, question_id)
);

-- 4.12 Final Evaluations Table
CREATE TABLE IF NOT EXISTS public.final_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  cv_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  assessment_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  interview_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  overall_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  recommendation TEXT NOT NULL DEFAULT 'hold' CHECK (recommendation IN ('hire', 'strong_consideration', 'hold', 'reject')),
  strengths JSONB NOT NULL DEFAULT '[]'::jsonb,
  weaknesses JSONB NOT NULL DEFAULT '[]'::jsonb,
  executive_summary TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uk_eval_application UNIQUE (application_id)
);

-- 4.13 AI Activity Logs Table
CREATE TABLE IF NOT EXISTS public.ai_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  application_id UUID REFERENCES public.applications(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 5. ATTACH UPDATED_AT TRIGGERS
-- ============================================================

DROP TRIGGER IF EXISTS tr_updated_at_profiles ON public.profiles;
CREATE TRIGGER tr_updated_at_profiles BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS tr_updated_at_organizations ON public.organizations;
CREATE TRIGGER tr_updated_at_organizations BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS tr_updated_at_jobs ON public.jobs;
CREATE TRIGGER tr_updated_at_jobs BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS tr_updated_at_candidates ON public.candidates;
CREATE TRIGGER tr_updated_at_candidates BEFORE UPDATE ON public.candidates FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS tr_updated_at_applications ON public.applications;
CREATE TRIGGER tr_updated_at_applications BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS tr_updated_at_assessments ON public.assessments;
CREATE TRIGGER tr_updated_at_assessments BEFORE UPDATE ON public.assessments FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS tr_updated_at_interviews ON public.interviews;
CREATE TRIGGER tr_updated_at_interviews BEFORE UPDATE ON public.interviews FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS tr_updated_at_final_evaluations ON public.final_evaluations;
CREATE TRIGGER tr_updated_at_final_evaluations BEFORE UPDATE ON public.final_evaluations FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ============================================================
-- 6. HIGH-PERFORMANCE INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_jobs_org_status_created ON public.jobs (organization_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_candidates_org_created ON public.candidates (organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_applications_org_status_applied ON public.applications (organization_id, status, applied_at DESC);
CREATE INDEX IF NOT EXISTS idx_applications_job_org ON public.applications (job_id, organization_id);
CREATE INDEX IF NOT EXISTS idx_cv_screenings_org_score ON public.cv_screenings (organization_id, match_score);
CREATE INDEX IF NOT EXISTS idx_ai_activity_org_created ON public.ai_activity_logs (organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_interviews_org_status ON public.interviews (organization_id, status);

-- ============================================================
-- 7. ATOMIC DASHBOARD AGGREGATION RPC
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_dashboard_summary(_org_id UUID)
RETURNS JSONB AS $$
DECLARE
  _result JSONB;
BEGIN
  IF NOT public.is_org_member(_org_id) THEN
    RAISE EXCEPTION 'Access denied to organization workspace data.';
  END IF;

  WITH dashboard_data AS (
    SELECT
      (SELECT COUNT(*) FROM public.jobs WHERE organization_id = _org_id AND status = 'active') AS active_jobs,
      (SELECT COUNT(*) FROM public.cv_screenings WHERE organization_id = _org_id) AS ai_analyses_count
  ),
  app_data AS (
    SELECT id, status, candidate_id
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
    SELECT COUNT(i.id) AS interview_count
    FROM public.interviews i
    JOIN filtered_apps a ON a.id = i.application_id
    WHERE i.status NOT IN ('abandoned', 'failed')
  ),
  ai_metrics AS (
    SELECT 
      COALESCE(ROUND(AVG(match_score)), 0) AS averageScore,
      COUNT(*) FILTER (WHERE match_score >= 85) AS strongMatches,
      COUNT(*) FILTER (WHERE match_score >= 70 AND match_score < 85) AS potentialMatches,
      COUNT(*) FILTER (WHERE match_score < 70) AS needsReview,
      COUNT(*) AS totalAnalyses
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

-- ============================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cv_screenings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.final_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_activity_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: Users manage their own profile
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (id = auth.uid());

-- Organizations: Members can view
CREATE POLICY "Members view org" ON public.organizations FOR SELECT USING (public.is_org_member(id));

-- Organization Members: Members view org members
CREATE POLICY "Members view org_members" ON public.organization_members FOR SELECT USING (public.is_org_member(organization_id));

-- Jobs: Org members manage, anyone can read active jobs (for candidate application portal)
CREATE POLICY "Public read active jobs" ON public.jobs FOR SELECT USING (status = 'active' OR public.is_org_member(organization_id));
CREATE POLICY "Org members manage jobs" ON public.jobs FOR ALL USING (public.is_org_member(organization_id));

-- Candidates: Org members read/update, service role inserts from apply portal
CREATE POLICY "Org candidate read" ON public.candidates FOR SELECT USING (public.is_org_member(organization_id));
CREATE POLICY "Org candidate update" ON public.candidates FOR UPDATE USING (public.is_org_member(organization_id));
CREATE POLICY "Service role candidate insert" ON public.candidates FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Applications: Org members read/update, service role inserts
CREATE POLICY "Org application read" ON public.applications FOR SELECT USING (public.is_org_member(organization_id));
CREATE POLICY "Org application update" ON public.applications FOR UPDATE USING (public.is_org_member(organization_id) OR auth.role() = 'service_role');
CREATE POLICY "Service role application insert" ON public.applications FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Candidate Documents: Org members read, service role all
CREATE POLICY "Org documents read" ON public.candidate_documents FOR SELECT USING (public.is_org_member(organization_id));
CREATE POLICY "Service role documents all" ON public.candidate_documents FOR ALL USING (auth.role() = 'service_role');

-- CV Screenings: Org members read, service role write
CREATE POLICY "Org screening read" ON public.cv_screenings FOR SELECT USING (public.is_org_member(organization_id));
CREATE POLICY "Service role screening write" ON public.cv_screenings FOR ALL USING (auth.role() = 'service_role');

-- Assessments & Questions: Org members read, service role write
CREATE POLICY "Org assessment read" ON public.assessments FOR SELECT USING (public.is_org_member(organization_id));
CREATE POLICY "Service role assessment write" ON public.assessments FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Org assessment questions read" ON public.assessment_questions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.assessments a WHERE a.id = assessment_id AND public.is_org_member(a.organization_id))
  OR auth.role() = 'service_role'
);
CREATE POLICY "Service role assessment questions write" ON public.assessment_questions FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role assessment answers write" ON public.assessment_answers FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Org assessment answers read" ON public.assessment_answers FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.assessments a WHERE a.id = assessment_id AND public.is_org_member(a.organization_id))
  OR auth.role() = 'service_role'
);

-- Interviews: Org members read, service role write
CREATE POLICY "Org interview read" ON public.interviews FOR SELECT USING (public.is_org_member(organization_id));
CREATE POLICY "Service role interview write" ON public.interviews FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Org interview questions read" ON public.interview_questions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.interviews i WHERE i.id = interview_id AND public.is_org_member(i.organization_id))
  OR auth.role() = 'service_role'
);
CREATE POLICY "Service role interview questions write" ON public.interview_questions FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Org interview responses read" ON public.interview_responses FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.interviews i WHERE i.id = interview_id AND public.is_org_member(i.organization_id))
  OR auth.role() = 'service_role'
);
CREATE POLICY "Service role interview responses write" ON public.interview_responses FOR ALL USING (auth.role() = 'service_role');

-- Final Evaluations: Org members read, service role write
CREATE POLICY "Org eval read" ON public.final_evaluations FOR SELECT USING (public.is_org_member(organization_id));
CREATE POLICY "Service role eval write" ON public.final_evaluations FOR ALL USING (auth.role() = 'service_role');

-- AI Activity Logs: Org members read, service role write
CREATE POLICY "Org activity read" ON public.ai_activity_logs FOR SELECT USING (public.is_org_member(organization_id));
CREATE POLICY "Service role activity write" ON public.ai_activity_logs FOR ALL USING (auth.role() = 'service_role');

COMMIT;
