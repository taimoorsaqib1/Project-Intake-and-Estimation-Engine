import { processBrief } from "@/lib/ai/process-brief";
import { apiError, apiRateLimited, apiValidationError } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import { formRateLimit } from "@/lib/redis";
import { broadcastEvent } from "@/lib/sse";
import { briefSchema } from "@/lib/validation/brief";
import { NextRequest, NextResponse } from "next/server";

function getIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "anonymous"
  );
}

export async function POST(request: NextRequest) {
  // 1. Rate limiting
  const ip = getIp(request);
  const { success, retryAfter } = await formRateLimit(ip);

  if (!success) {
    return apiRateLimited(retryAfter);
  }

  // 2. Parse and validate body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("Invalid JSON body", 400);
  }

  const parsed = briefSchema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError(parsed.error);
  }

  // 3. Save brief to database
  const brief = await prisma.brief.create({
    data: {
      ...parsed.data,
      source: "FORM",
    },
  });

  // 4. Broadcast SSE so the Kanban board refreshes in real-time
  broadcastEvent({ type: "BRIEF_NEW", briefId: brief.id });

  // 5. Fire-and-forget AI analysis pipeline
  processBrief(brief.id).catch((err) => {
    console.error(`[API] Background analysis failed for brief ${brief.id}:`, err);
  });

  return NextResponse.json(
    { id: brief.id, message: "Brief submitted successfully. We'll be in touch soon!" },
    { status: 201 }
  );
}
