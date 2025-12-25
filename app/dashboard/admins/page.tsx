"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  UserCog,
  UserCheck,
  UserX,
  Calendar,
  Phone,
  Mail,
  X,
  Plus,
  Eye,
  UserPlus,
} from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import PageCard from "@/components/dashboard/PageCard";
import DataTable from "@/components/dashboard/DataTable";
import StatCard from "@/components/dashboard/StatCard";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  fetchTenantAdmins,
  createTenantAdmin,
} from "@/lib/store/slices/tenantAdminsSlice";
import { Admin } from "@/lib/types/admins";

export default function TenantAdminsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();

  const { user, tenant } = useAppSelector((state) => state.auth);
  const { admins, isLoading, isCreating, error } = useAppSelector(
    (state) => state.tenantAdmins
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  // Role protection
  useEffect(() => {
    if (user && user.role !== "TENANT_ADMIN") {
      router.push("/dashboard");
    }
  }, [user, router]);

  // Fetch admins
  useEffect(() => {
    dispatch(fetchTenantAdmins());
  }, [dispatch]);

  // Error handling
  useEffect(() => {
    if (error) {
      showToast({ type: "error", title: error });
    }
  }, [error, showToast]);

  // Filter admins
  const filteredAdmins = admins.filter(
    (admin) =>
      admin.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.phone?.includes(searchQuery)
  );

  // Stats
  const totalAdmins = admins.length;
  const activeAdmins = admins.filter((a) => a.isActive).length;
  const inactiveAdmins = admins.filter((a) => !a.isActive).length;

  // Handle create
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant?.id) {
      showToast({ type: "error", title: "Tenant ID not found" });
      return;
    }
    try {
      await dispatch(
        createTenantAdmin({ ...formData, tenantId: tenant.id })
      ).unwrap();
      showToast({ type: "success", title: "Admin created successfully" });
      setShowCreateModal(false);
      setFormData({ name: "", email: "", password: "", phone: "" });
    } catch (err) {
      showToast({ type: "error", title: err as string });
    }
  };

  // Table columns
  const columns = [
    {
      key: "name" as keyof Admin,
      header: "Admin",
      render: (item: Admin) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white font-semibold text-sm">
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
      key: "phone" as keyof Admin,
      header: "Phone",
      render: (item: Admin) => (
        <div className="flex items-center gap-2">
          <Phone size={14} className="text-gray-400" />
          <span className="text-gray-600">{item.phone || "N/A"}</span>
        </div>
      ),
    },
    {
      key: "isActive" as keyof Admin,
      header: "Status",
      render: (item: Admin) => (
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
      key: "createdAt" as keyof Admin,
      header: "Joined",
      render: (item: Admin) => (
        <span className="text-gray-600">
          {new Date(item.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "id" as keyof Admin,
      header: "Actions",
      render: (item: Admin) => (
        <button
          onClick={() => setSelectedAdmin(item)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          title="View Details"
        >
          <Eye className="w-4 h-4 text-gray-600" />
        </button>
      ),
    },
  ];

  if (isLoading && admins.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Team Admins"
        subtitle="Manage your store administrators"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Admins"
          value={totalAdmins.toString()}
          icon={UserCog}
          iconColor="from-blue-500 to-cyan-500"
          delay={0}
        />
        <StatCard
          title="Active Admins"
          value={activeAdmins.toString()}
          icon={UserCheck}
          iconColor="from-green-500 to-emerald-500"
          delay={0.1}
        />
        <StatCard
          title="Inactive Admins"
          value={inactiveAdmins.toString()}
          icon={UserX}
          iconColor="from-gray-500 to-slate-500"
          delay={0.2}
        />
      </div>

      {/* Search & Actions */}
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
        <Button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2"
        >
          <Plus size={18} />
          Add Admin
        </Button>
      </div>

      {/* Admins Table */}
      <PageCard noPadding>
        <DataTable
          columns={columns}
          data={filteredAdmins}
          emptyMessage="No admins found"
        />
      </PageCard>

      {/* Admin Details Modal */}
      <AnimatePresence>
        {selectedAdmin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedAdmin(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 text-white">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
                      {selectedAdmin.name
                        ? selectedAdmin.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                        : selectedAdmin.email[0].toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">
                        {selectedAdmin.name || "N/A"}
                      </h3>
                      <p className="text-white/80 text-sm">
                        {selectedAdmin.email}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedAdmin(null)}
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
                    <UserCog className="text-gray-400" size={18} />
                    <span className="text-sm text-gray-600">Role</span>
                  </div>
                  <span className="font-medium text-blue-600">
                    TENANT_ADMIN
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Phone className="text-gray-400" size={18} />
                    <span className="text-sm text-gray-600">Phone</span>
                  </div>
                  <span className="font-medium text-gray-900">
                    {selectedAdmin.phone || "N/A"}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Mail className="text-gray-400" size={18} />
                    <span className="text-sm text-gray-600">Email</span>
                  </div>
                  <span className="font-medium text-gray-900">
                    {selectedAdmin.email}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <UserCheck className="text-gray-400" size={18} />
                    <span className="text-sm text-gray-600">Status</span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                      selectedAdmin.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {selectedAdmin.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Calendar className="text-gray-400" size={18} />
                    <span className="text-sm text-gray-600">Joined</span>
                  </div>
                  <span className="font-medium text-gray-900">
                    {new Date(selectedAdmin.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-100">
                <button
                  onClick={() => setSelectedAdmin(null)}
                  className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Admin Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 text-white">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <UserPlus size={24} />
                    <h3 className="text-xl font-bold">Add Team Admin</h3>
                  </div>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleCreate} className="p-6 space-y-4">
                <Input
                  label="Full Name"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
                <Input
                  label="Phone Number"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  required
                />
                <Input
                  label="Password"
                  type="password"
                  placeholder="Enter password (min 8 characters)"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                />

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <Button
                    type="submit"
                    disabled={isCreating}
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    {isCreating ? (
                      <>
                        <Spinner size="sm" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus size={18} />
                        Create Admin
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
