import { createClient } from "@/lib/supabase/server";
import { Database, AssessmentStatus } from "@/types/database.types";

export type Assessment = Database["public"]["Tables"]["assessments"]["Row"];
export type AssessmentQuestion =
  Database["public"]["Tables"]["assessment_questions"]["Row"];
export type AssessmentAnswer =
  Database["public"]["Tables"]["assessment_answers"]["Row"];

export type CandidateAssessmentQuestion = Omit<
  AssessmentQuestion,
  "correct_option" | "explanation"
>;

export async function getAssessmentQuestionsForCandidate(
  assessmentId: string,
): Promise<CandidateAssessmentQuestion[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("assessment_questions")
    .select(
      "id, assessment_id, question_number, question, option_a, option_b, option_c, option_d, skill_category, difficulty, created_at",
    )
    .eq("assessment_id", assessmentId)
    .order("question_number", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data as CandidateAssessmentQuestion[];
}

export async function submitAssessmentAnswers(
  assessmentId: string,
  answers: Record<number, string>,
  timeTakenMap?: Record<number, number>,
): Promise<{ score: number; percentage: number; passed: boolean }> {
  const supabase = await createClient();

  // 1. Fetch full questions with correct answers
  const { data: questions, error: qError } = await supabase
    .from("assessment_questions")
    .select("id, question_number, correct_option")
    .eq("assessment_id", assessmentId);

  if (qError || !questions) {
    throw new Error("Failed to evaluate assessment submission.");
  }

  let correctCount = 0;
  const totalCount = questions.length || 10;

  // 2. Evaluate each answer
  for (const q of questions) {
    const selected = (answers[q.question_number] || "").toUpperCase();
    const isCorrect = selected === q.correct_option.toUpperCase();
    if (isCorrect) correctCount++;

    await supabase.from("assessment_answers").upsert({
      assessment_id: assessmentId,
      question_id: q.id,
      selected_option: selected || "A",
      is_correct: isCorrect,
      time_taken_seconds: timeTakenMap?.[q.question_number] || 30,
    });
  }

  const score = Math.round((correctCount / totalCount) * 100);
  const percentage = score;
  const passed = percentage >= 60;
  const finalStatus: AssessmentStatus = passed ? "completed" : "failed";

  // 3. Update assessment record
  const { data: assessmentData } = await supabase
    .from("assessments")
    .update({
      correct_answers: correctCount,
      score,
      percentage,
      status: finalStatus,
      completed_at: new Date().toISOString(),
    })
    .eq("id", assessmentId)
    .select("application_id, organization_id")
    .single();

  // 4. Update application status
  if (assessmentData) {
    await supabase
      .from("applications")
      .update({
        status: passed ? "assessment" : "assessment_failed",
        assessment_completed_at: new Date().toISOString(),
      })
      .eq("id", assessmentData.application_id);
  }

  return { score, percentage, passed };
}
