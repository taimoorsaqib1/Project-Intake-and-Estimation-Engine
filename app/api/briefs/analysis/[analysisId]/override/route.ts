import { apiError, apiNotFound, apiUnauthorized, apiValidationError } from "@/lib/api-error";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const overrideSchema = z.object({
  effortMin: z.number().int().min(1),
  effortMax: z.number().int().min(1),
  complexityScore: z.number().int().min(1).max(5),
  techStack: z.array(z.string().min(1)).min(1),
  reason: z.string().min(10).max(2000),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { analysisId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return apiUnauthorized();

  const { analysisId } = params;

  const analysis = await prisma.briefAnalysis.findUnique({ where: { id: analysisId } });
  if (!analysis) return apiNotFound("Analysis");
  if (analysis.status !== "COMPLETED") {
    return apiError("Can only override a completed analysis", 400);
  }

  const body = await request.json();
  const parsed = overrideSchema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError(parsed.error);
  }

  const override = await prisma.estimateOverride.upsert({
    where: { analysisId },
    create: { analysisId, overriddenById: session.user.id, ...parsed.data },
    update: { overriddenById: session.user.id, ...parsed.data },
    select: { id: true },
  });

  return NextResponse.json({ override }, { status: 200 });
}
