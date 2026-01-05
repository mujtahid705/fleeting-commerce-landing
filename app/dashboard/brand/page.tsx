"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Plus,
  Layout,
  Image as ImageIcon,
  Link2,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Grid3X3,
  Layers,
  MapPin,
  GripVertical,
  Package,
} from "lucide-react";
import Image from "next/image";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
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
import { fetchCategories } from "@/lib/store/slices/categoriesSlice";
import { fetchProducts } from "@/lib/store/slices/productsSlice";
import {
  THEME_PREVIEWS,
  HeroSection,
  BrowseCategoriesSection,
  FeaturedCategoriesSection,
  ExclusiveSection,
  FooterSection,
  CategoryItem,
  ExclusiveProductItem,
  QuickLink,
} from "@/lib/types/brand";
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

// Collapsible Section Component
function CollapsibleSection({
  title,
  icon,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <PageCard>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            {icon}
          </div>
          <h2 className="font-semibold text-foreground">{title}</h2>
        </div>
        {isOpen ? (
          <ChevronUp size={20} className="text-muted" />
        ) : (
          <ChevronDown size={20} className="text-muted" />
        )}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-6">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageCard>
  );
}

export default function BrandPage() {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const { tenant, user } = useAppSelector((state) => state.auth);
  const { brand, loading, updateLoading, error } = useAppSelector(
    (state) => state.brand
  );
  const { categories, isLoading: categoriesLoading } = useAppSelector(
    (state) => state.categories
  );
  const { products, isLoading: productsLoading } = useAppSelector(
    (state) => state.products
  );

  // File input refs
  const logoInputRef = useRef<HTMLInputElement>(null);
  const heroImageInputRef = useRef<HTMLInputElement>(null);
  const exclusiveImageRefs = useRef<{ [key: number]: HTMLInputElement | null }>(
    {}
  );

  // Logo state
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [newLogo, setNewLogo] = useState<File | null>(null);

  // Hero image state
  const [heroImagePreview, setHeroImagePreview] = useState<string | null>(null);
  const [newHeroImage, setNewHeroImage] = useState<File | null>(null);

  // Exclusive product images state
  const [exclusiveImagePreviews, setExclusiveImagePreviews] = useState<{
    [key: number]: string | null;
  }>({});
  const [newExclusiveImages, setNewExclusiveImages] = useState<{
    [key: number]: File | null;
  }>({});

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDeleteLogoDialog, setShowDeleteLogoDialog] = useState(false);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";

  // Helper to construct full image URL
  const getImageUrl = (path: string | undefined | null): string | null => {
    if (!path) return null;
    // Already a full URL or blob URL
    if (
      path.startsWith("http") ||
      path.startsWith("blob:") ||
      path.startsWith("data:")
    ) {
      return path;
    }
    // Construct full URL with base - remove /api suffix if present since uploads are served from root
    let base = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    if (base.endsWith("/api")) {
      base = base.slice(0, -4); // Remove /api
    }
    const imagePath = path.startsWith("/") ? path : `/${path}`;
    const fullUrl = `${base}${imagePath}`;
    console.log("Image URL constructed:", { path, base, imagePath, fullUrl });
    return fullUrl;
  };

  // Basic form data
  const [formData, setFormData] = useState({
    tagline: "",
    description: "",
    theme: 1,
  });

  // Hero Section
  const [heroData, setHeroData] = useState<HeroSection>({
    title: "",
    subtitle: "",
    backgroundImage: "",
    ctaText: "",
    ctaLink: "",
  });

  // Browse Categories Section
  const [browseCategoriesData, setBrowseCategoriesData] =
    useState<BrowseCategoriesSection>({
      title: "Browse Categories",
      categories: [],
    });

  // Featured Categories Section
  const [featuredCategoriesData, setFeaturedCategoriesData] =
    useState<FeaturedCategoriesSection>({
      title: "Featured Categories",
      categories: [],
    });

  // Exclusive Section
  const [exclusiveData, setExclusiveData] = useState<ExclusiveSection>({
    title: "Exclusive Products",
    products: [],
  });

  // Footer Section
  const [footerData, setFooterData] = useState<FooterSection>({
    companyName: "",
    address: "",
    phone: "",
    email: "",
    socialLinks: {
      facebook: "",
      instagram: "",
      twitter: "",
      linkedin: "",
      youtube: "",
    },
    copyrightText: "",
    quickLinks: [],
  });

  const [hasChanges, setHasChanges] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    dispatch(fetchBrand());
    dispatch(fetchCategories());
    dispatch(fetchProducts());
  }, [dispatch]);

  // Populate form when brand loads
  useEffect(() => {
    if (brand) {
      setFormData({
        tagline: brand.tagline || "",
        description: brand.description || "",
        theme: brand.theme || 1,
      });

      if (brand.logoUrl) {
        setLogoPreview(getImageUrl(brand.logoUrl));
      }

      // Hero Section
      if (brand.hero) {
        setHeroData({
          title: brand.hero.title || "",
          subtitle: brand.hero.subtitle || "",
          backgroundImage: brand.hero.backgroundImage || "",
          ctaText: brand.hero.ctaText || "",
          ctaLink: brand.hero.ctaLink || "",
        });
        if (brand.hero.backgroundImage) {
          setHeroImagePreview(getImageUrl(brand.hero.backgroundImage));
        }
      }

      // Browse Categories
      if (brand.browseCategories) {
        setBrowseCategoriesData({
          title: brand.browseCategories.title || "Browse Categories",
          categories: brand.browseCategories.categories || [],
        });
      }

      // Featured Categories
      if (brand.featuredCategories) {
        setFeaturedCategoriesData({
          title: brand.featuredCategories.title || "Featured Categories",
          categories: brand.featuredCategories.categories || [],
        });
      }

      // Exclusive Section
      if (brand.exclusiveSection) {
        setExclusiveData({
          title: brand.exclusiveSection.title || "Exclusive Products",
          products: brand.exclusiveSection.products || [],
        });
        // Set previews for existing exclusive images
        const previews: { [key: number]: string | null } = {};
        brand.exclusiveSection.products?.forEach((p, idx) => {
          if (p.customImage) {
            previews[idx] = getImageUrl(p.customImage);
          }
        });
        setExclusiveImagePreviews(previews);
      }

      // Footer Section
      if (brand.footer) {
        setFooterData({
          companyName: brand.footer.companyName || "",
          address: brand.footer.address || "",
          phone: brand.footer.phone || "",
          email: brand.footer.email || "",
          socialLinks: {
            facebook: brand.footer.socialLinks?.facebook || "",
            instagram: brand.footer.socialLinks?.instagram || "",
            twitter: brand.footer.socialLinks?.twitter || "",
            linkedin: brand.footer.socialLinks?.linkedin || "",
            youtube: brand.footer.socialLinks?.youtube || "",
          },
          copyrightText: brand.footer.copyrightText || "",
          quickLinks: brand.footer.quickLinks || [],
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brand]);

  // Error handling
  useEffect(() => {
    if (error) {
      showToast({ type: "error", title: "Error", message: error });
      dispatch(clearBrandError());
    }
  }, [error, showToast, dispatch]);

  const markChanged = () => setHasChanges(true);

  const updateField = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    markChanged();
  };

  // Logo handlers
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
    reader.onload = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);

    setNewLogo(file);
    markChanged();
  };

  const removeNewLogo = () => {
    setNewLogo(null);
    setLogoPreview(brand?.logoUrl ? getImageUrl(brand.logoUrl) : null);
    if (logoInputRef.current) logoInputRef.current.value = "";
    markChanged();
  };

  // Hero Image handlers
  const handleHeroImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    if (file.size > 5 * 1024 * 1024) {
      showToast({
        type: "error",
        title: "File too large",
        message: "Image must be less than 5MB",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setHeroImagePreview(reader.result as string);
    reader.readAsDataURL(file);

    setNewHeroImage(file);
    markChanged();
  };

  const removeHeroImage = () => {
    setNewHeroImage(null);
    const existingImage = brand?.hero?.backgroundImage;
    setHeroImagePreview(existingImage ? getImageUrl(existingImage) : null);
    if (heroImageInputRef.current) heroImageInputRef.current.value = "";
    markChanged();
  };

  // Exclusive product image handlers
  const handleExclusiveProductImageChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
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
      setExclusiveImagePreviews((prev) => ({
        ...prev,
        [index]: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);

    setNewExclusiveImages((prev) => ({ ...prev, [index]: file }));
    markChanged();
  };

  const removeExclusiveProductImage = (index: number) => {
    setNewExclusiveImages((prev) => {
      const updated = { ...prev };
      delete updated[index];
      return updated;
    });
    const existingImage =
      brand?.exclusiveSection?.products?.[index]?.customImage;
    setExclusiveImagePreviews((prev) => ({
      ...prev,
      [index]: existingImage ? getImageUrl(existingImage) : null,
    }));
    markChanged();
  };

  // Browse Categories handlers
  const addBrowseCategory = () => {
    const newCategory: CategoryItem = {
      categoryId: 0,
      displayOrder: browseCategoriesData.categories.length + 1,
    };
    setBrowseCategoriesData((prev) => ({
      ...prev,
      categories: [...prev.categories, newCategory],
    }));
    markChanged();
  };

  const updateBrowseCategory = (index: number, categoryId: string | number) => {
    setBrowseCategoriesData((prev) => ({
      ...prev,
      categories: prev.categories.map((cat, i) =>
        i === index ? { ...cat, categoryId: Number(categoryId) } : cat
      ),
    }));
    markChanged();
  };

  const removeBrowseCategory = (index: number) => {
    setBrowseCategoriesData((prev) => ({
      ...prev,
      categories: prev.categories.filter((_, i) => i !== index),
    }));
    markChanged();
  };

  // Featured Categories handlers
  const addFeaturedCategory = () => {
    const newCategory: CategoryItem = {
      categoryId: 0,
      displayOrder: featuredCategoriesData.categories.length + 1,
    };
    setFeaturedCategoriesData((prev) => ({
      ...prev,
      categories: [...prev.categories, newCategory],
    }));
    markChanged();
  };

  const updateFeaturedCategory = (
    index: number,
    categoryId: string | number
  ) => {
    setFeaturedCategoriesData((prev) => ({
      ...prev,
      categories: prev.categories.map((cat, i) =>
        i === index ? { ...cat, categoryId: Number(categoryId) } : cat
      ),
    }));
    markChanged();
  };

  const removeFeaturedCategory = (index: number) => {
    setFeaturedCategoriesData((prev) => ({
      ...prev,
      categories: prev.categories.filter((_, i) => i !== index),
    }));
    markChanged();
  };

  // Exclusive Products handlers
  const addExclusiveProduct = () => {
    const newProduct: ExclusiveProductItem = {
      productId: "",
      customTitle: "",
      displayOrder: exclusiveData.products.length + 1,
    };
    setExclusiveData((prev) => ({
      ...prev,
      products: [...prev.products, newProduct],
    }));
    markChanged();
  };

  const updateExclusiveProduct = (
    index: number,
    field: keyof ExclusiveProductItem,
    value: string | number
  ) => {
    setExclusiveData((prev) => ({
      ...prev,
      products: prev.products.map((product, i) =>
        i === index ? { ...product, [field]: value } : product
      ),
    }));
    markChanged();
  };

  const removeExclusiveProduct = (index: number) => {
    setExclusiveData((prev) => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index),
    }));
    setExclusiveImagePreviews((prev) => {
      const updated = { ...prev };
      delete updated[index];
      return updated;
    });
    setNewExclusiveImages((prev) => {
      const updated = { ...prev };
      delete updated[index];
      return updated;
    });
    markChanged();
  };

  // Quick Links handlers
  const addQuickLink = () => {
    const newLink: QuickLink = { label: "", url: "" };
    setFooterData((prev) => ({
      ...prev,
      quickLinks: [...(prev.quickLinks || []), newLink],
    }));
    markChanged();
  };

  const updateQuickLink = (
    index: number,
    field: keyof QuickLink,
    value: string
  ) => {
    setFooterData((prev) => ({
      ...prev,
      quickLinks: prev.quickLinks?.map((link, i) =>
        i === index ? { ...link, [field]: value } : link
      ),
    }));
    markChanged();
  };

  const removeQuickLink = (index: number) => {
    setFooterData((prev) => ({
      ...prev,
      quickLinks: prev.quickLinks?.filter((_, i) => i !== index),
    }));
    markChanged();
  };

  // Save all changes
  const handleSave = async () => {
    try {
      // Collect exclusive images in order
      const exclusiveImages: File[] = [];
      exclusiveData.products.forEach((_, index) => {
        const file = newExclusiveImages[index];
        if (file) exclusiveImages.push(file);
      });

      const data = {
        logo: newLogo || undefined,
        heroImage: newHeroImage || undefined,
        exclusiveImages:
          exclusiveImages.length > 0 ? exclusiveImages : undefined,
        tagline: formData.tagline,
        description: formData.description,
        theme: formData.theme,
        hero: heroData,
        browseCategories: browseCategoriesData,
        exclusiveSection: exclusiveData,
        featuredCategories: featuredCategoriesData,
        footer: footerData,
      };

      if (brand) {
        await dispatch(updateBrand(data)).unwrap();
      } else {
        await dispatch(upsertBrand(data)).unwrap();
      }

      // Refresh brand data to get updated image URLs
      await dispatch(fetchBrand()).unwrap();

      showToast({
        type: "success",
        title: "Success",
        message: "Brand settings saved successfully!",
      });

      setNewLogo(null);
      setNewHeroImage(null);
      setNewExclusiveImages({});
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
      // Reset all states
      setLogoPreview(null);
      setNewLogo(null);
      setHeroImagePreview(null);
      setNewHeroImage(null);
      setExclusiveImagePreviews({});
      setNewExclusiveImages({});
      setFormData({ tagline: "", description: "", theme: 1 });
      setHeroData({
        title: "",
        subtitle: "",
        backgroundImage: "",
        ctaText: "",
        ctaLink: "",
      });
      setBrowseCategoriesData({ title: "Browse Categories", categories: [] });
      setFeaturedCategoriesData({
        title: "Featured Categories",
        categories: [],
      });
      setExclusiveData({ title: "Exclusive Products", products: [] });
      setFooterData({
        companyName: "",
        address: "",
        phone: "",
        email: "",
        socialLinks: {},
        copyrightText: "",
        quickLinks: [],
      });
      showToast({
        type: "success",
        title: "Success",
        message: "Brand settings reset successfully!",
      });
    } catch (err: any) {
      showToast({
        type: "error",
        title: "Error",
        message: err || "Failed to reset brand settings",
      });
    }
    setShowDeleteDialog(false);
  };

  const handleRefresh = () => {
    dispatch(fetchBrand());
    dispatch(fetchCategories());
    dispatch(fetchProducts());
    setNewLogo(null);
    setNewHeroImage(null);
    setNewExclusiveImages({});
    setHasChanges(false);
  };

  const openThemePreview = (previewUrl: string) => {
    window.open(previewUrl, "_blank", "noopener,noreferrer");
  };

  // Category options for select
  const categoryOptions = categoriesLoading
    ? [{ value: "", label: "Loading categories..." }]
    : categories.length === 0
    ? [{ value: "", label: "No categories available" }]
    : categories.map((cat) => ({
        value: cat.id,
        label: cat.name,
      }));

  // Product options for select
  const productOptions = productsLoading
    ? [{ value: "", label: "Loading products..." }]
    : products.length === 0
    ? [{ value: "", label: "No products available" }]
    : products.map((p) => ({
        value: p.id,
        label: p.title,
      }));

  // Helper to get category name
  const getCategoryName = (id: string | number) => {
    const cat = categories.find((c) => c.id === Number(id));
    return cat?.name || "Select category";
  };

  // Helper to get product name
  const getProductName = (id: string) => {
    const product = products.find((p) => p.id === id);
    return product?.title || "Select product";
  };

  if (loading) return <PageSpinner />;

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <PageHeader
          title="Brand & Storefront"
          subtitle="Customize your store's appearance and content sections"
        />
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

      {/* Store Info (Read-only) */}
      <PageCard>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Store size={20} className="text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Store Information</h2>
            <p className="text-sm text-muted">
              Your account details (read-only)
            </p>
          </div>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Store Name
            </label>
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50">
              <Store size={20} className="text-muted flex-shrink-0" />
              <span className="text-foreground truncate">
                {tenant?.name || brand?.tenant?.name || "Your Store"}
              </span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Domain
            </label>
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50">
              <Link2 size={20} className="text-muted flex-shrink-0" />
              <span className="text-foreground truncate">
                {brand?.domain || tenant?.domain || "your-domain"}
              </span>
            </div>
          </div>
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
                Upload your store logo (JPG, PNG, WebP, SVG • Max 2MB)
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
                unoptimized
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

      {/* Brand Details */}
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

      {/* Theme Selection */}
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
                <div
                  className={`w-16 h-16 rounded-xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center text-2xl flex-shrink-0`}
                >
                  {theme.icon}
                </div>
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
              {formData.theme === theme.id && (
                <div className="absolute top-4 right-4 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <Check size={14} className="text-white" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </PageCard>

      {/* Hero Section */}
      <CollapsibleSection
        title="Hero Section"
        icon={<Layout size={20} className="text-primary" />}
        defaultOpen={true}
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            label="Title"
            placeholder="Welcome to Our Store"
            value={heroData.title || ""}
            onChange={(e) => {
              setHeroData((prev) => ({ ...prev, title: e.target.value }));
              markChanged();
            }}
          />
          <Input
            label="Subtitle"
            placeholder="Find amazing products at great prices"
            value={heroData.subtitle || ""}
            onChange={(e) => {
              setHeroData((prev) => ({ ...prev, subtitle: e.target.value }));
              markChanged();
            }}
          />
          <Input
            label="CTA Button Text"
            placeholder="Shop Now"
            value={heroData.ctaText || ""}
            onChange={(e) => {
              setHeroData((prev) => ({ ...prev, ctaText: e.target.value }));
              markChanged();
            }}
          />
          <Input
            label="CTA Button Link"
            placeholder="/products"
            value={heroData.ctaLink || ""}
            onChange={(e) => {
              setHeroData((prev) => ({ ...prev, ctaLink: e.target.value }));
              markChanged();
            }}
          />
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-2">
              Background Image
            </label>
            <input
              ref={heroImageInputRef}
              type="file"
              accept="image/jpg,image/jpeg,image/png,image/gif,image/webp"
              onChange={handleHeroImageChange}
              className="hidden"
            />
            <div className="flex flex-col sm:flex-row items-start gap-4">
              {heroImagePreview ? (
                <div className="relative w-full sm:w-64 h-40 rounded-xl border-2 border-gray-200 overflow-hidden group">
                  <Image
                    src={heroImagePreview}
                    alt="Hero image preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  {newHeroImage && (
                    <button
                      type="button"
                      onClick={removeHeroImage}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <X size={16} />
                    </button>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => heroImageInputRef.current?.click()}
                      className="bg-white/90 hover:bg-white"
                    >
                      <Upload size={14} className="mr-1" />
                      Change
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => heroImageInputRef.current?.click()}
                  className="w-full sm:w-64 h-40 rounded-xl border-2 border-dashed border-gray-300 hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2"
                >
                  <ImageIcon size={32} className="text-muted" />
                  <span className="text-sm text-muted">Upload Hero Image</span>
                  <span className="text-xs text-muted">Max 5MB</span>
                </button>
              )}
              <div className="flex-1 text-sm text-muted">
                <p className="mb-2">Recommended: 1920x600 pixels or wider</p>
                <p>Supported formats: JPG, PNG, GIF, WebP</p>
              </div>
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Browse Categories */}
      <CollapsibleSection
        title="Browse Categories"
        icon={<Grid3X3 size={20} className="text-primary" />}
        defaultOpen={true}
      >
        <div className="space-y-4">
          <Input
            label="Section Title"
            placeholder="Browse Categories"
            value={browseCategoriesData.title || ""}
            onChange={(e) => {
              setBrowseCategoriesData((prev) => ({
                ...prev,
                title: e.target.value,
              }));
              markChanged();
            }}
          />

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted">
              Add categories with display order
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={addBrowseCategory}
              className="gap-1"
            >
              <Plus size={16} />
              Add Category
            </Button>
          </div>

          {browseCategoriesData.categories.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
              <Grid3X3 size={32} className="mx-auto text-muted mb-2" />
              <p className="text-sm text-muted">
                No categories added yet. Click &quot;Add Category&quot; to get
                started.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {browseCategoriesData.categories.map((cat, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                >
                  <GripVertical size={18} className="text-muted cursor-grab" />
                  <span className="text-sm font-medium text-muted w-8">
                    #{cat.displayOrder}
                  </span>
                  <div className="flex-1">
                    <Select
                      value={cat.categoryId}
                      onChange={(e) =>
                        updateBrowseCategory(index, e.target.value)
                      }
                      options={categoryOptions}
                      placeholder="Select category"
                    />
                  </div>
                  {cat.categoryId && (
                    <span className="text-sm text-primary font-medium hidden sm:block">
                      {getCategoryName(cat.categoryId)}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeBrowseCategory(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Exclusive Products Section */}
      <CollapsibleSection
        title="Exclusive Products"
        icon={<Sparkles size={20} className="text-primary" />}
        defaultOpen={true}
      >
        <div className="space-y-4">
          <Input
            label="Section Title"
            placeholder="Exclusive Products"
            value={exclusiveData.title || ""}
            onChange={(e) => {
              setExclusiveData((prev) => ({ ...prev, title: e.target.value }));
              markChanged();
            }}
          />

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted">
              Add products to feature in the exclusive section
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={addExclusiveProduct}
              className="gap-1"
            >
              <Plus size={16} />
              Add Product
            </Button>
          </div>

          {exclusiveData.products.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
              <Package size={32} className="mx-auto text-muted mb-2" />
              <p className="text-sm text-muted">
                No exclusive products yet. Add products to showcase.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {exclusiveData.products.map((product, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 rounded-xl space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">
                      Product #{product.displayOrder}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeExclusiveProduct(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-muted mb-1">
                        Product
                      </label>
                      <Select
                        value={product.productId}
                        onChange={(e) =>
                          updateExclusiveProduct(
                            index,
                            "productId",
                            e.target.value
                          )
                        }
                        options={productOptions}
                        placeholder="Select product"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted mb-1">
                        Custom Title (optional)
                      </label>
                      <Input
                        placeholder="Override product title"
                        value={product.customTitle || ""}
                        onChange={(e) =>
                          updateExclusiveProduct(
                            index,
                            "customTitle",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>

                  {/* Custom Image Upload */}
                  <div>
                    <label className="block text-xs font-medium text-muted mb-2">
                      Custom Image (optional)
                    </label>
                    <input
                      ref={(el) => {
                        exclusiveImageRefs.current[index] = el;
                      }}
                      type="file"
                      accept="image/jpg,image/jpeg,image/png,image/gif,image/webp"
                      onChange={(e) =>
                        handleExclusiveProductImageChange(index, e)
                      }
                      className="hidden"
                    />
                    <div className="flex items-start gap-3">
                      {exclusiveImagePreviews[index] ? (
                        <div className="relative w-24 h-24 rounded-lg border-2 border-gray-200 overflow-hidden group">
                          <Image
                            src={exclusiveImagePreviews[index]!}
                            alt={`Product ${index + 1} image`}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                          {newExclusiveImages[index] && (
                            <button
                              type="button"
                              onClick={() => removeExclusiveProductImage(index)}
                              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={12} />
                            </button>
                          )}
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            exclusiveImageRefs.current[index]?.click()
                          }
                          className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-1"
                        >
                          <ImageIcon size={20} className="text-muted" />
                          <span className="text-xs text-muted">Upload</span>
                        </button>
                      )}
                      {exclusiveImagePreviews[index] && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            exclusiveImageRefs.current[index]?.click()
                          }
                        >
                          Change
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Featured Categories */}
      <CollapsibleSection
        title="Featured Categories"
        icon={<Layers size={20} className="text-primary" />}
        defaultOpen={true}
      >
        <div className="space-y-4">
          <Input
            label="Section Title"
            placeholder="Featured Categories"
            value={featuredCategoriesData.title || ""}
            onChange={(e) => {
              setFeaturedCategoriesData((prev) => ({
                ...prev,
                title: e.target.value,
              }));
              markChanged();
            }}
          />

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted">
              Feature categories prominently on your homepage
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={addFeaturedCategory}
              className="gap-1"
            >
              <Plus size={16} />
              Add Category
            </Button>
          </div>

          {featuredCategoriesData.categories.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
              <Layers size={32} className="mx-auto text-muted mb-2" />
              <p className="text-sm text-muted">
                No featured categories yet. Add categories to highlight.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {featuredCategoriesData.categories.map((cat, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                >
                  <GripVertical size={18} className="text-muted cursor-grab" />
                  <span className="text-sm font-medium text-muted w-8">
                    #{cat.displayOrder}
                  </span>
                  <div className="flex-1">
                    <Select
                      value={cat.categoryId}
                      onChange={(e) =>
                        updateFeaturedCategory(index, e.target.value)
                      }
                      options={categoryOptions}
                      placeholder="Select category"
                    />
                  </div>
                  {cat.categoryId && (
                    <span className="text-sm text-primary font-medium hidden sm:block">
                      {getCategoryName(cat.categoryId)}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeFeaturedCategory(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Footer Settings */}
      <CollapsibleSection
        title="Footer Settings"
        icon={<Mail size={20} className="text-primary" />}
        defaultOpen={true}
      >
        <div className="space-y-6">
          {/* Company Info */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Store size={16} />
              Company Information
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Company Name"
                placeholder="My Store LLC"
                value={footerData.companyName || ""}
                onChange={(e) => {
                  setFooterData((prev) => ({
                    ...prev,
                    companyName: e.target.value,
                  }));
                  markChanged();
                }}
              />
              <Input
                label="Copyright Text"
                placeholder="© 2026 My Store. All rights reserved."
                value={footerData.copyrightText || ""}
                onChange={(e) => {
                  setFooterData((prev) => ({
                    ...prev,
                    copyrightText: e.target.value,
                  }));
                  markChanged();
                }}
              />
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Phone size={16} />
              Contact Information
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input
                label="Email"
                type="email"
                placeholder="contact@mystore.com"
                value={footerData.email || ""}
                onChange={(e) => {
                  setFooterData((prev) => ({ ...prev, email: e.target.value }));
                  markChanged();
                }}
                icon={<Mail size={18} />}
              />
              <Input
                label="Phone"
                placeholder="+1 234 567 8900"
                value={footerData.phone || ""}
                onChange={(e) => {
                  setFooterData((prev) => ({ ...prev, phone: e.target.value }));
                  markChanged();
                }}
                icon={<Phone size={18} />}
              />
              <Input
                label="Address"
                placeholder="123 Main Street, City, Country"
                value={footerData.address || ""}
                onChange={(e) => {
                  setFooterData((prev) => ({
                    ...prev,
                    address: e.target.value,
                  }));
                  markChanged();
                }}
                icon={<MapPin size={18} />}
              />
            </div>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Link2 size={16} />
              Social Media Links
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input
                label="Facebook"
                placeholder="https://facebook.com/mystore"
                value={footerData.socialLinks?.facebook || ""}
                onChange={(e) => {
                  setFooterData((prev) => ({
                    ...prev,
                    socialLinks: {
                      ...prev.socialLinks,
                      facebook: e.target.value,
                    },
                  }));
                  markChanged();
                }}
                icon={<Facebook size={18} />}
              />
              <Input
                label="Instagram"
                placeholder="https://instagram.com/mystore"
                value={footerData.socialLinks?.instagram || ""}
                onChange={(e) => {
                  setFooterData((prev) => ({
                    ...prev,
                    socialLinks: {
                      ...prev.socialLinks,
                      instagram: e.target.value,
                    },
                  }));
                  markChanged();
                }}
                icon={<Instagram size={18} />}
              />
              <Input
                label="Twitter"
                placeholder="https://twitter.com/mystore"
                value={footerData.socialLinks?.twitter || ""}
                onChange={(e) => {
                  setFooterData((prev) => ({
                    ...prev,
                    socialLinks: {
                      ...prev.socialLinks,
                      twitter: e.target.value,
                    },
                  }));
                  markChanged();
                }}
                icon={<Twitter size={18} />}
              />
              <Input
                label="LinkedIn"
                placeholder="https://linkedin.com/company/mystore"
                value={footerData.socialLinks?.linkedin || ""}
                onChange={(e) => {
                  setFooterData((prev) => ({
                    ...prev,
                    socialLinks: {
                      ...prev.socialLinks,
                      linkedin: e.target.value,
                    },
                  }));
                  markChanged();
                }}
                icon={<Linkedin size={18} />}
              />
              <Input
                label="YouTube"
                placeholder="https://youtube.com/mychannel"
                value={footerData.socialLinks?.youtube || ""}
                onChange={(e) => {
                  setFooterData((prev) => ({
                    ...prev,
                    socialLinks: {
                      ...prev.socialLinks,
                      youtube: e.target.value,
                    },
                  }));
                  markChanged();
                }}
                icon={<Youtube size={18} />}
              />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Link2 size={16} />
                Quick Links
              </h3>
              <Button
                size="sm"
                variant="outline"
                onClick={addQuickLink}
                className="gap-1"
              >
                <Plus size={16} />
                Add Link
              </Button>
            </div>

            {!footerData.quickLinks || footerData.quickLinks.length === 0 ? (
              <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-xl">
                <Link2 size={24} className="mx-auto text-muted mb-2" />
                <p className="text-sm text-muted">
                  Add quick links for your footer navigation
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {footerData.quickLinks.map((link, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                  >
                    <div className="flex-1 grid sm:grid-cols-2 gap-3">
                      <Input
                        placeholder="Link Label"
                        value={link.label}
                        onChange={(e) =>
                          updateQuickLink(index, "label", e.target.value)
                        }
                      />
                      <Input
                        placeholder="/about or https://..."
                        value={link.url}
                        onChange={(e) =>
                          updateQuickLink(index, "url", e.target.value)
                        }
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeQuickLink(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CollapsibleSection>

      {/* Floating Save Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <Button
          onClick={handleSave}
          disabled={updateLoading}
          className="shadow-xl min-w-[150px]"
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

      {/* Dialogs */}
      <ConfirmDialog
        isOpen={showDeleteLogoDialog}
        onClose={() => setShowDeleteLogoDialog(false)}
        onConfirm={handleDeleteLogo}
        title="Delete Logo"
        message="Are you sure you want to delete your store logo? This action cannot be undone."
        confirmText="Delete Logo"
        variant="danger"
      />

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteBrand}
        title="Reset Brand Settings"
        message="Are you sure you want to reset all brand settings? This will delete your logo, tagline, description, and all storefront configurations. This action cannot be undone."
        confirmText="Reset All"
        variant="danger"
      />
    </div>
  );
}
