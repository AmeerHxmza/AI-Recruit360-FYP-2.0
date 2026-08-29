import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET /api/keep-alive
 * Next.js Edge/Server endpoint to warm up and verify the Render Python backend.
 * Can be called by Vercel Cron or external uptime monitors.
 */
export async function GET() {
  const backendUrl =
    process.env.NEXT_PUBLIC_FASTAPI_URL ||
    "https://ai-recruit360-fyp.onrender.com";

  const target = `${backendUrl.replace(/\/$/, "")}/api/v1/health/live`;
  const startTime = Date.now();

  try {
    const response = await fetch(target, {
      method: "GET",
      cache: "no-store",
      headers: {
        "User-Agent": "AI-Recruit360-Vercel-KeepAlive/2.0",
      },
    });

    const durationMs = Date.now() - startTime;
    const isOk = response.ok;
    const body = await response.text();

    return NextResponse.json(
      {
        status: isOk ? "ok" : "degraded",
        backendUrl: target,
        backendStatus: response.status,
        durationMs,
        response: body,
      },
      { status: isOk ? 200 : 502 }
    );
  } catch (error: unknown) {
    const durationMs = Date.now() - startTime;
    const message = error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      {
        status: "error",
        backendUrl: target,
        durationMs,
        error: message,
      },
      { status: 500 }
    );
  }
}
