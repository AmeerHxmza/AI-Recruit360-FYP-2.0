-- Save AI evidence and its corresponding pipeline transition together.
BEGIN;
CREATE OR REPLACE FUNCTION public.save_screening_result(_application UUID, _result JSONB, _qualified BOOLEAN) RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE a public.applications;
BEGIN
 SELECT * INTO a FROM public.applications WHERE id=_application FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Application not found'; END IF;
 IF EXISTS(SELECT 1 FROM cv_screenings WHERE application_id=_application AND processing_status='completed') THEN RETURN; END IF;
 IF a.status NOT IN ('applied','screening','extraction_failed') THEN RAISE EXCEPTION 'Application is not eligible for screening'; END IF;
 INSERT INTO public.cv_screenings(application_id,organization_id,match_score,skills_score,experience_score,education_score,keyword_score,recommendation,matched_skills,missing_skills,matched_experience,missing_requirements,evidence,reasoning_summary,processing_status,completed_at)
 VALUES(a.id,a.organization_id,(_result->>'match_score')::numeric,(_result->>'skills_score')::numeric,(_result->>'experience_score')::numeric,(_result->>'education_score')::numeric,(_result->>'keyword_score')::numeric,_result->>'recommendation',_result->'matched_skills',_result->'missing_skills',_result->'matched_experience',_result->'missing_requirements',_result->'evidence',_result->>'reasoning_summary','completed',now())
 ON CONFLICT(application_id) DO UPDATE SET match_score=EXCLUDED.match_score, skills_score=EXCLUDED.skills_score, experience_score=EXCLUDED.experience_score, education_score=EXCLUDED.education_score, keyword_score=EXCLUDED.keyword_score, recommendation=EXCLUDED.recommendation,matched_skills=EXCLUDED.matched_skills,missing_skills=EXCLUDED.missing_skills,matched_experience=EXCLUDED.matched_experience,missing_requirements=EXCLUDED.missing_requirements,evidence=EXCLUDED.evidence,reasoning_summary=EXCLUDED.reasoning_summary,processing_status='completed',completed_at=now();
 UPDATE public.applications SET status=CASE WHEN _qualified THEN 'assessment' ELSE 'knocked_out' END, screening_completed_at=now() WHERE id=a.id;
END; $$;

CREATE OR REPLACE FUNCTION public.save_interview_response(_interview UUID, _question UUID, _response TEXT, _scores JSONB) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE i public.interviews; q public.interview_questions; existing public.interview_responses; answered INTEGER; average_score NUMERIC;
BEGIN
 SELECT * INTO i FROM public.interviews WHERE id=_interview FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Interview not found'; END IF;
 SELECT * INTO q FROM public.interview_questions WHERE id=_question AND interview_id=i.id;
 IF NOT FOUND THEN RAISE EXCEPTION 'Question does not belong to interview'; END IF;
 SELECT * INTO existing FROM public.interview_responses WHERE interview_id=i.id AND question_id=q.id;
 IF FOUND THEN RETURN jsonb_build_object('technical_score',existing.technical_score,'communication_score',existing.communication_score,'relevance_score',existing.relevance_score,'feedback',existing.ai_feedback); END IF;
 IF i.status NOT IN ('pending','in_progress') OR NOT EXISTS(SELECT 1 FROM public.applications WHERE id=i.application_id AND status='interview') THEN RAISE EXCEPTION 'Interview is not in progress'; END IF;
 IF EXISTS(SELECT 1 FROM public.interview_questions earlier WHERE earlier.interview_id=i.id AND earlier.question_number<q.question_number AND NOT EXISTS(SELECT 1 FROM public.interview_responses r WHERE r.question_id=earlier.id AND r.interview_id=i.id)) THEN RAISE EXCEPTION 'Answer previous question first'; END IF;
 IF length(trim(_response)) NOT BETWEEN 1 AND 5000 THEN RAISE EXCEPTION 'Answer must contain 1–5000 characters'; END IF;
 INSERT INTO public.interview_responses(interview_id,question_id,response_text,transcript,technical_score,communication_score,relevance_score,ai_feedback)
 VALUES(i.id,q.id,_response,_response,(_scores->>'technical_score')::numeric,(_scores->>'communication_score')::numeric,(_scores->>'relevance_score')::numeric,_scores->>'feedback');
 SELECT count(*),round(avg((technical_score+communication_score+relevance_score)/3),1) INTO answered,average_score FROM public.interview_responses WHERE interview_id=i.id;
 UPDATE public.interviews SET questions_answered=answered,overall_score=average_score,status=CASE WHEN answered>=total_questions THEN 'completed' ELSE 'in_progress' END,completed_at=CASE WHEN answered>=total_questions THEN now() ELSE NULL END WHERE id=i.id;
 RETURN _scores;
END; $$;
REVOKE ALL ON FUNCTION public.save_screening_result(UUID,JSONB,BOOLEAN) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.save_screening_result(UUID,JSONB,BOOLEAN) TO service_role;
REVOKE ALL ON FUNCTION public.save_interview_response(UUID,UUID,TEXT,JSONB) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.save_interview_response(UUID,UUID,TEXT,JSONB) TO service_role;
CREATE OR REPLACE FUNCTION public.save_final_evaluation(_application UUID,_result JSONB) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE a public.applications; existing public.final_evaluations;
BEGIN
 SELECT * INTO a FROM public.applications WHERE id=_application FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Application not found'; END IF;
 SELECT * INTO existing FROM public.final_evaluations WHERE application_id=a.id;
 IF FOUND THEN RETURN to_jsonb(existing); END IF;
 IF a.status <> 'interview' OR NOT EXISTS(SELECT 1 FROM public.interviews WHERE application_id=a.id AND status='completed') OR NOT EXISTS(SELECT 1 FROM public.assessments WHERE application_id=a.id AND status='completed') THEN RAISE EXCEPTION 'Complete the assessment and interview before evaluation'; END IF;
 INSERT INTO public.final_evaluations(organization_id,application_id,cv_score,assessment_score,interview_score,overall_score,recommendation,strengths,weaknesses,evidence,ai_summary)
 VALUES(a.organization_id,a.id,(_result->>'cv_score')::numeric,(_result->>'assessment_score')::numeric,(_result->>'interview_score')::numeric,(_result->>'overall_score')::numeric,_result->>'recommendation',_result->'strengths',_result->'weaknesses',_result->'evidence',_result->>'ai_summary');
 UPDATE public.applications SET status='evaluation',interview_completed_at=now(),finalized_at=now() WHERE id=a.id;
 RETURN _result;
END; $$;
REVOKE ALL ON FUNCTION public.save_final_evaluation(UUID,JSONB) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.save_final_evaluation(UUID,JSONB) TO service_role;
COMMIT;
