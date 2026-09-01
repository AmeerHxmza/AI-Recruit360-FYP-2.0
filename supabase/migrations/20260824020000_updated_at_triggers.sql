-- ============================================================================
-- Migration: Add missing updated_at triggers
-- Version:   20260824020000
-- ============================================================================

-- Ensure the helper function exists
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at trigger to jobs
DROP TRIGGER IF EXISTS tr_updated_at_jobs ON public.jobs;
CREATE TRIGGER tr_updated_at_jobs
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Add updated_at trigger to candidates
DROP TRIGGER IF EXISTS tr_updated_at_candidates ON public.candidates;
CREATE TRIGGER tr_updated_at_candidates
  BEFORE UPDATE ON public.candidates
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Add updated_at trigger to applications
DROP TRIGGER IF EXISTS tr_updated_at_applications ON public.applications;
CREATE TRIGGER tr_updated_at_applications
  BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Add updated_at trigger to assessments
DROP TRIGGER IF EXISTS tr_updated_at_assessments ON public.assessments;
CREATE TRIGGER tr_updated_at_assessments
  BEFORE UPDATE ON public.assessments
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Add updated_at trigger to interviews
DROP TRIGGER IF EXISTS tr_updated_at_interviews ON public.interviews;
CREATE TRIGGER tr_updated_at_interviews
  BEFORE UPDATE ON public.interviews
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Add updated_at trigger to final_evaluations
DROP TRIGGER IF EXISTS tr_updated_at_final_evaluations ON public.final_evaluations;
CREATE TRIGGER tr_updated_at_final_evaluations
  BEFORE UPDATE ON public.final_evaluations
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
