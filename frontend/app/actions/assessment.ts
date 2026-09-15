"use server";

import { aiServiceClient } from "@/lib/api/ai-service-client";
import { createAdminClient } from "@/lib/supabase/server";
import {
  requireCandidateSession,
  requireAssessmentAccess,
} from "@/lib/auth/candidate-session";

export async function getOrGenerateAssessmentAction(applicationId: string) {
  try {
    await requireCandidateSession(applicationId);
    const aiResponse = await aiServiceClient.generateAssessment({
      application_id: applicationId,
    });

    // Also fetch the assessment status and existing answers for state recovery
    const supabase = await createAdminClient();
    const { data: assessment } = await supabase
      .from("assessments")
      .select("*")
      .eq("application_id", applicationId)
      .single();

    if (!assessment) throw new Error("Assessment record not found.");
    const { data: savedAnswers, error: answersError } = await supabase
      .from("assessment_answers")
      .select("question_id, selected_option")
      .eq("assessment_id", assessment.id);
    if (answersError)
      throw new Error("Could not restore assessment progress. Please retry.");
    const answers = savedAnswers || [];
    const answered = new Set(answers.map((answer) => answer.question_id));
    const current = (aiResponse.questions || []).find(
      (question) => !answered.has(question.id),
    );
    let deadline: string | null = null;
    if (current && assessment.status !== "completed") {
      await supabase
        .from("assessment_questions")
        .update({ presented_at: new Date().toISOString() })
        .eq("id", current.id)
        .is("presented_at", null);
      const { data: timing, error } = await supabase
        .from("assessment_questions")
        .select("presented_at")
        .eq("id", current.id)
        .single();
      if (error || !timing?.presented_at)
        throw new Error("Could not start the question timer. Please retry.");
      deadline = new Date(
        new Date(timing.presented_at).getTime() + 60000,
      ).toISOString();
    }
    return {
      success: true,
      data: {
        status: "ready",
        questions: current ? [current] : [],
        assessment,
        answers,
        deadline,
      },
    };
  } catch (err: unknown) {
    const msg =
      err instanceof Error
        ? err.message
        : "Failed to load personalized assessment.";
    return { success: false, error: msg };
  }
}

export async function submitAssessmentAnswerAction(
  assessmentId: string,
  questionId: string,
  questionNumber: number,
  selectedOption: string,
  timeTakenSeconds: number,
) {
  try {
    await requireAssessmentAccess(assessmentId);
    const result = await aiServiceClient.submitAssessmentAnswer({
      assessment_id: assessmentId,
      question_id: questionId,
      question_number: questionNumber,
      selected_option: selectedOption,
      time_taken_seconds: timeTakenSeconds,
    });

    return { success: true, data: result };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to submit answer.";
    return { success: false, error: msg };
  }
}

export async function finalizeAssessmentAction(assessmentId: string) {
  try {
    await requireAssessmentAccess(assessmentId);
    const result = await aiServiceClient.finalizeAssessment({
      assessment_id: assessmentId,
    });
    return { success: true, data: result };
  } catch (err: unknown) {
    const msg =
      err instanceof Error ? err.message : "Failed to finalize assessment.";
    return { success: false, error: msg };
  }
}
