"use client";

import { useState, FormEvent, useRef } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Zap,
  Store,
  Palette,
  Upload,
  ImageIcon,
  Globe,
  Phone,
  Mail,
  MapPin,
  Check,
  ArrowRight,
  X,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Container from "@/components/ui/Container";
import { ButtonSpinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { setBrandSetupCompleted } from "@/lib/store/slices/authSlice";

interface BrandFormData {
  storeName: string;
  domain: string;
  tagline: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  logo: File | null;
  favicon: File | null;
  contactEmail: string;
  contactPhone: string;
  address: string;
  socialFacebook: string;
  socialInstagram: string;
}

const colorPresets = [
  { name: "Indigo", primary: "#6366f1", secondary: "#818cf8" },
  { name: "Blue", primary: "#3b82f6", secondary: "#60a5fa" },
  { name: "Green", primary: "#22c55e", secondary: "#4ade80" },
  { name: "Purple", primary: "#a855f7", secondary: "#c084fc" },
  { name: "Rose", primary: "#f43f5e", secondary: "#fb7185" },
  { name: "Orange", primary: "#f97316", secondary: "#fb923c" },
];

export default function BrandSetupPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const { tenant, user } = useAppSelector((state) => state.auth);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);

  // Get store base URL and extract domain suffix
  const storeBaseUrl =
    process.env.NEXT_PUBLIC_STORE_BASE_URL || "http://localhost:3001";
  const domainSuffix = storeBaseUrl.replace(/^https?:\/\//, "."); // e.g., ".localhost:3001"

  const [formData, setFormData] = useState<BrandFormData>({
    storeName: tenant?.name || "",
    domain: tenant?.name?.toLowerCase().replace(/[^a-z0-9]/g, "") || "",
    tagline: "",
    description: "",
    primaryColor: "#6366f1",
    secondaryColor: "#818cf8",
    logo: null,
    favicon: null,
    contactEmail: user?.email || "",
    contactPhone: user?.phone || "",
    address: "",
    socialFacebook: "",
    socialInstagram: "",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof BrandFormData, string>>
  >({});

  const updateField = (field: keyof BrandFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "logo" | "favicon"
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
      if (field === "logo") {
        setLogoPreview(reader.result as string);
      } else {
        setFaviconPreview(reader.result as string);
      }
    };
    reader.readAsDataURL(file);

    setFormData((prev) => ({ ...prev, [field]: file }));
  };

  const removeImage = (field: "logo" | "favicon") => {
    setFormData((prev) => ({ ...prev, [field]: null }));
    if (field === "logo") {
      setLogoPreview(null);
      if (logoInputRef.current) logoInputRef.current.value = "";
    } else {
      setFaviconPreview(null);
      if (faviconInputRef.current) faviconInputRef.current.value = "";
    }
  };

  const selectColorPreset = (preset: {
    primary: string;
    secondary: string;
  }) => {
    setFormData((prev) => ({
      ...prev,
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof BrandFormData, string>> = {};

    if (!formData.storeName.trim()) {
      newErrors.storeName = "Store name is required";
    }

    if (!formData.domain.trim()) {
      newErrors.domain = "Domain is required";
    } else if (!/^[a-z0-9-]+$/.test(formData.domain)) {
      newErrors.domain =
        "Domain can only contain lowercase letters, numbers, and hyphens";
    } else if (formData.domain.length < 3) {
      newErrors.domain = "Domain must be at least 3 characters";
    }

    if (
      formData.contactEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)
    ) {
      newErrors.contactEmail = "Invalid email format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    // TODO: API integration - for now just simulate
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Update Redux state to mark brand setup as complete
    dispatch(setBrandSetupCompleted());

    setIsSubmitting(false);
    // Redirect to confirmation page with domain
    router.push(
      `/brand-setup/success?domain=${encodeURIComponent(formData.domain)}`
    );
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
                Customize your store&apos;s appearance and contact information.
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
              {/* Basic Info Section */}
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
                      Basic details about your store
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
                  <Input
                    label="Store Name"
                    type="text"
                    placeholder="My Awesome Store"
                    value={formData.storeName}
                    onChange={(e) => updateField("storeName", e.target.value)}
                    error={errors.storeName}
                    icon={<Store size={20} />}
                  />

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Store Domain
                    </label>
                    <div className="flex items-center">
                      <div className="relative flex-1">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
                          <Globe size={20} />
                        </div>
                        <input
                          type="text"
                          placeholder="mystore"
                          value={formData.domain}
                          onChange={(e) =>
                            updateField(
                              "domain",
                              e.target.value
                                .toLowerCase()
                                .replace(/[^a-z0-9-]/g, "")
                            )
                          }
                          className={`w-full pl-11 pr-4 py-3 rounded-l-xl border ${
                            errors.domain ? "border-red-500" : "border-gray-200"
                          } bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all`}
                        />
                      </div>
                      <div className="px-4 py-3 bg-gray-100 border border-l-0 border-gray-200 rounded-r-xl text-muted text-sm whitespace-nowrap">
                        {domainSuffix}
                      </div>
                    </div>
                    {errors.domain && (
                      <p className="mt-1.5 text-sm text-red-500">
                        {errors.domain}
                      </p>
                    )}
                    <p className="mt-1.5 text-xs text-muted">
                      This will be your store&apos;s unique URL
                    </p>
                  </div>

                  <Input
                    label="Tagline (Optional)"
                    type="text"
                    placeholder="Your catchy slogan here"
                    value={formData.tagline}
                    onChange={(e) => updateField("tagline", e.target.value)}
                  />

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
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Branding Section */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Palette size={20} className="text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-foreground">Branding</h2>
                    <p className="text-sm text-muted">
                      Colors and visual identity
                    </p>
                  </div>
                </div>

                {/* Color Presets */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-foreground mb-3">
                    Color Theme
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {colorPresets.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => selectColorPreset(preset)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all ${
                          formData.primaryColor === preset.primary
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div
                          className="w-5 h-5 rounded-full"
                          style={{ backgroundColor: preset.primary }}
                        />
                        <span className="text-sm font-medium">
                          {preset.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Colors */}
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Primary Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={formData.primaryColor}
                        onChange={(e) =>
                          updateField("primaryColor", e.target.value)
                        }
                        className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-200"
                      />
                      <input
                        type="text"
                        value={formData.primaryColor}
                        onChange={(e) =>
                          updateField("primaryColor", e.target.value)
                        }
                        className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-white text-foreground font-mono text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Secondary Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={formData.secondaryColor}
                        onChange={(e) =>
                          updateField("secondaryColor", e.target.value)
                        }
                        className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-200"
                      />
                      <input
                        type="text"
                        value={formData.secondaryColor}
                        onChange={(e) =>
                          updateField("secondaryColor", e.target.value)
                        }
                        className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-white text-foreground font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Logo & Favicon */}
                <div className="grid sm:grid-cols-2 gap-6">
                  {/* Logo Upload */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Store Logo (Optional)
                    </label>
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "logo")}
                      className="hidden"
                    />
                    {logoPreview ? (
                      <div className="relative w-full h-32 rounded-xl border-2 border-gray-200 overflow-hidden group">
                        <Image
                          src={logoPreview}
                          alt="Logo preview"
                          fill
                          className="object-contain p-2"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage("logo")}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        className="w-full h-32 rounded-xl border-2 border-dashed border-gray-300 hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2"
                      >
                        <Upload size={24} className="text-muted" />
                        <span className="text-sm text-muted">Upload Logo</span>
                      </button>
                    )}
                  </div>

                  {/* Favicon Upload */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Favicon (Optional)
                    </label>
                    <input
                      ref={faviconInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "favicon")}
                      className="hidden"
                    />
                    {faviconPreview ? (
                      <div className="relative w-full h-32 rounded-xl border-2 border-gray-200 overflow-hidden group">
                        <Image
                          src={faviconPreview}
                          alt="Favicon preview"
                          fill
                          className="object-contain p-2"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage("favicon")}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => faviconInputRef.current?.click()}
                        className="w-full h-32 rounded-xl border-2 border-dashed border-gray-300 hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2"
                      >
                        <ImageIcon size={24} className="text-muted" />
                        <span className="text-sm text-muted">
                          Upload Favicon
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Info Section */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Globe size={20} className="text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-foreground">
                      Contact Information
                    </h2>
                    <p className="text-sm text-muted">
                      How customers can reach you
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <Input
                      label="Contact Email"
                      type="email"
                      placeholder="contact@store.com"
                      value={formData.contactEmail}
                      onChange={(e) =>
                        updateField("contactEmail", e.target.value)
                      }
                      error={errors.contactEmail}
                      icon={<Mail size={20} />}
                    />
                    <Input
                      label="Contact Phone"
                      type="tel"
                      placeholder="+880 1XXX-XXXXXX"
                      value={formData.contactPhone}
                      onChange={(e) =>
                        updateField("contactPhone", e.target.value)
                      }
                      icon={<Phone size={20} />}
                    />
                  </div>

                  <Input
                    label="Business Address (Optional)"
                    type="text"
                    placeholder="123 Main Street, Dhaka, Bangladesh"
                    value={formData.address}
                    onChange={(e) => updateField("address", e.target.value)}
                    icon={<MapPin size={20} />}
                  />

                  <div className="grid sm:grid-cols-2 gap-5">
                    <Input
                      label="Facebook Page (Optional)"
                      type="url"
                      placeholder="https://facebook.com/yourstore"
                      value={formData.socialFacebook}
                      onChange={(e) =>
                        updateField("socialFacebook", e.target.value)
                      }
                    />
                    <Input
                      label="Instagram (Optional)"
                      type="url"
                      placeholder="https://instagram.com/yourstore"
                      value={formData.socialInstagram}
                      onChange={(e) =>
                        updateField("socialInstagram", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  size="lg"
                  className="min-w-[200px] gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
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
