import { apiError, apiForbidden, apiNotFound, apiUnauthorized } from "@/lib/api-error";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { broadcastEvent } from "@/lib/sse";
import { BriefStage } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

const VALID_STAGES = Object.values(BriefStage);

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return apiUnauthorized();
  if (session.user.role !== "ADMIN") return apiForbidden();

  const { id } = params;
  const body = await request.json();
  const { stage } = body as { stage: string };

  if (!stage || !VALID_STAGES.includes(stage as BriefStage)) {
    return apiError("Invalid stage", 400);
  }

  const brief = await prisma.brief.findUnique({ where: { id } });
  if (!brief) return apiNotFound("Brief");

  const [updated] = await prisma.$transaction([
    prisma.brief.update({
      where: { id },
      data: { stage: stage as BriefStage },
      select: { id: true, stage: true },
    }),
    prisma.briefEvent.create({
      data: {
        briefId: id,
        userId: session.user.id,
        type: "STAGE_CHANGE",
        payload: { from: brief.stage, to: stage },
      },
    }),
  ]);

  // Invalidate analytics cache
  try {
    const { redis } = await import("@/lib/redis");
    await redis.del("analytics:summary");
  } catch {
    // non-fatal
  }

  broadcastEvent({ type: "STAGE_CHANGED", briefId: id, stage });

  return NextResponse.json(updated);
}
