import { getAnalyticsData } from "@/lib/analytics";
import { getRequiredSession } from "@/lib/session";
import { notFound } from "next/navigation";
import { BriefsByStageChart } from "./_components/BriefsByStageChart";
import { ComplexityOverTimeChart } from "./_components/ComplexityOverTimeChart";
import { MetricCards } from "./_components/MetricCards";
import { TopCategoriesChart } from "./_components/TopCategoriesChart";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const session = await getRequiredSession();
  if (session.user.role !== "ADMIN") notFound();
  const data = await getAnalyticsData();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Analytics</h2>
        <p className="text-sm text-slate-500 mt-1">Real-time pipeline metrics (cached 60 s).</p>
      </div>

      <MetricCards
        total={data.totalBriefs}
        wonBriefs={data.wonBriefs}
        conversionRate={data.conversionRate}
        revenuePipeline={data.revenuePipeline}
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Briefs by Stage</h3>
          <BriefsByStageChart data={data.briefsByStage} />
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Top Project Categories</h3>
          <TopCategoriesChart data={data.topCategories} />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Average Complexity Over Time</h3>
        <ComplexityOverTimeChart data={data.complexityOverTime} />
      </div>
    </div>
  );
}
