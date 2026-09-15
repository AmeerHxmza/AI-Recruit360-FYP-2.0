-- Additive FYP data-contract alignment. Run after 01_schema.sql.
-- Existing records and legacy columns are preserved. Review on a database copy first.
BEGIN;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS job_title TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.organization_members ADD COLUMN IF NOT EXISTS organization_id UUID;
ALTER TABLE public.organization_members ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE public.organization_members ADD COLUMN IF NOT EXISTS role TEXT;
ALTER TABLE public.organization_members ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS organization_id UUID;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS employment_type TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS workplace_type TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS requirements TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS responsibilities TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS qualifications TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS status TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS organization_id UUID;
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS portfolio_url TEXT;
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS organization_id UUID;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS job_id UUID;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS candidate_id UUID;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS status TEXT;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS applied_at TIMESTAMPTZ;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS screening_started_at TIMESTAMPTZ;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS screening_completed_at TIMESTAMPTZ;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS assessment_started_at TIMESTAMPTZ;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS assessment_completed_at TIMESTAMPTZ;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS interview_started_at TIMESTAMPTZ;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS interview_completed_at TIMESTAMPTZ;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS finalized_at TIMESTAMPTZ;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.candidate_documents ADD COLUMN IF NOT EXISTS organization_id UUID;
ALTER TABLE public.candidate_documents ADD COLUMN IF NOT EXISTS candidate_id UUID;
ALTER TABLE public.candidate_documents ADD COLUMN IF NOT EXISTS application_id UUID;
ALTER TABLE public.candidate_documents ADD COLUMN IF NOT EXISTS document_type TEXT;
ALTER TABLE public.candidate_documents ADD COLUMN IF NOT EXISTS storage_path TEXT;
ALTER TABLE public.candidate_documents ADD COLUMN IF NOT EXISTS original_filename TEXT;
ALTER TABLE public.candidate_documents ADD COLUMN IF NOT EXISTS mime_type TEXT;
ALTER TABLE public.candidate_documents ADD COLUMN IF NOT EXISTS file_size INTEGER;
ALTER TABLE public.candidate_documents ADD COLUMN IF NOT EXISTS extracted_text TEXT;
ALTER TABLE public.candidate_documents ADD COLUMN IF NOT EXISTS extraction_status TEXT;
ALTER TABLE public.candidate_documents ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.candidate_documents ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.cv_screenings ADD COLUMN IF NOT EXISTS organization_id UUID;
ALTER TABLE public.cv_screenings ADD COLUMN IF NOT EXISTS application_id UUID;
ALTER TABLE public.cv_screenings ADD COLUMN IF NOT EXISTS match_score NUMERIC;
ALTER TABLE public.cv_screenings ADD COLUMN IF NOT EXISTS recommendation TEXT;
ALTER TABLE public.cv_screenings ADD COLUMN IF NOT EXISTS skills_score NUMERIC;
ALTER TABLE public.cv_screenings ADD COLUMN IF NOT EXISTS experience_score NUMERIC;
ALTER TABLE public.cv_screenings ADD COLUMN IF NOT EXISTS education_score NUMERIC;
ALTER TABLE public.cv_screenings ADD COLUMN IF NOT EXISTS keyword_score NUMERIC;
ALTER TABLE public.cv_screenings ADD COLUMN IF NOT EXISTS matched_skills JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.cv_screenings ADD COLUMN IF NOT EXISTS missing_skills JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.cv_screenings ADD COLUMN IF NOT EXISTS matched_experience JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.cv_screenings ADD COLUMN IF NOT EXISTS missing_requirements JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.cv_screenings ADD COLUMN IF NOT EXISTS evidence JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.cv_screenings ADD COLUMN IF NOT EXISTS reasoning_summary TEXT;
ALTER TABLE public.cv_screenings ADD COLUMN IF NOT EXISTS model TEXT;
ALTER TABLE public.cv_screenings ADD COLUMN IF NOT EXISTS processing_status TEXT;
ALTER TABLE public.cv_screenings ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;
ALTER TABLE public.cv_screenings ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
ALTER TABLE public.cv_screenings ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.assessments ADD COLUMN IF NOT EXISTS organization_id UUID;
ALTER TABLE public.assessments ADD COLUMN IF NOT EXISTS application_id UUID;
ALTER TABLE public.assessments ADD COLUMN IF NOT EXISTS total_questions INTEGER;
ALTER TABLE public.assessments ADD COLUMN IF NOT EXISTS correct_answers INTEGER;
ALTER TABLE public.assessments ADD COLUMN IF NOT EXISTS score NUMERIC;
ALTER TABLE public.assessments ADD COLUMN IF NOT EXISTS percentage NUMERIC;
ALTER TABLE public.assessments ADD COLUMN IF NOT EXISTS status TEXT;
ALTER TABLE public.assessments ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;
ALTER TABLE public.assessments ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
ALTER TABLE public.assessments ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.assessments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.assessment_questions ADD COLUMN IF NOT EXISTS assessment_id UUID;
ALTER TABLE public.assessment_questions ADD COLUMN IF NOT EXISTS question_number INTEGER;
ALTER TABLE public.assessment_questions ADD COLUMN IF NOT EXISTS question TEXT;
ALTER TABLE public.assessment_questions ADD COLUMN IF NOT EXISTS option_a TEXT;
ALTER TABLE public.assessment_questions ADD COLUMN IF NOT EXISTS option_b TEXT;
ALTER TABLE public.assessment_questions ADD COLUMN IF NOT EXISTS option_c TEXT;
ALTER TABLE public.assessment_questions ADD COLUMN IF NOT EXISTS option_d TEXT;
ALTER TABLE public.assessment_questions ADD COLUMN IF NOT EXISTS correct_option TEXT;
ALTER TABLE public.assessment_questions ADD COLUMN IF NOT EXISTS explanation TEXT;
ALTER TABLE public.assessment_questions ADD COLUMN IF NOT EXISTS skill_category TEXT;
ALTER TABLE public.assessment_questions ADD COLUMN IF NOT EXISTS difficulty TEXT;
ALTER TABLE public.assessment_questions ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.assessment_answers ADD COLUMN IF NOT EXISTS assessment_id UUID;
ALTER TABLE public.assessment_answers ADD COLUMN IF NOT EXISTS question_id UUID;
ALTER TABLE public.assessment_answers ADD COLUMN IF NOT EXISTS selected_option TEXT;
ALTER TABLE public.assessment_answers ADD COLUMN IF NOT EXISTS is_correct BOOLEAN DEFAULT false;
ALTER TABLE public.assessment_answers ADD COLUMN IF NOT EXISTS time_taken_seconds INTEGER;
ALTER TABLE public.assessment_answers ADD COLUMN IF NOT EXISTS answered_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.interviews ADD COLUMN IF NOT EXISTS organization_id UUID;
ALTER TABLE public.interviews ADD COLUMN IF NOT EXISTS application_id UUID;
ALTER TABLE public.interviews ADD COLUMN IF NOT EXISTS status TEXT;
ALTER TABLE public.interviews ADD COLUMN IF NOT EXISTS interview_type TEXT;
ALTER TABLE public.interviews ADD COLUMN IF NOT EXISTS total_questions INTEGER;
ALTER TABLE public.interviews ADD COLUMN IF NOT EXISTS questions_answered INTEGER;
ALTER TABLE public.interviews ADD COLUMN IF NOT EXISTS overall_score NUMERIC;
ALTER TABLE public.interviews ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;
ALTER TABLE public.interviews ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
ALTER TABLE public.interviews ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.interviews ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.interview_questions ADD COLUMN IF NOT EXISTS interview_id UUID;
ALTER TABLE public.interview_questions ADD COLUMN IF NOT EXISTS question_number INTEGER;
ALTER TABLE public.interview_questions ADD COLUMN IF NOT EXISTS question_text TEXT;
ALTER TABLE public.interview_questions ADD COLUMN IF NOT EXISTS question_type TEXT;
ALTER TABLE public.interview_questions ADD COLUMN IF NOT EXISTS source TEXT;
ALTER TABLE public.interview_questions ADD COLUMN IF NOT EXISTS skill_category TEXT;
ALTER TABLE public.interview_questions ADD COLUMN IF NOT EXISTS is_follow_up BOOLEAN DEFAULT false;
ALTER TABLE public.interview_questions ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.interview_responses ADD COLUMN IF NOT EXISTS interview_id UUID;
ALTER TABLE public.interview_responses ADD COLUMN IF NOT EXISTS question_id UUID;
ALTER TABLE public.interview_responses ADD COLUMN IF NOT EXISTS response_text TEXT;
ALTER TABLE public.interview_responses ADD COLUMN IF NOT EXISTS audio_storage_path TEXT;
ALTER TABLE public.interview_responses ADD COLUMN IF NOT EXISTS transcript TEXT;
ALTER TABLE public.interview_responses ADD COLUMN IF NOT EXISTS technical_score NUMERIC;
ALTER TABLE public.interview_responses ADD COLUMN IF NOT EXISTS communication_score NUMERIC;
ALTER TABLE public.interview_responses ADD COLUMN IF NOT EXISTS relevance_score NUMERIC;
ALTER TABLE public.interview_responses ADD COLUMN IF NOT EXISTS ai_feedback TEXT;
ALTER TABLE public.interview_responses ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.final_evaluations ADD COLUMN IF NOT EXISTS organization_id UUID;
ALTER TABLE public.final_evaluations ADD COLUMN IF NOT EXISTS application_id UUID;
ALTER TABLE public.final_evaluations ADD COLUMN IF NOT EXISTS cv_score NUMERIC;
ALTER TABLE public.final_evaluations ADD COLUMN IF NOT EXISTS assessment_score NUMERIC;
ALTER TABLE public.final_evaluations ADD COLUMN IF NOT EXISTS interview_score NUMERIC;
ALTER TABLE public.final_evaluations ADD COLUMN IF NOT EXISTS overall_score NUMERIC;
ALTER TABLE public.final_evaluations ADD COLUMN IF NOT EXISTS recommendation TEXT;
ALTER TABLE public.final_evaluations ADD COLUMN IF NOT EXISTS strengths JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.final_evaluations ADD COLUMN IF NOT EXISTS weaknesses JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.final_evaluations ADD COLUMN IF NOT EXISTS evidence JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.final_evaluations ADD COLUMN IF NOT EXISTS ai_summary TEXT;
ALTER TABLE public.final_evaluations ADD COLUMN IF NOT EXISTS model TEXT;
ALTER TABLE public.final_evaluations ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.final_evaluations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.ai_activity_logs ADD COLUMN IF NOT EXISTS organization_id UUID;
ALTER TABLE public.ai_activity_logs ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE public.ai_activity_logs ADD COLUMN IF NOT EXISTS application_id UUID;
ALTER TABLE public.ai_activity_logs ADD COLUMN IF NOT EXISTS job_id UUID;
ALTER TABLE public.ai_activity_logs ADD COLUMN IF NOT EXISTS event_type TEXT;
ALTER TABLE public.ai_activity_logs ADD COLUMN IF NOT EXISTS status TEXT;
ALTER TABLE public.ai_activity_logs ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.ai_activity_logs ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.security_audit_logs ADD COLUMN IF NOT EXISTS organization_id UUID;
ALTER TABLE public.security_audit_logs ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE public.security_audit_logs ADD COLUMN IF NOT EXISTS action TEXT;
ALTER TABLE public.security_audit_logs ADD COLUMN IF NOT EXISTS ip_address TEXT;
ALTER TABLE public.security_audit_logs ADD COLUMN IF NOT EXISTS user_agent TEXT;
ALTER TABLE public.security_audit_logs ADD COLUMN IF NOT EXISTS details JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.security_audit_logs ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

ALTER TABLE public.assessment_questions ADD COLUMN IF NOT EXISTS presented_at TIMESTAMPTZ;
ALTER TABLE public.assessments ADD COLUMN IF NOT EXISTS error_message TEXT;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS submission_key UUID;
CREATE UNIQUE INDEX IF NOT EXISTS applications_submission_key ON public.applications(submission_key) WHERE submission_key IS NOT NULL;

-- Backfill legacy layouts only when those columns exist. The connected database
-- already uses the newer names; neither layout loses its existing records.
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='candidate_documents' AND column_name='file_name') THEN
   EXECUTE 'UPDATE public.candidate_documents SET original_filename=COALESCE(original_filename,file_name),mime_type=COALESCE(mime_type,file_type)';
   ALTER TABLE public.candidate_documents ALTER COLUMN file_name DROP NOT NULL;
   ALTER TABLE public.candidate_documents ALTER COLUMN file_type DROP NOT NULL;
 END IF;
 IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='assessment_questions' AND column_name='question_text') THEN
   EXECUTE 'UPDATE public.assessment_questions SET question=COALESCE(question,question_text),option_a=COALESCE(option_a,options->0->>''text''),option_b=COALESCE(option_b,options->1->>''text''),option_c=COALESCE(option_c,options->2->>''text''),option_d=COALESCE(option_d,options->3->>''text'')';
   ALTER TABLE public.assessment_questions ALTER COLUMN question_text DROP NOT NULL;
   ALTER TABLE public.assessment_questions ALTER COLUMN options DROP NOT NULL;
 END IF;
 IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='assessment_answers' AND column_name='time_spent_seconds') THEN
   EXECUTE 'UPDATE public.assessment_answers SET time_taken_seconds=COALESCE(time_taken_seconds,time_spent_seconds)';
 END IF;
 IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='interview_responses' AND column_name='candidate_response_text') THEN
   EXECUTE 'UPDATE public.interview_responses SET response_text=COALESCE(response_text,candidate_response_text),ai_feedback=COALESCE(ai_feedback,feedback)';
   ALTER TABLE public.interview_responses ALTER COLUMN candidate_response_text DROP NOT NULL;
 END IF;
 IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='final_evaluations' AND column_name='executive_summary') THEN
   EXECUTE 'UPDATE public.final_evaluations SET ai_summary=COALESCE(ai_summary,executive_summary)';
 END IF;
END; $$;
ALTER TABLE public.candidate_documents ALTER COLUMN application_id DROP NOT NULL;
ALTER TABLE public.assessments ADD COLUMN IF NOT EXISTS passed BOOLEAN;
UPDATE public.candidate_documents SET document_type=COALESCE(document_type,'resume'),extraction_status=COALESCE(extraction_status,CASE WHEN extracted_text IS NULL THEN 'pending' ELSE 'completed' END);
UPDATE public.assessments SET percentage = COALESCE(percentage, score), correct_answers = COALESCE(correct_answers, (SELECT count(*) FROM public.assessment_answers a WHERE a.assessment_id = assessments.id AND a.is_correct));
UPDATE public.interviews SET interview_type = COALESCE(interview_type, 'ai_adaptive'), total_questions = COALESCE(total_questions, 5), questions_answered = COALESCE(questions_answered, 0);
UPDATE public.ai_activity_logs SET status = COALESCE(status, 'success');
ALTER TABLE public.interviews ALTER COLUMN total_questions SET DEFAULT 5;
ALTER TABLE public.interviews ALTER COLUMN questions_answered SET DEFAULT 0;
ALTER TABLE public.interviews ALTER COLUMN interview_type SET DEFAULT 'ai_adaptive';
ALTER TABLE public.assessments ALTER COLUMN correct_answers SET DEFAULT 0;
ALTER TABLE public.ai_activity_logs ALTER COLUMN status SET DEFAULT 'success';
ALTER TABLE public.jobs ALTER COLUMN employment_type SET DEFAULT 'full_time';

-- Replace enum checks with values used by the actual application, retaining legacy values.
ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_employment_type_check;
UPDATE public.jobs SET employment_type = CASE employment_type WHEN 'Full-time' THEN 'full_time' WHEN 'Part-time' THEN 'part_time' WHEN 'Contract' THEN 'contract' WHEN 'Internship' THEN 'internship' ELSE employment_type END;
ALTER TABLE public.jobs ADD CONSTRAINT jobs_employment_type_check CHECK (employment_type IN ('full_time','part_time','contract','internship')) NOT VALID;
ALTER TABLE public.final_evaluations DROP CONSTRAINT IF EXISTS final_evaluations_recommendation_check;
ALTER TABLE public.final_evaluations ADD CONSTRAINT final_evaluations_recommendation_check CHECK (recommendation IN ('strong_hire','hire','review','no_hire','strong_no_hire','strong_consideration','hold','reject')) NOT VALID;
ALTER TABLE public.interviews DROP CONSTRAINT IF EXISTS interviews_status_check;
ALTER TABLE public.interviews ADD CONSTRAINT interviews_status_check CHECK (status IN ('pending','in_progress','completed','failed','abandoned','scheduled','cancelled','avatar_degraded')) NOT VALID;

-- Replace redundant single-column relationships so API joins stay unambiguous.
ALTER TABLE public.applications DROP CONSTRAINT IF EXISTS applications_job_id_fkey;
ALTER TABLE public.applications DROP CONSTRAINT IF EXISTS fk_apps_job_org;
ALTER TABLE public.applications DROP CONSTRAINT IF EXISTS fk_apps_candidate_org;
ALTER TABLE public.applications DROP CONSTRAINT IF EXISTS applications_candidate_id_fkey;
-- Verify parent/child relationships on new writes. NOT VALID preserves historical rows.
CREATE UNIQUE INDEX IF NOT EXISTS jobs_id_org_unique ON public.jobs(id, organization_id);
CREATE UNIQUE INDEX IF NOT EXISTS candidates_id_org_unique ON public.candidates(id, organization_id);
CREATE UNIQUE INDEX IF NOT EXISTS applications_id_org_unique ON public.applications(id, organization_id);
CREATE UNIQUE INDEX IF NOT EXISTS assessment_questions_id_session_unique ON public.assessment_questions(id, assessment_id);
CREATE UNIQUE INDEX IF NOT EXISTS interview_questions_id_session_unique ON public.interview_questions(id, interview_id);
ALTER TABLE public.applications ADD CONSTRAINT applications_job_tenant_fk FOREIGN KEY(job_id, organization_id) REFERENCES public.jobs(id, organization_id) ON DELETE CASCADE NOT VALID;
ALTER TABLE public.applications ADD CONSTRAINT applications_candidate_tenant_fk FOREIGN KEY(candidate_id, organization_id) REFERENCES public.candidates(id, organization_id) ON DELETE CASCADE NOT VALID;
ALTER TABLE public.assessment_answers ADD CONSTRAINT answers_question_session_fk FOREIGN KEY(question_id, assessment_id) REFERENCES public.assessment_questions(id, assessment_id) NOT VALID;
ALTER TABLE public.interview_responses ADD CONSTRAINT responses_question_session_fk FOREIGN KEY(question_id, interview_id) REFERENCES public.interview_questions(id, interview_id) NOT VALID;

CREATE OR REPLACE FUNCTION public.get_user_org_role(_org_id UUID) RETURNS TEXT
LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public, pg_temp AS $$
 SELECT role FROM public.organization_members WHERE organization_id = _org_id AND user_id = auth.uid() LIMIT 1;
$$;
CREATE OR REPLACE FUNCTION public.is_org_member(_org_id UUID) RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public, pg_temp AS $$
 SELECT EXISTS (SELECT 1 FROM public.organization_members WHERE organization_id = _org_id AND user_id = auth.uid());
$$;
CREATE OR REPLACE FUNCTION public.create_organization(_name TEXT, _slug TEXT) RETURNS public.organizations
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE result public.organizations;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
 IF length(trim(_name)) NOT BETWEEN 1 AND 100 OR _slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' OR length(_slug) NOT BETWEEN 3 AND 50 THEN RAISE EXCEPTION 'Invalid organization details'; END IF;
 INSERT INTO public.organizations(name, slug, created_by) VALUES(trim(_name), _slug, auth.uid()) RETURNING * INTO result;
 INSERT INTO public.organization_members(organization_id, user_id, role) VALUES(result.id, auth.uid(), 'owner');
 RETURN result;
END; $$;
REVOKE ALL ON FUNCTION public.create_organization(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_organization(TEXT, TEXT) TO authenticated;

-- Replace project-table policies as a set so older permissive policies cannot
-- silently override the role rules. This changes access rules, not stored records.
DO $$ DECLARE p RECORD; BEGIN
 FOR p IN SELECT tablename,policyname FROM pg_policies WHERE schemaname='public' AND tablename=ANY(ARRAY['profiles','organizations','organization_members','jobs','candidates','applications','candidate_documents','cv_screenings','assessments','assessment_questions','assessment_answers','interviews','interview_questions','interview_responses','final_evaluations','ai_activity_logs','security_audit_logs']) LOOP
   EXECUTE format('DROP POLICY %I ON public.%I',p.policyname,p.tablename);
 END LOOP;
END; $$;
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
ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own profile read" ON public.profiles FOR SELECT TO authenticated USING(id=auth.uid());
CREATE POLICY "Own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK(id=auth.uid());
CREATE POLICY "Own profile update" ON public.profiles FOR UPDATE TO authenticated USING(id=auth.uid()) WITH CHECK(id=auth.uid());
CREATE POLICY "Members read organization" ON public.organizations FOR SELECT TO authenticated USING(public.is_org_member(id));
CREATE POLICY "Owners update organization" ON public.organizations FOR UPDATE TO authenticated USING(public.get_user_org_role(id) IN ('owner','admin')) WITH CHECK(public.get_user_org_role(id) IN ('owner','admin'));
CREATE POLICY "Members read memberships" ON public.organization_members FOR SELECT TO authenticated USING(public.is_org_member(organization_id));
CREATE POLICY "Public active jobs" ON public.jobs FOR SELECT USING(status='active' OR public.is_org_member(organization_id));
CREATE POLICY "Members read candidates" ON public.candidates FOR SELECT TO authenticated USING(public.is_org_member(organization_id));
CREATE POLICY "Members read applications" ON public.applications FOR SELECT TO authenticated USING(public.is_org_member(organization_id));
CREATE POLICY "Members read candidate_documents" ON public.candidate_documents FOR SELECT TO authenticated USING(public.is_org_member(organization_id));
CREATE POLICY "Members read cv_screenings" ON public.cv_screenings FOR SELECT TO authenticated USING(public.is_org_member(organization_id));
CREATE POLICY "Members read assessments" ON public.assessments FOR SELECT TO authenticated USING(public.is_org_member(organization_id));
CREATE POLICY "Members read interviews" ON public.interviews FOR SELECT TO authenticated USING(public.is_org_member(organization_id));
CREATE POLICY "Members read final_evaluations" ON public.final_evaluations FOR SELECT TO authenticated USING(public.is_org_member(organization_id));
CREATE POLICY "Members read ai_activity_logs" ON public.ai_activity_logs FOR SELECT TO authenticated USING(public.is_org_member(organization_id));
CREATE POLICY "Recruiters manage jobs" ON public.jobs FOR ALL TO authenticated USING(public.get_user_org_role(organization_id) IN ('owner','admin','recruiter')) WITH CHECK(public.get_user_org_role(organization_id) IN ('owner','admin','recruiter'));
CREATE POLICY "Recruiters manage candidates" ON public.candidates FOR ALL TO authenticated USING(public.get_user_org_role(organization_id) IN ('owner','admin','recruiter')) WITH CHECK(public.get_user_org_role(organization_id) IN ('owner','admin','recruiter'));
CREATE POLICY "Recruiters manage applications" ON public.applications FOR ALL TO authenticated USING(public.get_user_org_role(organization_id) IN ('owner','admin','recruiter')) WITH CHECK(public.get_user_org_role(organization_id) IN ('owner','admin','recruiter'));
CREATE POLICY "Recruiters manage candidate_documents" ON public.candidate_documents FOR ALL TO authenticated USING(public.get_user_org_role(organization_id) IN ('owner','admin','recruiter')) WITH CHECK(public.get_user_org_role(organization_id) IN ('owner','admin','recruiter'));
CREATE POLICY "Members read assessment_questions" ON public.assessment_questions FOR SELECT TO authenticated USING(EXISTS(SELECT 1 FROM public.assessments p WHERE p.id=assessment_id AND public.is_org_member(p.organization_id)));
CREATE POLICY "Members read assessment_answers" ON public.assessment_answers FOR SELECT TO authenticated USING(EXISTS(SELECT 1 FROM public.assessments p WHERE p.id=assessment_id AND public.is_org_member(p.organization_id)));
CREATE POLICY "Members read interview_questions" ON public.interview_questions FOR SELECT TO authenticated USING(EXISTS(SELECT 1 FROM public.interviews p WHERE p.id=interview_id AND public.is_org_member(p.organization_id)));
CREATE POLICY "Members read interview_responses" ON public.interview_responses FOR SELECT TO authenticated USING(EXISTS(SELECT 1 FROM public.interviews p WHERE p.id=interview_id AND public.is_org_member(p.organization_id)));
CREATE POLICY "Members record activity" ON public.ai_activity_logs FOR INSERT TO authenticated WITH CHECK(public.is_org_member(organization_id));
CREATE POLICY "Owners read audit" ON public.security_audit_logs FOR SELECT TO authenticated USING(public.get_user_org_role(organization_id) IN ('owner','admin'));

INSERT INTO storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
VALUES ('candidate_documents','candidate_documents',false,10485760, ARRAY['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document','text/plain'])
ON CONFLICT(id) DO NOTHING;
CREATE POLICY "Members read resume files" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'candidate_documents' AND public.is_org_member((storage.foldername(name))[1]::uuid));
CREATE POLICY "Recruiters upload resume files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'candidate_documents' AND public.get_user_org_role((storage.foldername(name))[1]::uuid) IN ('owner','admin','recruiter'));
CREATE POLICY "Recruiters update resume files" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'candidate_documents' AND public.get_user_org_role((storage.foldername(name))[1]::uuid) IN ('owner','admin','recruiter')) WITH CHECK (bucket_id = 'candidate_documents' AND public.get_user_org_role((storage.foldername(name))[1]::uuid) IN ('owner','admin','recruiter'));
COMMIT;
