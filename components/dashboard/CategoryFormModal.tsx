"use client";

import { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Category, SubCategory } from "@/lib/types/categories";

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; categoryId?: number }) => void;
  category?: Category | null;
  subCategory?: SubCategory | null;
  categories?: Category[];
  isLoading?: boolean;
  mode: "category" | "subcategory";
}

export default function CategoryFormModal({
  isOpen,
  onClose,
  onSubmit,
  category,
  subCategory,
  categories = [],
  isLoading,
  mode,
}: CategoryFormModalProps) {
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [error, setError] = useState("");

  const isEditing = mode === "category" ? !!category : !!subCategory;

  useEffect(() => {
    if (!isOpen) return;

    if (mode === "category" && category) {
      setName(category.name);
    } else if (mode === "subcategory" && subCategory) {
      setName(subCategory.name);
      setCategoryId(subCategory.categoryId);
    } else {
      setName("");
      setCategoryId(undefined);
    }
    setError("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    if (mode === "subcategory" && !categoryId) {
      setError("Please select a category");
      return;
    }

    onSubmit({
      name: name.trim(),
      ...(mode === "subcategory" && { categoryId }),
    });
  };

  const title = isEditing
    ? `Edit ${mode === "category" ? "Category" : "Subcategory"}`
    : `Add ${mode === "category" ? "Category" : "Subcategory"}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError("");
          }}
          placeholder={`Enter ${mode} name`}
          error={mode === "category" || !categoryId ? error : undefined}
          autoFocus
        />

        {mode === "subcategory" && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Parent Category
            </label>
            <select
              value={categoryId || ""}
              onChange={(e) => {
                setCategoryId(parseInt(e.target.value));
                setError("");
              }}
              className={`w-full px-4 py-2.5 rounded-xl border ${
                error && !categoryId ? "border-red-500" : "border-gray-200"
              } focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm bg-white`}
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {error && !name.trim() === false && !categoryId && (
              <p className="mt-1 text-xs text-red-500">{error}</p>
            )}
          </div>
        )}

        <div className="flex gap-3 pt-4">
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
            {isLoading ? "Saving..." : isEditing ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
