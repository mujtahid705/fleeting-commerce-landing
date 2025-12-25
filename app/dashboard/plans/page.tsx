"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Plus,
  Edit2,
  RefreshCw,
  Check,
  X,
  Crown,
  Rocket,
  Zap,
  Database,
  Trash2,
} from "lucide-react";
import PageCard from "@/components/dashboard/PageCard";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import DataTable from "@/components/dashboard/DataTable";
import PlanFormModal from "@/components/dashboard/PlanFormModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  fetchAllPlansAdmin,
  createPlan,
  updatePlan,
  seedPlans,
  deletePlan,
  setSelectedPlan,
  clearSelectedPlan,
  clearError,
} from "@/lib/store/slices/adminPlansSlice";
import { Plan, CreatePlanData, UpdatePlanData } from "@/lib/types/plans";

const planIcons: Record<string, React.ReactNode> = {
  "Free Trial": <Rocket className="w-5 h-5 text-green-500" />,
  Starter: <Zap className="w-5 h-5 text-blue-500" />,
  Growth: <Crown className="w-5 h-5 text-purple-500" />,
};

export default function PlansPage() {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const { plans, selectedPlan, isLoading, isSubmitting, error } =
    useAppSelector((state) => state.adminPlans);
  const { user } = useAppSelector((state) => state.auth);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    plan: Plan | null;
  }>({
    open: false,
    plan: null,
  });

  // Check if user is SUPER_ADMIN
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  useEffect(() => {
    if (isSuperAdmin) {
      dispatch(fetchAllPlansAdmin());
    }
  }, [dispatch, isSuperAdmin]);

  useEffect(() => {
    if (error) {
      showToast({ type: "error", title: error });
      dispatch(clearError());
    }
  }, [error, dispatch, showToast]);

  const handleOpenModal = (plan?: Plan) => {
    if (plan) {
      dispatch(setSelectedPlan(plan));
    } else {
      dispatch(clearSelectedPlan());
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    dispatch(clearSelectedPlan());
  };

  const handleSubmit = async (data: CreatePlanData | UpdatePlanData) => {
    try {
      if ("id" in data) {
        await dispatch(updatePlan(data as UpdatePlanData)).unwrap();
        showToast({ type: "success", title: "Plan updated successfully" });
      } else {
        await dispatch(createPlan(data as CreatePlanData)).unwrap();
        showToast({ type: "success", title: "Plan created successfully" });
      }
      handleCloseModal();
    } catch {
      // Error handled by redux
    }
  };

  const handleSeedPlans = async () => {
    try {
      await dispatch(seedPlans()).unwrap();
      showToast({
        type: "success",
        title: "Default plans seeded successfully",
      });
    } catch {
      // Error handled by redux
    }
  };

  const handleToggleActive = async (plan: Plan) => {
    try {
      await dispatch(
        updatePlan({ id: plan.id, isActive: !plan.isActive })
      ).unwrap();
      showToast({
        type: "success",
        title: `Plan ${
          plan.isActive ? "deactivated" : "activated"
        } successfully`,
      });
    } catch {
      // Error handled by redux
    }
  };

  const handleDeleteClick = (plan: Plan) => {
    setDeleteConfirm({ open: true, plan });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.plan) return;
    try {
      await dispatch(deletePlan(deleteConfirm.plan.id)).unwrap();
      showToast({ type: "success", title: "Plan deleted successfully" });
      setDeleteConfirm({ open: false, plan: null });
    } catch {
      // Error handled by redux
    }
  };

  // Table columns
  const columns = [
    {
      key: "name" as keyof Plan,
      header: "Plan Name",
      render: (item: Plan) => (
        <div className="flex items-center gap-2">
          {planIcons[item.name] || (
            <Package className="w-5 h-5 text-gray-500" />
          )}
          <span className="font-medium text-gray-900">{item.name}</span>
        </div>
      ),
    },
    {
      key: "price" as keyof Plan,
      header: "Price",
      render: (item: Plan) => (
        <span className="text-gray-700">
          {item.price === 0 ? (
            <span className="text-green-600 font-medium">Free</span>
          ) : (
            `৳${item.price}/${item.interval === "MONTHLY" ? "mo" : "yr"}`
          )}
        </span>
      ),
    },
    {
      key: "maxProducts" as keyof Plan,
      header: "Products",
      render: (item: Plan) => (
        <span className="text-gray-600">{item.maxProducts}</span>
      ),
    },
    {
      key: "maxCategories" as keyof Plan,
      header: "Categories",
      render: (item: Plan) => (
        <span className="text-gray-600">{item.maxCategories}</span>
      ),
    },
    {
      key: "maxSubcategoriesPerCategory" as keyof Plan,
      header: "Subcategories",
      render: (item: Plan) => (
        <span className="text-gray-600">
          {item.maxSubcategoriesPerCategory}/cat
        </span>
      ),
    },
    {
      key: "customDomain" as keyof Plan,
      header: "Custom Domain",
      render: (item: Plan) =>
        item.customDomain ? (
          <Check className="w-5 h-5 text-green-500" />
        ) : (
          <X className="w-5 h-5 text-gray-400" />
        ),
    },
    {
      key: "isActive" as keyof Plan,
      header: "Status",
      render: (item: Plan) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            item.isActive
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {item.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "id" as keyof Plan,
      header: "Actions",
      render: (item: Plan) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenModal(item)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Edit Plan"
          >
            <Edit2 className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={() => handleToggleActive(item)}
            className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${
              item.isActive ? "text-red-500" : "text-green-500"
            }`}
            title={item.isActive ? "Deactivate" : "Activate"}
          >
            {item.isActive ? (
              <X className="w-4 h-4" />
            ) : (
              <Check className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => handleDeleteClick(item)}
            className="p-2 rounded-lg hover:bg-red-50 transition-colors text-red-500"
            title="Delete Plan"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  if (!isSuperAdmin) {
    return (
      <PageCard title="Plans Management">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <X className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Access Denied
          </h3>
          <p className="text-gray-500">
            Only Super Admins can access this page.
          </p>
        </div>
      </PageCard>
    );
  }

  return (
    <>
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-primary" />
            Plans Management
          </h1>
          <p className="text-gray-500 mt-1">
            Create and manage subscription plans for tenants
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleSeedPlans}
            isLoading={isSubmitting}
          >
            <Database className="w-4 h-4 mr-2" />
            Seed Default Plans
          </Button>
          <Button
            variant="outline"
            onClick={() => dispatch(fetchAllPlansAdmin())}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="primary" onClick={() => handleOpenModal()}>
            <Plus className="w-4 h-4 mr-2" />
            New Plan
          </Button>
        </div>
      </div>

      {/* Content */}
      <PageCard>
        {isLoading && plans.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : plans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No plans yet
            </h3>
            <p className="text-gray-500 mb-4">
              Create your first plan or seed default plans.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSeedPlans}>
                <Database className="w-4 h-4 mr-2" />
                Seed Default Plans
              </Button>
              <Button variant="primary" onClick={() => handleOpenModal()}>
                <Plus className="w-4 h-4 mr-2" />
                Create Plan
              </Button>
            </div>
          </div>
        ) : (
          <DataTable columns={columns} data={plans} />
        )}
      </PageCard>

      {/* Plan Form Modal */}
      <PlanFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        plan={selectedPlan}
        isLoading={isSubmitting}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, plan: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Plan"
        message={`Are you sure you want to delete "${deleteConfirm.plan?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        isLoading={isSubmitting}
        variant="danger"
      />
    </>
  );
}
