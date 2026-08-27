import { AIProvider, GenerateStructuredParams, GenerateTextParams } from "./ai-provider";
import { AIProviderError, AIValidationError, AIConfigError } from "@/lib/utils/errors";

export class OpenAIProvider implements AIProvider {
  public readonly name = "OpenAI";
  private apiKey: string;
  private modelName: string;

  constructor(apiKey?: string, modelName = "gpt-4o-mini") {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || "";
    this.modelName = process.env.OPENAI_MODEL || modelName;

    if (!this.apiKey) {
      throw new AIConfigError("OPENAI_API_KEY is not configured in environment variables.");
    }
  }

  async generateText(params: GenerateTextParams): Promise<string> {
    const endpoint = "https://api.openai.com/v1/chat/completions";

    const messages = [];
    if (params.systemPrompt) {
      messages.push({ role: "system", content: params.systemPrompt });
    }
    messages.push({ role: "user", content: params.prompt });

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.modelName,
          messages,
          temperature: 0.1,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new AIProviderError(`OpenAI API returned status ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const textOutput = data?.choices?.[0]?.message?.content;
      if (!textOutput) {
        throw new AIProviderError("OpenAI API returned empty response.");
      }

      return textOutput;
    } catch (err: unknown) {
      if (err instanceof AIProviderError || err instanceof AIConfigError) throw err;
      throw new AIProviderError(`OpenAI API request failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  async generateStructuredObject<T>(params: GenerateStructuredParams<T>): Promise<T> {
    const endpoint = "https://api.openai.com/v1/chat/completions";

    const messages = [];
    const systemPromptWithJsonInstruction = `${params.systemPrompt || "You are a helpful assistant."}\n\nCRITICAL: You must return a valid JSON object matching the requested schema. Do NOT include markdown code blocks (\`\`\`json) or any other text before or after the JSON.`;
    messages.push({ role: "system", content: systemPromptWithJsonInstruction });
    messages.push({ role: "user", content: params.prompt });

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.modelName,
          messages,
          response_format: { type: "json_object" },
          temperature: 0.1,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new AIProviderError(`OpenAI API returned status ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const rawText = data?.choices?.[0]?.message?.content;
      if (!rawText) {
        throw new AIProviderError("OpenAI API returned empty response.");
      }

      const cleanJson = rawText
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

      const parsed = JSON.parse(cleanJson);
      const validated = params.schema.safeParse(parsed);

      if (!validated.success) {
        throw new AIValidationError(
          `OpenAI output failed schema validation: ${validated.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`
        );
      }

      return validated.data;
    } catch (err: unknown) {
      if (err instanceof AIValidationError || err instanceof AIProviderError || err instanceof AIConfigError) throw err;
      if (err instanceof SyntaxError) {
        throw new AIValidationError(`OpenAI output was not valid JSON: ${err.message}`);
      }
      throw new AIProviderError(`OpenAI API structured generation failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
}
