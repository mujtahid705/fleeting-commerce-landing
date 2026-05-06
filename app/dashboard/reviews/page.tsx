"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Search,
  Eye,
  EyeOff,
  MessageSquare,
  Star,
  XCircle,
} from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import PageCard from "@/components/dashboard/PageCard";
import DataTable from "@/components/dashboard/DataTable";
import StatCard from "@/components/dashboard/StatCard";
import Spinner from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import ReviewDetailsModal from "@/components/dashboard/ReviewDetailsModal";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  fetchReviews,
  deactivateReview,
  activateReview,
  setSelectedReview,
  clearSelectedReview,
  clearError,
} from "@/lib/store/slices/reviewsSlice";
import { fetchProducts } from "@/lib/store/slices/productsSlice";
import { Review } from "@/lib/types/reviews";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={13}
          className={
            star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
          }
        />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const { reviews, selectedReview, pagination, isLoading, isSubmitting, error } =
    useAppSelector((state) => state.reviews);
  const { user } = useAppSelector((state) => state.auth);
  const { products } = useAppSelector((state) => state.products);

  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [productFilter, setProductFilter] = useState<string>("all");
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const buildParams = useCallback(
    (search: string, page: number) => {
      return {
        page,
        limit: 20,
        ...(search.trim() ? { search: search.trim() } : {}),
        ...(ratingFilter !== "all" ? { rating: Number(ratingFilter) } : {}),
        ...(statusFilter !== "all" ? { isActive: statusFilter === "active" } : {}),
        ...(productFilter !== "all" ? { productId: productFilter } : {}),
      };
    },
    [ratingFilter, statusFilter, productFilter]
  );

  // Fetch reviews on mount and filter changes
  useEffect(() => {
    if (user?.role === "TENANT_ADMIN") {
      dispatch(fetchReviews(buildParams(searchQuery, currentPage)));
    }
  }, [dispatch, user?.role, ratingFilter, statusFilter, productFilter, currentPage]); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced search
  useEffect(() => {
    if (user?.role !== "TENANT_ADMIN") return;
    const timeout = setTimeout(() => {
      setCurrentPage(1);
      dispatch(fetchReviews(buildParams(searchQuery, 1)));
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load products for filter dropdown
  useEffect(() => {
    if (user?.role === "TENANT_ADMIN" && products.length === 0) {
      dispatch(fetchProducts({}));
    }
  }, [dispatch, user?.role]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle errors
  useEffect(() => {
    if (error) {
      showToast({ type: "error", title: "Error", message: error });
      dispatch(clearError());
    }
  }, [error, dispatch, showToast]);

  // Stats
  const totalReviews = pagination.total;
  const activeCount = reviews.filter((r) => r.isActive).length;
  const hiddenCount = reviews.filter((r) => !r.isActive).length;
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : "—";

  const handleViewReview = (review: Review) => {
    dispatch(setSelectedReview(review));
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsModalOpen(false);
    dispatch(clearSelectedReview());
  };

  const handleToggleVisibility = async (id: string, currentlyActive: boolean) => {
    try {
      if (currentlyActive) {
        await dispatch(deactivateReview(id)).unwrap();
        showToast({ type: "success", title: "Review Hidden", message: "Review deactivated and hidden from storefront." });
      } else {
        await dispatch(activateReview(id)).unwrap();
        showToast({ type: "success", title: "Review Restored", message: "Review is now visible on storefront." });
      }
    } catch {
      // error handled by slice
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const columns = [
    {
      key: "product",
      header: "Product",
      render: (item: Review) => (
        <p className="font-medium text-foreground max-w-[160px] truncate">
          {item.product.title}
        </p>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      render: (item: Review) => (
        <div>
          <p className="font-medium text-foreground">{item.user.name}</p>
          <p className="text-xs text-muted">{item.user.email}</p>
        </div>
      ),
    },
    {
      key: "rating",
      header: "Rating",
      render: (item: Review) => <StarRating rating={item.rating} />,
    },
    {
      key: "comment",
      header: "Comment",
      render: (item: Review) => (
        <span className="text-sm text-muted max-w-[200px] truncate block">
          {item.comment
            ? item.comment.length > 60
              ? item.comment.slice(0, 60) + "…"
              : item.comment
            : <span className="italic">No comment</span>}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item: Review) => (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
            item.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {item.isActive ? <Eye size={11} /> : <EyeOff size={11} />}
          {item.isActive ? "Active" : "Hidden"}
        </span>
      ),
    },
    {
      key: "date",
      header: "Date",
      render: (item: Review) => (
        <span className="text-muted text-sm">{formatDate(item.createdAt)}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (item: Review) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleViewReview(item)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="View Details"
          >
            <Eye size={16} className="text-muted" />
          </button>
          <button
            onClick={() => handleToggleVisibility(item.id, item.isActive)}
            disabled={isSubmitting}
            className={`p-2 rounded-lg transition-colors disabled:opacity-40 ${
              item.isActive
                ? "hover:bg-red-50 text-red-500"
                : "hover:bg-green-50 text-green-600"
            }`}
            title={item.isActive ? "Deactivate" : "Activate"}
          >
            {item.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      ),
    },
  ];

  // Access check
  if (user?.role !== "TENANT_ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <XCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">Access Denied</h2>
        <p className="text-muted">You don&apos;t have permission to view this page.</p>
      </div>
    );
  }

  return (
    <>
      <PageHeader title="Reviews" subtitle="Manage customer product reviews" />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Reviews"
          value={totalReviews.toString()}
          icon={MessageSquare}
          iconColor="from-blue-500 to-cyan-500"
          delay={0}
        />
        <StatCard
          title="Avg Rating"
          value={avgRating.toString()}
          icon={Star}
          iconColor="from-yellow-400 to-orange-400"
          delay={0.1}
        />
        <StatCard
          title="Active"
          value={activeCount.toString()}
          icon={Eye}
          iconColor="from-green-500 to-emerald-500"
          delay={0.2}
        />
        <StatCard
          title="Hidden"
          value={hiddenCount.toString()}
          icon={EyeOff}
          iconColor="from-red-500 to-rose-500"
          delay={0.3}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search comments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
          />
        </div>
        <select
          value={ratingFilter}
          onChange={(e) => { setRatingFilter(e.target.value); setCurrentPage(1); }}
          className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium text-foreground"
        >
          <option value="all">All Ratings</option>
          <option value="5">5 Stars</option>
          <option value="4">4 Stars</option>
          <option value="3">3 Stars</option>
          <option value="2">2 Stars</option>
          <option value="1">1 Star</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium text-foreground"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="hidden">Hidden</option>
        </select>
        {products.length > 0 && (
          <select
            value={productFilter}
            onChange={(e) => { setProductFilter(e.target.value); setCurrentPage(1); }}
            className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium text-foreground"
          >
            <option value="all">All Products</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Table */}
      <PageCard noPadding>
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={reviews}
            emptyMessage="No reviews found"
          />
        )}
      </PageCard>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-1">
          <p className="text-sm text-muted">
            Page {pagination.page} of {pagination.totalPages} · {pagination.total} total
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={pagination.page === 1}
              className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-foreground hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={pagination.page === pagination.totalPages}
              className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-foreground hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Details Modal */}
      <ReviewDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetails}
        review={selectedReview}
        onToggleVisibility={handleToggleVisibility}
        isSubmitting={isSubmitting}
      />
    </>
  );
}
