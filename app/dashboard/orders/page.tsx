"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Eye,
  ShoppingCart,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  Package,
  AlertCircle,
} from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import PageCard from "@/components/dashboard/PageCard";
import DataTable from "@/components/dashboard/DataTable";
import StatCard from "@/components/dashboard/StatCard";
import Spinner from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import OrderDetailsModal from "@/components/dashboard/OrderDetailsModal";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  fetchOrders,
  updateOrderStatus,
  setSelectedOrder,
  clearSelectedOrder,
  clearError,
} from "@/lib/store/slices/ordersSlice";
import { Order, OrderStatus } from "@/lib/types/orders";

const statusConfig: Record<OrderStatus, { label: string; style: string }> = {
  pending: { label: "Pending", style: "bg-yellow-100 text-yellow-700" },
  processing: { label: "Processing", style: "bg-blue-100 text-blue-700" },
  shipped: { label: "Shipped", style: "bg-purple-100 text-purple-700" },
  delivered: { label: "Delivered", style: "bg-green-100 text-green-700" },
  cancelled: { label: "Cancelled", style: "bg-red-100 text-red-700" },
};

export default function OrdersPage() {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const { orders, selectedOrder, isLoading, isSubmitting, error } =
    useAppSelector((state) => state.orders);
  const { user } = useAppSelector((state) => state.auth);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Fetch orders on mount
  useEffect(() => {
    if (user?.role === "TENANT_ADMIN" || user?.role === "SUPER_ADMIN") {
      dispatch(fetchOrders());
    }
  }, [dispatch, user?.role]);

  // Handle errors
  useEffect(() => {
    if (error) {
      showToast({ type: "error", title: "Error", message: error });
      dispatch(clearError());
    }
  }, [error, dispatch, showToast]);

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toString().includes(searchQuery);
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Stats
  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const processingCount = orders.filter(
    (o) => o.status === "processing"
  ).length;
  const shippedCount = orders.filter((o) => o.status === "shipped").length;
  const deliveredCount = orders.filter((o) => o.status === "delivered").length;

  // View order details
  const handleViewOrder = (order: Order) => {
    dispatch(setSelectedOrder(order));
    setIsDetailsModalOpen(true);
  };

  // Close details modal
  const handleCloseDetails = () => {
    setIsDetailsModalOpen(false);
    dispatch(clearSelectedOrder());
  };

  // Update order status
  const handleStatusChange = async (orderId: number, status: OrderStatus) => {
    try {
      await dispatch(updateOrderStatus({ id: orderId, status })).unwrap();
      showToast({
        type: "success",
        title: "Status Updated",
        message: `Order status changed to ${statusConfig[status].label}`,
      });
    } catch {
      // Error handled by slice
    }
  };

  // Format price
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "BDT",
    }).format(price);

  // Format date
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  // Table columns
  const columns = [
    {
      key: "id",
      header: "Order ID",
      render: (item: Order) => (
        <span className="font-medium text-foreground">#{item.id}</span>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      render: (item: Order) => (
        <div>
          <p className="font-medium text-foreground">{item.user.name}</p>
          <p className="text-xs text-muted">{item.user.email}</p>
        </div>
      ),
    },
    {
      key: "items",
      header: "Items",
      render: (item: Order) => (
        <span className="text-foreground">{item.order_items.length}</span>
      ),
    },
    {
      key: "total",
      header: "Total",
      render: (item: Order) => (
        <span className="font-medium text-foreground">
          {formatPrice(item.totalAmount)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item: Order) => {
        const config = statusConfig[item.status];
        return (
          <span
            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${config.style}`}
          >
            {config.label}
          </span>
        );
      },
    },
    {
      key: "date",
      header: "Date",
      render: (item: Order) => (
        <span className="text-muted">{formatDate(item.createdAt)}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (item: Order) => (
        <button
          onClick={() => handleViewOrder(item)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          title="View Details"
        >
          <Eye size={16} className="text-muted" />
        </button>
      ),
    },
  ];

  // Access check
  if (user?.role !== "TENANT_ADMIN" && user?.role !== "SUPER_ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <XCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Access Denied
        </h2>
        <p className="text-muted">
          You don&apos;t have permission to view this page.
        </p>
      </div>
    );
  }

  return (
    <>
      <PageHeader title="Orders" subtitle="View and manage customer orders" />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Orders"
          value={orders.length.toString()}
          icon={ShoppingCart}
          iconColor="from-blue-500 to-cyan-500"
          delay={0}
        />
        <StatCard
          title="Pending"
          value={pendingCount.toString()}
          icon={Clock}
          iconColor="from-yellow-500 to-orange-500"
          delay={0.1}
        />
        <StatCard
          title="Processing"
          value={processingCount.toString()}
          icon={AlertCircle}
          iconColor="from-blue-500 to-indigo-500"
          delay={0.2}
        />
        <StatCard
          title="Delivered"
          value={deliveredCount.toString()}
          icon={CheckCircle}
          iconColor="from-green-500 to-emerald-500"
          delay={0.3}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="text"
            placeholder="Search by order ID, customer name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium text-foreground"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      <PageCard noPadding>
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredOrders}
            emptyMessage="No orders found"
          />
        )}
      </PageCard>

      {/* Order Details Modal */}
      <OrderDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetails}
        order={selectedOrder}
        onStatusChange={handleStatusChange}
        isSubmitting={isSubmitting}
      />
    </>
  );
}
