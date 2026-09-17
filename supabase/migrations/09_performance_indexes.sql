-- ============================================================
-- Migration 09: High-Performance Indexes for Multi-Tenant RLS & Foreign Keys
-- ============================================================

-- 1. Accelerate is_org_member() RLS policy checks and session loading
CREATE INDEX IF NOT EXISTS idx_org_members_user_id 
  ON public.organization_members (user_id);

CREATE INDEX IF NOT EXISTS idx_org_members_org_user 
  ON public.organization_members (organization_id, user_id);

-- 2. Foreign Key & Join optimization for Candidate, Application & Pipeline queries
CREATE INDEX IF NOT EXISTS idx_applications_candidate_id 
  ON public.applications (candidate_id);

CREATE INDEX IF NOT EXISTS idx_candidate_documents_candidate_id 
  ON public.candidate_documents (candidate_id);

CREATE INDEX IF NOT EXISTS idx_final_evaluations_application_id 
  ON public.final_evaluations (application_id);

CREATE INDEX IF NOT EXISTS idx_interviews_application_id 
  ON public.interviews (application_id);

CREATE INDEX IF NOT EXISTS idx_assessments_application_id 
  ON public.assessments (application_id);
