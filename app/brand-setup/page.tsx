"use client";

import { useState, FormEvent, useRef } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Zap,
  Store,
  Palette,
  Upload,
  Globe,
  Phone,
  Mail,
  Check,
  ArrowRight,
  X,
  ExternalLink,
  Eye,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Container from "@/components/ui/Container";
import { ButtonSpinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  upsertBrand,
  checkDomainUniqueness,
} from "@/lib/store/slices/brandSlice";
import { THEME_PREVIEWS } from "@/lib/types/brand";

interface BrandFormData {
  domain: string;
  tagline: string;
  description: string;
  theme: number;
  logo: File | null;
}

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

export default function BrandSetupPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const { tenant, user } = useAppSelector((state) => state.auth);
  const { updateLoading, domainCheckLoading } = useAppSelector(
    (state) => state.brand
  );

  const logoInputRef = useRef<HTMLInputElement>(null);

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [domainAvailable, setDomainAvailable] = useState<boolean | null>(null);

  const [formData, setFormData] = useState<BrandFormData>({
    domain: "",
    tagline: "",
    description: "",
    theme: 1,
    logo: null,
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof BrandFormData, string>>
  >({});

  const updateField = (field: keyof BrandFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (field === "domain") {
      setDomainAvailable(null);
    }
  };

  const handleCheckDomain = async () => {
    if (!formData.domain.trim()) {
      showToast({
        type: "error",
        title: "Domain required",
        message: "Please enter a domain name",
      });
      return;
    }

    try {
      const result = await dispatch(
        checkDomainUniqueness(formData.domain)
      ).unwrap();
      setDomainAvailable(result.isAvailable);

      if (result.isAvailable) {
        showToast({
          type: "success",
          title: "Domain available",
          message: `${formData.domain}.fleetingcommerce.com is available!`,
        });
      } else {
        showToast({
          type: "error",
          title: "Domain taken",
          message: "This domain is already in use. Please choose another.",
        });
        setErrors((prev) => ({
          ...prev,
          domain: "Domain is already taken",
        }));
      }
    } catch (error: any) {
      showToast({
        type: "error",
        title: "Check failed",
        message: error || "Failed to check domain availability",
      });
    }
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

    setFormData((prev) => ({ ...prev, logo: file }));
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, logo: null }));
    setLogoPreview(null);
    if (logoInputRef.current) logoInputRef.current.value = "";
  };

  const openThemePreview = (previewUrl: string) => {
    window.open(previewUrl, "_blank", "noopener,noreferrer");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validate required fields
    const newErrors: Partial<Record<keyof BrandFormData, string>> = {};
    if (!formData.domain.trim()) {
      newErrors.domain = "Domain is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast({
        type: "error",
        title: "Validation Error",
        message: "Please fill in all required fields",
      });
      return;
    }

    // Warn if domain availability wasn't checked
    if (domainAvailable === null) {
      showToast({
        type: "warning",
        title: "Domain not checked",
        message:
          "Please verify domain availability before submitting to avoid issues.",
      });
    }

    try {
      await dispatch(
        upsertBrand({
          logo: formData.logo || undefined,
          domain: formData.domain,
          tagline: formData.tagline || undefined,
          description: formData.description || undefined,
          theme: formData.theme,
        })
      ).unwrap();

      showToast({
        type: "success",
        title: "Brand setup complete!",
        message: "Your store branding has been saved successfully.",
      });

      router.push("/brand-setup/success");
    } catch (error: any) {
      showToast({
        type: "error",
        title: "Setup failed",
        message: error || "Failed to save brand settings. Please try again.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
        <div className="absolute bottom-40 right-20 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
      </div>

      {/* Header */}
      <header className="py-6 border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <Container>
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">
                Fleeting<span className="text-primary">Commerce</span>
              </span>
            </Link>
            <div className="flex items-center gap-2 text-sm text-muted">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Check size={16} className="text-primary" />
              </div>
              <span>Almost there!</span>
            </div>
          </div>
        </Container>
      </header>

      {/* Main Content */}
      <main className="py-12">
        <Container>
          <div className="max-w-3xl mx-auto">
            {/* Page Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Set Up Your <span className="gradient-text">Brand</span>
              </h1>
              <p className="text-muted max-w-lg mx-auto">
                Customize your store&apos;s appearance with a theme and logo.
                You can always update these settings later.
              </p>
            </motion.div>

            {/* Form */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              onSubmit={handleSubmit}
              className="space-y-8"
            >
              {/* Store Info Section - Display Only */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
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

                <div className="space-y-4">
                  {/* Store Name - Read Only */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Store Name
                    </label>
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50">
                      <Store size={20} className="text-muted" />
                      <span className="text-foreground">
                        {tenant?.name || "Your Store"}
                      </span>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* Email - Read Only */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Email
                      </label>
                      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50">
                        <Mail size={20} className="text-muted" />
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
                        <Phone size={20} className="text-muted" />
                        <span className="text-foreground">
                          {user?.phone || "Not provided"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Domain Section */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Globe size={20} className="text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-foreground">
                      Store Domain
                    </h2>
                    <p className="text-sm text-muted">
                      Choose your store&apos;s web address
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Domain Name <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <Input
                        type="text"
                        placeholder="mystore"
                        value={formData.domain}
                        onChange={(e) => {
                          const value = e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9-]/g, "");
                          updateField("domain", value);
                        }}
                        error={errors.domain}
                        maxLength={63}
                      />
                    </div>
                    <span className="text-sm text-muted font-medium whitespace-nowrap">
                      .fleetingcommerce.com
                    </span>
                    <Button
                      type="button"
                      onClick={handleCheckDomain}
                      disabled={!formData.domain.trim() || domainCheckLoading}
                      variant="outline"
                      size="md"
                      className="whitespace-nowrap"
                    >
                      {domainCheckLoading ? (
                        <>
                          <ButtonSpinner />
                          Checking...
                        </>
                      ) : (
                        "Check"
                      )}
                    </Button>
                  </div>
                  {!errors.domain && (
                    <p className="text-xs text-muted mt-2">
                      {formData.domain ? (
                        <>
                          Your store will be available at{" "}
                          <span className="font-medium text-primary">
                            {formData.domain}.fleetingcommerce.com
                          </span>
                          {domainAvailable === true && (
                            <span className="ml-2 text-green-600">
                              ✓ Available
                            </span>
                          )}
                          {domainAvailable === false && (
                            <span className="ml-2 text-red-600">
                              ✗ Not available
                            </span>
                          )}
                        </>
                      ) : (
                        "Enter a unique domain name for your store URL"
                      )}
                    </p>
                  )}
                </div>
              </div>

              {/* Brand Details Section */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Globe size={20} className="text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-foreground">
                      Brand Details
                    </h2>
                    <p className="text-sm text-muted">
                      Add a tagline and description for your store
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <Input
                      label="Tagline (Optional)"
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
                      Description (Optional)
                    </label>
                    <textarea
                      placeholder="Tell customers what makes your store special..."
                      value={formData.description}
                      onChange={(e) =>
                        updateField("description", e.target.value)
                      }
                      rows={3}
                      maxLength={2000}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                    />
                    <p className="text-xs text-muted mt-1">
                      {formData.description.length}/2000 characters
                    </p>
                  </div>
                </div>
              </div>

              {/* Theme Selection Section */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Palette size={20} className="text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-foreground">
                      Choose a Theme
                    </h2>
                    <p className="text-sm text-muted">
                      Select a theme for your storefront
                    </p>
                  </div>
                </div>

                <div className="grid gap-4">
                  {themes.map((theme) => (
                    <div
                      key={theme.id}
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
                          <p className="text-sm text-muted">
                            {theme.description}
                          </p>
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
                    </div>
                  ))}
                </div>
              </div>

              {/* Logo Upload Section */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Upload size={20} className="text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-foreground">
                      Store Logo
                    </h2>
                    <p className="text-sm text-muted">
                      Upload your store logo (Optional)
                    </p>
                  </div>
                </div>

                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/jpg,image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {logoPreview ? (
                  <div className="relative w-full max-w-xs h-40 rounded-xl border-2 border-gray-200 overflow-hidden group mx-auto">
                    <Image
                      src={logoPreview}
                      alt="Logo preview"
                      fill
                      className="object-contain p-4"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="w-full max-w-xs mx-auto h-40 rounded-xl border-2 border-dashed border-gray-300 hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2"
                  >
                    <Upload size={32} className="text-muted" />
                    <span className="text-sm text-muted">
                      Click to upload logo
                    </span>
                    <span className="text-xs text-muted">
                      JPG, PNG, GIF, WebP, SVG • Max 2MB
                    </span>
                  </button>
                )}
              </div>

              {/* Submit */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  size="lg"
                  className="min-w-[200px] gap-2"
                  disabled={updateLoading}
                >
                  {updateLoading ? (
                    <>
                      <ButtonSpinner />
                      Publishing...
                    </>
                  ) : (
                    <>
                      Publish & Continue
                      <ArrowRight size={18} />
                    </>
                  )}
                </Button>
              </div>
            </motion.form>
          </div>
        </Container>
      </main>
    </div>
  );
}
