import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  eventApi,
  ticketApi,
  reviewApi,
  type EventItem,
  type TicketItem,
  type ReviewItem,
  type RatingStats,
} from "../services/eventflow";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  DollarSign,
  Users,
  Ticket,
  Download,
  Star,
  PenLine,
  CheckCircle2,
  Clock,
  Tag,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { StarRating } from "../components/StarRating";
import { ReviewForm } from "../components/ReviewForm";
import { ReviewList } from "../components/ReviewList";

export function AttendeeEventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState<EventItem | null>(null);
  const [myTickets, setMyTickets] = useState<TicketItem[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [ratingStats, setRatingStats] = useState<RatingStats | null>(null);
  const [canReview, setCanReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !user) return;

    const load = async () => {
      setLoading(true);
      try {
        const [eventsData, ticketsData] = await Promise.all([
          eventApi.list(),
          ticketApi.list({ userId: user.id }),
        ]);

        const found = eventsData.find((e) => e.id === id);
        if (!found) {
          toast.error("Event not found");
          navigate("/attendee/discover");
          return;
        }
        setEvent(found);
        const eventTickets = ticketsData.filter((t) => t.eventId === id);
        setMyTickets(eventTickets);

        // Load reviews (non-critical)
        let loadedReviews: ReviewItem[] = [];
        try {
          const [reviewData, statsData] = await Promise.all([
            reviewApi.getByEvent(id),
            reviewApi.getRatingStats(id),
          ]);
          loadedReviews = reviewData;
          setReviews(reviewData);
          setRatingStats(statsData);
        } catch {
          // ignore
        }

        // Check review eligibility — fall back to local heuristic if API unavailable
        try {
          const { canReview: allowed } = await reviewApi.canReview(id, user.id);
          setCanReview(allowed);
        } catch {
          // API unreachable: allow review if user has a ticket and hasn't reviewed yet
          const alreadyReviewed = loadedReviews.some((r) => r.userId === user.id);
          setCanReview(eventTickets.length > 0 && !alreadyReviewed);
        }
      } catch {
        toast.error("Failed to load event");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [id, user?.id]);

  const hasTicket = myTickets.length > 0;

  const handleDownload = async (ticketId: string) => {
    setDownloadingId(ticketId);
    try {
      await ticketApi.download(ticketId);
      toast.success("Ticket downloaded!");
    } catch {
      toast.error("Failed to download ticket");
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      {/* Back */}
      <button
        onClick={() => navigate("/attendee/discover")}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Discover
      </button>

      {/* Hero Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Banner image */}
        <div className="relative h-64 md:h-80">
          <img
            src={event.imageUrl || "https://images.unsplash.com/photo-1540575467063-178a50c2df87"}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Badges */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-medium">
              <Tag className="w-3 h-3" />
              {event.category}
            </span>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                event.status === "Upcoming" ? "bg-green-500 text-white" : "bg-gray-500 text-white"
              }`}
            >
              {event.status}
            </span>
          </div>

          {/* Title overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h1 className="text-2xl md:text-3xl font-extrabold drop-shadow">{event.title}</h1>
            {ratingStats && ratingStats.totalReviews > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <StarRating value={Math.round(ratingStats.averageRating)} readonly size="sm" />
                <span className="text-sm font-semibold">{ratingStats.averageRating.toFixed(1)}</span>
                <span className="text-xs text-white/70">({ratingStats.totalReviews} reviews)</span>
              </div>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Stat chips */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex flex-col gap-1 bg-indigo-50 rounded-xl p-3 border border-indigo-100">
              <div className="flex items-center gap-1.5 text-indigo-600 text-xs font-semibold">
                <Calendar className="w-3.5 h-3.5" /> Date
              </div>
              <p className="text-sm font-bold text-gray-900">{event.date}</p>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {event.time}
              </p>
            </div>

            <div className="flex flex-col gap-1 bg-green-50 rounded-xl p-3 border border-green-100">
              <div className="flex items-center gap-1.5 text-green-600 text-xs font-semibold">
                <MapPin className="w-3.5 h-3.5" /> Venue
              </div>
              <p className="text-sm font-bold text-gray-900 line-clamp-2">{event.location}</p>
            </div>

            <div className="flex flex-col gap-1 bg-purple-50 rounded-xl p-3 border border-purple-100">
              <div className="flex items-center gap-1.5 text-purple-600 text-xs font-semibold">
                <DollarSign className="w-3.5 h-3.5" /> Price
              </div>
              <p className="text-sm font-bold text-gray-900">LKR {event.price}</p>
            </div>

            <div className="flex flex-col gap-1 bg-amber-50 rounded-xl p-3 border border-amber-100">
              <div className="flex items-center gap-1.5 text-amber-600 text-xs font-semibold">
                <Users className="w-3.5 h-3.5" /> Capacity
              </div>
              <p className="text-sm font-bold text-gray-900">{event.maxTickets} seats</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">About this event</h2>
            <p className="text-gray-600 leading-relaxed text-sm">{event.description}</p>
          </div>

          {/* ─── Ticket CTA ─── */}
          {hasTicket ? (
            <div className="rounded-xl border border-green-200 bg-green-50 p-5">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-green-800">
                    You have {myTickets.length} ticket{myTickets.length > 1 ? "s" : ""} for this event
                  </p>
                  <p className="text-xs text-green-600 mt-0.5">
                    Purchased on {new Date(myTickets[0].purchasedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {myTickets.map((ticket) => (
                  <button
                    key={ticket.id}
                    onClick={() => handleDownload(ticket.id)}
                    disabled={downloadingId === ticket.id}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition-colors text-sm font-medium disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    {downloadingId === ticket.id ? "Downloading…" : `Ticket #${ticket.id.slice(0, 8)}`}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-5 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-indigo-900">Ready to attend?</p>
                <p className="text-sm text-indigo-600 mt-0.5">Secure your spot before tickets sell out.</p>
              </div>
              <button
                onClick={() => navigate(`/attendee/checkout/${event.id}`)}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-semibold text-sm shadow-sm whitespace-nowrap"
              >
                <Ticket className="w-4 h-4" />
                Get Tickets · LKR {event.price}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ─── Reviews Section ─── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Reviews</h2>
            {ratingStats && ratingStats.totalReviews > 0 && (
              <div className="flex items-center gap-2 mt-1">
                <StarRating value={Math.round(ratingStats.averageRating)} readonly size="sm" />
                <span className="text-sm font-semibold text-gray-700">
                  {ratingStats.averageRating.toFixed(1)}
                </span>
                <span className="text-sm text-gray-400">
                  ({ratingStats.totalReviews} {ratingStats.totalReviews === 1 ? "review" : "reviews"})
                </span>
              </div>
            )}
          </div>
          {canReview && !showReviewForm && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
            >
              <PenLine className="w-4 h-4" />
              Write a Review
            </button>
          )}
        </div>

        {/* Rating Distribution */}
        {ratingStats && ratingStats.totalReviews > 0 && (
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-6">
              <div className="text-center flex-shrink-0">
                <p className="text-5xl font-extrabold text-gray-900 leading-none">
                  {ratingStats.averageRating.toFixed(1)}
                </p>
                <StarRating value={Math.round(ratingStats.averageRating)} readonly size="sm" />
                <p className="text-xs text-gray-400 mt-1">{ratingStats.totalReviews} ratings</p>
              </div>
              <div className="flex-1 space-y-1.5">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = ratingStats.distribution[star] ?? 0;
                  const pct =
                    ratingStats.totalReviews > 0
                      ? (count / ratingStats.totalReviews) * 100
                      : 0;
                  return (
                    <div key={star} className="flex items-center gap-2">
                      <div className="flex items-center gap-0.5 w-14 flex-shrink-0">
                        <span className="text-xs text-gray-500 w-3 text-right">{star}</span>
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      </div>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 w-6 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Write Review Form */}
        {showReviewForm && user && (
          <ReviewForm
            eventId={id!}
            userId={user.id}
            onSuccess={(newReview) => {
              setReviews((prev) => [newReview, ...prev]);
              setCanReview(false);
              setShowReviewForm(false);
            }}
            onCancel={() => setShowReviewForm(false)}
          />
        )}

        {/* Review List */}
        <ReviewList
          reviews={reviews}
          currentUserId={user?.id}
          onReviewUpdated={(updated) =>
            setReviews((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
          }
          onReviewDeleted={(deletedId) => {
            setReviews((prev) => prev.filter((r) => r.id !== deletedId));
            setCanReview(true);
          }}
        />
      </div>
    </div>
  );
}
