"use client";

interface MetricCardsProps {
  total: number;
  wonBriefs: number;
  conversionRate: number;
  revenuePipeline: number;
}

export function MetricCards({ total, wonBriefs, conversionRate, revenuePipeline }: MetricCardsProps) {
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(revenuePipeline);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { label: "Total Briefs", value: String(total), color: "text-blue-600" },
        { label: "Won Briefs", value: String(wonBriefs), color: "text-emerald-600" },
        { label: "Conversion Rate", value: `${conversionRate}%`, color: "text-green-600" },
        { label: "Revenue Pipeline", value: formatted, color: "text-purple-600" },
      ].map(({ label, value, color }) => (
        <div key={label} className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs text-slate-400 uppercase font-medium tracking-wide">{label}</p>
          <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
        </div>
      ))}
    </div>
  );
}
