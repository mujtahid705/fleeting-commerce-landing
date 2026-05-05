"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { RevenueSeries } from "@/lib/types/dashboard";

interface RevenueLineChartProps {
  data: RevenueSeries[];
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatTaka(value: number) {
  return `৳${value.toLocaleString("en-US", { minimumFractionDigits: 0 })}`;
}

export default function RevenueLineChart({ data }: RevenueLineChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted text-sm">
        Awaiting first order
      </div>
    );
  }

  const chartData = data.map((d) => ({ ...d, date: formatDate(d.date) }));

  return (
    <ResponsiveContainer width="100%" height={256}>
      <LineChart
        data={chartData}
        margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12, fill: "#64748b" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          yAxisId="revenue"
          tickFormatter={(v) => `৳${(v / 1000).toFixed(0)}k`}
          tick={{ fontSize: 12, fill: "#64748b" }}
          tickLine={false}
          axisLine={false}
          width={50}
        />
        <YAxis
          yAxisId="orders"
          orientation="right"
          tick={{ fontSize: 12, fill: "#64748b" }}
          tickLine={false}
          axisLine={false}
          width={30}
        />
        <Tooltip
          formatter={(value: any, name: any) =>
            String(name) === "revenue"
              ? [formatTaka(value), "Revenue"]
              : [value, "Orders"]
          }
          contentStyle={{
            borderRadius: 12,
            border: "1px solid #e2e8f0",
            fontSize: 13,
          }}
        />
        <Legend
          formatter={(value) => (value === "revenue" ? "Revenue" : "Orders")}
          wrapperStyle={{ fontSize: 13 }}
        />
        <Line
          yAxisId="revenue"
          type="monotone"
          dataKey="revenue"
          stroke="#6366f1"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 5 }}
        />
        <Line
          yAxisId="orders"
          type="monotone"
          dataKey="orders"
          stroke="#8b5cf6"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 5 }}
          strokeDasharray="4 2"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
