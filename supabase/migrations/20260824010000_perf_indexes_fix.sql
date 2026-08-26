-- =========================================================================================
-- Migration: 20260824010000_perf_indexes_fix.sql
-- Description: Add composite indexes for missing sequential scans identified during profiling
-- =========================================================================================

-- Jobs table frequently queried by slug for public facing route
CREATE INDEX IF NOT EXISTS idx_jobs_slug ON public.jobs (slug);

-- Applications table frequently queried by job_id and status to calculate pipeline stats
CREATE INDEX IF NOT EXISTS idx_applications_job_id_status ON public.applications (job_id, status);

-- Candidate duplicate checking by email and phone
CREATE INDEX IF NOT EXISTS idx_candidates_email_phone ON public.candidates (email, phone);

-- Fetching applications by org id and ordering by applied_at
CREATE INDEX IF NOT EXISTS idx_applications_org_applied_at ON public.applications (organization_id, applied_at DESC);
