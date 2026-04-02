import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

const CACHE_KEY = "analytics:summary";
const CACHE_TTL = 60;

const BUDGET_MIDPOINTS: Record<string, number> = {
  UNDER_5K: 2_500,
  BETWEEN_5K_15K: 10_000,
  BETWEEN_15K_50K: 32_500,
  OVER_50K: 75_000,
};

export interface AnalyticsData {
  briefsByStage: { stage: string; count: number }[];
  topCategories: { category: string; count: number }[];
  revenuePipeline: number;
  conversionRate: number;
  complexityOverTime: { date: string; avgScore: number }[];
  totalBriefs: number;
  wonBriefs: number;
}

export async function getAnalyticsData(): Promise<AnalyticsData> {
  // Check cache
  try {
    const cached = await redis.get<string>(CACHE_KEY);
    if (cached) {
      return typeof cached === "string" ? JSON.parse(cached) : cached;
    }
  } catch {
    // Cache miss is fine
  }

  const [byStage, byCategory, activeBriefs, total, won, allComplexity] = await Promise.all([
    prisma.brief.groupBy({ by: ["stage"], _count: { _all: true } }),
    prisma.briefAnalysis.groupBy({
      by: ["category"],
      where: { status: "COMPLETED", category: { not: null } },
      _count: { _all: true },
    }),
    prisma.brief.findMany({
      where: { stage: { in: ["UNDER_REVIEW", "PROPOSAL_SENT"] } },
      select: { budgetRange: true },
    }),
    prisma.brief.count(),
    prisma.brief.count({ where: { stage: "WON" } }),
    prisma.briefAnalysis.findMany({
      where: { status: "COMPLETED", complexityScore: { not: null } },
      select: { complexityScore: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const revenuePipeline = activeBriefs.reduce(
    (sum, b) => sum + (BUDGET_MIDPOINTS[b.budgetRange] ?? 0),
    0
  );

  const weeklyMap = new Map<string, number[]>();
  for (const a of allComplexity) {
    const d = new Date(a.createdAt);
    d.setDate(d.getDate() - d.getDay());
    d.setHours(0, 0, 0, 0);
    const key = d.toISOString().slice(0, 10);
    if (!weeklyMap.has(key)) weeklyMap.set(key, []);
    weeklyMap.get(key)!.push(a.complexityScore ?? 0);
  }

  const data: AnalyticsData = {
    briefsByStage: byStage.map((s) => ({
      stage: s.stage.replace(/_/g, " "),
      count: s._count._all,
    })),
    topCategories: byCategory
      .filter((c) => c.category !== null)
      .sort((a, b) => b._count._all - a._count._all)
      .slice(0, 5)
      .map((c) => ({
        category: (c.category as string).replace(/_/g, " "),
        count: c._count._all,
      })),
    revenuePipeline,
    conversionRate: total > 0 ? Math.round((won / total) * 100) : 0,
    complexityOverTime: Array.from(weeklyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([date, scores]) => ({
        date,
        avgScore:
          Math.round((scores.reduce((s, v) => s + v, 0) / scores.length) * 10) / 10,
      })),
    totalBriefs: total,
    wonBriefs: won,
  };

  try {
    await redis.set(CACHE_KEY, JSON.stringify(data), { ex: CACHE_TTL });
  } catch {
    // non-fatal
  }

  return data;
}
