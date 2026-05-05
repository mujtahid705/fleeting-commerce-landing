"use client";

export function KpiSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="h-4 w-28 bg-gray-200 rounded mb-3" />
          <div className="h-9 w-20 bg-gray-200 rounded mb-3" />
          <div className="h-5 w-36 bg-gray-100 rounded-full" />
        </div>
        <div className="w-12 h-12 rounded-xl bg-gray-200" />
      </div>
    </div>
  );
}

export function ChartSkeleton({ height = 280 }: { height?: number }) {
  return (
    <div
      className="animate-pulse bg-gray-100 rounded-xl"
      style={{ height }}
    />
  );
}
