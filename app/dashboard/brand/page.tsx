"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Palette,
  Upload,
  Store,
  Mail,
  Phone,
  Eye,
  ExternalLink,
  Check,
  X,
  Trash2,
  Save,
  RefreshCw,
} from "lucide-react";
import Image from "next/image";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { ButtonSpinner, PageSpinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  fetchBrand,
  updateBrand,
  upsertBrand,
  deleteLogo,
  deleteBrand,
  clearBrandError,
} from "@/lib/store/slices/brandSlice";
import { THEME_PREVIEWS } from "@/lib/types/brand";
import PageHeader from "@/components/dashboard/PageHeader";
import PageCard from "@/components/dashboard/PageCard";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

const themes = [
  {
    id: 1,
    name: "Classic",
    description: "Clean and professional design with a modern touch",
    previewUrl: THEME_PREVIEWS[1].previewUrl,
    gradient: "from-indigo-500 to-purple-600",
    icon: "🎨",
  },
  {
    id: 2,
    name: "Modern",
    description: "Bold and contemporary design for trendy brands",
    previewUrl: THEME_PREVIEWS[2].previewUrl,
    gradient: "from-blue-500 to-cyan-500",
    icon: "✨",
  },
  {
    id: 3,
    name: "Minimal",
    description: "Simple and elegant design focused on your products",
    previewUrl: THEME_PREVIEWS[3].previewUrl,
    gradient: "from-gray-600 to-gray-800",
    icon: "🌿",
  },
];

export default function BrandPage() {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const { tenant, user } = useAppSelector((state) => state.auth);
  const { brand, loading, updateLoading, error } = useAppSelector(
    (state) => state.brand
  );

  const logoInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [newLogo, setNewLogo] = useState<File | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDeleteLogoDialog, setShowDeleteLogoDialog] = useState(false);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";

  const [formData, setFormData] = useState({
    tagline: "",
    description: "",
    theme: 1,
  });

  const [hasChanges, setHasChanges] = useState(false);

  // Fetch brand on mount
  useEffect(() => {
    dispatch(fetchBrand());
  }, [dispatch]);

  // Update form when brand data loads
  useEffect(() => {
    if (brand) {
      setFormData({
        tagline: brand.tagline || "",
        description: brand.description || "",
        theme: brand.theme || 1,
      });
      if (brand.logoUrl) {
        setLogoPreview(`${baseUrl}${brand.logoUrl}`);
      }
    }
  }, [brand, baseUrl]);

  // Show error toast
  useEffect(() => {
    if (error) {
      showToast({
        type: "error",
        title: "Error",
        message: error,
      });
      dispatch(clearBrandError());
    }
  }, [error, showToast, dispatch]);

  const updateField = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast({
        type: "error",
        title: "Invalid file",
        message: "Please select an image file",
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showToast({
        type: "error",
        title: "File too large",
        message: "Image must be less than 2MB",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setNewLogo(file);
    setHasChanges(true);
  };

  const removeNewLogo = () => {
    setNewLogo(null);
    if (brand?.logoUrl) {
      setLogoPreview(`${baseUrl}${brand.logoUrl}`);
    } else {
      setLogoPreview(null);
    }
    if (logoInputRef.current) logoInputRef.current.value = "";
    setHasChanges(true);
  };

  const openThemePreview = (previewUrl: string) => {
    window.open(previewUrl, "_blank", "noopener,noreferrer");
  };

  const handleSave = async () => {
    try {
      const data: {
        logo?: File;
        tagline?: string;
        description?: string;
        theme?: number;
      } = {
        tagline: formData.tagline,
        description: formData.description,
        theme: formData.theme,
      };

      if (newLogo) {
        data.logo = newLogo;
      }

      if (brand) {
        await dispatch(updateBrand(data)).unwrap();
      } else {
        await dispatch(upsertBrand(data)).unwrap();
      }

      showToast({
        type: "success",
        title: "Success",
        message: "Brand settings saved successfully!",
      });

      setNewLogo(null);
      setHasChanges(false);
    } catch (err: any) {
      showToast({
        type: "error",
        title: "Error",
        message: err || "Failed to save brand settings",
      });
    }
  };

  const handleDeleteLogo = async () => {
    try {
      await dispatch(deleteLogo()).unwrap();
      setLogoPreview(null);
      setNewLogo(null);
      showToast({
        type: "success",
        title: "Success",
        message: "Logo deleted successfully!",
      });
    } catch (err: any) {
      showToast({
        type: "error",
        title: "Error",
        message: err || "Failed to delete logo",
      });
    }
    setShowDeleteLogoDialog(false);
  };

  const handleDeleteBrand = async () => {
    try {
      await dispatch(deleteBrand()).unwrap();
      setLogoPreview(null);
      setNewLogo(null);
      setFormData({ tagline: "", description: "", theme: 1 });
      showToast({
        type: "success",
        title: "Success",
        message: "Brand settings deleted successfully!",
      });
    } catch (err: any) {
      showToast({
        type: "error",
        title: "Error",
        message: err || "Failed to delete brand settings",
      });
    }
    setShowDeleteDialog(false);
  };

  const handleRefresh = () => {
    dispatch(fetchBrand());
    setNewLogo(null);
    setHasChanges(false);
  };

  if (loading) {
    return <PageSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <PageHeader
            title="Brand Setup"
            subtitle="Customize your store's appearance, logo, and theme"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw size={16} className="mr-2" />
            Refresh
          </Button>
          {brand && (
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(true)}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <Trash2 size={16} className="mr-2" />
              Reset All
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6">
        {/* Store Info Section - Display Only */}
        <PageCard>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Store size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">
                Store Information
              </h2>
              <p className="text-sm text-muted">
                Your account details (read-only)
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {/* Store Name - Read Only */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Store Name
              </label>
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50">
                <Store size={20} className="text-muted flex-shrink-0" />
                <span className="text-foreground truncate">
                  {tenant?.name || "Your Store"}
                </span>
              </div>
            </div>

            {/* Email - Read Only */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email
              </label>
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50">
                <Mail size={20} className="text-muted flex-shrink-0" />
                <span className="text-foreground truncate">
                  {user?.email || "email@example.com"}
                </span>
              </div>
            </div>

            {/* Phone - Read Only */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Phone
              </label>
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50">
                <Phone size={20} className="text-muted flex-shrink-0" />
                <span className="text-foreground">
                  {user?.phone || "Not provided"}
                </span>
              </div>
            </div>
          </div>
        </PageCard>

        {/* Logo Section */}
        <PageCard>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Upload size={20} className="text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Store Logo</h2>
                <p className="text-sm text-muted">
                  Upload your store logo (JPG, PNG, GIF, WebP, SVG • Max 2MB)
                </p>
              </div>
            </div>
            {brand?.logoUrl && !newLogo && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteLogoDialog(true)}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 size={14} className="mr-1" />
                Delete Logo
              </Button>
            )}
          </div>

          <input
            ref={logoInputRef}
            type="file"
            accept="image/jpg,image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex items-center gap-6">
            {logoPreview ? (
              <div className="relative w-40 h-40 rounded-xl border-2 border-gray-200 overflow-hidden group bg-white">
                <Image
                  src={logoPreview}
                  alt="Logo preview"
                  fill
                  className="object-contain p-4"
                />
                {newLogo && (
                  <button
                    type="button"
                    onClick={removeNewLogo}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="w-40 h-40 rounded-xl border-2 border-dashed border-gray-300 hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2"
              >
                <Upload size={32} className="text-muted" />
                <span className="text-sm text-muted">Upload Logo</span>
              </button>
            )}

            {logoPreview && (
              <Button
                variant="outline"
                onClick={() => logoInputRef.current?.click()}
              >
                <Upload size={16} className="mr-2" />
                Change Logo
              </Button>
            )}
          </div>
        </PageCard>

        {/* Brand Details Section */}
        <PageCard>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Store size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Brand Details</h2>
              <p className="text-sm text-muted">
                Add a tagline and description for your store
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <Input
                label="Tagline"
                type="text"
                placeholder="Your catchy slogan here"
                value={formData.tagline}
                onChange={(e) => updateField("tagline", e.target.value)}
                maxLength={200}
              />
              <p className="text-xs text-muted mt-1">
                {formData.tagline.length}/200 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Description
              </label>
              <textarea
                placeholder="Tell customers what makes your store special..."
                value={formData.description}
                onChange={(e) => updateField("description", e.target.value)}
                rows={4}
                maxLength={2000}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
              />
              <p className="text-xs text-muted mt-1">
                {formData.description.length}/2000 characters
              </p>
            </div>
          </div>
        </PageCard>

        {/* Theme Selection Section */}
        <PageCard>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Palette size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Store Theme</h2>
              <p className="text-sm text-muted">
                Select a theme for your storefront
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            {themes.map((theme) => (
              <motion.div
                key={theme.id}
                whileHover={{ scale: 1.01 }}
                className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  formData.theme === theme.id
                    ? "border-primary bg-primary/5 shadow-lg"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
                onClick={() => updateField("theme", theme.id)}
              >
                <div className="flex items-start gap-4">
                  {/* Theme Preview Thumbnail */}
                  <div
                    className={`w-16 h-16 rounded-xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center text-2xl flex-shrink-0`}
                  >
                    {theme.icon}
                  </div>

                  {/* Theme Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">
                        {theme.name}
                      </h3>
                      {formData.theme === theme.id && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-primary text-white rounded-full">
                          Selected
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted">{theme.description}</p>
                  </div>

                  {/* Preview Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openThemePreview(theme.previewUrl);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
                  >
                    <Eye size={16} />
                    Preview
                    <ExternalLink size={14} />
                  </button>
                </div>

                {/* Selection Indicator */}
                {formData.theme === theme.id && (
                  <div className="absolute top-4 right-4 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <Check size={14} className="text-white" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </PageCard>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <Button
            onClick={handleSave}
            disabled={updateLoading}
            className="min-w-[150px]"
          >
            {updateLoading ? (
              <>
                <ButtonSpinner />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} className="mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Delete Logo Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteLogoDialog}
        onClose={() => setShowDeleteLogoDialog(false)}
        onConfirm={handleDeleteLogo}
        title="Delete Logo"
        message="Are you sure you want to delete your store logo? This action cannot be undone."
        confirmText="Delete Logo"
        variant="danger"
      />

      {/* Delete Brand Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteBrand}
        title="Reset Brand Settings"
        message="Are you sure you want to reset all brand settings? This will delete your logo, tagline, description, and reset the theme to default. This action cannot be undone."
        confirmText="Reset All"
        variant="danger"
      />
    </div>
  );
}
