"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface BriefsByStageChartProps {
  data: { stage: string; count: number }[];
}

export function BriefsByStageChart({ data }: BriefsByStageChartProps) {
  if (data.length === 0) {
    return <p className="text-sm text-slate-400 text-center py-8">No data yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis
          dataKey="stage"
          tick={{ fontSize: 11, fill: "#64748b" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#64748b" }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
        />
        <Bar
          dataKey="count"
          fill="#1e40af"
          radius={[4, 4, 0, 0]}
          label={false}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
