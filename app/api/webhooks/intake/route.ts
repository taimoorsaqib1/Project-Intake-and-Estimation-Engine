import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";
import { apiError, apiRateLimited, apiUnauthorized, apiValidationError } from "@/lib/api-error";
import { webhookRateLimit } from "@/lib/redis";
import { briefSchema } from "@/lib/validation/brief";
import { processBrief } from "@/lib/ai/process-brief";

function getIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "webhook-anonymous"
  );
}

function verifySignature(rawBody: string, signatureHeader: string | null): boolean {
  const secret = process.env.WEBHOOK_SECRET;
  if (!secret) {
    console.error("[Webhook] WEBHOOK_SECRET is not set");
    return false;
  }
  if (!signatureHeader) return false;

  // Expected format: sha256=<hex>
  const [algo, provided] = signatureHeader.split("=");
  if (algo !== "sha256" || !provided) return false;

  const expected = createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("hex");

  try {
    return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(provided, "hex"));
  } catch {
    // Buffers of different lengths — definitely invalid
    return false;
  }
}

export async function POST(request: NextRequest) {
  // 1. Read raw body first (needed for HMAC before JSON.parse)
  const rawBody = await request.text();

  // 2. Verify HMAC signature
  const signature = request.headers.get("x-webhook-signature");
  if (!verifySignature(rawBody, signature)) {
    return apiUnauthorized();
  }

  // 3. Rate limit by IP
  const ip = getIp(request);
  const { success, retryAfter } = await webhookRateLimit(ip);
  if (!success) {
    return apiRateLimited(retryAfter);
  }

  // 4. Parse and validate JSON
  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return apiError("Invalid JSON body", 400);
  }

  const parsed = briefSchema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError(parsed.error);
  }

  // 5. Save brief as WEBHOOK source
  const brief = await prisma.brief.create({
    data: {
      ...parsed.data,
      source: "WEBHOOK",
    },
  });

  // 6. Fire-and-forget AI pipeline
  processBrief(brief.id).catch((err) => {
    console.error(`[Webhook] Background analysis failed for brief ${brief.id}:`, err);
  });

  return NextResponse.json({ received: true, id: brief.id }, { status: 200 });
}
