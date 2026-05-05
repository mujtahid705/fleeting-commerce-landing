"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { OrderStatusCount } from "@/lib/types/dashboard";

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  processing: "#3b82f6",
  shipped: "#8b5cf6",
  delivered: "#10b981",
  cancelled: "#ef4444",
};

interface OrderStatusDonutProps {
  data: OrderStatusCount[];
}

export default function OrderStatusDonut({ data }: OrderStatusDonutProps) {
  const nonZero = data.filter((d) => d.count > 0);

  if (nonZero.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-muted text-sm">
        No orders yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={nonZero}
          dataKey="count"
          nameKey="status"
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={80}
          paddingAngle={3}
        >
          {nonZero.map((entry) => (
            <Cell
              key={entry.status}
              fill={STATUS_COLORS[entry.status] ?? "#6366f1"}
            />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: any, name: any) => [
            value,
            String(name).charAt(0).toUpperCase() + String(name).slice(1),
          ]}
          contentStyle={{
            borderRadius: 12,
            border: "1px solid #e2e8f0",
            fontSize: 13,
          }}
        />
        <Legend
          formatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
          wrapperStyle={{ fontSize: 12 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
