import { prisma } from "@/lib/prisma";
import { broadcastEvent } from "@/lib/sse";
import { analyzeBrief } from "@/lib/ai/analyze-brief";

export async function processBrief(briefId: string): Promise<void> {
  // Fetch the brief to get title and description
  const brief = await prisma.brief.findUnique({
    where: { id: briefId },
    select: { title: true, description: true },
  });

  if (!brief) {
    console.error(`[Pipeline] Brief not found: ${briefId}`);
    return;
  }

  // Create the analysis record in PENDING state
  const analysisRecord = await prisma.briefAnalysis.create({
    data: {
      briefId,
      status: "PENDING",
      features: [],
    },
  });

  try {
    const { analysis, rawResponse } = await analyzeBrief(brief.title, brief.description);

    if (!analysis) {
      await prisma.briefAnalysis.update({
        where: { id: analysisRecord.id },
        data: {
          status: "FAILED",
          rawResponse: rawResponse ?? "No response received",
          errorMessage: "AI analysis failed after all retry attempts",
        },
      });
      console.warn(`[Pipeline] Analysis FAILED for brief: ${briefId}`);
      return;
    }

    await prisma.briefAnalysis.update({
      where: { id: analysisRecord.id },
      data: {
        status: "COMPLETED",
        features: analysis.features,
        category: analysis.category,
        effortMin: analysis.effortMin,
        effortMax: analysis.effortMax,
        techStack: analysis.techStack,
        complexityScore: analysis.complexityScore,
        rawResponse,
      },
    });

    broadcastEvent({ type: "ANALYSIS_COMPLETED", briefId });

    console.log(`[Pipeline] Analysis COMPLETED for brief: ${briefId}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    await prisma.briefAnalysis.update({
      where: { id: analysisRecord.id },
      data: {
        status: "FAILED",
        errorMessage: message,
      },
    }).catch(() => {}); // Don't throw if this update also fails
    console.error(`[Pipeline] Unexpected error for brief ${briefId}:`, error);
  }
}
