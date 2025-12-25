"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  FolderOpen,
  Package,
} from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import PageCard from "@/components/dashboard/PageCard";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import CategoryFormModal from "@/components/dashboard/CategoryFormModal";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  clearError,
} from "@/lib/store/slices/categoriesSlice";
import { Category } from "@/lib/types/categories";

export default function CategoriesPage() {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const { categories, isLoading, isSubmitting, error } = useAppSelector(
    (state) => state.categories
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null
  );
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  // Fetch categories on mount
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Show error toast
  useEffect(() => {
    if (error) {
      showToast({ type: "error", title: "Error", message: error });
      dispatch(clearError());
    }
  }, [error, dispatch, showToast]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    if (openMenuId !== null) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [openMenuId]);

  // Filter categories
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Open create modal
  const handleAddCategory = () => {
    setSelectedCategory(null);
    setIsFormModalOpen(true);
  };

  // Open edit modal
  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setOpenMenuId(null);
    setIsFormModalOpen(true);
  };

  // Open delete dialog
  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    setOpenMenuId(null);
    setIsDeleteDialogOpen(true);
  };

  // Submit form (create/update)
  const handleFormSubmit = async (data: { name: string }) => {
    try {
      if (selectedCategory) {
        await dispatch(
          updateCategory({
            id: selectedCategory.id,
            name: data.name,
          })
        ).unwrap();
        showToast({ type: "success", title: "Category updated successfully!" });
      } else {
        await dispatch(createCategory({ name: data.name })).unwrap();
        showToast({ type: "success", title: "Category created successfully!" });
      }
      setIsFormModalOpen(false);
      setSelectedCategory(null);
    } catch {
      // Error handled by slice
    }
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    try {
      await dispatch(deleteCategory(categoryToDelete.id)).unwrap();
      showToast({ type: "success", title: "Category deleted successfully!" });
      setIsDeleteDialogOpen(false);
      setCategoryToDelete(null);
    } catch {
      // Error handled by slice
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      <PageHeader
        title="Categories"
        subtitle="Organize your products into categories"
      />

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
          />
        </div>
        <Button
          size="sm"
          className="flex items-center gap-2"
          onClick={handleAddCategory}
        >
          <Plus size={18} />
          Add Category
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Spinner size="lg" />
          <p className="mt-4 text-muted">Loading categories...</p>
        </div>
      ) : filteredCategories.length === 0 ? (
        /* Empty State */
        <PageCard className="py-16 text-center">
          <div className="flex flex-col items-center">
            <div className="p-4 bg-gray-100 rounded-full mb-4">
              <FolderOpen size={32} className="text-muted" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {searchQuery ? "No categories found" : "No categories yet"}
            </h3>
            <p className="text-muted text-sm mb-4 max-w-sm">
              {searchQuery
                ? "Try adjusting your search to find what you're looking for."
                : "Get started by creating your first category to organize your products."}
            </p>
            {!searchQuery && (
              <Button
                onClick={handleAddCategory}
                className="flex items-center gap-2"
              >
                <Plus size={18} />
                Add Category
              </Button>
            )}
          </div>
        </PageCard>
      ) : (
        /* Categories Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
              >
                <PageCard className="hover:shadow-md transition-shadow group">
                  {/* Category Icon */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl">
                      <Package className="w-6 h-6 text-primary" />
                    </div>
                    {/* Menu Button */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(
                            openMenuId === category.id ? null : category.id
                          );
                        }}
                        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <MoreVertical size={18} className="text-muted" />
                      </button>

                      {/* Dropdown Menu */}
                      <AnimatePresence>
                        {openMenuId === category.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -5 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -5 }}
                            transition={{ duration: 0.1 }}
                            className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10"
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditCategory(category);
                              }}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-foreground"
                            >
                              <Edit size={14} />
                              Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(category);
                              }}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 flex items-center gap-2 text-red-600"
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Category Info */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-foreground text-lg">
                      {category.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-muted">
                      <span>
                        {category.subCategoriesCount || 0} subcategories
                      </span>
                      <span>•</span>
                      <span>{category.productsCount || 0} products</span>
                    </div>
                    {category.createdAt && (
                      <p className="text-xs text-muted pt-2">
                        Created {formatDate(category.createdAt)}
                      </p>
                    )}
                  </div>
                </PageCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Form Modal */}
      <CategoryFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedCategory(null);
        }}
        onSubmit={handleFormSubmit}
        category={selectedCategory}
        isLoading={isSubmitting}
        mode="category"
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setCategoryToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Category"
        message={`Are you sure you want to delete "${categoryToDelete?.name}"? This will also delete all subcategories and may affect products.`}
        confirmText="Delete"
        variant="danger"
        isLoading={isSubmitting}
      />
    </>
  );
}
