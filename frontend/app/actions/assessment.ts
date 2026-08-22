"use server";

import { aiServiceClient } from "@/lib/api/ai-service-client";
import { createClient } from "@/lib/supabase/server";

export async function getOrGenerateAssessmentAction(applicationId: string) {
  try {
    const supabase = await createClient();

    const { data: app, error } = await supabase
      .from("applications")
      .select("*")
      .eq("id", applicationId)
      .single();

    if (error || !app) {
      return { success: false, error: "Application not found." };
    }

    const { data: job } = await supabase.from("jobs").select("*").eq("id", app.job_id).single();
    const { data: screenings } = await supabase.from("cv_screenings").select("*").eq("application_id", applicationId);

    const screening = screenings && screenings.length > 0 ? screenings[0] : null;
    const matchedSkills = (screening?.matched_skills as string[] | undefined) || ["Software Engineering"];

    // Delegate 10 MCQ generation to Python FastAPI AI Engine
    const questions = await aiServiceClient.generateAssessment({
      application_id: applicationId,
      job_title: job?.title || "Technical Position",
      job_description: job?.description || "",
      matched_skills: matchedSkills,
      cv_summary: screening?.reasoning_summary || null,
    });

    return { success: true, data: questions };
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
