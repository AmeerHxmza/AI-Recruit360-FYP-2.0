-- ============================================================
-- AI-RECRUIT360 DATABASE ARCHITECTURE MIGRATION (2/2)
-- Migration Version: 20260820000001
-- Title: Hardened Row Level Security (RLS), Atomic Org Bootstrap & Storage Security
-- ============================================================

-- ============================================================
-- 1. HARDENED SECURITY HELPER FUNCTIONS
-- ============================================================

-- Helper: Check if current authenticated user is an active member of an organization
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

GRANT EXECUTE ON FUNCTION public.is_org_member(UUID) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.is_org_member(UUID) FROM anon, public;

-- Helper: Get user's role in a specific organization
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

GRANT EXECUTE ON FUNCTION public.get_user_org_role(UUID) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.get_user_org_role(UUID) FROM anon, public;

-- ============================================================
-- 2. ATOMIC ORGANIZATION CREATION BOOTSTRAP FUNCTION
-- ============================================================

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

  -- 1. Create Organization (created_by is bound to auth.uid())
  INSERT INTO public.organizations (name, slug, created_by)
  VALUES (trim(_name), lower(trim(_slug)), _user_id)
  RETURNING * INTO _org;

  -- 2. Atomically create Creator Membership as Owner
  INSERT INTO public.organization_members (organization_id, user_id, role)
  VALUES (_org.id, _user_id, 'owner');

  RETURN _org;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

GRANT EXECUTE ON FUNCTION public.create_organization(TEXT, TEXT) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.create_organization(TEXT, TEXT) FROM anon, public;

-- ============================================================
-- 3. ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_candidate_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_analysis_evidences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluation_criteria_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 4. PROFILES POLICIES
-- ============================================================

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- ============================================================
-- 5. ORGANIZATIONS POLICIES
-- Direct client INSERT is disabled; creation MUST happen via create_organization() RPC
-- ============================================================

CREATE POLICY "Members can view their organization"
  ON public.organizations FOR SELECT
  USING (public.is_org_member(id));

CREATE POLICY "Owners and Admins can update organization"
  ON public.organizations FOR UPDATE
  USING (public.get_user_org_role(id) IN ('owner', 'admin'));

-- ============================================================
-- 6. ORGANIZATION MEMBERS POLICIES
-- Direct client INSERT is disabled for non-owners/admins; bootstrapper RPC handles creation
-- ============================================================

CREATE POLICY "Members can view org membership list"
  ON public.organization_members FOR SELECT
  USING (public.is_org_member(organization_id));

CREATE POLICY "Owners and Admins can manage org members"
  ON public.organization_members FOR ALL
  USING (public.get_user_org_role(organization_id) IN ('owner', 'admin'));

-- ============================================================
-- 7. JOBS POLICIES
-- ============================================================

CREATE POLICY "Members can view org jobs"
  ON public.jobs FOR SELECT
  USING (public.is_org_member(organization_id));

CREATE POLICY "Recruiters, Admins, and Owners can create/update jobs"
  ON public.jobs FOR ALL
  USING (public.get_user_org_role(organization_id) IN ('owner', 'admin', 'recruiter'));

-- ============================================================
-- 8. CANDIDATES POLICIES
-- ============================================================

CREATE POLICY "Members can view org candidates"
  ON public.candidates FOR SELECT
  USING (public.is_org_member(organization_id));

CREATE POLICY "Recruiters, Admins, and Owners can manage candidates"
  ON public.candidates FOR ALL
  USING (public.get_user_org_role(organization_id) IN ('owner', 'admin', 'recruiter'));

-- ============================================================
-- 9. APPLICATIONS POLICIES
-- ============================================================

CREATE POLICY "Members can view org applications"
  ON public.applications FOR SELECT
  USING (public.is_org_member(organization_id));

CREATE POLICY "Recruiters, Admins, and Owners can manage applications"
  ON public.applications FOR ALL
  USING (public.get_user_org_role(organization_id) IN ('owner', 'admin', 'recruiter'));

-- ============================================================
-- 10. CANDIDATE DOCUMENTS POLICIES
-- ============================================================

CREATE POLICY "Members can view org candidate documents"
  ON public.candidate_documents FOR SELECT
  USING (public.is_org_member(organization_id));

CREATE POLICY "Recruiters, Admins, and Owners can manage candidate documents"
  ON public.candidate_documents FOR ALL
  USING (public.get_user_org_role(organization_id) IN ('owner', 'admin', 'recruiter'));

-- ============================================================
-- 11. AI CANDIDATE ANALYSIS & EVIDENCE POLICIES
-- Read-only for org members; written exclusively by trusted server-side background processes
-- ============================================================

CREATE POLICY "Members can view org AI candidate analyses"
  ON public.ai_candidate_analyses FOR SELECT
  USING (public.is_org_member(organization_id));

CREATE POLICY "Members can view org AI analysis evidences"
  ON public.ai_analysis_evidences FOR SELECT
  USING (public.is_org_member(organization_id));

-- ============================================================
-- 12. INTERVIEWS, QUESTIONS & RESPONSES POLICIES
-- Child entities derive organization boundaries via parent interviews table
-- ============================================================

CREATE POLICY "Members can view org interviews"
  ON public.interviews FOR SELECT
  USING (public.is_org_member(organization_id));

CREATE POLICY "Interviewers, Recruiters, Admins, and Owners can manage interviews"
  ON public.interviews FOR ALL
  USING (public.get_user_org_role(organization_id) IN ('owner', 'admin', 'recruiter', 'interviewer'));

CREATE POLICY "Members can view interview questions"
  ON public.interview_questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.interviews i
      WHERE i.id = interview_id
        AND public.is_org_member(i.organization_id)
    )
  );

CREATE POLICY "Interviewers, Recruiters, Admins, Owners can manage interview questions"
  ON public.interview_questions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.interviews i
      WHERE i.id = interview_id
        AND public.get_user_org_role(i.organization_id) IN ('owner', 'admin', 'recruiter', 'interviewer')
    )
  );

CREATE POLICY "Members can view interview responses"
  ON public.interview_responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.interview_questions q
      JOIN public.interviews i ON i.id = q.interview_id
      WHERE q.id = question_id
        AND public.is_org_member(i.organization_id)
    )
  );

CREATE POLICY "Interviewers, Recruiters, Admins, Owners can manage interview responses"
  ON public.interview_responses FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.interview_questions q
      JOIN public.interviews i ON i.id = q.interview_id
      WHERE q.id = question_id
        AND public.get_user_org_role(i.organization_id) IN ('owner', 'admin', 'recruiter', 'interviewer')
    )
  );

-- ============================================================
-- 13. EVALUATIONS & CRITERIA POLICIES
-- ============================================================

CREATE POLICY "Members can view org evaluations"
  ON public.evaluations FOR SELECT
  USING (public.is_org_member(organization_id));

CREATE POLICY "Interviewers, Recruiters, Admins, and Owners can manage evaluations"
  ON public.evaluations FOR ALL
  USING (public.get_user_org_role(organization_id) IN ('owner', 'admin', 'recruiter', 'interviewer'));

CREATE POLICY "Members can view evaluation criteria scores"
  ON public.evaluation_criteria_scores FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.evaluations e
      WHERE e.id = evaluation_id
        AND public.is_org_member(e.organization_id)
    )
  );

CREATE POLICY "Interviewers, Recruiters, Admins, Owners can manage evaluation criteria scores"
  ON public.evaluation_criteria_scores FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.evaluations e
      WHERE e.id = evaluation_id
        AND public.get_user_org_role(e.organization_id) IN ('owner', 'admin', 'recruiter', 'interviewer')
    )
  );

-- ============================================================
-- 14. AI ACTIVITY LOGS & SECURITY AUDIT POLICIES
-- Client INSERT is disabled; logs are generated by trusted server endpoints
-- ============================================================

CREATE POLICY "Members can view org AI activity logs"
  ON public.ai_activity_logs FOR SELECT
  USING (public.is_org_member(organization_id));

CREATE POLICY "Owners and Admins can view security audit logs"
  ON public.security_audit_logs FOR SELECT
  USING (public.get_user_org_role(organization_id) IN ('owner', 'admin'));

-- ============================================================
-- 15. SUPABASE STORAGE SECURITY POLICIES (IMMUTABLE FILES)
-- Path format: {organization_id}/{candidate_id}/{filename}
-- Validates both organization_id membership AND candidate_id organization ownership!
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'candidate-documents',
  'candidate-documents',
  false,
  20971520, -- 20MB limit
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/png', 'image/jpeg']
)
ON CONFLICT (id) DO NOTHING;

-- RLS Policy: Read candidate document if user is org member AND candidate belongs to org
CREATE POLICY "Org members can read candidate documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'candidate-documents'
    AND EXISTS (
      SELECT 1 FROM public.candidates c
      WHERE c.id = (storage.foldername(name))[2]::uuid
        AND c.organization_id = (storage.foldername(name))[1]::uuid
        AND public.is_org_member(c.organization_id)
    )
  );

-- RLS Policy: Upload document if candidate belongs to org AND user has recruiter/admin/owner role
CREATE POLICY "Recruiters can upload candidate documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'candidate-documents'
    AND EXISTS (
      SELECT 1 FROM public.candidates c
      WHERE c.id = (storage.foldername(name))[2]::uuid
        AND c.organization_id = (storage.foldername(name))[1]::uuid
        AND public.get_user_org_role(c.organization_id) IN ('owner', 'admin', 'recruiter')
    )
  );

-- RLS Policy: Delete candidate document
CREATE POLICY "Recruiters can delete candidate documents"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'candidate-documents'
    AND EXISTS (
      SELECT 1 FROM public.candidates c
      WHERE c.id = (storage.foldername(name))[2]::uuid
        AND c.organization_id = (storage.foldername(name))[1]::uuid
        AND public.get_user_org_role(c.organization_id) IN ('owner', 'admin', 'recruiter')
    )
  );

-- NOTE: No UPDATE policy is defined. Candidate documents are IMMUTABLE.
