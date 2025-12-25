"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  FolderTree,
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
  fetchSubCategories,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
  clearError,
} from "@/lib/store/slices/categoriesSlice";
import { SubCategory } from "@/lib/types/categories";

export default function SubcategoriesPage() {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const { categories, subCategories, isLoading, isSubmitting, error } =
    useAppSelector((state) => state.categories);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<
    number | null
  >(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSubCategory, setSelectedSubCategory] =
    useState<SubCategory | null>(null);
  const [subCategoryToDelete, setSubCategoryToDelete] =
    useState<SubCategory | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  // Fetch data on mount
  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchSubCategories());
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

  // Filter subcategories
  const filteredSubCategories = subCategories.filter((subCategory) => {
    const matchesSearch = subCategory.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      !selectedCategoryFilter ||
      subCategory.categoryId === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Get category name by ID
  const getCategoryName = (categoryId: number) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || "Unknown";
  };

  // Open create modal
  const handleAddSubCategory = () => {
    setSelectedSubCategory(null);
    setIsFormModalOpen(true);
  };

  // Open edit modal
  const handleEditSubCategory = (subCategory: SubCategory) => {
    setSelectedSubCategory(subCategory);
    setOpenMenuId(null);
    setIsFormModalOpen(true);
  };

  // Open delete dialog
  const handleDeleteClick = (subCategory: SubCategory) => {
    setSubCategoryToDelete(subCategory);
    setOpenMenuId(null);
    setIsDeleteDialogOpen(true);
  };

  // Submit form (create/update)
  const handleFormSubmit = async (data: {
    name: string;
    categoryId?: number;
  }) => {
    try {
      if (selectedSubCategory) {
        await dispatch(
          updateSubCategory({
            id: selectedSubCategory.id,
            name: data.name,
            categoryId: data.categoryId!,
          })
        ).unwrap();
        showToast({
          type: "success",
          title: "Subcategory updated successfully!",
        });
      } else {
        await dispatch(
          createSubCategory({
            name: data.name,
            categoryId: data.categoryId!,
          })
        ).unwrap();
        showToast({
          type: "success",
          title: "Subcategory created successfully!",
        });
      }
      setIsFormModalOpen(false);
      setSelectedSubCategory(null);
    } catch {
      // Error handled by slice
    }
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!subCategoryToDelete) return;
    try {
      await dispatch(deleteSubCategory(subCategoryToDelete.id)).unwrap();
      showToast({
        type: "success",
        title: "Subcategory deleted successfully!",
      });
      setIsDeleteDialogOpen(false);
      setSubCategoryToDelete(null);
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
        title="Subcategories"
        subtitle="Organize your products with subcategories"
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
            placeholder="Search subcategories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
          />
        </div>
        <div className="flex gap-3">
          {/* Category Filter */}
          <div className="relative">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2.5 rounded-xl border bg-white hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm font-medium ${
                selectedCategoryFilter
                  ? "border-primary text-primary"
                  : "border-gray-200 text-foreground"
              }`}
            >
              <Filter size={18} />
              Filter
              {selectedCategoryFilter && (
                <span className="px-1.5 py-0.5 bg-primary text-white text-xs rounded-full">
                  1
                </span>
              )}
            </button>

            {/* Filter Dropdown */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 p-4 z-20"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-foreground">
                      Parent Category
                    </span>
                    {selectedCategoryFilter && (
                      <button
                        onClick={() => setSelectedCategoryFilter(null)}
                        className="text-xs text-primary hover:underline"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="space-y-1 max-h-60 overflow-y-auto">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => {
                          setSelectedCategoryFilter(category.id);
                          setShowFilters(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          selectedCategoryFilter === category.id
                            ? "bg-primary text-white"
                            : "hover:bg-gray-50 text-foreground"
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                    {categories.length === 0 && (
                      <p className="text-sm text-muted text-center py-2">
                        No categories found
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Button
            size="sm"
            className="flex items-center gap-2"
            onClick={handleAddSubCategory}
            disabled={categories.length === 0}
          >
            <Plus size={18} />
            Add Subcategory
          </Button>
        </div>
      </div>

      {/* No Categories Warning */}
      {categories.length === 0 && !isLoading && (
        <PageCard className="py-8 mb-6 bg-amber-50 border-amber-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 rounded-xl">
              <FolderTree size={24} className="text-amber-600" />
            </div>
            <div>
              <h3 className="font-medium text-amber-800">
                No categories available
              </h3>
              <p className="text-sm text-amber-600">
                Please create at least one category before adding subcategories.
              </p>
            </div>
          </div>
        </PageCard>
      )}

      {/* Loading State */}
      {isLoading && subCategories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Spinner size="lg" />
          <p className="mt-4 text-muted">Loading subcategories...</p>
        </div>
      ) : filteredSubCategories.length === 0 && categories.length > 0 ? (
        /* Empty State */
        <PageCard className="py-16 text-center">
          <div className="flex flex-col items-center">
            <div className="p-4 bg-gray-100 rounded-full mb-4">
              <FolderTree size={32} className="text-muted" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {searchQuery || selectedCategoryFilter
                ? "No subcategories found"
                : "No subcategories yet"}
            </h3>
            <p className="text-muted text-sm mb-4 max-w-sm">
              {searchQuery || selectedCategoryFilter
                ? "Try adjusting your search or filter to find what you're looking for."
                : "Get started by creating your first subcategory to organize your products."}
            </p>
            {!searchQuery && !selectedCategoryFilter && (
              <Button
                onClick={handleAddSubCategory}
                className="flex items-center gap-2"
              >
                <Plus size={18} />
                Add Subcategory
              </Button>
            )}
          </div>
        </PageCard>
      ) : (
        categories.length > 0 && (
          /* Subcategories Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredSubCategories.map((subCategory, index) => (
                <motion.div
                  key={subCategory.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <PageCard className="hover:shadow-md transition-shadow group">
                    {/* Header with Icon and Menu */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-accent/10 to-primary/10 rounded-xl">
                        <FolderTree className="w-6 h-6 text-accent" />
                      </div>
                      {/* Menu Button */}
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(
                              openMenuId === subCategory.id
                                ? null
                                : subCategory.id
                            );
                          }}
                          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <MoreVertical size={18} className="text-muted" />
                        </button>

                        {/* Dropdown Menu */}
                        <AnimatePresence>
                          {openMenuId === subCategory.id && (
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
                                  handleEditSubCategory(subCategory);
                                }}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-foreground"
                              >
                                <Edit size={14} />
                                Edit
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteClick(subCategory);
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

                    {/* Subcategory Info */}
                    <div className="space-y-2">
                      <h3 className="font-semibold text-foreground text-lg">
                        {subCategory.name}
                      </h3>
                      <div className="inline-flex items-center px-2.5 py-1 bg-gray-100 rounded-lg text-xs font-medium text-muted">
                        {getCategoryName(subCategory.categoryId)}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted pt-1">
                        <span>{subCategory.productsCount || 0} products</span>
                      </div>
                      {subCategory.createdAt && (
                        <p className="text-xs text-muted pt-2">
                          Created {formatDate(subCategory.createdAt)}
                        </p>
                      )}
                    </div>
                  </PageCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )
      )}

      {/* Form Modal */}
      <CategoryFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedSubCategory(null);
        }}
        onSubmit={handleFormSubmit}
        subCategory={selectedSubCategory}
        categories={categories}
        isLoading={isSubmitting}
        mode="subcategory"
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSubCategoryToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Subcategory"
        message={`Are you sure you want to delete "${subCategoryToDelete?.name}"? This may affect products assigned to this subcategory.`}
        confirmText="Delete"
        variant="danger"
        isLoading={isSubmitting}
      />
    </>
  );
}
