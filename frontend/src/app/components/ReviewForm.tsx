import { useState } from "react";
import { reviewApi, type ReviewItem } from "../services/eventflow";
import { StarRating } from "./StarRating";
import { toast } from "sonner";
import { Send, X } from "lucide-react";

interface ReviewFormProps {
  eventId: string;
  userId: string;
  existingReview?: ReviewItem | null;
  onSuccess: (review: ReviewItem) => void;
  onCancel?: () => void;
}

export function ReviewForm({ eventId, userId, existingReview, onSuccess, onCancel }: ReviewFormProps) {
  const isEditing = !!existingReview;

  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [title, setTitle] = useState(existingReview?.title ?? "");
  const [comment, setComment] = useState(existingReview?.comment ?? "");
  const [pros, setPros] = useState(existingReview?.pros ?? "");
  const [cons, setCons] = useState(existingReview?.cons ?? "");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a star rating");
      return;
    }

    setSubmitting(true);
    try {
      let result: ReviewItem;
      if (isEditing && existingReview) {
        result = await reviewApi.update(existingReview.id, userId, { rating, title, comment, pros, cons });
        toast.success("Review updated!");
      } else {
        result = await reviewApi.create({ eventId, userId, rating, title, comment, pros, cons });
        toast.success("Review submitted!");
      }
      onSuccess(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to submit review";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">
          {isEditing ? "Edit Your Review" : "Write a Review"}
        </h3>
        {onCancel && (
          <button type="button" onClick={onCancel} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>

      {/* Star Rating */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Overall Rating *</label>
        <div className="flex items-center gap-3">
          <StarRating value={rating} onChange={setRating} size="lg" />
          {rating > 0 && (
            <span className="text-sm text-gray-500">
              {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
            </span>
          )}
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          placeholder="Summarise your experience…"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {/* Comment */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Review</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={2000}
          rows={4}
          placeholder="Share the details of your experience…"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
        />
        <p className="text-xs text-gray-400 mt-1 text-right">{comment.length}/2000</p>
      </div>

      {/* Pros / Cons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <span className="text-green-600">Pros</span>
          </label>
          <textarea
            value={pros}
            onChange={(e) => setPros(e.target.value)}
            rows={2}
            placeholder="What did you enjoy?"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <span className="text-red-500">Cons</span>
          </label>
          <textarea
            value={cons}
            onChange={(e) => setCons(e.target.value)}
            rows={2}
            placeholder="What could be improved?"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-1">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={submitting || rating === 0}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
          {submitting ? "Submitting…" : isEditing ? "Update Review" : "Submit Review"}
        </button>
      </div>
    </form>
  );
}
