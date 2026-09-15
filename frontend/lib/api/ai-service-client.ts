import "server-only";

const AI_SERVICE_BASE_URL =
  process.env.AI_SERVICE_URL || "http://127.0.0.1:8000/api/v1";
const SHARED_SECRET = process.env.AI_SERVICE_SHARED_SECRET || "";

async function aiServiceFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  if (SHARED_SECRET.length < 32)
    throw new Error(
      "Configure the shared AI service secret before using assessments.",
    );
  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${SHARED_SECRET}`);
  if (!(options.body instanceof FormData))
    headers.set("Content-Type", "application/json");
  let response: Response;
  try {
    response = await fetch(`${AI_SERVICE_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(90000),
    });
  } catch (error) {
    const cause = error instanceof Error ? error.cause : undefined;
    const code =
      cause && typeof cause === "object" && "code" in cause
        ? String(cause.code)
        : "";
    if (process.env.NODE_ENV !== "production" && code === "ECONNREFUSED") {
      throw new Error(
        "The local AI backend is not running. Start FastAPI in a second terminal, then retry screening. Your application is saved.",
      );
    }
    throw new Error(
      "The AI service could not be reached or timed out. Your application is saved; please retry shortly.",
    );
  }
  const data = await response.json().catch(() => null);
  if (!response.ok)
    throw new Error(
      typeof data?.detail === "string"
        ? data.detail
        : "Could not complete this step. Please retry.",
    );
  return data as T;
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
  evidence: Array<{
    requirement: string;
    evidence_quote: string;
    is_matched: boolean;
  }>;
  reasoning_summary: string;
}

export interface GenerateAssessmentPayload {
  application_id: string;
}

export interface PythonMCQItem {
  id: string;
  assessment_id?: string;
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
  interviewSpeech: (interviewId: string, questionId: string) =>
    aiServiceFetch<{ audio: string; mime_type: string }>("/interviews/speech", {
      method: "POST",
      body: JSON.stringify({
        interview_id: interviewId,
        question_id: questionId,
      }),
    }),
  /**
   * Runs CV screening via Python FastAPI AI Engine
   */
  screenApplication: async (payload: {
    application_id: string;
  }): Promise<{
    status: string;
    application_id: string;
    result: PythonScreeningResult;
  }> => {
    return aiServiceFetch<{
      status: string;
      application_id: string;
      result: PythonScreeningResult;
    }>("/screening/screen-application", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Generates or fetches 10 personalized candidate MCQs via Python FastAPI AI Engine
   */
  generateAssessment: async (payload: {
    application_id: string;
  }): Promise<{
    status: "ready" | "generating";
    message?: string;
    questions?: PythonMCQItem[];
  }> => {
    return aiServiceFetch<{
      status: "ready" | "generating";
      message?: string;
      questions?: PythonMCQItem[];
    }>("/assessments/generate", {
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
  }): Promise<{
    status: string;
    question_number: number;
    timed_out: boolean;
  }> => {
    return aiServiceFetch("/assessments/submit-answer", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Finalizes assessment score & updates application stage
   */
  finalizeAssessment: async (payload: {
    assessment_id: string;
  }): Promise<PythonAssessmentFinalResult> => {
    return aiServiceFetch<PythonAssessmentFinalResult>(
      "/assessments/finalize",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
  },

  /**
   * Initializes adaptive AI interview session via Python FastAPI engine
   */
  initializeInterview: async (applicationId: string) => {
    return aiServiceFetch<{
      interview_id: string;
      total_questions: number;
      initial_questions: Array<Record<string, unknown>>;
    }>("/interviews/initialize", {
      method: "POST",
      body: JSON.stringify({ application_id: applicationId }),
    });
  },

  /**
   * Fetches or generates the next adaptive interview question via Python FastAPI engine
   */
  getNextInterviewQuestion: async (interviewId: string) => {
    return aiServiceFetch<{
      interview_id: string;
      completed: boolean;
      current_question?: {
        question_number: number;
        question_text: string;
        question_type: string;
        skill_category: string;
        source: string;
        is_follow_up: boolean;
      } | null;
      questions_answered: number;
      total_questions: number;
    }>("/interviews/next-question", {
      method: "POST",
      body: JSON.stringify({ interview_id: interviewId }),
    });
  },

  /**
   * Evaluates candidate interview response
   */
  evaluateInterviewResponse: async (
    interviewId: string,
    questionId: string,
    responseText: string,
  ) => {
    return aiServiceFetch<{
      status: string;
      evaluation: Record<string, unknown>;
    }>("/interviews/evaluate-response", {
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

  /**
   * Transcribe recorded audio file
   */
  transcribeAudioFile: async (
    formData: FormData,
  ): Promise<{ transcript: string }> => {
    return aiServiceFetch<{ transcript: string }>("/interviews/stt", {
      method: "POST",
      body: formData,
    });
  },
};
