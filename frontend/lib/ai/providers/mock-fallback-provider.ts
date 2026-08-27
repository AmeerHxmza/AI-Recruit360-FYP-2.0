import { AIProvider, GenerateStructuredParams, GenerateTextParams } from "./ai-provider";
import { AIValidationError } from "@/lib/utils/errors";

const COMMON_SKILLS_MAP: { pattern: RegExp; name: string; defaultImportance: "critical" | "important" | "nice_to_have" }[] = [
  { pattern: /\bpython\b/i, name: "Python", defaultImportance: "critical" },
  { pattern: /\b(numpy|pandas)\b/i, name: "NumPy & Pandas", defaultImportance: "critical" },
  { pattern: /\b(pytorch|torch)\b/i, name: "PyTorch", defaultImportance: "critical" },
  { pattern: /\btensorflow\b/i, name: "TensorFlow", defaultImportance: "important" },
  { pattern: /\blangchain\b/i, name: "LangChain", defaultImportance: "critical" },
  { pattern: /\blanggraph\b/i, name: "LangGraph", defaultImportance: "important" },
  { pattern: /\b(rag|retrieval[ -]augmented)\b/i, name: "RAG Pipelines", defaultImportance: "critical" },
  { pattern: /\b(llm|llms|large language models?)\b/i, name: "LLM Orchestration", defaultImportance: "critical" },
  { pattern: /\b(prompt engineering|prompt-engineering)\b/i, name: "Prompt Engineering", defaultImportance: "important" },
  { pattern: /\b(vector databases?|pgvector|pinecone|weaviate|chroma|qdrant)\b/i, name: "Vector Databases", defaultImportance: "important" },
  { pattern: /\b(sql|postgres|postgresql)\b/i, name: "SQL", defaultImportance: "important" },
  { pattern: /\b(git|github)\b/i, name: "Git", defaultImportance: "important" },
  { pattern: /\b(linux|bash|shell)\b/i, name: "Linux / Bash", defaultImportance: "nice_to_have" },
  { pattern: /\btypescript\b/i, name: "TypeScript", defaultImportance: "critical" },
  { pattern: /\bjavascript\b/i, name: "JavaScript", defaultImportance: "important" },
  { pattern: /\breact(\.js)?\b/i, name: "React", defaultImportance: "critical" },
  { pattern: /\bnext(\.js)?\b/i, name: "Next.js", defaultImportance: "important" },
  { pattern: /\bnode(\.js)?\b/i, name: "Node.js", defaultImportance: "important" },
  { pattern: /\bfastapi\b/i, name: "FastAPI", defaultImportance: "important" },
  { pattern: /\bdocker\b/i, name: "Docker", defaultImportance: "nice_to_have" },
  { pattern: /\bkubernetes\b/i, name: "Kubernetes", defaultImportance: "nice_to_have" },
  { pattern: /\b(aws|amazon web services|gcp|google cloud|azure)\b/i, name: "Cloud Platforms", defaultImportance: "nice_to_have" },
];

export class MockFallbackProvider implements AIProvider {
  public readonly name = "Deterministic Heuristic AI Fallback";

  async generateText(params: GenerateTextParams): Promise<string> {
    return `Fallback Analysis Report for request:\n${params.prompt.slice(0, 100)}...`;
  }

  async generateStructuredObject<T>(params: GenerateStructuredParams<T>): Promise<T> {
    const promptText = params.prompt;
    const lowerPrompt = promptText.toLowerCase();

    // 1. Extract Title
    let titleMatch = "AI Engineer Intern";
    const titleRegex = /job title:\s*([^\n]+)/i;
    const match = promptText.match(titleRegex);
    if (match && match[1]) {
      titleMatch = match[1].trim();
    }

    // 2. Dynamic Skill Extraction based on actual prompt content
    const matchedSkills: { name: string; importance: "critical" | "important" | "nice_to_have" }[] = [];
    for (const skill of COMMON_SKILLS_MAP) {
      if (skill.pattern.test(lowerPrompt)) {
        matchedSkills.push({
          name: skill.name,
          importance: skill.defaultImportance,
        });
      }
    }

    // Fallback if no specific keywords matched
    if (matchedSkills.length === 0) {
      matchedSkills.push(
        { name: "Software Development", importance: "critical" },
        { name: "Problem Solving", importance: "important" }
      );
    }

    // 3. Dynamic Experience Bounds
    const isInternOrEntry =
      lowerPrompt.includes("intern") ||
      lowerPrompt.includes("internship") ||
      lowerPrompt.includes("student") ||
      lowerPrompt.includes("trainee") ||
      lowerPrompt.includes("entry level") ||
      lowerPrompt.includes("junior");

    let minYears: number | null = 0;
    let prefYears: number | null = 1;

    if (!isInternOrEntry) {
      if (lowerPrompt.includes("lead") || lowerPrompt.includes("principal")) {
        minYears = 7;
        prefYears = 10;
      } else if (lowerPrompt.includes("senior") || lowerPrompt.includes("staff")) {
        minYears = 5;
        prefYears = 7;
      } else if (lowerPrompt.includes("mid") || lowerPrompt.includes("intermediate")) {
        minYears = 2;
        prefYears = 4;
      } else {
        // Search for regex like "X+ years" or "X years"
        const expMatch = promptText.match(/(\d+)\+?\s*(?:-\s*(\d+))?\s*years?/i);
        if (expMatch) {
          minYears = parseInt(expMatch[1], 10);
          prefYears = expMatch[2] ? parseInt(expMatch[2], 10) : minYears + 2;
        } else {
          minYears = 1;
          prefYears = 3;
        }
      }
    }

    // 4. Dynamic Degrees
    const degrees: string[] = [];
    if (lowerPrompt.includes("computer science") || lowerPrompt.includes("cs")) {
      degrees.push("Computer Science");
    }
    if (lowerPrompt.includes("data science")) {
      degrees.push("Data Science");
    }
    if (lowerPrompt.includes("artificial intelligence") || lowerPrompt.includes("ai")) {
      degrees.push("Artificial Intelligence");
    }
    if (lowerPrompt.includes("software engineering")) {
      degrees.push("Software Engineering");
    }
    if (degrees.length === 0) {
      degrees.push("Computer Science or related technical field");
    }

    const fallbackObject = {
      job_title: titleMatch,
      skills: matchedSkills,
      experience: {
        minimum_years: minYears,
        preferred_years: prefYears,
      },
      education: {
        required: lowerPrompt.includes("bachelor") || lowerPrompt.includes("degree") || lowerPrompt.includes("master"),
        degrees,
      },
      responsibilities: [
        "Assist in building, testing, and optimizing AI and machine learning workflows.",
        "Collaborate with senior engineers to build data pipelines, evaluations, and production integrations.",
        "Maintain high-quality documentation and track experimental benchmarks.",
      ],
      semantic_requirements: [
        "Demonstrated hands-on experience with core programming and machine learning fundamentals.",
        "Strong analytical, problem-solving, and collaboration skills in engineering projects.",
      ],
      metadata: {
        fallback_generated: true,
        timestamp: new Date().toISOString(),
      },
    };

    const validated = params.schema.safeParse(fallbackObject);
    if (!validated.success) {
      throw new AIValidationError(`Mock fallback output failed schema validation: ${validated.error.message}`);
    }

    return validated.data;
  }
}
