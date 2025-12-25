"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Package,
  User,
  Mail,
  Calendar,
  DollarSign,
  Truck,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Order, OrderStatus } from "@/lib/types/orders";
import Button from "@/components/ui/Button";

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onStatusChange: (orderId: number, status: OrderStatus) => void;
  isSubmitting?: boolean;
}

const statusConfig: Record<
  OrderStatus,
  { label: string; color: string; bgColor: string; icon: typeof Clock }
> = {
  pending: {
    label: "Pending",
    color: "text-yellow-700",
    bgColor: "bg-yellow-100",
    icon: Clock,
  },
  processing: {
    label: "Processing",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
    icon: AlertCircle,
  },
  shipped: {
    label: "Shipped",
    color: "text-purple-700",
    bgColor: "bg-purple-100",
    icon: Truck,
  },
  delivered: {
    label: "Delivered",
    color: "text-green-700",
    bgColor: "bg-green-100",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-700",
    bgColor: "bg-red-100",
    icon: XCircle,
  },
};

export default function OrderDetailsModal({
  isOpen,
  onClose,
  order,
  onStatusChange,
  isSubmitting,
}: OrderDetailsModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "">("");

  if (!order) return null;

  const config = statusConfig[order.status];
  const StatusIcon = config.icon;
  const imageBaseUrl = process.env.NEXT_PUBLIC_IMAGE_URL || "";

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "BDT",
    }).format(price);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const handleStatusUpdate = () => {
    if (selectedStatus && selectedStatus !== order.status) {
      onStatusChange(order.id, selectedStatus);
      setSelectedStatus("");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Order #{order.id}
                </h2>
                <p className="text-sm text-muted">
                  {formatDate(order.createdAt)}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-muted hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
              {/* Status & Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Current Status */}
                <div className="p-4 rounded-xl bg-gray-50">
                  <div className="flex items-center gap-2 mb-2">
                    <StatusIcon size={18} className={config.color} />
                    <span className="text-sm font-medium text-muted">
                      Status
                    </span>
                  </div>
                  <span
                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${config.bgColor} ${config.color}`}
                  >
                    {config.label}
                  </span>
                </div>

                {/* Customer Info */}
                <div className="p-4 rounded-xl bg-gray-50">
                  <div className="flex items-center gap-2 mb-2">
                    <User size={18} className="text-muted" />
                    <span className="text-sm font-medium text-muted">
                      Customer
                    </span>
                  </div>
                  <p className="font-medium text-foreground">
                    {order.user.name}
                  </p>
                  <p className="text-sm text-muted flex items-center gap-1">
                    <Mail size={14} />
                    {order.user.email}
                  </p>
                </div>
              </div>

              {/* Update Status */}
              <div className="p-4 rounded-xl border border-gray-200">
                <h3 className="text-sm font-medium text-foreground mb-3">
                  Update Status
                </h3>
                <div className="flex gap-3">
                  <select
                    value={selectedStatus}
                    onChange={(e) =>
                      setSelectedStatus(e.target.value as OrderStatus)
                    }
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                  >
                    <option value="">Select new status...</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <Button
                    onClick={handleStatusUpdate}
                    disabled={
                      !selectedStatus || selectedStatus === order.status
                    }
                    isLoading={isSubmitting}
                  >
                    Update
                  </Button>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                  <Package size={18} />
                  Order Items ({order.order_items.length})
                </h3>
                <div className="space-y-3">
                  {order.order_items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-3 rounded-xl bg-gray-50"
                    >
                      <div className="w-16 h-16 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
                        {item.product.images?.[0]?.imageUrl ? (
                          <Image
                            src={`${imageBaseUrl}${item.product.images[0].imageUrl}`}
                            alt={item.product.title}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package size={24} className="text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {item.product.title}
                        </p>
                        <p className="text-sm text-muted">
                          {formatPrice(item.unitPrice)} × {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold text-foreground">
                        {formatPrice(item.unitPrice * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Total */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10">
                <div className="flex items-center gap-2">
                  <DollarSign size={20} className="text-primary" />
                  <span className="font-medium text-foreground">
                    Total Amount
                  </span>
                </div>
                <span className="text-xl font-bold text-primary">
                  {formatPrice(order.totalAmount)}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100">
              <Button variant="outline" className="w-full" onClick={onClose}>
                Close
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
