-- ============================================================
-- AI-RECRUIT360 DATABASE ARCHITECTURE MIGRATION (1/2)
-- Migration Version: 20260820000000
-- Title: Core Multi-Tenant Schema & Cross-Tenant Referential Integrity
-- ============================================================

-- Enable required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. USER PROFILES & ORGANIZATIONS MODEL
-- ============================================================

-- Application User Profile (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  job_title TEXT DEFAULT 'Recruitment Specialist',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Organizations Table (Tenants)
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Organization Memberships (Join table connecting auth.users to organizations with roles)
CREATE TABLE IF NOT EXISTS public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'recruiter', 'interviewer', 'viewer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uk_org_user UNIQUE (organization_id, user_id)
);

-- ============================================================
-- 2. RECRUITMENT POSITIONS (JOBS)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  department TEXT NOT NULL,
  location TEXT NOT NULL,
  employment_type TEXT NOT NULL CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'internship')),
  workplace_type TEXT NOT NULL DEFAULT 'hybrid' CHECK (workplace_type IN ('on_site', 'hybrid', 'remote')),
  description TEXT,
  requirements TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'closed')),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMPTZ,
  CONSTRAINT uk_jobs_id_org UNIQUE (id, organization_id)
);

-- ============================================================
-- 3. CANDIDATES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  location TEXT,
  headline TEXT,
  summary TEXT,
  linkedin_url TEXT,
  portfolio_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uk_org_candidate_email UNIQUE (organization_id, email),
  CONSTRAINT uk_candidates_id_org UNIQUE (id, organization_id)
);

-- ============================================================
-- 4. APPLICATIONS (Bridge between Jobs and Candidates)
-- Cross-Tenant Integrity: Composite FKs guarantee Job and Candidate belong to same Organization
-- ============================================================

CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  job_id UUID NOT NULL,
  candidate_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'applied' CHECK (status IN ('applied', 'screening', 'interview', 'evaluation', 'shortlisted', 'rejected', 'hired')),
  source TEXT NOT NULL DEFAULT 'direct',
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uk_job_candidate UNIQUE (job_id, candidate_id),
  CONSTRAINT uk_applications_id_org UNIQUE (id, organization_id),
  CONSTRAINT fk_apps_job_org FOREIGN KEY (job_id, organization_id) REFERENCES public.jobs(id, organization_id) ON DELETE CASCADE,
  CONSTRAINT fk_apps_cand_org FOREIGN KEY (candidate_id, organization_id) REFERENCES public.candidates(id, organization_id) ON DELETE CASCADE
);

-- ============================================================
-- 5. CANDIDATE DOCUMENTS (Metadata for Supabase Storage)
-- Cross-Tenant Integrity: Composite FKs guarantee Candidate and Application belong to same Organization
-- ============================================================

CREATE TABLE IF NOT EXISTS public.candidate_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL,
  application_id UUID,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  storage_path TEXT NOT NULL UNIQUE,
  file_size BIGINT NOT NULL,
  document_type TEXT NOT NULL DEFAULT 'resume' CHECK (document_type IN ('resume', 'cover_letter', 'portfolio', 'assessment', 'other')),
  processing_status TEXT NOT NULL DEFAULT 'uploaded' CHECK (processing_status IN ('uploaded', 'processing', 'processed', 'failed')),
  extracted_text TEXT,
  parser_version TEXT,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  CONSTRAINT uk_cand_docs_id_org UNIQUE (id, organization_id),
  CONSTRAINT fk_docs_cand_org FOREIGN KEY (candidate_id, organization_id) REFERENCES public.candidates(id, organization_id) ON DELETE CASCADE,
  CONSTRAINT fk_docs_app_org FOREIGN KEY (application_id, organization_id) REFERENCES public.applications(id, organization_id) ON DELETE SET NULL
);

-- ============================================================
-- 6. AI ANALYSIS & EVIDENCE DOMAIN
-- Cross-Tenant Integrity: Composite FKs guarantee Application and Source Document belong to same Organization
-- ============================================================

CREATE TABLE IF NOT EXISTS public.ai_candidate_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  application_id UUID NOT NULL,
  match_score INT CHECK (match_score BETWEEN 0 AND 100),
  skills_alignment JSONB NOT NULL DEFAULT '{}'::jsonb,
  experience_alignment JSONB NOT NULL DEFAULT '{}'::jsonb,
  education_alignment JSONB NOT NULL DEFAULT '{}'::jsonb,
  reasoning TEXT,
  recommendation TEXT CHECK (recommendation IN ('strong_match', 'potential_match', 'low_alignment', 'needs_review')),
  model_info JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uk_ai_analyses_id_org UNIQUE (id, organization_id),
  CONSTRAINT fk_ai_analyses_app_org FOREIGN KEY (application_id, organization_id) REFERENCES public.applications(id, organization_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.ai_analysis_evidences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  analysis_id UUID NOT NULL,
  source_document_id UUID,
  evidence_type TEXT NOT NULL,
  source_reference TEXT,
  content TEXT NOT NULL,
  relevance_score FLOAT CHECK (relevance_score BETWEEN 0 AND 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_evidences_analysis_org FOREIGN KEY (analysis_id, organization_id) REFERENCES public.ai_candidate_analyses(id, organization_id) ON DELETE CASCADE,
  CONSTRAINT fk_evidences_doc_org FOREIGN KEY (source_document_id, organization_id) REFERENCES public.candidate_documents(id, organization_id) ON DELETE SET NULL
);

-- ============================================================
-- 7. INTERVIEWS DOMAIN
-- Cross-Tenant Integrity: Composite FK guarantees Application belongs to same Organization
-- ============================================================

CREATE TABLE IF NOT EXISTS public.interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  application_id UUID NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 45,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  interview_type TEXT NOT NULL DEFAULT 'ai_adaptive' CHECK (interview_type IN ('ai_adaptive', 'technical', 'behavioral', 'screening')),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uk_interviews_id_org UNIQUE (id, organization_id),
  CONSTRAINT fk_interviews_app_org FOREIGN KEY (application_id, organization_id) REFERENCES public.applications(id, organization_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.interview_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id UUID NOT NULL REFERENCES public.interviews(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  category TEXT NOT NULL,
  question_order INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.interview_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.interview_questions(id) ON DELETE CASCADE,
  response_text TEXT,
  audio_storage_path TEXT,
  duration_seconds INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 8. EVALUATIONS DOMAIN
-- Cross-Tenant Integrity: Composite FKs guarantee Application and Interview belong to same Organization
-- ============================================================

CREATE TABLE IF NOT EXISTS public.evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  application_id UUID NOT NULL,
  interview_id UUID,
  evaluator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'completed')),
  overall_score INT CHECK (overall_score BETWEEN 0 AND 100),
  recommendation TEXT CHECK (recommendation IN ('strong_hire', 'hire', 'no_hire', 'strong_no_hire')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uk_evaluations_id_org UNIQUE (id, organization_id),
  CONSTRAINT fk_evaluations_app_org FOREIGN KEY (application_id, organization_id) REFERENCES public.applications(id, organization_id) ON DELETE CASCADE,
  CONSTRAINT fk_evaluations_interview_org FOREIGN KEY (interview_id, organization_id) REFERENCES public.interviews(id, organization_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS public.evaluation_criteria_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_id UUID NOT NULL REFERENCES public.evaluations(id) ON DELETE CASCADE,
  criteria_name TEXT NOT NULL,
  score INT NOT NULL CHECK (score BETWEEN 1 AND 5),
  notes TEXT
);

-- ============================================================
-- 9. AI ACTIVITY LOGS & SECURITY AUDIT DOMAIN
-- ============================================================

CREATE TABLE IF NOT EXISTS public.ai_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid(),
  event_type TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  status TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'warning', 'error', 'in_progress')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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
-- 10. INDEXING STRATEGY FOR HIGH QUERY PERFORMANCE
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_org_members_user_org ON public.organization_members(user_id, organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_org_role ON public.organization_members(organization_id, role);

CREATE INDEX IF NOT EXISTS idx_jobs_org_status ON public.jobs(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON public.jobs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_candidates_org_email ON public.candidates(organization_id, email);
CREATE INDEX IF NOT EXISTS idx_applications_org_job ON public.applications(organization_id, job_id);
CREATE INDEX IF NOT EXISTS idx_applications_candidate ON public.applications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(organization_id, status);

CREATE INDEX IF NOT EXISTS idx_documents_candidate ON public.candidate_documents(organization_id, candidate_id);
CREATE INDEX IF NOT EXISTS idx_documents_processing ON public.candidate_documents(processing_status);

CREATE INDEX IF NOT EXISTS idx_ai_analysis_app ON public.ai_candidate_analyses(organization_id, application_id);
CREATE INDEX IF NOT EXISTS idx_ai_evidence_analysis ON public.ai_analysis_evidences(organization_id, analysis_id);

CREATE INDEX IF NOT EXISTS idx_interviews_app_scheduled ON public.interviews(organization_id, application_id, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_evaluations_app ON public.evaluations(organization_id, application_id);

CREATE INDEX IF NOT EXISTS idx_ai_activity_org_created ON public.ai_activity_logs(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_audit_org_created ON public.security_audit_logs(organization_id, created_at DESC);

-- ============================================================
-- 11. AUTOMATIC PROFILE CREATION TRIGGER ON AUTH.USERS
-- ============================================================

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

-- ============================================================
-- 12. AUTOMATIC UPDATED_AT TRIGGER FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public, pg_temp;

CREATE TRIGGER tr_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER tr_organizations_updated BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER tr_jobs_updated BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER tr_candidates_updated BEFORE UPDATE ON public.candidates FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER tr_applications_updated BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER tr_ai_analyses_updated BEFORE UPDATE ON public.ai_candidate_analyses FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER tr_interviews_updated BEFORE UPDATE ON public.interviews FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER tr_evaluations_updated BEFORE UPDATE ON public.evaluations FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
