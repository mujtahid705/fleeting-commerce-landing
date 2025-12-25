"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  DollarSign,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Eye,
  Check,
  X,
} from "lucide-react";
import PageCard from "@/components/dashboard/PageCard";
import DataTable from "@/components/dashboard/DataTable";
import StatCard from "@/components/dashboard/StatCard";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  fetchPaymentHistory,
  verifyManualPayment,
  setSelectedPayment,
  clearSelectedPayment,
  clearError,
} from "@/lib/store/slices/paymentsSlice";
import { Payment, PaymentStatus } from "@/lib/types/payments";

const statusConfig: Record<
  PaymentStatus,
  { bg: string; icon: typeof CheckCircle }
> = {
  PAID: {
    bg: "bg-green-100 text-green-700",
    icon: CheckCircle,
  },
  PENDING: {
    bg: "bg-yellow-100 text-yellow-700",
    icon: Clock,
  },
  FAILED: {
    bg: "bg-red-100 text-red-700",
    icon: XCircle,
  },
  CANCELLED: {
    bg: "bg-gray-100 text-gray-700",
    icon: XCircle,
  },
};

export default function PaymentsPage() {
  const dispatch = useAppDispatch();
  const { payments, selectedPayment, isLoading, error } = useAppSelector(
    (state) => state.payments
  );
  const { user } = useAppSelector((state) => state.auth);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  useEffect(() => {
    dispatch(fetchPaymentHistory());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      setToastMessage(error);
      setToastType("error");
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        dispatch(clearError());
      }, 3000);
    }
  }, [error, dispatch]);

  const handleViewDetails = (payment: Payment) => {
    dispatch(setSelectedPayment(payment));
    setShowDetailsModal(true);
  };

  const handleCloseDetails = () => {
    setShowDetailsModal(false);
    dispatch(clearSelectedPayment());
  };

  const handleVerifyPayment = async (action: "approve" | "reject") => {
    if (!selectedPayment) return;
    try {
      await dispatch(
        verifyManualPayment({ paymentId: selectedPayment.id, action })
      ).unwrap();
      setToastMessage(
        `Payment ${action === "approve" ? "approved" : "rejected"} successfully`
      );
      setToastType("success");
      setShowToast(true);
      handleCloseDetails();
      dispatch(fetchPaymentHistory());
    } catch {
      // Error handled by redux
    }
  };

  // Filter payments
  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      payment.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const totalAmount = payments.reduce((acc, p) => acc + p.amount, 0);
  const paidAmount = payments
    .filter((p) => p.status === "PAID")
    .reduce((acc, p) => acc + p.amount, 0);
  const pendingCount = payments.filter((p) => p.status === "PENDING").length;
  const failedCount = payments.filter(
    (p) => p.status === "FAILED" || p.status === "CANCELLED"
  ).length;

  // Table columns
  const columns = [
    {
      key: "transactionId" as keyof Payment,
      header: "Transaction ID",
      render: (item: Payment) => (
        <span className="font-mono text-sm text-gray-700">
          {item.transactionId.substring(0, 12)}...
        </span>
      ),
    },
    {
      key: "amount" as keyof Payment,
      header: "Amount",
      render: (item: Payment) => (
        <span className="font-medium text-gray-900">
          {item.currency} {item.amount.toFixed(2)}
        </span>
      ),
    },
    {
      key: "subscription" as keyof Payment,
      header: "Plan",
      render: (item: Payment) => (
        <span className="text-gray-600">
          {item.subscription?.plan?.name || "N/A"}
        </span>
      ),
    },
    {
      key: "provider" as keyof Payment,
      header: "Provider",
      render: (item: Payment) => (
        <div className="flex items-center gap-2">
          <CreditCard size={14} className="text-gray-400" />
          <span className="text-gray-600">{item.provider}</span>
        </div>
      ),
    },
    {
      key: "status" as keyof Payment,
      header: "Status",
      render: (item: Payment) => {
        const config = statusConfig[item.status] || statusConfig.PENDING;
        const Icon = config.icon;
        return (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg}`}
          >
            <Icon size={12} />
            {item.status}
          </span>
        );
      },
    },
    {
      key: "createdAt" as keyof Payment,
      header: "Date",
      render: (item: Payment) => (
        <span className="text-gray-600">
          {new Date(item.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "id" as keyof Payment,
      header: "Actions",
      render: (item: Payment) => (
        <button
          onClick={() => handleViewDetails(item)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          title="View Details"
        >
          <Eye className="w-4 h-4 text-gray-600" />
        </button>
      ),
    },
  ];

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Transactions"
          value={payments.length.toString()}
          icon={CreditCard}
          iconColor="from-blue-500 to-cyan-500"
          delay={0}
        />
        <StatCard
          title="Revenue Collected"
          value={`৳${paidAmount.toLocaleString()}`}
          change={`of ৳${totalAmount.toLocaleString()} total`}
          changeType="positive"
          icon={DollarSign}
          iconColor="from-green-500 to-emerald-500"
          delay={0.1}
        />
        <StatCard
          title="Pending Payments"
          value={pendingCount.toString()}
          icon={Clock}
          iconColor="from-yellow-500 to-orange-500"
          delay={0.2}
        />
        <StatCard
          title="Failed Payments"
          value={failedCount.toString()}
          change={failedCount > 0 ? "Needs review" : "All clear"}
          changeType={failedCount > 0 ? "negative" : "positive"}
          icon={XCircle}
          iconColor="from-red-500 to-pink-500"
          delay={0.3}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search by transaction ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm text-gray-900"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium text-gray-900"
        >
          <option value="all">All Status</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <Button
          variant="outline"
          onClick={() => dispatch(fetchPaymentHistory())}
          isLoading={isLoading}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Payments Table */}
      <PageCard title="Payment History">
        {isLoading && payments.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredPayments}
            emptyMessage="No payments found"
          />
        )}
      </PageCard>

      {/* Payment Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={handleCloseDetails}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-lg bg-white rounded-xl shadow-xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Payment Details
                </h2>
                <button
                  onClick={handleCloseDetails}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">
                      Transaction ID
                    </span>
                    <p className="font-mono text-sm text-gray-900 break-all">
                      {selectedPayment.transactionId}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Amount</span>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedPayment.currency}{" "}
                      {selectedPayment.amount.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Provider</span>
                    <p className="text-gray-900">{selectedPayment.provider}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Status</span>
                    <div className="mt-1">
                      {(() => {
                        const config =
                          statusConfig[selectedPayment.status] ||
                          statusConfig.PENDING;
                        const Icon = config.icon;
                        return (
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg}`}
                          >
                            <Icon size={12} />
                            {selectedPayment.status}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {selectedPayment.subscription && (
                  <div>
                    <span className="text-sm text-gray-500">
                      Subscription Plan
                    </span>
                    <p className="text-gray-900">
                      {selectedPayment.subscription.plan?.name || "N/A"}
                    </p>
                  </div>
                )}

                <div>
                  <span className="text-sm text-gray-500">Date</span>
                  <p className="text-gray-900">
                    {new Date(selectedPayment.createdAt).toLocaleString()}
                  </p>
                </div>

                {/* Verify Actions for SUPER_ADMIN */}
                {isSuperAdmin && selectedPayment.status === "PENDING" && (
                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      Manual Verification
                    </h4>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => handleVerifyPayment("reject")}
                        className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                      <Button
                        variant="primary"
                        onClick={() => handleVerifyPayment("approve")}
                        className="flex-1"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <Button
                  variant="outline"
                  onClick={handleCloseDetails}
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-4 right-4 px-4 py-3 rounded-xl shadow-lg z-50 ${
              toastType === "success"
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
