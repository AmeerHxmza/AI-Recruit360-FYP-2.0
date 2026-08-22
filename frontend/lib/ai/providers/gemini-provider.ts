import { AIProvider, GenerateStructuredParams, GenerateTextParams } from "./ai-provider";
import { AIProviderError, AIValidationError, AIConfigError } from "@/lib/utils/errors";

export class GeminiProvider implements AIProvider {
  public readonly name = "Google Gemini";
  private apiKey: string;
  private modelName: string;

  constructor(apiKey?: string, modelName = "gemini-1.5-flash") {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || "";
    this.modelName = modelName;

    if (!this.apiKey) {
      throw new AIConfigError("GEMINI_API_KEY is not configured in environment variables.");
    }
  }

  async generateText(params: GenerateTextParams): Promise<string> {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${this.apiKey}`;

    const contents = [];
    if (params.systemPrompt) {
      contents.push({
        role: "user",
        parts: [{ text: `SYSTEM INSTRUCTIONS:\n${params.systemPrompt}` }],
      });
    }
    contents.push({
      role: "user",
      parts: [{ text: params.prompt }],
    });

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new AIProviderError(`Gemini API returned status ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const textOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!textOutput) {
        throw new AIProviderError("Gemini API returned empty text response.");
      }

      return textOutput;
    } catch (err: unknown) {
      if (err instanceof AIProviderError || err instanceof AIConfigError) throw err;
      throw new AIProviderError(`Gemini API request failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  async generateStructuredObject<T>(params: GenerateStructuredParams<T>): Promise<T> {
    const rawText = await this.generateText({
      prompt: `${params.prompt}\n\nIMPORTANT: Return strictly valid JSON object conforming to the required schema. Do not include markdown code block blocks if possible, or wrap strictly in JSON.`,
      systemPrompt: params.systemPrompt,
    });

    try {
      // Strip markdown code fences if present (e.g. ```json ... ```)
      const cleanJson = rawText
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

      const parsed = JSON.parse(cleanJson);
      const validated = params.schema.safeParse(parsed);

      if (!validated.success) {
        throw new AIValidationError(
          `Gemini output failed schema validation: ${validated.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`
        );
      }

      return validated.data;
    } catch (err: unknown) {
      if (err instanceof AIValidationError) throw err;
      if (err instanceof SyntaxError) {
        throw new AIValidationError(`Gemini output was not valid JSON: ${err.message}`);
      }
      throw err;
    }
  }
}
