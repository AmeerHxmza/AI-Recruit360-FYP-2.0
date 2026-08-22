export interface BuildJobAnalysisPromptParams {
  title: string;
  description: string;
  requirements?: string;
}

export const JOB_ANALYSIS_SYSTEM_PROMPT = `You are an expert AI Recruitment Intelligence Engine for AI-Recruit360.
Your task is to analyze job position descriptions and extract structured, normalized hiring criteria.

STRICT EXTRACTION RULES:
1. EXTRACT ONLY SUPPORTED INFORMATION: Do not invent or assume requirements that are not supported by the job title, description, or requirements text.
2. SKILL IMPORTANCE CLASSIFICATION: Categorize every extracted skill into one of three strict levels:
   - "critical": Absolute non-negotiable core skill or technology explicitly required.
   - "important": Major required skill or framework key to the daily role.
   - "nice_to_have": Bonus, optional, or preferred qualification.
3. TECHNOLOGY NORMALIZATION: Standardize technology names (e.g., "JS" -> "JavaScript", "TS" -> "TypeScript", "Postgres" -> "PostgreSQL", "React.js" -> "React").
4. EXPERIENCE BOUNDS: Extract minimum_years and preferred_years as numbers or null if unspecified.
5. EDUCATION: Determine if a degree is strictly required (boolean) and list acceptable degrees.
6. RESPONSIBILITIES & SEMANTIC REQUIREMENTS: Extract concise key responsibilities and semantic hiring benchmarks.
7. OUTPUT FORMAT: Respond strictly with valid JSON conforming to the requested schema without markdown commentary or raw wrappers outside JSON.`;

export function buildJobAnalysisPrompt(params: BuildJobAnalysisPromptParams): string {
  return `Please analyze the following job opening details and extract normalized recruitment intelligence:

JOB TITLE:
${params.title}

JOB OVERVIEW & DESCRIPTION:
${params.description || "N/A"}

JOB REQUIREMENTS & SPECIFICATIONS:
${params.requirements || "N/A"}

OUTPUT STRUCTURE EXPECTED:
{
  "job_title": "${params.title.trim()}",
  "skills": [
    { "name": "Skill Name", "importance": "critical" | "important" | "nice_to_have" }
  ],
  "experience": {
    "minimum_years": number | null,
    "preferred_years": number | null
  },
  "education": {
    "required": boolean,
    "degrees": ["Degree Name"]
  },
  "responsibilities": ["Responsibility statement"],
  "semantic_requirements": ["Semantic criteria"]
}`;
}
