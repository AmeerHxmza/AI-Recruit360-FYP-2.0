-- ============================================================================
-- Migration: Fix RLS Security Policies (Cross-Tenant Data Leak)
-- Version:   20260823020000
-- Severity:  CRITICAL — replaces USING (true) with proper org-scoped access
-- ============================================================================
--
-- Problem: Multiple tables had USING (true) / WITH CHECK (true) RLS policies,
-- meaning ANY authenticated user could read or write data from ANY organization.
-- This migration replaces those with proper scoped policies.
--
-- Architecture Decision:
-- Recruiter-facing tables  → auth.uid() must be a member of the org
-- Candidate-facing writes  → use service_role key from Next.js API routes only
-- Public read access       → kept where intentionally needed (e.g. public jobs)
-- ============================================================================

-- ── Helper: is_org_member function ──────────────────────────────────────────
-- Returns true if the currently authenticated user belongs to the organization.
CREATE OR REPLACE FUNCTION public.is_org_member(_org_id uuid)
RETURNS boolean
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

-- ── Candidates Table ─────────────────────────────────────────────────────────
-- Recruiters can only see candidates that belong to their organization.
-- Candidates submit applications via Next.js API route using service_role key.
DROP POLICY IF EXISTS "Public candidate access" ON public.candidates;
DROP POLICY IF EXISTS "Org candidate read access"  ON public.candidates;
DROP POLICY IF EXISTS "Org candidate write access" ON public.candidates;

-- Recruiters can read candidates in their org
CREATE POLICY "Org candidate read access" ON public.candidates
  FOR SELECT USING (public.is_org_member(organization_id));

-- Service role handles all inserts from the candidate portal (bypasses RLS)
CREATE POLICY "Service role candidate insert" ON public.candidates
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Recruiters can update candidates in their org only
CREATE POLICY "Org candidate update access" ON public.candidates
  FOR UPDATE USING (public.is_org_member(organization_id))
  WITH CHECK (public.is_org_member(organization_id));


-- ── Applications Table ───────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Public application access" ON public.applications;
DROP POLICY IF EXISTS "Org application read access"  ON public.applications;
DROP POLICY IF EXISTS "Org application write access" ON public.applications;

CREATE POLICY "Org application read access" ON public.applications
  FOR SELECT USING (public.is_org_member(organization_id));

-- Candidates submit applications via service_role key (Next.js API route)
CREATE POLICY "Service role application insert" ON public.applications
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Recruiters + service_role can update application status
CREATE POLICY "Org application update access" ON public.applications
  FOR UPDATE USING (
    public.is_org_member(organization_id) OR auth.role() = 'service_role'
  );


-- ── CV Screenings Table ──────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Public screening access"    ON public.cv_screenings;
DROP POLICY IF EXISTS "Org screening read access"  ON public.cv_screenings;
DROP POLICY IF EXISTS "Org screening write access" ON public.cv_screenings;

CREATE POLICY "Org screening read access" ON public.cv_screenings
  FOR SELECT USING (public.is_org_member(organization_id));

-- AI service writes via service_role key
CREATE POLICY "Service role screening write" ON public.cv_screenings
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');


-- ── Assessments Table ────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Public assessment access"    ON public.assessments;
DROP POLICY IF EXISTS "Org assessment read access"  ON public.assessments;
DROP POLICY IF EXISTS "Org assessment write access" ON public.assessments;

CREATE POLICY "Org assessment read access" ON public.assessments
  FOR SELECT USING (public.is_org_member(organization_id));

CREATE POLICY "Service role assessment write" ON public.assessments
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');


-- ── Assessment Questions Table ───────────────────────────────────────────────
DROP POLICY IF EXISTS "Public question access"         ON public.assessment_questions;
DROP POLICY IF EXISTS "Org question read access"        ON public.assessment_questions;
DROP POLICY IF EXISTS "Candidate question read access"  ON public.assessment_questions;

-- Recruiters can read questions from their org's assessments
CREATE POLICY "Org question read access" ON public.assessment_questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.assessments a
      WHERE a.id = assessment_id
        AND public.is_org_member(a.organization_id)
    )
  );

-- Candidates can read questions for their own assessment session (via service_role)
CREATE POLICY "Service role question access" ON public.assessment_questions
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');


-- ── Interviews Table ─────────────────────────────────────────────────
DROP POLICY IF EXISTS "Public interview access"    ON public.interviews;
DROP POLICY IF EXISTS "Org interview read access"  ON public.interviews;
DROP POLICY IF EXISTS "Org interview write access" ON public.interviews;

CREATE POLICY "Org interview read access" ON public.interviews
  FOR SELECT USING (public.is_org_member(organization_id));

CREATE POLICY "Service role interview write" ON public.interviews
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');


-- ── Final Evaluations Table ──────────────────────────────────────────────
DROP POLICY IF EXISTS "Public evaluation access"    ON public.final_evaluations;
DROP POLICY IF EXISTS "Org evaluation read access"  ON public.final_evaluations;

CREATE POLICY "Org evaluation read access" ON public.final_evaluations
  FOR SELECT USING (public.is_org_member(organization_id));

CREATE POLICY "Service role evaluation write" ON public.final_evaluations
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');


-- ── Grant execute permission on helper function ──────────────────────────────
GRANT EXECUTE ON FUNCTION public.is_org_member(uuid) TO authenticated;

-- ============================================================================
-- MANUAL ACTION REQUIRED:
-- 1. Verify your Next.js API route /api/py/* uses the service_role key
--    (SUPABASE_SERVICE_ROLE_KEY), NOT the anon key.
-- 2. Verify the FastAPI service uses SUPABASE_SERVICE_ROLE_KEY in its env vars.
-- 3. Test by logging in as a recruiter from Org A and trying to access Org B
--    data — it should return 0 rows.
-- ============================================================================
