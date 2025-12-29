export interface TenantBrand {
  id: string;
  tenantId: string;
  logoUrl: string | null;
  tagline: string | null;
  description: string | null;
  theme: number;
  createdAt: string;
  updatedAt: string;
  tenant?: {
    id: string;
    name: string;
    domain: string;
  };
  tenantName?: string;
  domain?: string;
}

export interface BrandResponse {
  message: string;
  data: TenantBrand;
}

export interface CreateBrandRequest {
  logo?: File;
  tagline?: string;
  description?: string;
  theme?: number;
}

export interface UpdateBrandRequest {
  logo?: File;
  tagline?: string;
  description?: string;
  theme?: number;
}

export interface BrandState {
  brand: TenantBrand | null;
  loading: boolean;
  error: string | null;
  updateLoading: boolean;
  domainCheckLoading: boolean;
}

// Theme preview URLs - these will be opened in new tabs
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
