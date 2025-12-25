"use client";

import { useState, useEffect, useRef } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Product, Category, SubCategory } from "@/lib/types/products";

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormData) => void;
  product?: Product | null;
  categories: Category[];
  subCategories: SubCategory[];
  isLoading?: boolean;
  onCategoryChange?: (categoryId: number) => void;
}

export interface ProductFormData {
  title: string;
  description: string;
  price: number;
  categoryId: number;
  subCategoryId?: number;
  brand?: string;
  images?: File[];
}

export default function ProductFormModal({
  isOpen,
  onClose,
  onSubmit,
  product,
  categories,
  subCategories,
  isLoading,
  onCategoryChange,
}: ProductFormModalProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    title: "",
    description: "",
    price: 0,
    categoryId: 0,
    subCategoryId: undefined,
    brand: "",
  });
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title,
        description: product.description,
        price: product.price,
        categoryId: product.category?.id || 0,
        subCategoryId: product.subCategory?.id,
        brand: product.brand || "",
      });
      setExistingImages(product.images?.map((img) => img.imageUrl) || []);
    } else {
      setFormData({
        title: "",
        description: "",
        price: 0,
        categoryId: 0,
        subCategoryId: undefined,
        brand: "",
      });
      setExistingImages([]);
    }
    setImages([]);
    setPreviews([]);
    setErrors({});
  }, [product, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === "categoryId") {
      const categoryId = parseInt(value);
      setFormData((prev) => ({
        ...prev,
        categoryId,
        subCategoryId: undefined,
      }));
      onCategoryChange?.(categoryId);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: name === "price" ? parseFloat(value) || 0 : value,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newImages = [...images, ...files].slice(0, 5);
    setImages(newImages);

    const newPreviews = newImages.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => {
      prev.forEach((url) => URL.revokeObjectURL(url));
      return newPreviews;
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Product title is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    if (formData.price <= 0) {
      newErrors.price = "Price must be greater than 0";
    }
    if (!formData.categoryId) {
      newErrors.categoryId = "Category is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      ...formData,
      images: images.length > 0 ? images : undefined,
    });
  };

  const filteredSubCategories = subCategories.filter(
    (sub) => sub.categoryId === formData.categoryId
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={product ? "Edit Product" : "Add New Product"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <Input
          label="Product Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter product title"
          error={errors.title}
        />

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter product description"
            rows={3}
            className={`w-full px-4 py-2.5 rounded-xl border ${
              errors.description ? "border-red-500" : "border-gray-200"
            } focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm resize-none`}
          />
          {errors.description && (
            <p className="mt-1 text-xs text-red-500">{errors.description}</p>
          )}
        </div>

        {/* Price & Brand Row */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Price"
            name="price"
            type="number"
            step="0.01"
            value={formData.price.toString()}
            onChange={handleChange}
            placeholder="0.00"
            error={errors.price}
          />
          <Input
            label="Brand (Optional)"
            name="brand"
            value={formData.brand || ""}
            onChange={handleChange}
            placeholder="Enter brand name"
          />
        </div>

        {/* Category & Subcategory Row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Category
            </label>
            <select
              name="categoryId"
              value={formData.categoryId || ""}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 rounded-xl border ${
                errors.categoryId ? "border-red-500" : "border-gray-200"
              } focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm bg-white`}
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="mt-1 text-xs text-red-500">{errors.categoryId}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Subcategory (Optional)
            </label>
            <select
              name="subCategoryId"
              value={formData.subCategoryId || ""}
              onChange={handleChange}
              disabled={
                !formData.categoryId || filteredSubCategories.length === 0
              }
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
            >
              <option value="">Select subcategory</option>
              {filteredSubCategories.map((subCategory) => (
                <option key={subCategory.id} value={subCategory.id}>
                  {subCategory.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Product Images (Max 5)
          </label>

          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div className="grid grid-cols-5 gap-3 mb-3">
              {existingImages.map((imageUrl, index) => (
                <div key={index} className="relative aspect-square group">
                  <img
                    src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${imageUrl}`}
                    alt={`Product ${index + 1}`}
                    className="w-full h-full object-cover rounded-xl border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(index)}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* New Image Previews */}
          {previews.length > 0 && (
            <div className="grid grid-cols-5 gap-3 mb-3">
              {previews.map((preview, index) => (
                <div key={index} className="relative aspect-square group">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover rounded-xl border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload Area */}
          {existingImages.length + previews.length < 5 && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
              />
              <div className="flex flex-col items-center gap-2">
                <div className="p-3 bg-gray-100 rounded-full">
                  <ImageIcon size={24} className="text-muted" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Click to upload images
                  </p>
                  <p className="text-xs text-muted mt-1">
                    PNG, JPG, WEBP up to 5MB each
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={isLoading}>
            {isLoading
              ? "Saving..."
              : product
              ? "Update Product"
              : "Create Product"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
