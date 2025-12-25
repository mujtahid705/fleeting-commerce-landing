"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Package,
  AlertTriangle,
  ArrowUpDown,
  XCircle,
  Boxes,
} from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import PageCard from "@/components/dashboard/PageCard";
import DataTable from "@/components/dashboard/DataTable";
import StatCard from "@/components/dashboard/StatCard";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import InventoryFormModal, {
  InventoryFormData,
} from "@/components/dashboard/InventoryFormModal";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  fetchInventory,
  fetchLowStock,
  fetchOutOfStock,
  addToInventory,
  updateInventoryQuantity,
  deleteInventoryItem,
  setSelectedItem,
  clearSelectedItem,
  clearError,
} from "@/lib/store/slices/inventorySlice";
import { fetchProducts } from "@/lib/store/slices/productsSlice";
import { InventoryItem } from "@/lib/types/inventory";

type StockFilter = "all" | "low" | "out";

export default function InventoryPage() {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const { items, selectedItem, isLoading, isSubmitting, error } =
    useAppSelector((state) => state.inventory);
  const { products } = useAppSelector((state) => state.products);
  const { user } = useAppSelector((state) => state.auth);

  const [searchQuery, setSearchQuery] = useState("");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);
  const [lowStockThreshold] = useState(10);

  // Fetch data on mount and filter change
  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  useEffect(() => {
    if (stockFilter === "all") {
      dispatch(fetchInventory());
    } else if (stockFilter === "low") {
      dispatch(fetchLowStock(lowStockThreshold));
    } else if (stockFilter === "out") {
      dispatch(fetchOutOfStock());
    }
  }, [dispatch, stockFilter, lowStockThreshold]);

  // Handle errors
  useEffect(() => {
    if (error) {
      showToast({ type: "error", title: "Error", message: error });
      dispatch(clearError());
    }
  }, [error, dispatch, showToast]);

  // Filter items by search
  const filteredItems = items.filter((item) => {
    const productTitle = item.product?.title?.toLowerCase() || "";
    const productId = item.productId.toLowerCase();
    const query = searchQuery.toLowerCase();
    return productTitle.includes(query) || productId.includes(query);
  });

  // Stats calculations
  const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);
  const lowStockCount = items.filter(
    (item) => item.quantity > 0 && item.quantity <= lowStockThreshold
  ).length;
  const outOfStockCount = items.filter((item) => item.quantity === 0).length;
  const existingProductIds = items.map((item) => item.productId);

  // Add new item
  const handleAddItem = () => {
    dispatch(clearSelectedItem());
    setIsFormModalOpen(true);
  };

  // Edit item
  const handleEditItem = (item: InventoryItem) => {
    dispatch(setSelectedItem(item));
    setIsFormModalOpen(true);
  };

  // Delete item click
  const handleDeleteClick = (item: InventoryItem) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await dispatch(deleteInventoryItem(itemToDelete.productId)).unwrap();
      showToast({
        type: "success",
        title: "Deleted",
        message: "Inventory item deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch {
      // Error handled by slice
    }
  };

  // Form submit
  const handleFormSubmit = async (data: InventoryFormData) => {
    try {
      if (selectedItem) {
        await dispatch(
          updateInventoryQuantity({
            productId: data.productId,
            quantity: data.quantity,
          })
        ).unwrap();
        showToast({
          type: "success",
          title: "Updated",
          message: "Inventory quantity updated successfully",
        });
      } else {
        await dispatch(addToInventory(data)).unwrap();
        showToast({
          type: "success",
          title: "Added",
          message: "Product added to inventory successfully",
        });
      }
      setIsFormModalOpen(false);
      dispatch(clearSelectedItem());
    } catch {
      // Error handled by slice
    }
  };

  // Table columns
  const columns = [
    {
      key: "product",
      header: "Product",
      render: (item: InventoryItem) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
            <Package size={18} className="text-gray-500" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-foreground truncate">
              {item.product?.title || "Unknown Product"}
            </p>
            <p className="text-xs text-muted truncate">{item.productId}</p>
          </div>
        </div>
      ),
    },
    {
      key: "quantity",
      header: "Quantity",
      render: (item: InventoryItem) => {
        const isLow = item.quantity > 0 && item.quantity <= lowStockThreshold;
        const isOut = item.quantity === 0;
        return (
          <div className="flex items-center gap-2">
            <span
              className={`font-medium ${
                isOut
                  ? "text-red-600"
                  : isLow
                  ? "text-yellow-600"
                  : "text-foreground"
              }`}
            >
              {item.quantity}
            </span>
            {isOut && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                Out of Stock
              </span>
            )}
            {isLow && !isOut && (
              <AlertTriangle size={14} className="text-yellow-500" />
            )}
          </div>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      render: (item: InventoryItem) => {
        if (item.quantity === 0) {
          return (
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
              Out of Stock
            </span>
          );
        }
        if (item.quantity <= lowStockThreshold) {
          return (
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
              Low Stock
            </span>
          );
        }
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            In Stock
          </span>
        );
      },
    },
    {
      key: "updated",
      header: "Last Updated",
      render: (item: InventoryItem) => (
        <span className="text-muted text-sm">
          {new Date(item.updatedAt || item.createdAt).toLocaleDateString(
            "en-US",
            { month: "short", day: "numeric", year: "numeric" }
          )}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (item: InventoryItem) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleEditItem(item)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Edit"
          >
            <Edit size={16} className="text-muted" />
          </button>
          <button
            onClick={() => handleDeleteClick(item)}
            className="p-2 rounded-lg hover:bg-red-50 transition-colors"
            title="Delete"
          >
            <Trash2 size={16} className="text-red-500" />
          </button>
        </div>
      ),
    },
  ];

  // Access check
  if (user?.role !== "TENANT_ADMIN") {
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
      <PageHeader
        title="Inventory"
        subtitle="Track and manage your stock levels"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Quantity"
          value={totalQuantity.toLocaleString()}
          icon={Boxes}
          iconColor="from-blue-500 to-cyan-500"
          delay={0}
        />
        <StatCard
          title="Products Tracked"
          value={items.length.toString()}
          icon={Package}
          iconColor="from-purple-500 to-pink-500"
          delay={0.1}
        />
        <StatCard
          title="Low Stock"
          value={lowStockCount.toString()}
          change="Needs attention"
          changeType={lowStockCount > 0 ? "negative" : "neutral"}
          icon={AlertTriangle}
          iconColor="from-yellow-500 to-orange-500"
          delay={0.2}
        />
        <StatCard
          title="Out of Stock"
          value={outOfStockCount.toString()}
          change={outOfStockCount > 0 ? "Critical" : "All good"}
          changeType={outOfStockCount > 0 ? "negative" : "positive"}
          icon={XCircle}
          iconColor="from-red-500 to-pink-500"
          delay={0.3}
        />
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="text"
            placeholder="Search by product name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
          />
        </div>
        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value as StockFilter)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium text-foreground"
        >
          <option value="all">All Stock</option>
          <option value="low">Low Stock</option>
          <option value="out">Out of Stock</option>
        </select>
        <Button onClick={handleAddItem} className="flex items-center gap-2">
          <Plus size={18} />
          <span>Add Item</span>
        </Button>
      </div>

      {/* Inventory Table */}
      <PageCard noPadding>
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredItems}
            emptyMessage="No inventory items found"
          />
        )}
      </PageCard>

      {/* Form Modal */}
      <InventoryFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          dispatch(clearSelectedItem());
        }}
        onSubmit={handleFormSubmit}
        item={selectedItem}
        products={products}
        existingProductIds={existingProductIds}
        isLoading={isSubmitting}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Inventory Item"
        message={`Are you sure you want to remove "${
          itemToDelete?.product?.title || "this item"
        }" from inventory? This action cannot be undone.`}
        confirmText="Delete"
        isLoading={isSubmitting}
      />
    </>
  );
}
