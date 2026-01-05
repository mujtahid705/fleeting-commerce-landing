// Hero Section
export interface HeroSection {
  title?: string;
  subtitle?: string;
  backgroundImage?: string;
  ctaText?: string;
  ctaLink?: string;
}

// Category item in browse/featured sections
export interface CategoryItem {
  categoryId: string | number;
  displayOrder: number;
  category?: {
    id: string | number;
    name: string;
    slug: string;
  };
}

// Browse Categories Section
export interface BrowseCategoriesSection {
  title?: string;
  categories: CategoryItem[];
}

// Featured Categories Section
export interface FeaturedCategoriesSection {
  title?: string;
  categories: CategoryItem[];
}

// Exclusive Product Item
export interface ExclusiveProductItem {
  productId: string;
  customTitle?: string;
  customImage?: string;
  displayOrder: number;
}

// Exclusive Section
export interface ExclusiveSection {
  title?: string;
  products: ExclusiveProductItem[];
}

// Social Links
export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
}

// Quick Link
export interface QuickLink {
  label: string;
  url: string;
}

// Footer Section
export interface FooterSection {
  companyName?: string;
  address?: string;
  phone?: string;
  email?: string;
  socialLinks?: SocialLinks;
  copyrightText?: string;
  quickLinks?: QuickLink[];
}

// Main Tenant Brand
export interface TenantBrand {
  id: string;
  tenantId: string;
  logoUrl: string | null;
  domain?: string;
  tagline: string | null;
  description: string | null;
  theme: number;
  hero?: HeroSection | null;
  browseCategories?: BrowseCategoriesSection | null;
  exclusiveSection?: ExclusiveSection | null;
  featuredCategories?: FeaturedCategoriesSection | null;
  footer?: FooterSection | null;
  tenant?: {
    id: string;
    name: string;
    domain: string;
  };
  tenantName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BrandResponse {
  message: string;
  data: TenantBrand;
}

// Request types
export interface CreateBrandRequest {
  logo?: File;
  heroImage?: File;
  exclusiveImages?: File[];
  domain?: string;
  tagline?: string;
  description?: string;
  theme?: number;
  hero?: HeroSection;
  browseCategories?: BrowseCategoriesSection;
  exclusiveSection?: ExclusiveSection;
  featuredCategories?: FeaturedCategoriesSection;
  footer?: FooterSection;
}

export interface UpdateBrandRequest {
  logo?: File;
  heroImage?: File;
  exclusiveImages?: File[];
  tagline?: string;
  description?: string;
  theme?: number;
  hero?: HeroSection;
  browseCategories?: BrowseCategoriesSection;
  exclusiveSection?: ExclusiveSection;
  featuredCategories?: FeaturedCategoriesSection;
  footer?: FooterSection;
}

export interface BrandState {
  brand: TenantBrand | null;
  loading: boolean;
  error: string | null;
  updateLoading: boolean;
  domainCheckLoading: boolean;
}

// Theme preview URLs
export const THEME_PREVIEWS: Record<
  number,
  { name: string; previewUrl: string; description: string }
> = {
  1: {
    name: "Classic",
    previewUrl: "https://themes.fleetingcommerce.com/classic",
    description: "Clean and professional design with a modern touch",
  },
  2: {
    name: "Modern",
    previewUrl: "https://themes.fleetingcommerce.com/modern",
    description: "Bold and contemporary design for trendy brands",
  },
  3: {
    name: "Minimal",
    previewUrl: "https://themes.fleetingcommerce.com/minimal",
    description: "Simple and elegant design focused on your products",
  },
};
