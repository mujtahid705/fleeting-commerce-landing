"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Mail,
  Phone,
  Users,
  UserCheck,
  UserX,
  Calendar,
  X,
  Eye,
  Power,
} from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import PageCard from "@/components/dashboard/PageCard";
import DataTable from "@/components/dashboard/DataTable";
import StatCard from "@/components/dashboard/StatCard";
import Spinner from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  fetchCustomersByTenant,
  updateCustomerStatus,
} from "@/lib/store/slices/customersSlice";
import { Customer } from "@/lib/types/customers";

export default function CustomersPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();

  const { user } = useAppSelector((state) => state.auth);
  const { customers, isLoading, error } = useAppSelector(
    (state) => state.customers
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Handle status toggle
  const handleStatusToggle = async (customer: Customer) => {
    setUpdatingId(customer.id);
    try {
      await dispatch(
        updateCustomerStatus({
          customerId: customer.id,
          isActive: !customer.isActive,
        })
      ).unwrap();
      showToast({
        type: "success",
        title: customer.isActive
          ? "Customer deactivated successfully"
          : "Customer activated successfully",
      });
    } catch (err) {
      showToast({ type: "error", title: err as string });
    } finally {
      setUpdatingId(null);
    }
  };

  // Role protection
  useEffect(() => {
    if (user && user.role !== "TENANT_ADMIN") {
      router.push("/dashboard");
    }
  }, [user, router]);

  // Fetch customers
  useEffect(() => {
    dispatch(fetchCustomersByTenant());
  }, [dispatch]);

  // Error handling
  useEffect(() => {
    if (error) {
      showToast({ type: "error", title: error });
    }
  }, [error, showToast]);

  // Filter customers
  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone?.includes(searchQuery);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && customer.isActive) ||
      (statusFilter === "inactive" && !customer.isActive);

    return matchesSearch && matchesStatus;
  });

  // Stats
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter((c) => c.isActive).length;
  const inactiveCustomers = customers.filter((c) => !c.isActive).length;
  const recentCustomers = customers.filter((c) => {
    const createdDate = new Date(c.createdAt);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return createdDate >= thirtyDaysAgo;
  }).length;

  // Table columns
  const columns = [
    {
      key: "name" as keyof Customer,
      header: "Customer",
      render: (item: Customer) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold text-sm">
            {item.name
              ? item.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
              : item.email[0].toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-gray-900">{item.name || "N/A"}</p>
            <p className="text-xs text-gray-500">{item.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "phone" as keyof Customer,
      header: "Phone",
      render: (item: Customer) => (
        <div className="flex items-center gap-2">
          <Phone size={14} className="text-gray-400" />
          <span className="text-gray-600">{item.phone || "N/A"}</span>
        </div>
      ),
    },
    {
      key: "isActive" as keyof Customer,
      header: "Status",
      render: (item: Customer) => (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
            item.isActive
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {item.isActive ? <UserCheck size={12} /> : <UserX size={12} />}
          {item.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "createdAt" as keyof Customer,
      header: "Joined",
      render: (item: Customer) => (
        <span className="text-gray-600">
          {new Date(item.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "id" as keyof Customer,
      header: "Actions",
      render: (item: Customer) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => setSelectedCustomer(item)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={() => handleStatusToggle(item)}
            disabled={updatingId === item.id}
            className={`p-2 rounded-lg transition-colors ${
              item.isActive
                ? "hover:bg-red-50 text-red-600"
                : "hover:bg-green-50 text-green-600"
            } ${updatingId === item.id ? "opacity-50 cursor-wait" : ""}`}
            title={item.isActive ? "Deactivate Customer" : "Activate Customer"}
          >
            {updatingId === item.id ? (
              <Spinner size="sm" />
            ) : (
              <Power className="w-4 h-4" />
            )}
          </button>
        </div>
      ),
    },
  ];

  if (isLoading && customers.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Customers"
        subtitle="Manage your customer relationships"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Customers"
          value={totalCustomers.toString()}
          icon={Users}
          iconColor="from-blue-500 to-cyan-500"
          delay={0}
        />
        <StatCard
          title="Active Customers"
          value={activeCustomers.toString()}
          icon={UserCheck}
          iconColor="from-green-500 to-emerald-500"
          delay={0.1}
        />
        <StatCard
          title="Inactive Customers"
          value={inactiveCustomers.toString()}
          icon={UserX}
          iconColor="from-gray-500 to-slate-500"
          delay={0.2}
        />
        <StatCard
          title="New (30 days)"
          value={recentCustomers.toString()}
          icon={Calendar}
          iconColor="from-purple-500 to-pink-500"
          delay={0.3}
        />
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
          />
        </div>
        <div className="flex gap-3">
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "all" | "active" | "inactive")
            }
            className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium text-gray-700"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm font-medium text-gray-700">
            <Filter size={18} />
            More Filters
          </button>
        </div>
      </div>

      {/* Customers Table */}
      <PageCard noPadding>
        <DataTable
          columns={columns}
          data={filteredCustomers}
          emptyMessage="No customers found"
        />
      </PageCard>

      {/* Customer Details Modal */}
      <AnimatePresence>
        {selectedCustomer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedCustomer(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-primary to-accent p-6 text-white">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
                      {selectedCustomer.name
                        ? selectedCustomer.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                        : selectedCustomer.email[0].toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">
                        {selectedCustomer.name || "N/A"}
                      </h3>
                      <p className="text-white/80 text-sm">
                        {selectedCustomer.email}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedCustomer(null)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Phone className="text-gray-400" size={18} />
                    <span className="text-sm text-gray-600">Phone</span>
                  </div>
                  <span className="font-medium text-gray-900">
                    {selectedCustomer.phone || "N/A"}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Mail className="text-gray-400" size={18} />
                    <span className="text-sm text-gray-600">Email</span>
                  </div>
                  <span className="font-medium text-gray-900">
                    {selectedCustomer.email}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <UserCheck className="text-gray-400" size={18} />
                    <span className="text-sm text-gray-600">Status</span>
                  </div>
                  <button
                    onClick={() => handleStatusToggle(selectedCustomer)}
                    disabled={updatingId === selectedCustomer.id}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedCustomer.isActive
                        ? "bg-red-100 text-red-700 hover:bg-red-200"
                        : "bg-green-100 text-green-700 hover:bg-green-200"
                    } ${
                      updatingId === selectedCustomer.id
                        ? "opacity-50 cursor-wait"
                        : ""
                    }`}
                  >
                    {updatingId === selectedCustomer.id ? (
                      <Spinner size="sm" />
                    ) : selectedCustomer.isActive ? (
                      <UserX size={14} />
                    ) : (
                      <UserCheck size={14} />
                    )}
                    {selectedCustomer.isActive ? "Deactivate" : "Activate"}
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Calendar className="text-gray-400" size={18} />
                    <span className="text-sm text-gray-600">Joined</span>
                  </div>
                  <span className="font-medium text-gray-900">
                    {new Date(selectedCustomer.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Calendar className="text-gray-400" size={18} />
                    <span className="text-sm text-gray-600">Last Updated</span>
                  </div>
                  <span className="font-medium text-gray-900">
                    {new Date(selectedCustomer.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-100">
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
