BEGIN;
ALTER TABLE public.assessment_answers DROP CONSTRAINT IF EXISTS assessment_answers_selected_option_check;
ALTER TABLE public.assessment_answers ADD CONSTRAINT assessment_answers_selected_option_check CHECK(selected_option IN ('A','B','C','D','TIMEOUT')) NOT VALID;

CREATE OR REPLACE FUNCTION public.record_assessment_answer(_assessment UUID, _question UUID, _option TEXT) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE a public.assessments; q public.assessment_questions; existing public.assessment_answers; elapsed INTEGER;
BEGIN
 SELECT * INTO a FROM public.assessments WHERE id = _assessment FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Assessment not found'; END IF;
 SELECT * INTO q FROM public.assessment_questions WHERE id = _question AND assessment_id = _assessment;
 IF NOT FOUND THEN RAISE EXCEPTION 'Question does not belong to this assessment'; END IF;
 SELECT * INTO existing FROM public.assessment_answers WHERE assessment_id = _assessment AND question_id = _question;
 IF FOUND THEN RETURN jsonb_build_object('status','recorded','question_number',q.question_number,'timed_out',existing.time_taken_seconds > 65); END IF;
 IF a.status <> 'in_progress' THEN RAISE EXCEPTION 'Assessment is not in progress'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.applications WHERE id=a.application_id AND status='assessment') THEN RAISE EXCEPTION 'Application is no longer in assessment'; END IF;
 IF q.presented_at IS NULL THEN RAISE EXCEPTION 'Question has not been presented'; END IF;
 IF EXISTS(SELECT 1 FROM public.assessment_questions earlier WHERE earlier.assessment_id = _assessment AND earlier.question_number < q.question_number AND NOT EXISTS(SELECT 1 FROM public.assessment_answers answer WHERE answer.question_id = earlier.id AND answer.assessment_id = _assessment)) THEN RAISE EXCEPTION 'Answer the previous question first'; END IF;
 IF _option IS NULL OR _option NOT IN ('A','B','C','D','TIMEOUT') THEN RAISE EXCEPTION 'Invalid answer'; END IF;
 elapsed := GREATEST(0, floor(extract(epoch from (now() - q.presented_at))));
 INSERT INTO public.assessment_answers(assessment_id,question_id,selected_option,is_correct,time_taken_seconds)
 VALUES(_assessment,_question,_option, _option = q.correct_option AND elapsed <= 65, elapsed);
 RETURN jsonb_build_object('status','recorded','question_number',q.question_number,'timed_out',elapsed > 65);
END; $$;

CREATE OR REPLACE FUNCTION public.finish_assessment(_assessment UUID, _threshold NUMERIC) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE a public.assessments; answered INTEGER; correct INTEGER; result_score NUMERIC; did_pass BOOLEAN;
BEGIN
 SELECT * INTO a FROM public.assessments WHERE id = _assessment FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Assessment not found'; END IF;
 SELECT count(*), count(*) FILTER (WHERE is_correct) INTO answered, correct FROM public.assessment_answers WHERE assessment_id = _assessment;
 IF a.total_questions IS NULL OR a.total_questions <= 0 OR answered <> a.total_questions THEN RAISE EXCEPTION 'Answer every question before completing the assessment'; END IF;
 result_score := round(correct * 100.0 / a.total_questions, 1); did_pass := result_score >= _threshold;
 IF a.status = 'completed' THEN
   result_score := a.score; did_pass := COALESCE(a.passed,a.score >= _threshold);
 ELSE
   IF a.status <> 'in_progress' OR NOT EXISTS(SELECT 1 FROM public.applications WHERE id=a.application_id AND status='assessment') THEN RAISE EXCEPTION 'Assessment is no longer in progress'; END IF;
   UPDATE public.assessments SET status='completed', score=result_score, percentage=result_score, correct_answers=correct, passed=did_pass, completed_at=now() WHERE id=_assessment;
   UPDATE public.applications SET status=CASE WHEN did_pass THEN 'interview' ELSE 'assessment_failed' END, assessment_completed_at=now() WHERE id=a.application_id AND status='assessment';
 END IF;
 RETURN jsonb_build_object('assessment_id',a.id,'total_questions',a.total_questions,'correct_answers',correct,'score',result_score,'percentage',result_score,'passed',did_pass);
END; $$;
REVOKE ALL ON FUNCTION public.record_assessment_answer(UUID,UUID,TEXT) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.finish_assessment(UUID,NUMERIC) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.record_assessment_answer(UUID,UUID,TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.finish_assessment(UUID,NUMERIC) TO service_role;
COMMIT;
