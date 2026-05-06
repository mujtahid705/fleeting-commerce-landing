"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Star,
  User,
  Mail,
  Package,
  Calendar,
  EyeOff,
  Eye,
} from "lucide-react";
import { Review } from "@/lib/types/reviews";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Spinner from "@/components/ui/Spinner";

interface ReviewDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  review: Review | null;
  onToggleVisibility: (id: string, currentlyActive: boolean) => void;
  isSubmitting?: boolean;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={18}
          className={star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
        />
      ))}
      <span className="ml-2 text-sm font-medium text-foreground">{rating}/5</span>
    </div>
  );
}

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function ReviewDetailsModal({
  isOpen,
  onClose,
  review,
  onToggleVisibility,
  isSubmitting,
}: ReviewDetailsModalProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!review) return null;

  const handleToggle = () => {
    if (review.isActive) {
      setConfirmOpen(true);
    } else {
      onToggleVisibility(review.id, review.isActive);
    }
  };

  const handleConfirmDeactivate = () => {
    setConfirmOpen(false);
    onToggleVisibility(review.id, review.isActive);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Review Details</h2>
                  <p className="text-sm text-muted">{formatDate(review.createdAt)}</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-muted hover:text-foreground"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
                {/* Status badge */}
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                      review.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {review.isActive ? <Eye size={12} /> : <EyeOff size={12} />}
                    {review.isActive ? "Active" : "Hidden"}
                  </span>
                </div>

                {/* Product */}
                <div className="p-4 rounded-xl bg-gray-50">
                  <div className="flex items-center gap-2 mb-1">
                    <Package size={16} className="text-muted" />
                    <span className="text-xs font-medium text-muted uppercase tracking-wide">Product</span>
                  </div>
                  <p className="font-medium text-foreground">{review.product.title}</p>
                </div>

                {/* Reviewer */}
                <div className="p-4 rounded-xl bg-gray-50">
                  <div className="flex items-center gap-2 mb-1">
                    <User size={16} className="text-muted" />
                    <span className="text-xs font-medium text-muted uppercase tracking-wide">Reviewer</span>
                  </div>
                  <p className="font-medium text-foreground">{review.user.name}</p>
                  <p className="text-sm text-muted flex items-center gap-1 mt-0.5">
                    <Mail size={12} />
                    {review.user.email}
                  </p>
                </div>

                {/* Rating */}
                <div className="p-4 rounded-xl bg-gray-50">
                  <div className="flex items-center gap-2 mb-2">
                    <Star size={16} className="text-muted" />
                    <span className="text-xs font-medium text-muted uppercase tracking-wide">Rating</span>
                  </div>
                  <StarRating rating={review.rating} />
                </div>

                {/* Comment */}
                {review.comment && (
                  <div className="p-4 rounded-xl bg-gray-50">
                    <p className="text-xs font-medium text-muted uppercase tracking-wide mb-2">Comment</p>
                    <p className="text-sm text-foreground leading-relaxed">{review.comment}</p>
                  </div>
                )}

                {/* Dates */}
                <div className="p-4 rounded-xl bg-gray-50">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar size={16} className="text-muted" />
                    <span className="text-xs font-medium text-muted uppercase tracking-wide">Timestamps</span>
                  </div>
                  <p className="text-sm text-muted">Created: {formatDate(review.createdAt)}</p>
                  <p className="text-sm text-muted">Updated: {formatDate(review.updatedAt)}</p>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
                <Button variant="outline" className="flex-1" onClick={onClose}>
                  Close
                </Button>
                {review.isActive ? (
                  <button
                    onClick={handleToggle}
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-3 rounded-full font-medium transition-all duration-300 inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? <Spinner size="sm" /> : null}
                    <EyeOff size={15} /> Deactivate
                  </button>
                ) : (
                  <Button variant="primary" className="flex-1" onClick={handleToggle} isLoading={isSubmitting} disabled={isSubmitting}>
                    <Eye size={15} /> Activate
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDeactivate}
        title="Deactivate Review"
        message="This will hide the review from your storefront and exclude it from rating averages. You can re-activate it anytime."
        confirmText="Deactivate"
        variant="warning"
        isLoading={isSubmitting}
      />
    </>
  );
}
