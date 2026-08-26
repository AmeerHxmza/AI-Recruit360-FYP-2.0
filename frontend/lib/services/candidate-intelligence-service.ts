import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganization } from "@/lib/auth/session";
import { DatabaseError } from "@/lib/utils/errors";

export interface CandidateIntelligence {
  candidateId: string;
  application: {
    id: string;
    jobTitle: string;
    status: string;
    appliedAt: string;
  } | null;
  cvScreening: {
    matchScore: number;
    skillsScore: number;
    experienceScore: number;
    educationScore: number;
    matchedSkills: string[];
    missingSkills: string[];
    recommendation: string;
    evidence: string;
    createdAt: string;
  } | null;
  assessment: {
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    status: string;
    createdAt: string;
    completedAt: string | null;
    questions: {
      questionText: string;
      selectedOption: string | null;
      isCorrect: boolean | null;
    }[];
  } | null;
  interview: {
    status: string;
    overallScore: number | null;
    technicalScore: number | null;
    communicationScore: number | null;
    relevanceScore: number | null;
    transcript: string | null;
    feedback: string | null;
    createdAt: string;
    completedAt: string | null;
    responses: {
      questionText: string;
      responseText: string;
    }[];
  } | null;
  finalEvaluation: {
    overallScore: number;
    cvWeight: number;
    assessmentWeight: number;
    interviewWeight: number;
    recommendation: string;
    evidence: string;
    strengths: string[];
    weaknesses: string[];
    createdAt: string;
  } | null;
}

export async function getCandidateIntelligence(candidateId: string): Promise<CandidateIntelligence> {
  const org = await getCurrentOrganization();
  const supabase = await createClient();

  try {
    // 1. Get the most recent active application for this candidate
    const { data: apps, error: appError } = await supabase
      .from("applications")
      .select("id, status, applied_at, jobs(title)")
      .eq("organization_id", org.id)
      .eq("candidate_id", candidateId)
      .order("applied_at", { ascending: false })
      .limit(1);

    if (appError) throw appError;

    const result: CandidateIntelligence = {
      candidateId,
      application: null,
      cvScreening: null,
      assessment: null,
      interview: null,
      finalEvaluation: null,
    };

    if (!apps || apps.length === 0) {
      return result; // No application found
    }

    const app = apps[0];
    const appId = app.id;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const jobTitle = (app.jobs as any)?.title || "Unknown Job";

    result.application = {
      id: appId,
      jobTitle,
      status: app.status,
      appliedAt: app.applied_at,
    };

    // 2. Fetch all intelligence concurrently based on application_id using a single nested select
    const { data: pipelineData, error: pipelineError } = await supabase
      .from("applications")
      .select(`
        cv_screenings (*),
        assessments (*),
        interviews (*),
        final_evaluations (*)
      `)
      .eq("id", appId)
      .single();

    if (pipelineError) throw pipelineError;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getFirst = (item: any) => Array.isArray(item) ? item[0] : item;

    const cvRes = { data: getFirst(pipelineData.cv_screenings) || null };
    const asstRes = { data: getFirst(pipelineData.assessments) || null };
    const intRes = { data: getFirst(pipelineData.interviews) || null };
    const evalRes = { data: getFirst(pipelineData.final_evaluations) || null };

    if (cvRes.data) {
      const ms = Array.isArray(cvRes.data.matched_skills) ? (cvRes.data.matched_skills as string[]) : [];
      const mss = Array.isArray(cvRes.data.missing_skills) ? (cvRes.data.missing_skills as string[]) : [];
      let ev = "";
      if (typeof cvRes.data.evidence === "string") ev = cvRes.data.evidence;
      else if (cvRes.data.evidence) ev = JSON.stringify(cvRes.data.evidence);

      result.cvScreening = {
        matchScore: cvRes.data.match_score || 0,
        skillsScore: cvRes.data.skills_score || 0,
        experienceScore: cvRes.data.experience_score || 0,
        educationScore: cvRes.data.education_score || 0,
        matchedSkills: ms,
        missingSkills: mss,
        recommendation: cvRes.data.recommendation || "",
        evidence: ev,
        createdAt: cvRes.data.created_at,
      };
    }

    if (asstRes.data) {
      // Fetch assessment questions via answers
      const { data: qData } = await supabase
        .from("assessment_answers")
        .select(`
          selected_option, 
          is_correct,
          assessment_questions!inner (
            question
          )
        `)
        .eq("assessment_id", asstRes.data.id);

      result.assessment = {
        score: asstRes.data.score || 0,
        totalQuestions: asstRes.data.total_questions || 0,
        correctAnswers: asstRes.data.correct_answers || 0,
        status: asstRes.data.status || "pending",
        createdAt: asstRes.data.created_at,
        completedAt: asstRes.data.completed_at || null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        questions: (qData || []).map((q: any) => ({
          questionText: q.assessment_questions?.question || "",
          selectedOption: q.selected_option,
          isCorrect: q.is_correct,
        })),
      };
    }

    if (intRes.data) {
      // Fetch interview responses with real-time scoring dimensions
      const { data: irData } = await supabase
        .from("interview_responses")
        .select(`
          response_text,
          technical_score,
          communication_score,
          relevance_score,
          ai_feedback,
          interview_questions!inner (
            question_text
          )
        `)
        .eq("interview_id", intRes.data.id)
        .order("created_at", { ascending: true });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const responses: any[] = irData || [];
      const validTech = responses.filter(r => r.technical_score != null).map(r => Number(r.technical_score));
      const validComm = responses.filter(r => r.communication_score != null).map(r => Number(r.communication_score));
      const validRel = responses.filter(r => r.relevance_score != null).map(r => Number(r.relevance_score));

      const avgTech = validTech.length > 0 ? Math.round(validTech.reduce((a, b) => a + b, 0) / validTech.length) : null;
      const avgComm = validComm.length > 0 ? Math.round(validComm.reduce((a, b) => a + b, 0) / validComm.length) : null;
      const avgRel = validRel.length > 0 ? Math.round(validRel.reduce((a, b) => a + b, 0) / validRel.length) : null;

      let calculatedOverall: number | null = intRes.data.overall_score != null ? Number(intRes.data.overall_score) : null;
      if (calculatedOverall == null && evalRes.data?.interview_score != null) {
        calculatedOverall = Number(evalRes.data.interview_score);
      }
      if (calculatedOverall == null && avgTech != null && avgComm != null && avgRel != null) {
        calculatedOverall = Math.round(avgTech * 0.4 + avgComm * 0.3 + avgRel * 0.3);
      }

      let fb = "";
      if (evalRes.data?.ai_summary) {
        fb = evalRes.data.ai_summary;
      } else {
        const fbParts = responses.map(r => r.ai_feedback).filter(Boolean);
        if (fbParts.length > 0) fb = fbParts.join(" ");
      }

      const isCompleted = intRes.data.status === "completed" || evalRes.data != null || (responses.length > 0 && calculatedOverall != null);

      result.interview = {
        status: isCompleted ? "completed" : (intRes.data.status || "pending"),
        overallScore: calculatedOverall,
        technicalScore: avgTech ?? calculatedOverall,
        communicationScore: avgComm ?? calculatedOverall,
        relevanceScore: avgRel ?? calculatedOverall,
        transcript: null,
        feedback: fb || (isCompleted ? "AI technical interview completed and evaluated." : null),
        createdAt: intRes.data.created_at,
        completedAt: intRes.data.completed_at || null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        responses: responses.map((r: any) => ({
          questionText: r.interview_questions?.question_text || "",
          responseText: r.response_text || "",
        })),
      };
    }

    if (evalRes.data) {
      let fEv = "";
      if (typeof evalRes.data.evidence === "string") fEv = evalRes.data.evidence;
      else if (evalRes.data.evidence) fEv = JSON.stringify(evalRes.data.evidence);

      result.finalEvaluation = {
        overallScore: evalRes.data.overall_score || 0,
        cvWeight: 40,
        assessmentWeight: 25,
        interviewWeight: 35,
        recommendation: evalRes.data.recommendation || "",
        evidence: fEv,
        strengths: Array.isArray(evalRes.data.strengths) ? (evalRes.data.strengths as string[]) : [],
        weaknesses: Array.isArray(evalRes.data.weaknesses) ? (evalRes.data.weaknesses as string[]) : [],
        createdAt: evalRes.data.created_at,
      };
    }

    return result;
  } catch (err: unknown) {
    console.error("Failed to fetch candidate intelligence:", err);
    throw new DatabaseError("Could not retrieve candidate intelligence data.");
  }
}
