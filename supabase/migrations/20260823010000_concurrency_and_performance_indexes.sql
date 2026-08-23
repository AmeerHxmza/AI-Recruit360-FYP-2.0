-- 20260823010000_concurrency_and_performance_indexes.sql
-- AI-Recruit360 Phase 5: High-Concurrency & Duplicate Prevention Database Migration

BEGIN;

-- 1. Deduplicate applications (Keep newest application per job_id & candidate_id)
DELETE FROM public.applications a
USING public.applications b
WHERE a.job_id = b.job_id 
  AND a.candidate_id = b.candidate_id 
  AND a.created_at < b.created_at;

-- 2. Deduplicate assessments (Keep newest assessment per application_id)
DELETE FROM public.assessments a
USING public.assessments b
WHERE a.application_id = b.application_id 
  AND a.created_at < b.created_at;

-- 3. Deduplicate interviews (Keep newest interview per application_id)
DELETE FROM public.interviews a
USING public.interviews b
WHERE a.application_id = b.application_id 
  AND a.created_at < b.created_at;

-- 4. Deduplicate cv_screenings (Keep newest cv_screening per application_id)
DELETE FROM public.cv_screenings a
USING public.cv_screenings b
WHERE a.application_id = b.application_id 
  AND a.created_at < b.created_at;

-- 5. Unique Candidate Application Constraint (Prevents duplicate applications per job position)
CREATE UNIQUE INDEX IF NOT EXISTS uk_applications_job_candidate 
  ON public.applications (job_id, candidate_id);

-- 6. Unique Assessment Per Application Constraint
CREATE UNIQUE INDEX IF NOT EXISTS uk_assessments_application 
  ON public.assessments (application_id);

-- 7. Unique Interview Per Application Constraint
CREATE UNIQUE INDEX IF NOT EXISTS uk_interviews_application 
  ON public.interviews (application_id);

-- 8. Unique CV Screening Per Application Constraint
CREATE UNIQUE INDEX IF NOT EXISTS uk_cv_screenings_application 
  ON public.cv_screenings (application_id);

-- 9. Additional Performance Indexes for Keyset Pagination & Filtering
CREATE INDEX IF NOT EXISTS idx_candidates_org_email 
  ON public.candidates (organization_id, email);

CREATE INDEX IF NOT EXISTS idx_candidates_org_phone 
  ON public.candidates (organization_id, phone);

CREATE INDEX IF NOT EXISTS idx_applications_job_status 
  ON public.applications (job_id, status);

CREATE INDEX IF NOT EXISTS idx_assessment_questions_ass_num 
  ON public.assessment_questions (assessment_id, question_number);

CREATE INDEX IF NOT EXISTS idx_interview_questions_int_num 
  ON public.interview_questions (interview_id, question_number);

COMMIT;
