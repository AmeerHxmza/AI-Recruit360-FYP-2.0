import { NextRequest, NextResponse } from "next/server";

const PYTHON_BACKEND_BASE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000/api/v1";
const SHARED_SECRET = process.env.AI_SERVICE_SHARED_SECRET || "recruit360_shared_backend_secret_2026";

async function proxyToPythonService(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const resolvedParams = await params;
    const pathSegments = resolvedParams.path || [];
    const targetPath = pathSegments.join("/");
    const searchParams = request.nextUrl.search;
    
    const targetUrl = `${PYTHON_BACKEND_BASE_URL}/${targetPath}${searchParams}`;

    let body: BodyInit | null = null;
    if (request.method !== "GET" && request.method !== "HEAD") {
      const contentType = request.headers.get("content-type") || "";
      if (contentType.includes("multipart/form-data")) {
        body = await request.formData();
      } else {
        body = await request.text();
      }
    }

    const headers: Record<string, string> = {
      "x-ai-service-secret": SHARED_SECRET,
    };

    const reqContentType = request.headers.get("content-type");
    if (reqContentType && !reqContentType.includes("multipart/form-data")) {
      headers["content-type"] = reqContentType;
    }

    const pythonResponse = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
      cache: "no-store",
    });

    const responseData = await pythonResponse.text();

    return new NextResponse(responseData, {
      status: pythonResponse.status,
      headers: {
        "Content-Type": pythonResponse.headers.get("content-type") || "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Failed to connect to Python AI Engine.";
    return NextResponse.json(
      { error: "API Gateway Proxy Error", message: errorMsg },
      { status: 502 }
    );
  }
}

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxyToPythonService(request, context);
}

export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxyToPythonService(request, context);
}

export async function PUT(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxyToPythonService(request, context);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxyToPythonService(request, context);
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxyToPythonService(request, context);
}
