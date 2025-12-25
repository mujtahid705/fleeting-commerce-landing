"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  DollarSign,
  Package,
  Layers,
  FolderTree,
  ShoppingCart,
  Globe,
} from "lucide-react";
import { Plan, CreatePlanData, UpdatePlanData } from "@/lib/types/plans";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface PlanFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePlanData | UpdatePlanData) => void;
  plan?: Plan | null;
  isLoading?: boolean;
}

export default function PlanFormModal({
  isOpen,
  onClose,
  onSubmit,
  plan,
  isLoading = false,
}: PlanFormModalProps) {
  const isEditing = !!plan;

  const [formData, setFormData] = useState<CreatePlanData>({
    name: "",
    price: 0,
    currency: "BDT",
    interval: "MONTHLY",
    trialDays: 0,
    maxProducts: 10,
    maxCategories: 5,
    maxSubcategoriesPerCategory: 5,
    maxOrders: 100,
    customDomain: false,
  });

  useEffect(() => {
    if (plan) {
      setFormData({
        name: plan.name,
        price: plan.price,
        currency: plan.currency,
        interval: plan.interval as "MONTHLY" | "YEARLY",
        trialDays: plan.trialDays,
        maxProducts: plan.maxProducts,
        maxCategories: plan.maxCategories,
        maxSubcategoriesPerCategory: plan.maxSubcategoriesPerCategory,
        maxOrders: plan.maxOrders,
        customDomain: plan.customDomain,
      });
    } else {
      setFormData({
        name: "",
        price: 0,
        currency: "BDT",
        interval: "MONTHLY",
        trialDays: 0,
        maxProducts: 10,
        maxCategories: 5,
        maxSubcategoriesPerCategory: 5,
        maxOrders: 100,
        customDomain: false,
      });
    }
  }, [plan, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && plan) {
      onSubmit({ id: plan.id, ...formData });
    } else {
      onSubmit(formData);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : type === "number"
          ? parseFloat(value) || 0
          : value,
    }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h2 className="text-xl font-semibold text-gray-900">
                {isEditing ? "Edit Plan" : "Create New Plan"}
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  Basic Information
                </h3>
                <Input
                  label="Plan Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Starter, Growth, Pro"
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    icon={<DollarSign className="w-4 h-4" />}
                    required
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Currency
                    </label>
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    >
                      <option value="BDT">BDT</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Billing Interval
                  </label>
                  <select
                    name="interval"
                    value={formData.interval}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  >
                    <option value="MONTHLY">Monthly</option>
                    <option value="YEARLY">Yearly</option>
                  </select>
                </div>
              </div>

              {/* Limits */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-primary" />
                  Plan Limits
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Max Products"
                    name="maxProducts"
                    type="number"
                    min="1"
                    value={formData.maxProducts}
                    onChange={handleChange}
                    icon={<Package className="w-4 h-4" />}
                    required
                  />
                  <Input
                    label="Max Categories"
                    name="maxCategories"
                    type="number"
                    min="1"
                    value={formData.maxCategories}
                    onChange={handleChange}
                    icon={<FolderTree className="w-4 h-4" />}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Max Subcategories per Category"
                    name="maxSubcategoriesPerCategory"
                    type="number"
                    min="1"
                    value={formData.maxSubcategoriesPerCategory}
                    onChange={handleChange}
                    icon={<Layers className="w-4 h-4" />}
                    required
                  />
                  <Input
                    label="Max Orders"
                    name="maxOrders"
                    type="number"
                    min="1"
                    value={formData.maxOrders}
                    onChange={handleChange}
                    icon={<ShoppingCart className="w-4 h-4" />}
                  />
                </div>
              </div>

              {/* Features */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  Features
                </h3>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="customDomain"
                    checked={formData.customDomain}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-gray-700">Custom Domain Support</span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isLoading}
                  className="flex-1"
                >
                  {isEditing ? "Update Plan" : "Create Plan"}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
