"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Package,
  User,
  Mail,
  Truck,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ShoppingBag,
  ChevronRight,
} from "lucide-react";
import { Order, OrderStatus } from "@/lib/types/orders";
import { Product } from "@/lib/types/products";
import Button from "@/components/ui/Button";

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onStatusChange: (orderId: number, status: OrderStatus) => void;
  isSubmitting?: boolean;
  products?: Product[];
}

const statusConfig: Record<
  OrderStatus,
  {
    label: string;
    color: string;
    bgColor: string;
    borderColor: string;
    icon: typeof Clock;
    step: number;
  }
> = {
  pending: {
    label: "Pending",
    color: "text-yellow-700",
    bgColor: "bg-yellow-100",
    borderColor: "border-yellow-300",
    icon: Clock,
    step: 0,
  },
  processing: {
    label: "Processing",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
    borderColor: "border-blue-300",
    icon: AlertCircle,
    step: 1,
  },
  shipped: {
    label: "Shipped",
    color: "text-purple-700",
    bgColor: "bg-purple-100",
    borderColor: "border-purple-300",
    icon: Truck,
    step: 2,
  },
  delivered: {
    label: "Delivered",
    color: "text-green-700",
    bgColor: "bg-green-100",
    borderColor: "border-green-300",
    icon: CheckCircle,
    step: 3,
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-700",
    bgColor: "bg-red-100",
    borderColor: "border-red-300",
    icon: XCircle,
    step: -1,
  },
};

const statusFlow: OrderStatus[] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
];

const allStatuses: OrderStatus[] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export default function OrderDetailsModal({
  isOpen,
  onClose,
  order,
  onStatusChange,
  isSubmitting,
  products = [],
}: OrderDetailsModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "">("");

  if (!order) return null;

  const config = statusConfig[order.status];
  const StatusIcon = config.icon;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(price);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const handleStatusUpdate = () => {
    if (selectedStatus && selectedStatus !== order.status) {
      onStatusChange(order.id, selectedStatus as OrderStatus);
      setSelectedStatus("");
    }
  };

  const isCancelled = order.status === "cancelled";
  const currentStep = config.step;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[92vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <ShoppingBag size={18} className="text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold text-foreground">
                      Order #{order.id}
                    </h2>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.bgColor} ${config.color} border ${config.borderColor}`}
                    >
                      <StatusIcon size={11} />
                      {config.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted">{formatDate(order.createdAt)}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-muted hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">
              {/* Status timeline */}
              {!isCancelled && (
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                  <div className="flex items-center justify-between relative">
                    {/* progress bar */}
                    <div className="absolute left-0 right-0 top-4 h-0.5 bg-gray-200 mx-8" />
                    <div
                      className="absolute left-8 top-4 h-0.5 bg-primary transition-all duration-500"
                      style={{
                        width:
                          currentStep === 0
                            ? "0%"
                            : `${(currentStep / (statusFlow.length - 1)) * 100}%`,
                      }}
                    />
                    {statusFlow.map((s, i) => {
                      const sc = statusConfig[s];
                      const Icon = sc.icon;
                      const done = i <= currentStep;
                      const active = i === currentStep;
                      return (
                        <div key={s} className="flex flex-col items-center gap-1.5 z-10">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                              active
                                ? "border-primary bg-primary text-white shadow-md"
                                : done
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-gray-300 bg-white text-gray-400"
                            }`}
                          >
                            <Icon size={14} />
                          </div>
                          <span
                            className={`text-xs font-medium ${
                              active
                                ? "text-primary"
                                : done
                                ? "text-primary/70"
                                : "text-gray-400"
                            }`}
                          >
                            {sc.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {isCancelled && (
                <div className="mx-6 mt-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3">
                  <XCircle size={18} className="text-red-500 flex-shrink-0" />
                  <p className="text-sm font-medium text-red-700">
                    This order has been cancelled
                  </p>
                </div>
              )}

              <div className="px-6 py-4 space-y-5">
                {/* Customer + summary row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-100 bg-white">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <User size={15} className="text-muted" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted mb-0.5">Customer</p>
                      <p className="font-semibold text-sm text-foreground truncate">
                        {order.user.name}
                      </p>
                      <p className="text-xs text-muted flex items-center gap-1 truncate">
                        <Mail size={11} />
                        {order.user.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-100 bg-white">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <Package size={15} className="text-muted" />
                    </div>
                    <div>
                      <p className="text-xs text-muted mb-0.5">Order Summary</p>
                      <p className="font-semibold text-sm text-foreground">
                        {order.order_items.length}{" "}
                        {order.order_items.length === 1 ? "item" : "items"}
                      </p>
                      <p className="text-xs text-muted">
                        Total:{" "}
                        <span className="font-semibold text-primary">
                          {formatPrice(order.totalAmount)}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order items */}
                <div>
                  <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                    Items
                  </h3>
                  <div className="space-y-2">
                    {order.order_items.map((item) => {
                    const fullProduct = products.find((p) => p.id === item.productId);
                    const imageUrl =
                      fullProduct?.images?.[0]?.imageUrl ||
                      item.product.images?.[0]?.imageUrl;
                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-white hover:border-gray-200 transition-colors"
                      >
                        <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={item.product.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package size={20} className="text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-foreground truncate">
                            {item.product.title}
                          </p>
                          <p className="text-xs text-muted mt-0.5">
                            {formatPrice(item.unitPrice)} × {item.quantity}
                          </p>
                        </div>
                        <p className="font-semibold text-sm text-foreground flex-shrink-0">
                          {formatPrice(item.unitPrice * item.quantity)}
                        </p>
                      </div>
                    );
                  })}
                  </div>

                  {/* Total row */}
                  <div className="flex items-center justify-between mt-3 px-3 py-2.5 rounded-xl bg-primary/5 border border-primary/10">
                    <span className="text-sm font-medium text-foreground">
                      Total
                    </span>
                    <span className="text-lg font-bold text-primary">
                      {formatPrice(order.totalAmount)}
                    </span>
                  </div>
                </div>

                {/* Update status — pill button group */}
                <div className="border border-gray-200 rounded-xl p-4">
                  <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
                    Update Status
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {allStatuses.map((s) => {
                      const sc = statusConfig[s];
                      const Icon = sc.icon;
                      const isCurrent = s === order.status;
                      const isSelected = s === selectedStatus;
                      return (
                        <button
                          key={s}
                          type="button"
                          disabled={isCurrent}
                          onClick={() =>
                            setSelectedStatus(isSelected ? "" : s)
                          }
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                            isCurrent
                              ? `${sc.bgColor} ${sc.color} ${sc.borderColor} cursor-default opacity-80`
                              : isSelected
                              ? `${sc.bgColor} ${sc.color} ${sc.borderColor} ring-2 ring-offset-1 ring-current`
                              : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          <Icon size={11} />
                          {sc.label}
                          {isCurrent && (
                            <span className="ml-0.5 opacity-60">(current)</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3">
              <Button variant="outline" onClick={onClose} className="flex-1 sm:flex-none">
                Close
              </Button>
              <Button
                onClick={handleStatusUpdate}
                disabled={!selectedStatus || selectedStatus === order.status}
                isLoading={isSubmitting}
                className="flex-1 sm:flex-none flex items-center gap-1.5"
              >
                {selectedStatus && selectedStatus !== order.status ? (
                  <>
                    Set to{" "}
                    <span className="font-bold">
                      {statusConfig[selectedStatus as OrderStatus].label}
                    </span>
                    <ChevronRight size={14} />
                  </>
                ) : (
                  "Update Status"
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
