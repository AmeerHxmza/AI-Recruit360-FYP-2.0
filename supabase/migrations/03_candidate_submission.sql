-- One transaction for candidate, application and document records.
BEGIN;
CREATE OR REPLACE FUNCTION public.submit_candidate_application(payload JSONB) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE job public.jobs; _candidate UUID; _application UUID; submission UUID := (payload->>'submission_key')::uuid;
BEGIN
 SELECT * INTO job FROM public.jobs WHERE id = (payload->>'job_id')::uuid AND status = 'active' FOR SHARE;
 IF NOT FOUND THEN RAISE EXCEPTION 'This job is no longer accepting applications'; END IF;
 -- A random submission key makes lost-response retries safe.
 SELECT id INTO _application FROM public.applications WHERE submission_key = submission AND job_id = job.id;
 IF FOUND THEN SELECT candidate_id INTO _candidate FROM public.applications WHERE id = _application; RETURN jsonb_build_object('application_id', _application, 'candidate_id', _candidate); END IF;
 INSERT INTO public.candidates(organization_id, full_name, email, phone, location, linkedin_url, portfolio_url)
 VALUES(job.organization_id, payload->>'full_name', lower(payload->>'email'), payload->>'phone', payload->>'location', payload->>'linkedin_url', payload->>'portfolio_url')
 ON CONFLICT(organization_id, email) DO NOTHING RETURNING id INTO _candidate;
 IF _candidate IS NULL THEN SELECT id INTO _candidate FROM public.candidates WHERE organization_id = job.organization_id AND email = lower(payload->>'email'); END IF;
 IF EXISTS(SELECT 1 FROM public.applications a WHERE a.job_id = job.id AND a.candidate_id = _candidate) THEN
   RAISE EXCEPTION 'An application already exists for this email and job. Please contact the recruitment team to resume it.';
 END IF;
 INSERT INTO public.applications(organization_id, job_id, candidate_id, status, submission_key)
 VALUES(job.organization_id, job.id, _candidate, 'applied', submission) RETURNING id INTO _application;
 INSERT INTO public.candidate_documents(organization_id, candidate_id, application_id, document_type, storage_path, original_filename, mime_type, file_size, extraction_status)
 VALUES(job.organization_id, _candidate, _application, 'resume', payload->>'storage_path', payload->>'original_filename', payload->>'mime_type', (payload->>'file_size')::integer, 'pending');
 RETURN jsonb_build_object('candidate_id', _candidate, 'application_id', _application);
END; $$;
REVOKE ALL ON FUNCTION public.submit_candidate_application(JSONB) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_candidate_application(JSONB) TO service_role;
COMMIT;
