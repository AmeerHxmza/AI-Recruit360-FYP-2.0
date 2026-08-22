import { JobAnalysisSchema, JobAnalysis } from "@/lib/ai/schemas/job-analysis-schema";
import { JOB_ANALYSIS_SYSTEM_PROMPT, buildJobAnalysisPrompt } from "@/lib/ai/prompts/job-analysis";
import { getAIProvider } from "@/lib/ai/providers/ai-provider";
import { logAiActivity } from "@/lib/services/ai-activity-service";
import { ValidationError, AIProviderError, AppError } from "@/lib/utils/errors";

// Enforce server-only execution boundary
if (typeof window !== "undefined") {
  throw new Error("Job Analyzer service can only be executed on the server.");
}

export interface AnalyzeJobInput {
  title: string;
  description: string;
  requirements?: string;
  organizationId?: string;
  jobId?: string;
}

export async function analyzeJobDescription(input: AnalyzeJobInput): Promise<JobAnalysis> {
  // 1. Input Validation
  if (!input.title || !input.title.trim()) {
    throw new ValidationError("Job title is required for AI intelligence analysis.");
  }

  if (!input.description || !input.description.trim()) {
    throw new ValidationError("Job description content is required for AI intelligence analysis.");
  }

  const provider = getAIProvider();
  const prompt = buildJobAnalysisPrompt({
    title: input.title,
    description: input.description,
    requirements: input.requirements,
  });

  try {
    // 2. Invoke AI Provider with Zod Schema Validation
    const analysis = await provider.generateStructuredObject({
      prompt,
      schema: JobAnalysisSchema,
      systemPrompt: JOB_ANALYSIS_SYSTEM_PROMPT,
    });

    // 3. Log AI Activity if organization context is provided
    if (input.organizationId) {
      try {
        await logAiActivity({
          organization_id: input.organizationId,
          event_type: "job_analysis",
          entity_type: "job",
          entity_id: input.jobId || null,
          status: "success",
          metadata: {
            job_title: analysis.job_title,
            provider_name: provider.name,
            critical_skills_count: analysis.skills.filter((s) => s.importance === "critical").length,
            total_skills_count: analysis.skills.length,
          },
        });
      } catch (logErr) {
        console.warn("[JobAnalyzer] Failed to log AI activity:", logErr);
      }
    }

    return analysis;
  } catch (err: unknown) {
    // Log failed event if organizationId is available
    if (input.organizationId) {
      try {
        await logAiActivity({
          organization_id: input.organizationId,
          event_type: "job_analysis",
          entity_type: "job",
          entity_id: input.jobId || null,
          status: "error",
          metadata: {
            job_title: input.title,
            error: err instanceof Error ? err.message : String(err),
          },
        });
      } catch {
        // ignore logging failure
      }
    }

    if (err instanceof AppError) {
      throw err;
    }

    if (err instanceof Error) {
      throw new AIProviderError(`AI Job Analysis failed: ${err.message}`);
    }

    throw new AIProviderError("An unexpected error occurred during AI job analysis.");
  }
}
