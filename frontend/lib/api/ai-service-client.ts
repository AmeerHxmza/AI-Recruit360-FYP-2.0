/**
 * Thin API Client for communicating with the Python FastAPI AI Service (http://localhost:8000/api/v1).
 * Contains ZERO AI orchestration, prompts, or model logic.
 */

const AI_SERVICE_BASE_URL = typeof window !== "undefined" 
  ? "/api/py" 
  : (process.env.AI_SERVICE_URL || "http://localhost:8000/api/v1");
const SHARED_SECRET = process.env.AI_SERVICE_SHARED_SECRET || "recruit360_shared_backend_secret_2026";

async function aiServiceFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${AI_SERVICE_BASE_URL}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    "x-ai-service-secret": SHARED_SECRET,
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI Service request failed [HTTP ${response.status}]: ${errorText}`);
  }

  return response.json();
}

export interface PythonScreeningResult {
  match_score: number;
  recommendation: string;
  qualified: boolean;
  skills_score: number;
  experience_score: number;
  education_score: number;
  relevance_score: number;
  matched_skills: string[];
  missing_skills: string[];
  matched_experience: string[];
  missing_requirements: string[];
  evidence: Array<{ requirement: string; evidence_quote: string; is_matched: boolean }>;
  reasoning_summary: string;
}

export interface PythonMCQItem {
  id: string;
  question_number: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  skill_category: string;
  difficulty: string;
}

export interface PythonAssessmentFinalResult {
  assessment_id: string;
  total_questions: number;
  correct_answers: number;
  score: number;
  percentage: number;
  passed: boolean;
}

export const aiServiceClient = {
  /**
   * Triggers Multi-Agent CV Screening via Python FastAPI AI Engine
   */
  screenApplication: async (payload: {
    application_id: string;
    job_title: string;
    job_description: string;
    job_requirements?: string | null;
    cv_text: string;
    candidate_name?: string;
    organization_id?: string;
    candidate_id?: string;
    job_id?: string;
  }): Promise<PythonScreeningResult> => {
    return aiServiceFetch<PythonScreeningResult>("/screening/screen-application", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Generates or fetches 10 personalized candidate MCQs via Python FastAPI AI Engine
   */
  generateAssessment: async (payload: {
    application_id: string;
    job_title: string;
    job_description: string;
    matched_skills?: string[];
    cv_summary?: string | null;
  }): Promise<PythonMCQItem[]> => {
    return aiServiceFetch<PythonMCQItem[]>("/assessments/generate", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Records candidate answer & performs server-side timer validation
   */
  submitAssessmentAnswer: async (payload: {
    assessment_id: string;
    question_id: string;
    question_number: number;
    selected_option: string;
    time_taken_seconds: number;
  }): Promise<{ status: string; question_number: number; timed_out: boolean }> => {
    return aiServiceFetch("/assessments/submit-answer", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Finalizes assessment score & updates application stage
   */
  finalizeAssessment: async (payload: { assessment_id: string }): Promise<PythonAssessmentFinalResult> => {
    return aiServiceFetch<PythonAssessmentFinalResult>("/assessments/finalize", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Initializes adaptive AI interview session via Python FastAPI engine
   */
  initializeInterview: async (applicationId: string) => {
    return aiServiceFetch<{ interview_id: string; total_questions: number; initial_questions: Array<Record<string, unknown>> }>("/interviews/initialize", {
      method: "POST",
      body: JSON.stringify({ application_id: applicationId }),
    });
  },

  /**
   * Evaluates candidate interview response
   */
  evaluateInterviewResponse: async (interviewId: string, questionId: string, responseText: string) => {
    return aiServiceFetch<{ status: string; evaluation: Record<string, unknown> }>("/interviews/evaluate-response", {
      method: "POST",
      body: JSON.stringify({
        interview_id: interviewId,
        question_id: questionId,
        response_text: responseText,
      }),
    });
  },

  /**
   * Generates final consolidated hiring evaluation scorecard
   */
  generateFinalEvaluation: async (applicationId: string) => {
    return aiServiceFetch("/evaluations/generate", {
      method: "POST",
      body: JSON.stringify({ application_id: applicationId }),
    });
  },
};
