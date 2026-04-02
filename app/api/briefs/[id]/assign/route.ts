import { apiError, apiForbidden, apiNotFound, apiUnauthorized } from "@/lib/api-error";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { broadcastEvent } from "@/lib/sse";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return apiUnauthorized();
  if (session.user.role !== "ADMIN") return apiForbidden();

  const { id } = params;
  const body = await request.json();
  const { assigneeId } = body as { assigneeId: string | null };

  const brief = await prisma.brief.findUnique({ where: { id } });
  if (!brief) return apiNotFound("Brief");

  if (assigneeId) {
    const user = await prisma.user.findUnique({ where: { id: assigneeId } });
    if (!user) return apiError("User not found", 400);
  }

  const [updated] = await prisma.$transaction([
    prisma.brief.update({
      where: { id },
      data: { assigneeId: assigneeId ?? null },
      select: { id: true, assigneeId: true },
    }),
    prisma.briefEvent.create({
      data: {
        briefId: id,
        userId: session.user.id,
        type: "ASSIGNMENT",
        payload: { assigneeId: assigneeId ?? null },
      },
    }),
  ]);

  broadcastEvent({ type: "ASSIGNED", briefId: id, assigneeId });

  return NextResponse.json(updated);
}
