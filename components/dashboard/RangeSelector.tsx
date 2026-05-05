"use client";

import { DashboardRange } from "@/lib/types/dashboard";

const RANGES: { label: string; value: DashboardRange }[] = [
  { label: "7d", value: "7d" },
  { label: "30d", value: "30d" },
  { label: "90d", value: "90d" },
];

interface RangeSelectorProps {
  value: DashboardRange;
  onChange: (range: DashboardRange) => void;
  disabled?: boolean;
}

export default function RangeSelector({ value, onChange, disabled }: RangeSelectorProps) {
  return (
    <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-1">
      {RANGES.map((r) => (
        <button
          key={r.value}
          onClick={() => onChange(r.value)}
          disabled={disabled}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
            value === r.value
              ? "bg-primary text-white shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          } disabled:opacity-50`}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}
