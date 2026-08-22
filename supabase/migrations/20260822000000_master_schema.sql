-- ============================================================
-- AI-RECRUIT360 MASTER PRODUCTION DATABASE MIGRATION
-- Migration Version: 20260822000000
-- Title: Self-Contained Multi-Tenant Architecture, Recruitment Pipeline & pgvector Engine
-- ============================================================

BEGIN;

-- ============================================================
-- 1. EXTENSIONS & CORE INFRASTRUCTURE
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA extensions;

-- 1.1 Application User Profiles (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  job_title TEXT DEFAULT 'Recruitment Specialist',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1.2 Organizations Table (Multi-tenant isolation boundary)
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1.3 Organization Memberships (RBAC mapping)
CREATE TABLE IF NOT EXISTS public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'recruiter', 'interviewer', 'viewer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uk_org_user UNIQUE (organization_id, user_id)
);

-- 1.4 Security Audit Logs
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
-- 2. HELPER FUNCTIONS & TRIGGERS
-- ============================================================

-- Updated At Trigger Handler
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public, pg_temp;

-- Automatic Profile Creation Trigger Handler
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, job_title)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'job_title', 'Recruitment Specialist')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS tr_on_auth_user_created_profile ON auth.users;
CREATE TRIGGER tr_on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();

-- Org Membership Helper
CREATE OR REPLACE FUNCTION public.is_org_member(_org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  IF _org_id IS NULL OR auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM public.organization_members
    WHERE organization_id = _org_id
      AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public, pg_temp;

-- Org Role Helper
CREATE OR REPLACE FUNCTION public.get_user_org_role(_org_id UUID)
RETURNS TEXT AS $$
DECLARE
  _role TEXT;
BEGIN
  IF _org_id IS NULL OR auth.uid() IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT role INTO _role
  FROM public.organization_members
  WHERE organization_id = _org_id
    AND user_id = auth.uid();
  RETURN _role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public, pg_temp;

-- Explicitly grant execute permissions on helper functions to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.is_org_member(UUID) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_user_org_role(UUID) TO anon, authenticated, service_role;

-- Atomic Organization Creation RPC
CREATE OR REPLACE FUNCTION public.create_organization(_name TEXT, _slug TEXT)
RETURNS public.organizations AS $$
DECLARE
  _org public.organizations;
  _user_id UUID;
BEGIN
  _user_id := auth.uid();
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to create an organization.';
  END IF;

  IF _name IS NULL OR length(trim(_name)) = 0 THEN
    RAISE EXCEPTION 'Organization name cannot be empty.';
  END IF;

  IF _slug IS NULL OR length(trim(_slug)) = 0 THEN
    RAISE EXCEPTION 'Organization slug cannot be empty.';
  END IF;

  -- Check if organization with this slug already exists
  SELECT * INTO _org FROM public.organizations WHERE slug = lower(trim(_slug));

  IF _org.id IS NOT NULL THEN
    -- Auto-attach user as owner if organization exists
    INSERT INTO public.organization_members (organization_id, user_id, role)
    VALUES (_org.id, _user_id, 'owner')
    ON CONFLICT (organization_id, user_id) DO UPDATE SET role = 'owner';

    RETURN _org;
  END IF;

  -- Insert new organization
  INSERT INTO public.organizations (name, slug, created_by)
  VALUES (trim(_name), lower(trim(_slug)), _user_id)
  RETURNING * INTO _org;

  INSERT INTO public.organization_members (organization_id, user_id, role)
  VALUES (_org.id, _user_id, 'owner')
  ON CONFLICT (organization_id, user_id) DO UPDATE SET role = 'owner';

  RETURN _org;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- ============================================================
-- 3. DROP CONFLICTING RECRUITMENT DOMAIN TABLES IN DEPENDENCY ORDER
-- ============================================================

DROP TABLE IF EXISTS public.evaluation_criteria_scores CASCADE;
DROP TABLE IF EXISTS public.evaluations CASCADE;
DROP TABLE IF EXISTS public.interview_responses CASCADE;
DROP TABLE IF EXISTS public.interview_questions CASCADE;
DROP TABLE IF EXISTS public.interviews CASCADE;
DROP TABLE IF EXISTS public.ai_analysis_evidences CASCADE;
DROP TABLE IF EXISTS public.ai_candidate_analyses CASCADE;
DROP TABLE IF EXISTS public.candidate_documents CASCADE;
DROP TABLE IF EXISTS public.final_evaluations CASCADE;
DROP TABLE IF EXISTS public.assessment_answers CASCADE;
DROP TABLE IF EXISTS public.assessment_questions CASCADE;
DROP TABLE IF EXISTS public.assessments CASCADE;
DROP TABLE IF EXISTS public.cv_screenings CASCADE;
DROP TABLE IF EXISTS public.applications CASCADE;
DROP TABLE IF EXISTS public.candidates CASCADE;
DROP TABLE IF EXISTS public.jobs CASCADE;
DROP TABLE IF EXISTS public.ai_activity_logs CASCADE;

-- ============================================================
-- 4. REBUILD RECRUITMENT DOMAIN TABLES (WITH PGVECTOR & OPENAI EMBEDDINGS)
-- ============================================================

-- 4.1 JOBS TABLE
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  department TEXT,
  location TEXT,
  employment_type TEXT CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'internship')),
  workplace_type TEXT DEFAULT 'hybrid' CHECK (workplace_type IN ('on_site', 'hybrid', 'remote')),
  description TEXT NOT NULL,
  requirements TEXT,
  responsibilities TEXT,
  qualifications TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'closed')),
  published_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  embedding vector(1536),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uk_jobs_org_slug UNIQUE (organization_id, slug),
  CONSTRAINT uk_jobs_id_org UNIQUE (id, organization_id)
);

-- 4.2 CANDIDATES TABLE
CREATE TABLE public.candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  location TEXT,
  linkedin_url TEXT,
  portfolio_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uk_candidates_id_org UNIQUE (id, organization_id)
);

-- 4.3 APPLICATIONS TABLE
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  job_id UUID NOT NULL,
  candidate_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'applied' CHECK (
    status IN (
      'applied', 'screening', 'knocked_out', 'assessment', 'assessment_failed',
      'interview', 'evaluation', 'shortlisted', 'rejected', 'hired'
    )
  ),
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  screening_started_at TIMESTAMPTZ,
  screening_completed_at TIMESTAMPTZ,
  assessment_started_at TIMESTAMPTZ,
  assessment_completed_at TIMESTAMPTZ,
  interview_started_at TIMESTAMPTZ,
  interview_completed_at TIMESTAMPTZ,
  finalized_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uk_applications_id_org UNIQUE (id, organization_id),
  CONSTRAINT fk_apps_job_org FOREIGN KEY (job_id, organization_id) REFERENCES public.jobs(id, organization_id) ON DELETE CASCADE,
  CONSTRAINT fk_apps_cand_org FOREIGN KEY (candidate_id, organization_id) REFERENCES public.candidates(id, organization_id) ON DELETE CASCADE
);

-- 4.4 CANDIDATE DOCUMENTS TABLE
CREATE TABLE public.candidate_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL,
  application_id UUID NOT NULL,
  document_type TEXT NOT NULL DEFAULT 'resume' CHECK (document_type IN ('resume', 'cover_letter', 'portfolio', 'other')),
  storage_path TEXT NOT NULL UNIQUE,
  original_filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  extracted_text TEXT,
  extraction_status TEXT NOT NULL DEFAULT 'pending' CHECK (extraction_status IN ('pending', 'processing', 'completed', 'failed')),
  embedding vector(1536),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uk_cand_docs_id_org UNIQUE (id, organization_id),
  CONSTRAINT fk_docs_cand_org FOREIGN KEY (candidate_id, organization_id) REFERENCES public.candidates(id, organization_id) ON DELETE CASCADE,
  CONSTRAINT fk_docs_app_org FOREIGN KEY (application_id, organization_id) REFERENCES public.applications(id, organization_id) ON DELETE CASCADE
);

-- 4.5 CV SCREENINGS TABLE
CREATE TABLE public.cv_screenings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  application_id UUID NOT NULL,
  match_score NUMERIC CHECK (match_score BETWEEN 0 AND 100),
  recommendation TEXT CHECK (recommendation IN ('strong_match', 'match', 'borderline', 'no_match')),
  skills_score NUMERIC CHECK (skills_score BETWEEN 0 AND 100),
  experience_score NUMERIC CHECK (experience_score BETWEEN 0 AND 100),
  education_score NUMERIC CHECK (education_score BETWEEN 0 AND 100),
  keyword_score NUMERIC CHECK (keyword_score BETWEEN 0 AND 100),
  vector_similarity_score DOUBLE PRECISION DEFAULT 0.0,
  matched_skills JSONB DEFAULT '[]'::jsonb,
  missing_skills JSONB DEFAULT '[]'::jsonb,
  matched_experience JSONB DEFAULT '[]'::jsonb,
  missing_requirements JSONB DEFAULT '[]'::jsonb,
  evidence JSONB DEFAULT '[]'::jsonb,
  reasoning_summary TEXT,
  model TEXT DEFAULT 'gpt-4o-mini',
  processing_status TEXT NOT NULL DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uk_cv_screenings_id_org UNIQUE (id, organization_id),
  CONSTRAINT fk_cv_screenings_app_org FOREIGN KEY (application_id, organization_id) REFERENCES public.applications(id, organization_id) ON DELETE CASCADE
);

-- 4.6 ASSESSMENTS TABLE
CREATE TABLE public.assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  application_id UUID NOT NULL,
  total_questions INTEGER DEFAULT 10 CHECK (total_questions = 10),
  correct_answers INTEGER DEFAULT 0 CHECK (correct_answers BETWEEN 0 AND 10),
  score INTEGER DEFAULT 0 CHECK (score BETWEEN 0 AND 100),
  percentage NUMERIC CHECK (percentage BETWEEN 0 AND 100),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'abandoned')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uk_assessments_id_org UNIQUE (id, organization_id),
  CONSTRAINT fk_assessments_app_org FOREIGN KEY (application_id, organization_id) REFERENCES public.applications(id, organization_id) ON DELETE CASCADE
);

-- 4.7 ASSESSMENT QUESTIONS TABLE
CREATE TABLE public.assessment_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  question_number INTEGER NOT NULL CHECK (question_number BETWEEN 1 AND 10),
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_option TEXT NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D')),
  explanation TEXT,
  skill_category TEXT,
  difficulty TEXT DEFAULT 'medium',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uk_assessment_q_num UNIQUE (assessment_id, question_number)
);

-- 4.8 ASSESSMENT ANSWERS TABLE
CREATE TABLE public.assessment_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.assessment_questions(id) ON DELETE CASCADE,
  selected_option TEXT NOT NULL CHECK (selected_option IN ('A', 'B', 'C', 'D')),
  is_correct BOOLEAN NOT NULL,
  time_taken_seconds INTEGER CHECK (time_taken_seconds BETWEEN 0 AND 30),
  answered_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uk_assessment_q_answer UNIQUE (assessment_id, question_id)
);

-- 4.9 INTERVIEWS TABLE
CREATE TABLE public.interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  application_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'abandoned')),
  interview_type TEXT NOT NULL DEFAULT 'ai_adaptive' CHECK (interview_type IN ('ai_adaptive', 'technical', 'behavioral')),
  total_questions INTEGER DEFAULT 5,
  questions_answered INTEGER DEFAULT 0,
  overall_score NUMERIC CHECK (overall_score BETWEEN 0 AND 100),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uk_interviews_id_org UNIQUE (id, organization_id),
  CONSTRAINT fk_interviews_app_org FOREIGN KEY (application_id, organization_id) REFERENCES public.applications(id, organization_id) ON DELETE CASCADE
);

-- 4.10 INTERVIEW QUESTIONS TABLE
CREATE TABLE public.interview_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id UUID NOT NULL REFERENCES public.interviews(id) ON DELETE CASCADE,
  question_number INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'technical',
  source TEXT NOT NULL DEFAULT 'cv' CHECK (source IN ('job', 'cv', 'previous_answer', 'adaptive')),
  skill_category TEXT,
  is_follow_up BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.11 INTERVIEW RESPONSES TABLE
CREATE TABLE public.interview_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id UUID NOT NULL REFERENCES public.interviews(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.interview_questions(id) ON DELETE CASCADE,
  response_text TEXT,
  audio_storage_path TEXT,
  transcript TEXT,
  technical_score NUMERIC CHECK (technical_score BETWEEN 0 AND 100),
  communication_score NUMERIC CHECK (communication_score BETWEEN 0 AND 100),
  relevance_score NUMERIC CHECK (relevance_score BETWEEN 0 AND 100),
  ai_feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.12 FINAL EVALUATIONS TABLE
CREATE TABLE public.final_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  application_id UUID NOT NULL,
  cv_score NUMERIC CHECK (cv_score BETWEEN 0 AND 100),
  assessment_score NUMERIC CHECK (assessment_score BETWEEN 0 AND 100),
  interview_score NUMERIC CHECK (interview_score BETWEEN 0 AND 100),
  overall_score NUMERIC CHECK (overall_score BETWEEN 0 AND 100),
  recommendation TEXT CHECK (recommendation IN ('strong_hire', 'hire', 'review', 'no_hire')),
  strengths JSONB DEFAULT '[]'::jsonb,
  weaknesses JSONB DEFAULT '[]'::jsonb,
  evidence JSONB DEFAULT '[]'::jsonb,
  ai_summary TEXT,
  model TEXT DEFAULT 'gpt-4o-mini',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uk_final_eval_id_org UNIQUE (id, organization_id),
  CONSTRAINT fk_final_eval_app_org FOREIGN KEY (application_id, organization_id) REFERENCES public.applications(id, organization_id) ON DELETE CASCADE
);

-- 4.13 AI ACTIVITY LOGS TABLE
CREATE TABLE public.ai_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  application_id UUID,
  job_id UUID,
  event_type TEXT NOT NULL CHECK (
    event_type IN (
      'job_analyzed', 'cv_extracted', 'cv_screened', 'candidate_knocked_out',
      'assessment_generated', 'assessment_completed', 'interview_started',
      'interview_question_generated', 'interview_evaluated', 'candidate_evaluated'
    )
  ),
  status TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'warning', 'error', 'in_progress')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. INDEXES & PGVECTOR HNSW SEARCH
-- ============================================================

CREATE INDEX idx_jobs_org_slug ON public.jobs(organization_id, slug);
CREATE INDEX idx_jobs_status ON public.jobs(organization_id, status);
CREATE INDEX idx_jobs_created_at ON public.jobs(created_at DESC);

CREATE INDEX idx_candidates_org_email ON public.candidates(organization_id, email);
CREATE INDEX idx_applications_org_job ON public.applications(organization_id, job_id);
CREATE INDEX idx_applications_candidate ON public.applications(candidate_id);
CREATE INDEX idx_applications_status ON public.applications(organization_id, status);

CREATE INDEX idx_cand_docs_app ON public.candidate_documents(organization_id, application_id);
CREATE INDEX idx_cv_screenings_app ON public.cv_screenings(organization_id, application_id);
CREATE INDEX idx_assessments_app ON public.assessments(organization_id, application_id);
CREATE INDEX idx_assessment_q_assessment ON public.assessment_questions(assessment_id);
CREATE INDEX idx_assessment_ans_assessment ON public.assessment_answers(assessment_id);

-- HNSW Vector Cosine Distance Indexing
CREATE INDEX IF NOT EXISTS jobs_embedding_hnsw_idx 
  ON public.jobs 
  USING hnsw (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS candidate_documents_embedding_hnsw_idx 
  ON public.candidate_documents 
  USING hnsw (embedding vector_cosine_ops);

-- ============================================================
-- 6. STORED PROCEDURE FOR VECTOR COSINE SIMILARITY MATCHING
-- ============================================================

CREATE OR REPLACE FUNCTION public.match_candidate_cv_to_job(
  target_job_id UUID,
  match_threshold DOUBLE PRECISION DEFAULT 0.5,
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  document_id UUID,
  candidate_id UUID,
  application_id UUID,
  original_filename TEXT,
  similarity DOUBLE PRECISION
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cd.id AS document_id,
    cd.candidate_id,
    cd.application_id,
    cd.original_filename,
    1 - (cd.embedding <=> j.embedding) AS similarity
  FROM public.candidate_documents cd
  CROSS JOIN public.jobs j
  WHERE j.id = target_job_id
    AND cd.embedding IS NOT NULL
    AND j.embedding IS NOT NULL
    AND (1 - (cd.embedding <=> j.embedding)) >= match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;

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

-- 7.0 CORE AUTH & ORGANIZATION RLS POLICIES
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Members can view their organization" ON public.organizations;
CREATE POLICY "Members can view their organization" ON public.organizations FOR SELECT USING (public.is_org_member(id) OR created_by = auth.uid());

DROP POLICY IF EXISTS "Authenticated users can create organization" ON public.organizations;
CREATE POLICY "Authenticated users can create organization" ON public.organizations FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Owners can update organization" ON public.organizations;
CREATE POLICY "Owners can update organization" ON public.organizations FOR UPDATE USING (public.get_user_org_role(id) IN ('owner', 'admin'));

DROP POLICY IF EXISTS "Members can view org membership list" ON public.organization_members;
CREATE POLICY "Members can view org membership list" ON public.organization_members FOR SELECT USING (user_id = auth.uid() OR public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Authenticated users can insert org membership" ON public.organization_members;
CREATE POLICY "Authenticated users can insert org membership" ON public.organization_members FOR INSERT WITH CHECK (user_id = auth.uid() OR public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Owners and Admins can manage org members" ON public.organization_members;
CREATE POLICY "Owners and Admins can manage org members" ON public.organization_members FOR ALL USING (public.get_user_org_role(organization_id) IN ('owner', 'admin'));

-- 7.1 PUBLIC CANDIDATE JOB VIEW POLICY
DROP POLICY IF EXISTS "Public can view active jobs" ON public.jobs;
DROP POLICY IF EXISTS "Public can view jobs" ON public.jobs;
CREATE POLICY "Public can view jobs" ON public.jobs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Members can view org jobs" ON public.jobs;
CREATE POLICY "Members can view org jobs" ON public.jobs FOR SELECT USING (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Recruiters can manage org jobs" ON public.jobs;
CREATE POLICY "Recruiters can manage org jobs" ON public.jobs FOR ALL USING (public.get_user_org_role(organization_id) IN ('owner', 'admin', 'recruiter'));

-- 7.2 CANDIDATE PORTAL DOMAIN POLICIES (Public Candidate Application & Assessment Flow)
DROP POLICY IF EXISTS "Public candidates insert" ON public.candidates;
DROP POLICY IF EXISTS "Public candidates select" ON public.candidates;
DROP POLICY IF EXISTS "Members can view org candidates" ON public.candidates;
DROP POLICY IF EXISTS "Recruiters can manage org candidates" ON public.candidates;
DROP POLICY IF EXISTS "Public candidate access" ON public.candidates;
CREATE POLICY "Public candidate access" ON public.candidates FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public applications insert" ON public.applications;
DROP POLICY IF EXISTS "Public applications select" ON public.applications;
DROP POLICY IF EXISTS "Members can view org applications" ON public.applications;
DROP POLICY IF EXISTS "Recruiters can manage org applications" ON public.applications;
DROP POLICY IF EXISTS "Public application access" ON public.applications;
CREATE POLICY "Public application access" ON public.applications FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public candidate documents insert" ON public.candidate_documents;
DROP POLICY IF EXISTS "Public candidate documents select" ON public.candidate_documents;
DROP POLICY IF EXISTS "Members can view candidate documents" ON public.candidate_documents;
DROP POLICY IF EXISTS "Recruiters can manage org candidate documents" ON public.candidate_documents;
DROP POLICY IF EXISTS "Public candidate document access" ON public.candidate_documents;
CREATE POLICY "Public candidate document access" ON public.candidate_documents FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Members can view cv screenings" ON public.cv_screenings;
DROP POLICY IF EXISTS "Recruiters can manage org CV screenings" ON public.cv_screenings;
DROP POLICY IF EXISTS "Public cv screening access" ON public.cv_screenings;
CREATE POLICY "Public cv screening access" ON public.cv_screenings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Members can view assessments" ON public.assessments;
DROP POLICY IF EXISTS "Recruiters can manage org assessments" ON public.assessments;
DROP POLICY IF EXISTS "Public assessment access" ON public.assessments;
CREATE POLICY "Public assessment access" ON public.assessments FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public view assessment questions" ON public.assessment_questions;
DROP POLICY IF EXISTS "Public assessment questions access" ON public.assessment_questions;
CREATE POLICY "Public assessment questions access" ON public.assessment_questions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public insert assessment answers" ON public.assessment_answers;
DROP POLICY IF EXISTS "Public assessment answers access" ON public.assessment_answers;
CREATE POLICY "Public assessment answers access" ON public.assessment_answers FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public interview access" ON public.interviews;
CREATE POLICY "Public interview access" ON public.interviews FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public interview questions access" ON public.interview_questions;
CREATE POLICY "Public interview questions access" ON public.interview_questions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public interview responses access" ON public.interview_responses;
CREATE POLICY "Public interview responses access" ON public.interview_responses FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public final evaluations access" ON public.final_evaluations;
CREATE POLICY "Public final evaluations access" ON public.final_evaluations FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public activity logs access" ON public.ai_activity_logs;
CREATE POLICY "Public activity logs access" ON public.ai_activity_logs FOR ALL USING (true) WITH CHECK (true);

COMMIT;
