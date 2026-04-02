import { apiError, apiForbidden, apiNotFound, apiUnauthorized, apiValidationError } from "@/lib/api-error";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { broadcastEvent } from "@/lib/sse";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const noteSchema = z.object({
  content: z.string().min(1).max(5000),
  parentId: z.string().cuid().optional().nullable(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return apiUnauthorized();

  const { id: briefId } = params;

  const brief = await prisma.brief.findUnique({ where: { id: briefId } });
  if (!brief) return apiNotFound("Brief");

  // REVIEWER can only add notes to briefs assigned to them
  if (session.user.role === "REVIEWER" && brief.assigneeId !== session.user.id) {
    return apiForbidden();
  }

  const body = await request.json();
  const parsed = noteSchema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError(parsed.error);
  }

  const { content, parentId } = parsed.data;

  // Verify parent if supplied
  if (parentId) {
    const parent = await prisma.briefNote.findUnique({ where: { id: parentId } });
    if (!parent || parent.briefId !== briefId) {
      return apiError("Invalid parentId", 400);
    }
  }

  const [note] = await prisma.$transaction([
    prisma.briefNote.create({
      data: { briefId, authorId: session.user.id, content, parentId: parentId ?? null },
      select: { id: true, content: true, createdAt: true, parentId: true },
    }),
    prisma.briefEvent.create({
      data: {
        briefId,
        userId: session.user.id,
        type: "NOTE_ADDED",
        payload: { content: content.slice(0, 100) },
      },
    }),
  ]);

  broadcastEvent({ type: "NOTE_ADDED", briefId });

  return NextResponse.json({ note }, { status: 201 });
}
