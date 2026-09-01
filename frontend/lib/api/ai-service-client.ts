/**
 * API Client for communicating with the Python FastAPI AI Service (http://localhost:8000/api/v1).
 * Features request timeouts, retry policies, and structured error handling.
 */

if (typeof window !== "undefined") {
  console.error("CRITICAL SECURITY ERROR: aiServiceClient cannot be imported or executed in the browser.");
}

const AI_SERVICE_BASE_URL =
  process.env.AI_SERVICE_URL ||
  process.env.NEXT_PUBLIC_AI_SERVICE_URL ||
  "https://ai-recruit360-fyp.onrender.com/api/v1";
const SHARED_SECRET = process.env.AI_SERVICE_SHARED_SECRET || "recruit360_shared_backend_secret_2026";
const DEFAULT_TIMEOUT_MS = 90000; // 90s timeout for cold starts and multi-agent LLM reasoning

async function aiServiceFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  retries = 2
): Promise<T> {
  if (typeof window !== "undefined") {
    throw new Error("SECURITY VIOLATION: AI Service cannot be called from the browser.");
  }

  const url = `${AI_SERVICE_BASE_URL}${endpoint}`;
  const headers = new Headers(options.headers || {});
  headers.set("Authorization", `Bearer ${SHARED_SECRET}`);
  
  if (options.body instanceof FormData) {
    // Let browser set the multipart/form-data boundary automatically
    headers.delete("Content-Type");
  } else if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        // Do not retry 4xx user errors
        if (response.status >= 400 && response.status < 500) {
          throw new Error(`[HTTP ${response.status}] ${errorText}`);
        }
        throw new Error(`[HTTP ${response.status}] ${errorText}`);
      }

      return await response.json();
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err));
      
      // If client abort or non-retryable 4xx error, throw immediately
      if (lastError.name === "AbortError") {
        throw new Error(`AI Service request timed out after ${DEFAULT_TIMEOUT_MS}ms.`);
      }

      if (attempt < retries) {
        // Exponential backoff: 300ms, 600ms
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 300));
      }
    }
  }

  throw lastError || new Error("Failed to communicate with AI Engine after retries.");
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
  /**
   * Triggers Multi-Agent CV Screening via Python FastAPI AI Engine
   */
  screenApplication: async (payload: {
    application_id: string;
  }): Promise<{ status: string; message: string; application_id: string }> => {
    return aiServiceFetch<{ status: string; message: string; application_id: string }>("/screening/screen-application", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Generates or fetches 10 personalized candidate MCQs via Python FastAPI AI Engine
   */
  generateAssessment: async (payload: {
    application_id: string;
  }): Promise<{ status: "ready" | "generating"; message?: string; questions?: PythonMCQItem[] }> => {
    return aiServiceFetch<{ status: "ready" | "generating"; message?: string; questions?: PythonMCQItem[] }>("/assessments/generate", {
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

  /**
   * Fetches Simli session token
   */
  getSimliToken: async (): Promise<{ session_token: string }> => {
    return aiServiceFetch<{ session_token: string }>("/interviews/simli-token", {
      method: "POST",
    });
  },

  /**
   * Transcribe recorded audio file
   */
  transcribeAudioFile: async (formData: FormData): Promise<{ transcript: string }> => {
    return aiServiceFetch<{ transcript: string }>("/interviews/stt", {
      method: "POST",
      body: formData,
    });
  },

  /**
   * Mark interview as avatar_degraded
   */
  degradeAvatar: async (interviewId: string): Promise<{ status: string }> => {
    return aiServiceFetch<{ status: string }>("/interviews/degrade-avatar", {
      method: "POST",
      body: JSON.stringify({ interview_id: interviewId }),
    });
  },
};
