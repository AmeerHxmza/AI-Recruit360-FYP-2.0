import { AIProvider, GenerateStructuredParams, GenerateTextParams } from "./ai-provider";
import { AIValidationError } from "@/lib/utils/errors";

export class MockFallbackProvider implements AIProvider {
  public readonly name = "Deterministic Mock AI Fallback";

  async generateText(params: GenerateTextParams): Promise<string> {
    return `Fallback Analysis Report for request:\n${params.prompt.slice(0, 100)}...`;
  }

  async generateStructuredObject<T>(params: GenerateStructuredParams<T>): Promise<T> {
    const promptText = params.prompt.toLowerCase();

    // Extract title from prompt if possible
    let titleMatch = "Software Engineer";
    const titleRegex = /job title:\s*([^\n]+)/i;
    const match = params.prompt.match(titleRegex);
    if (match && match[1]) {
      titleMatch = match[1].trim();
    }

    // Heuristic skill extraction for fallback
    const mockSkills = [
      { name: "TypeScript", importance: "critical" as const },
      { name: "React", importance: "critical" as const },
      { name: "Node.js", importance: "important" as const },
      { name: "PostgreSQL", importance: "important" as const },
      { name: "Docker", importance: "nice_to_have" as const },
    ];

    if (promptText.includes("python") || promptText.includes("fastapi")) {
      mockSkills.push(
        { name: "Python", importance: "critical" as const },
        { name: "FastAPI", importance: "important" as const }
      );
    }

    const fallbackObject = {
      job_title: titleMatch,
      skills: mockSkills,
      experience: {
        minimum_years: promptText.includes("senior") ? 5 : promptText.includes("lead") ? 7 : 2,
        preferred_years: promptText.includes("senior") ? 7 : 4,
      },
      education: {
        required: true,
        degrees: ["Bachelor of Science in Computer Science", "Software Engineering or equivalent"],
      },
      responsibilities: [
        "Architect, implement, and maintain scalable cloud services and modular front-end interfaces.",
        "Collaborate with product managers and engineering lead to deliver high-quality recruitment features.",
        "Write clean, self-documenting code with comprehensive automated tests and peer reviews.",
      ],
      semantic_requirements: [
        "Strong problem-solving capability in modern full-stack web applications.",
        "Demonstrated track record of delivering resilient cloud software components.",
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
