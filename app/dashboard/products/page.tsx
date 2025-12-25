"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Package,
  X,
} from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import PageCard from "@/components/dashboard/PageCard";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import ProductFormModal, {
  ProductFormData,
} from "@/components/dashboard/ProductFormModal";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  fetchProducts,
  fetchCategories,
  fetchSubCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  clearError,
  setSelectedProduct,
  clearSelectedProduct,
} from "@/lib/store/slices/productsSlice";
import { Product } from "@/lib/types/products";

export default function ProductsPage() {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const {
    products,
    categories,
    subCategories,
    selectedProduct,
    isLoading,
    isSubmitting,
    error,
  } = useAppSelector((state) => state.products);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<
    number | null
  >(null);
  const [selectedSubCategoryFilter, setSelectedSubCategoryFilter] = useState<
    number | null
  >(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Fetch data on mount
  useEffect(() => {
    dispatch(fetchProducts());
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

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      !selectedCategoryFilter ||
      product.category?.id === selectedCategoryFilter;
    const matchesSubCategory =
      !selectedSubCategoryFilter ||
      product.subCategory?.id === selectedSubCategoryFilter;
    return matchesSearch && matchesCategory && matchesSubCategory;
  });

  // Get subcategories for selected category filter
  const filteredSubCategoriesForFilter = subCategories.filter(
    (sub) => sub.categoryId === selectedCategoryFilter
  );

  // Handle category change in form
  const handleCategoryChange = useCallback(
    (categoryId: number) => {
      dispatch(fetchSubCategories(categoryId));
    },
    [dispatch]
  );

  // Open create modal
  const handleAddProduct = () => {
    dispatch(clearSelectedProduct());
    setIsFormModalOpen(true);
  };

  // Open edit modal
  const handleEditProduct = (product: Product) => {
    dispatch(setSelectedProduct(product));
    if (product.category?.id) {
      dispatch(fetchSubCategories(product.category.id));
    }
    setIsFormModalOpen(true);
  };

  // Open view modal
  const handleViewProduct = (product: Product) => {
    setViewProduct(product);
    setSelectedImageIndex(0);
    setIsViewModalOpen(true);
  };

  // Open delete dialog
  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  };

  // Submit form (create/update)
  const handleFormSubmit = async (data: ProductFormData) => {
    try {
      if (selectedProduct) {
        await dispatch(
          updateProduct({
            id: selectedProduct.id,
            ...data,
          })
        ).unwrap();
        showToast({ type: "success", title: "Product updated successfully!" });
      } else {
        await dispatch(createProduct(data)).unwrap();
        showToast({ type: "success", title: "Product created successfully!" });
      }
      setIsFormModalOpen(false);
      dispatch(clearSelectedProduct());
    } catch {
      // Error handled by slice
    }
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    try {
      await dispatch(deleteProduct(productToDelete.id)).unwrap();
      showToast({ type: "success", title: "Product deleted successfully!" });
      setIsDeleteDialogOpen(false);
      setProductToDelete(null);
    } catch {
      // Error handled by slice
    }
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  return (
    <>
      <PageHeader title="Products" subtitle="Manage your product catalog" />

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
          />
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2.5 rounded-xl border bg-white hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm font-medium ${
                selectedCategoryFilter || selectedSubCategoryFilter
                  ? "border-primary text-primary"
                  : "border-gray-200 text-foreground"
              }`}
            >
              <Filter size={18} />
              Filter
              {(selectedCategoryFilter || selectedSubCategoryFilter) && (
                <span className="px-1.5 py-0.5 bg-primary text-white text-xs rounded-full">
                  {(selectedCategoryFilter ? 1 : 0) +
                    (selectedSubCategoryFilter ? 1 : 0)}
                </span>
              )}
            </button>

            {/* Filter Dropdown */}
            {showFilters && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-100 p-4 z-20">
                {/* Clear All */}
                {(selectedCategoryFilter || selectedSubCategoryFilter) && (
                  <div className="flex justify-end mb-3">
                    <button
                      onClick={() => {
                        setSelectedCategoryFilter(null);
                        setSelectedSubCategoryFilter(null);
                      }}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Clear All Filters
                    </button>
                  </div>
                )}

                {/* Category Filter */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">
                      Category
                    </span>
                    {selectedCategoryFilter && (
                      <button
                        onClick={() => {
                          setSelectedCategoryFilter(null);
                          setSelectedSubCategoryFilter(null);
                        }}
                        className="text-xs text-primary hover:underline"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => {
                          setSelectedCategoryFilter(category.id);
                          setSelectedSubCategoryFilter(null);
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
                </div>

                {/* Subcategory Filter - Only show when category is selected */}
                {selectedCategoryFilter &&
                  filteredSubCategoriesForFilter.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-foreground">
                          Subcategory
                        </span>
                        {selectedSubCategoryFilter && (
                          <button
                            onClick={() => setSelectedSubCategoryFilter(null)}
                            className="text-xs text-primary hover:underline"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {filteredSubCategoriesForFilter.map((subCategory) => (
                          <button
                            key={subCategory.id}
                            onClick={() => {
                              setSelectedSubCategoryFilter(subCategory.id);
                              setShowFilters(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                              selectedSubCategoryFilter === subCategory.id
                                ? "bg-primary text-white"
                                : "hover:bg-gray-50 text-foreground"
                            }`}
                          >
                            {subCategory.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            )}
          </div>
          <Button
            size="sm"
            className="flex items-center gap-2"
            onClick={handleAddProduct}
          >
            <Plus size={18} />
            Add Product
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Spinner size="lg" />
          <p className="mt-4 text-muted">Loading products...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        /* Empty State */
        <PageCard className="py-16 text-center">
          <div className="flex flex-col items-center">
            <div className="p-4 bg-gray-100 rounded-full mb-4">
              <Package size={32} className="text-muted" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {searchQuery ||
              selectedCategoryFilter ||
              selectedSubCategoryFilter
                ? "No products found"
                : "No products yet"}
            </h3>
            <p className="text-muted text-sm mb-4 max-w-sm">
              {searchQuery ||
              selectedCategoryFilter ||
              selectedSubCategoryFilter
                ? "Try adjusting your search or filter to find what you're looking for."
                : "Get started by adding your first product to the catalog."}
            </p>
            {!searchQuery &&
              !selectedCategoryFilter &&
              !selectedSubCategoryFilter && (
                <Button
                  onClick={handleAddProduct}
                  className="flex items-center gap-2"
                >
                  <Plus size={18} />
                  Add Product
                </Button>
              )}
          </div>
        </PageCard>
      ) : (
        /* Products Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <PageCard
              key={product.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleViewProduct(product)}
            >
              {/* Product Image */}
              <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${product.images[0].imageUrl}`}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl">📦</span>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">
                      {product.title}
                    </h3>
                    <p className="text-sm text-muted truncate">
                      {product.category?.name || "Uncategorized"}
                    </p>
                  </div>
                  <div
                    className="relative group"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                      <MoreVertical size={16} className="text-muted" />
                    </button>
                    <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                      <button
                        onClick={() => handleViewProduct(product)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-gray-50 transition-colors rounded-t-xl"
                      >
                        <Eye size={14} /> View
                      </button>
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-gray-50 transition-colors"
                      >
                        <Edit size={14} /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(product)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors rounded-b-xl"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-foreground">
                    {formatPrice(product.price)}
                  </span>
                  {product.brand && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      {product.brand}
                    </span>
                  )}
                </div>

                {product.subCategory && (
                  <p className="text-xs text-muted">
                    {product.subCategory.name}
                  </p>
                )}
              </div>
            </PageCard>
          ))}
        </div>
      )}

      {/* Product Form Modal */}
      <ProductFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          dispatch(clearSelectedProduct());
        }}
        onSubmit={handleFormSubmit}
        product={selectedProduct}
        categories={categories}
        subCategories={subCategories}
        isLoading={isSubmitting}
        onCategoryChange={handleCategoryChange}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setProductToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${productToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        isLoading={isSubmitting}
        variant="danger"
      />

      {/* View Product Modal */}
      <AnimatePresence>
        {isViewModalOpen && viewProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsViewModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-foreground">
                  Product Details
                </h2>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X size={20} className="text-muted" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Images */}
                  <div>
                    <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden mb-4">
                      {viewProduct.images && viewProduct.images.length > 0 ? (
                        <img
                          src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${
                            viewProduct.images[selectedImageIndex]?.imageUrl ||
                            viewProduct.images[0].imageUrl
                          }`}
                          alt={viewProduct.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={64} className="text-gray-300" />
                        </div>
                      )}
                    </div>
                    {viewProduct.images && viewProduct.images.length > 1 && (
                      <div className="grid grid-cols-4 gap-2">
                        {viewProduct.images.slice(0, 4).map((image, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedImageIndex(index)}
                            className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-all ${
                              selectedImageIndex === index
                                ? "border-primary ring-2 ring-primary/20"
                                : "border-transparent hover:border-gray-300"
                            }`}
                          >
                            <img
                              src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${image.imageUrl}`}
                              alt={`${viewProduct.title} ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-foreground">
                        {viewProduct.title}
                      </h3>
                      <p className="text-2xl font-bold text-primary mt-1">
                        {formatPrice(viewProduct.price)}
                      </p>
                    </div>

                    <p className="text-muted text-sm leading-relaxed">
                      {viewProduct.description}
                    </p>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted">Category:</span>
                        <span className="text-sm font-medium text-foreground">
                          {viewProduct.category?.name || "Uncategorized"}
                        </span>
                      </div>
                      {viewProduct.subCategory && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted">
                            Subcategory:
                          </span>
                          <span className="text-sm font-medium text-foreground">
                            {viewProduct.subCategory.name}
                          </span>
                        </div>
                      )}
                      {viewProduct.brand && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted">Brand:</span>
                          <span className="text-sm font-medium text-foreground">
                            {viewProduct.brand}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        className="flex-1 flex items-center justify-center gap-2"
                        onClick={() => {
                          setIsViewModalOpen(false);
                          handleEditProduct(viewProduct);
                        }}
                      >
                        <Edit size={16} />
                        Edit Product
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsViewModalOpen(false)}
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Click outside to close filters */}
      {showFilters && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowFilters(false)}
        />
      )}
    </>
  );
}
