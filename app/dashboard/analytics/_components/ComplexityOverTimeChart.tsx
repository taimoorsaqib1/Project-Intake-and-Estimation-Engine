"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ComplexityOverTimeChartProps {
  data: { date: string; avgScore: number }[];
}

export function ComplexityOverTimeChart({ data }: ComplexityOverTimeChartProps) {
  if (data.length === 0) {
    return <p className="text-sm text-slate-400 text-center py-8">Not enough data yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: "#64748b" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[0, 5]}
          tick={{ fontSize: 11, fill: "#64748b" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
        <Line
          type="monotone"
          dataKey="avgScore"
          stroke="#f59e0b"
          strokeWidth={2}
          dot={{ r: 4, fill: "#f59e0b" }}
          name="Avg Complexity"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
