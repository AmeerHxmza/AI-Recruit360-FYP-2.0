"use server";

import { aiServiceClient } from "@/lib/api/ai-service-client";
import { createAdminClient } from "@/lib/supabase/server";

export async function getOrGenerateAssessmentAction(applicationId: string) {
  try {
    const aiResponse = await aiServiceClient.generateAssessment({
      application_id: applicationId,
    });
    
    // Also fetch the assessment status and existing answers for state recovery
    const supabase = await createAdminClient();
    const { data: assessment } = await supabase
      .from("assessments")
      .select("*, assessment_answers(question_id, selected_option)")
      .eq("application_id", applicationId)
      .single();

    if (aiResponse.status === "generating") {
      return {
        success: true,
        data: {
          status: "generating",
          message: aiResponse.message || "Generating...",
          questions: [],
          assessment: assessment || null,
          answers: assessment?.assessment_answers || []
        }
      }
    }

    return { 
      success: true, 
      data: {
        status: "ready",
        questions: aiResponse.questions || [],
        assessment: assessment || null,
        answers: assessment?.assessment_answers || []
      }
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load personalized assessment.";
    return { success: false, error: msg };
  }
}

export async function submitAssessmentAnswerAction(
  assessmentId: string,
  questionId: string,
  questionNumber: number,
  selectedOption: string,
  timeTakenSeconds: number
) {
  try {
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
    const result = await aiServiceClient.finalizeAssessment({ assessment_id: assessmentId });
    return { success: true, data: result };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to finalize assessment.";
    return { success: false, error: msg };
  }
}
