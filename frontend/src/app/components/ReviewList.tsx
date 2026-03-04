import { useState } from "react";
import { reviewApi, type ReviewItem } from "../services/eventflow";
import { StarRating } from "./StarRating";
import { toast } from "sonner";
import { ThumbsUp, Pencil, Trash2, MessageSquare } from "lucide-react";
import { ReviewForm } from "./ReviewForm";

interface ReviewListProps {
  reviews: ReviewItem[];
  currentUserId?: string;
  onReviewUpdated: (review: ReviewItem) => void;
  onReviewDeleted: (id: string) => void;
}

export function ReviewList({ reviews, currentUserId, onReviewUpdated, onReviewDeleted }: ReviewListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (review: ReviewItem) => {
    if (!currentUserId) return;
    setDeletingId(review.id);
    try {
      await reviewApi.delete(review.id, currentUserId);
      toast.success("Review deleted");
      onReviewDeleted(review.id);
    } catch {
      toast.error("Failed to delete review");
    } finally {
      setDeletingId(null);
    }
  };

  const handleHelpful = async (review: ReviewItem) => {
    try {
      const updated = await reviewApi.markHelpful(review.id);
      onReviewUpdated(updated);
    } catch {
      toast.error("Failed to mark as helpful");
    }
  };

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200 border-dashed">
        <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 font-medium">No reviews yet</p>
        <p className="text-sm text-gray-400 mt-1">Be the first to share your experience!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => {
        const isOwner = currentUserId === review.userId;
        const isEditing = editingId === review.id;

        if (isEditing) {
          return (
            <ReviewForm
              key={review.id}
              eventId={review.eventId}
              userId={review.userId}
              existingReview={review}
              onSuccess={(updated) => {
                onReviewUpdated(updated);
                setEditingId(null);
              }}
              onCancel={() => setEditingId(null)}
            />
          );
        }

        return (
          <div key={review.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
            {/* Header row */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm flex-shrink-0">
                  {review.userId.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">User ···{review.userId.slice(-6)}</p>
                  <p className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <StarRating value={review.rating} readonly size="sm" />
                <span className="text-sm font-bold text-gray-700">{review.rating}/5</span>
                {review.verified && (
                  <span className="px-1.5 py-0.5 rounded bg-green-100 text-green-700 text-xs font-medium">
                    Verified
                  </span>
                )}
              </div>
            </div>

            {/* Title */}
            {review.title && (
              <h4 className="font-semibold text-gray-900">{review.title}</h4>
            )}

            {/* Comment */}
            {review.comment && (
              <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
            )}

            {/* Pros / Cons */}
            {(review.pros || review.cons) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {review.pros && (
                  <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                    <p className="text-xs font-semibold text-green-700 mb-1">Pros</p>
                    <p className="text-sm text-gray-700">{review.pros}</p>
                  </div>
                )}
                {review.cons && (
                  <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                    <p className="text-xs font-semibold text-red-600 mb-1">Cons</p>
                    <p className="text-sm text-gray-700">{review.cons}</p>
                  </div>
                )}
              </div>
            )}

            {/* Footer actions */}
            <div className="flex items-center justify-between pt-1 border-t border-gray-100">
              <button
                onClick={() => handleHelpful(review)}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-indigo-600 transition-colors"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                Helpful ({review.helpfulCount})
              </button>

              {isOwner && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingId(review.id)}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-indigo-600 transition-colors px-2 py-1 rounded hover:bg-indigo-50"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(review)}
                    disabled={deletingId === review.id}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-600 transition-colors px-2 py-1 rounded hover:bg-red-50 disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {deletingId === review.id ? "Deleting…" : "Delete"}
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
