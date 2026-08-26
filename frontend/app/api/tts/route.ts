import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

const PYTHON_BACKEND_BASE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000/api/v1";
const SHARED_SECRET = process.env.AI_SERVICE_SHARED_SECRET || "recruit360_shared_backend_secret_2026";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, applicationId } = body;

    if (!text || !applicationId) {
      return NextResponse.json({ error: "Missing text or applicationId" }, { status: 400 });
    }

    // 1. Authorize: Verify the application is actually in the 'interview' state
    const supabase = await createAdminClient();
    const { data: application } = await supabase
      .from("applications")
      .select("status")
      .eq("id", applicationId)
      .single();

    if (!application || application.status !== "interview") {
      return NextResponse.json({ error: "Unauthorized or invalid application state" }, { status: 403 });
    }

    // 2. Proxy to Python TTS endpoint securely
    const targetUrl = `${PYTHON_BACKEND_BASE_URL}/interviews/tts`;
    
    const pythonResponse = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "x-ai-service-secret": SHARED_SECRET,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
      cache: "no-store",
    });

    if (!pythonResponse.ok) {
      const err = await pythonResponse.text();
      throw new Error(err);
    }

    const audioBlob = await pythonResponse.blob();

    return new NextResponse(audioBlob, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
      },
    });
  } catch (error: unknown) {
    console.error("TTS Proxy Error:", error);
    return NextResponse.json(
      { error: "Failed to generate TTS audio" },
      { status: 500 }
    );
  }
}
