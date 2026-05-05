"use client";

import { AlertTriangle, CheckCircle } from "lucide-react";
import { InventoryItem } from "@/lib/types/inventory";

interface LowStockPanelProps {
  items: InventoryItem[];
}

export default function LowStockPanel({ items }: LowStockPanelProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <CheckCircle size={32} className="text-green-500 mb-2" />
        <p className="text-sm font-medium text-gray-700">All stocked</p>
        <p className="text-xs text-muted mt-1">No inventory alerts</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const isOut = item.quantity === 0;
        return (
          <div
            key={item.productId}
            className={`flex items-center justify-between p-3 rounded-xl border ${
              isOut ? "border-red-200 bg-red-50" : "border-amber-200 bg-amber-50"
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <AlertTriangle
                size={16}
                className={isOut ? "text-red-500 shrink-0" : "text-amber-500 shrink-0"}
              />
              <p className="text-sm font-medium text-gray-800 truncate">
                {item.product?.title ?? item.productId}
              </p>
            </div>
            <span
              className={`ml-3 shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold ${
                isOut ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
              }`}
            >
              {isOut ? "Out" : `${item.quantity} left`}
            </span>
          </div>
        );
      })}
    </div>
  );
}
