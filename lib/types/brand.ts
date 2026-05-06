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
  aboutPage?: AboutPageSection | null;
  contactPage?: ContactPageSection | null;
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
  aboutPage?: AboutPageSection;
  contactPage?: ContactPageSection;
  aboutHeroImage?: File;
  aboutStoryImage?: File;
  aboutTeamImages?: File[];
  contactMapImage?: File;
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
  aboutPage?: AboutPageSection;
  contactPage?: ContactPageSection;
  aboutHeroImage?: File;
  aboutStoryImage?: File;
  aboutTeamImages?: File[];
  contactMapImage?: File;
}

export interface BrandState {
  brand: TenantBrand | null;
  loading: boolean;
  error: string | null;
  updateLoading: boolean;
  domainCheckLoading: boolean;
}

// --- About Page Types ---

export type IconName =
  | "users"
  | "shopping-bag"
  | "award"
  | "truck"
  | "shield"
  | "heart"
  | "star"
  | "globe"
  | "target"
  | "map-pin"
  | "sparkles"
  | "leaf"
  | "mail"
  | "phone"
  | "clock"
  | "send"
  | "message-circle"
  | "headphones"
  | "facebook"
  | "twitter"
  | "instagram"
  | "linkedin"
  | "youtube"
  | "whatsapp"
  | "help-circle";

export interface SeoBlock {
  title?: string;
  description?: string;
}

export interface AboutHero {
  eyebrow?: string;
  title: string;
  highlightText?: string;
  description: string;
  backgroundImage?: string | null;
}

export interface AboutStatItem {
  label: string;
  value: string;
  icon?: IconName;
}

export interface AboutStats {
  isEnabled: boolean;
  items: AboutStatItem[];
}

export interface AboutFeaturedCard {
  title?: string;
  description?: string;
  icon?: IconName;
}

export interface AboutStory {
  isEnabled: boolean;
  eyebrow?: string;
  title: string;
  paragraphs: string[];
  featuredCard?: AboutFeaturedCard;
  image?: string | null;
}

export interface AboutValueItem {
  title: string;
  description: string;
  icon?: IconName;
}

export interface AboutValues {
  isEnabled: boolean;
  eyebrow?: string;
  title: string;
  description?: string;
  items: AboutValueItem[];
}

export interface AboutMilestoneItem {
  year: string;
  title: string;
  description: string;
}

export interface AboutMilestones {
  isEnabled: boolean;
  eyebrow?: string;
  title: string;
  description?: string;
  items: AboutMilestoneItem[];
}

export interface AboutTeamMember {
  name: string;
  role: string;
  description?: string;
  image?: string | null;
}

export interface AboutTeam {
  isEnabled: boolean;
  eyebrow?: string;
  title: string;
  description?: string;
  members: AboutTeamMember[];
}

export interface AboutMission {
  isEnabled: boolean;
  title: string;
  description: string;
  icon?: IconName;
}

export interface AboutPageSection {
  isEnabled: boolean;
  hero: AboutHero;
  stats: AboutStats;
  story: AboutStory;
  values: AboutValues;
  milestones: AboutMilestones;
  team: AboutTeam;
  mission: AboutMission;
  seo?: SeoBlock;
}

// --- Contact Page Types ---

export type ContactInfoType =
  | "email"
  | "phone"
  | "address"
  | "hours"
  | "whatsapp"
  | "custom";

export interface ContactHero {
  eyebrow?: string;
  title: string;
  description: string;
}

export interface ContactInfoItem {
  type: ContactInfoType;
  title: string;
  description?: string;
  details: string;
  actionUrl?: string;
  icon?: IconName;
}

export interface ContactInfo {
  isEnabled: boolean;
  items: ContactInfoItem[];
}

export interface ContactFormField {
  isEnabled: boolean;
  isRequired: boolean;
  label: string;
  placeholder: string;
}

export interface ContactForm {
  isEnabled: boolean;
  title: string;
  description?: string;
  submitButtonText: string;
  successMessage: string;
  recipientEmail: string;
  fields: {
    name: ContactFormField;
    email: ContactFormField;
    subject: ContactFormField;
    message: ContactFormField;
  };
}

export interface SupportOptionItem {
  title: string;
  description?: string;
  isAvailable: boolean;
  actionUrl?: string;
  icon?: IconName;
}

export interface SupportOptions {
  isEnabled: boolean;
  title: string;
  items: SupportOptionItem[];
}

export type SocialPlatform =
  | "facebook"
  | "instagram"
  | "twitter"
  | "x"
  | "linkedin"
  | "youtube"
  | "tiktok"
  | "whatsapp"
  | "website";

export interface ContactSocialItem {
  platform: SocialPlatform;
  label?: string;
  url: string;
}

export interface ContactSocialLinks {
  isEnabled: boolean;
  title?: string;
  items: ContactSocialItem[];
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface ContactFaq {
  isEnabled: boolean;
  eyebrow?: string;
  title: string;
  description?: string;
  items: FaqItem[];
}

export interface ContactLocation {
  isEnabled: boolean;
  title: string;
  description?: string;
  addressLabel?: string;
  address: string;
  mapEmbedUrl?: string | null;
  directionsUrl?: string;
  buttonText?: string;
  mapImage?: string | null;
  mapImagePublicId?: string;
}

export interface ContactPageSection {
  isEnabled: boolean;
  hero: ContactHero;
  contactInfo: ContactInfo;
  form: ContactForm;
  supportOptions: SupportOptions;
  socialLinks: ContactSocialLinks;
  faq: ContactFaq;
  location: ContactLocation;
  seo?: SeoBlock;
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
  4: {
    name: "Editorial Boutique",
    previewUrl: "https://themes.fleetingcommerce.com/editorial-boutique",
    description: "Refined editorial layout for boutique brand storytelling",
  },
};
