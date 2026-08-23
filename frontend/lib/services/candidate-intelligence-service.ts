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
  } | null;
  assessment: {
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    status: string;
  } | null;
  interview: {
    status: string;
    overallScore: number | null;
    technicalScore: number | null;
    communicationScore: number | null;
    relevanceScore: number | null;
    transcript: string | null;
    feedback: string | null;
  } | null;
  finalEvaluation: {
    overallScore: number;
    cvWeight: number;
    assessmentWeight: number;
    interviewWeight: number;
    recommendation: string;
    evidence: string;
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
      };
    }

    if (asstRes.data) {
      result.assessment = {
        score: asstRes.data.score || 0,
        totalQuestions: asstRes.data.total_questions || 0,
        correctAnswers: asstRes.data.correct_answers || 0,
        status: asstRes.data.status || "pending",
      };
    }

    if (intRes.data) {
      result.interview = {
        status: intRes.data.status || "pending",
        overallScore: intRes.data.overall_score,
        technicalScore: null,
        communicationScore: null,
        relevanceScore: null,
        transcript: null,
        feedback: null,
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
      };
    }

    return result;
  } catch (err: unknown) {
    console.error("Failed to fetch candidate intelligence:", err);
    throw new DatabaseError("Could not retrieve candidate intelligence data.");
  }
}
