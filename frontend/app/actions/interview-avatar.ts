"use server";

import { requireInterviewAccess } from "@/lib/auth/candidate-session";
import { createAdminClient } from "@/lib/supabase/server";
import { aiServiceClient } from "@/lib/api/ai-service-client";

async function requireActiveInterview(interviewId: string) {
  await requireInterviewAccess(interviewId);
  const db = await createAdminClient();
  const { data } = await db
    .from("interviews")
    .select("status")
    .eq("id", interviewId)
    .single();
  if (!data || !["pending", "in_progress"].includes(data.status))
    throw new Error("This interview is not active.");
}

export async function createAvatarSessionAction(interviewId: string) {
  try {
    await requireActiveInterview(interviewId);
    const apiKey = process.env.SIMLI_API_KEY;
    const faceId = process.env.SIMLI_FACE_ID;
    if (!apiKey || !faceId)
      throw new Error("The interviewer avatar is not configured.");
    const response = await fetch("https://api.simli.ai/compose/token", {
      method: "POST",
      cache: "no-store",
      signal: AbortSignal.timeout(20000),
      headers: {
        "Content-Type": "application/json",
        "x-simli-api-key": apiKey,
      },
      body: JSON.stringify({
        faceId,
        handleSilence: true,
        maxSessionLength: 1800,
        maxIdleTime: 300,
      }),
    });
    if (!response.ok)
      throw new Error(
        `Avatar connection unavailable (HTTP ${response.status}). Check the Simli account and face configuration.`,
      );
    const data = await response.json();
    if (typeof data.session_token !== "string")
      throw new Error("Avatar session could not be created.");
    return { success: true as const, token: data.session_token };
  } catch (error) {
    return {
      success: false as const,
      error:
        error instanceof Error ? error.message : "Avatar connection failed.",
    };
  }
}

export async function getInterviewSpeechAction(
  interviewId: string,
  questionId: string,
) {
  try {
    await requireActiveInterview(interviewId);
    const data = await aiServiceClient.interviewSpeech(interviewId, questionId);
    return { success: true as const, data };
  } catch (error) {
    return {
      success: false as const,
      error:
        error instanceof Error
          ? error.message
          : "Interviewer audio is unavailable.",
    };
  }
}
