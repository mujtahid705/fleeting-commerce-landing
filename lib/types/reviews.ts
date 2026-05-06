export interface ReviewUser {
  id: string;
  name: string;
  email: string;
}

export interface ReviewProduct {
  id: string;
  title: string;
  slug: string;
}

export interface Review {
  id: string;
  rating: number;
  comment: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  product: ReviewProduct;
  user: ReviewUser;
}

export interface ReviewsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ReviewsState {
  reviews: Review[];
  selectedReview: Review | null;
  pagination: ReviewsPagination;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
}

export interface FetchReviewsParams {
  productId?: string;
  rating?: number;
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}
