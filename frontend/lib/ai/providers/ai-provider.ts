import { z } from "zod";
import { GeminiProvider } from "./gemini-provider";
import { OpenAIProvider } from "./openai-provider";
import { MockFallbackProvider } from "./mock-fallback-provider";

export interface GenerateStructuredParams<T> {
  prompt: string;
  schema: z.ZodSchema<T>;
  systemPrompt?: string;
}

export interface GenerateTextParams {
  prompt: string;
  systemPrompt?: string;
}

export interface AIProvider {
  name: string;
  generateStructuredObject<T>(params: GenerateStructuredParams<T>): Promise<T>;
  generateText(params: GenerateTextParams): Promise<string>;
}

export function getAIProvider(): AIProvider {
  const openaiKey = process.env.OPENAI_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (openaiKey) {
    try {
      return new OpenAIProvider(openaiKey);
    } catch (err) {
      console.warn("Failed to initialize OpenAIProvider, trying Gemini / Fallback:", err);
    }
  }

  if (geminiKey) {
    try {
      return new GeminiProvider(geminiKey);
    } catch (err) {
      console.warn("Failed to initialize GeminiProvider, using MockFallbackProvider:", err);
    }
  }

  return new MockFallbackProvider();
}
