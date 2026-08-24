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

    // 2. Fetch all intelligence concurrently based on application_id
    const [cvRes, asstRes, intRes, evalRes] = await Promise.all([
      supabase.from("cv_screenings").select("*").eq("application_id", appId).limit(1).maybeSingle(),
      supabase.from("assessments").select("*").eq("application_id", appId).limit(1).maybeSingle(),
      supabase.from("interviews").select("*").eq("application_id", appId).limit(1).maybeSingle(),
      supabase.from("final_evaluations").select("*").eq("application_id", appId).limit(1).maybeSingle(),
    ]);

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
      // Fetch interview responses
      const { data: irData } = await supabase
        .from("interview_responses")
        .select(`
          response_text,
          interview_questions!inner (
            question_text
          )
        `)
        .eq("interview_id", intRes.data.id)
        .order("created_at", { ascending: true });

      result.interview = {
        status: intRes.data.status || "pending",
        overallScore: intRes.data.overall_score,
        technicalScore: null,
        communicationScore: null,
        relevanceScore: null,
        transcript: null,
        feedback: null, // Feedback is in final evaluation
        createdAt: intRes.data.created_at,
        completedAt: intRes.data.completed_at || null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        responses: (irData || []).map((r: any) => ({
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
