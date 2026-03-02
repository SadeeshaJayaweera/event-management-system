import { eventApi, ticketApi, paymentApi, type EventItem, type TicketItem, type PaymentStatus } from "../api/eventflow";
import { Search, Calendar, MapPin, Heart, Ticket, LogOut, CheckCircle, AlertTriangle, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import clsx from "clsx";
import { toast } from "sonner";

interface AttendeeDashboardProps {
  user: { id: string; name: string; role: string };
  onLogout: () => void;
  onBuyTickets: (event: EventItem) => void;
  initialTab?: 'discover' | 'tickets';
}

export function AttendeeDashboard({ user, onLogout, onBuyTickets, initialTab = 'discover' }: AttendeeDashboardProps) {
  const [activeTab, setActiveTab] = useState<'discover' | 'tickets'>(initialTab);
  const [searchTerm, setSearchTerm] = useState("");
  const [likedEvents, setLikedEvents] = useState<string[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [myTickets, setMyTickets] = useState<EventItem[]>([]);
  const [cancelledPayments, setCancelledPayments] = useState<PaymentStatus[]>([]);
  const [refundingOrderId, setRefundingOrderId] = useState<string | null>(null);
  const [refundedOrderIds, setRefundedOrderIds] = useState<Set<string>>(new Set());
  const [pendingRefundPayment, setPendingRefundPayment] = useState<PaymentStatus | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load events and user's payments in parallel
        const [eventsData, userPayments]: [EventItem[], PaymentStatus[]] = await Promise.all([
          eventApi.list(),
          paymentApi.getByUserId(user.id).catch(() => [] as PaymentStatus[]),
        ]);
        setEvents(eventsData);

        // Build a set of current event IDs
        const allEventIds = new Set(eventsData.map(e => e.id));

        // Find COMPLETED or REFUNDED payments belonging to this user for events that no longer exist
        const cancelled = userPayments.filter(
          p => (p.status === 'COMPLETED' || p.status === 'REFUNDED') && !allEventIds.has(p.eventId)
        );
        setCancelledPayments(cancelled);

        // Pre-mark any already-refunded payments as success (so they show green card on load)
        const alreadyRefunded = new Set(cancelled.filter(p => p.status === 'REFUNDED').map(p => p.orderId));
        if (alreadyRefunded.size > 0) {
          setRefundedOrderIds(alreadyRefunded);
        }

        // For active tickets, load from ticket service as normal
        const ticketsData: TicketItem[] = await ticketApi.list({ attendeeId: user.id }).catch(() => []);
        const ticketEventIds = new Set(ticketsData.map(t => t.eventId));
        const userTicketedEvents = eventsData.filter(e => ticketEventIds.has(e.id));
        setMyTickets(userTicketedEvents);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load data");
      }
    };

    void loadData();
  }, [user.id]);

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleLike = (id: string) => {
    if (likedEvents.includes(id)) {
      setLikedEvents(likedEvents.filter(e => e !== id));
      toast("Removed from favorites");
    } else {
      setLikedEvents([...likedEvents, id]);
      toast("Added to favorites");
    }
  };

  const handleBuyTicket = async (event: EventItem) => {
    if (myTickets.some((ticket) => ticket.id === event.id)) {
      toast.error("You already have a ticket for this event!");
      setActiveTab('tickets');
      return;
    }
    onBuyTickets(event);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Calendar className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-gray-900">EventFlow</span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => setActiveTab('discover')}
                className={clsx("text-sm font-medium transition-colors relative py-5", activeTab === 'discover' ? "text-indigo-600" : "text-gray-500 hover:text-gray-900")}
              >
                Discover
                {activeTab === 'discover' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full" />}
              </button>
              <button
                onClick={() => setActiveTab('tickets')}
                className={clsx("text-sm font-medium transition-colors relative py-5", activeTab === 'tickets' ? "text-indigo-600" : "text-gray-500 hover:text-gray-900")}
              >
                My Tickets
                {activeTab === 'tickets' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full" />}
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-sm border border-indigo-200">
                  {user.name.charAt(0)}
                </div>
                <span className="text-sm font-medium text-gray-700 hidden sm:block">{user.name}</span>
              </div>
              <button onClick={onLogout} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-colors">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'discover' ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Hero Banner */}
            <div className="relative rounded-2xl overflow-hidden bg-indigo-900 h-64 md:h-80 flex items-center group">
              <div className="absolute inset-0 opacity-40">
                <img
                  src="https://images.unsplash.com/photo-1735748917428-be035e873f97?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGNvbmNlcnQlMjBjcm93ZCUyMGxpZ2h0c3xlbnwxfHx8fDE3NzAyNjI1MTN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Crowd enjoying a live concert"
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
              </div>
              <div className="relative z-10 px-8 md:px-12 max-w-2xl">
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">Find your next experience</h1>
                <p className="text-indigo-100 text-lg mb-8">Discover concerts, workshops, and conferences happening near you.</p>
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search events, categories, or locations..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-0 focus:ring-2 focus:ring-indigo-500 text-gray-900 shadow-lg placeholder:text-gray-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Event Grid */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Trending Events</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
                  <div key={event.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group flex flex-col h-full">
                    <div className="relative h-48 overflow-hidden">
                      <img src={event.imageUrl || ""} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <button
                        onClick={() => toggleLike(event.id)}
                        className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white shadow-sm transition-colors z-10"
                      >
                        <Heart className={clsx("w-4 h-4", likedEvents.includes(event.id) ? "fill-red-500 text-red-500" : "text-gray-400")} />
                      </button>
                      <div className="absolute top-3 left-3 px-2 py-1 rounded text-xs font-semibold text-gray-900 bg-white/90 shadow-sm">
                        ${event.price}
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium border border-indigo-100">
                          {event.category}
                        </span>
                      </div>

                      <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">{event.title}</h3>
                      <p className="text-gray-500 text-sm mb-4 line-clamp-2">{event.description}</p>

                      <div className="mt-auto space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>{event.date} • {event.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleBuyTicket(event)}
                        className={clsx(
                          "w-full mt-4 py-2 rounded-lg text-sm font-medium transition-colors",
                          myTickets.some(t => t.id === event.id)
                            ? "bg-green-50 text-green-700 border border-green-200 cursor-default"
                            : "bg-gray-900 text-white hover:bg-gray-800"
                        )}
                      >
                        {myTickets.some(t => t.id === event.id) ? "Ticket Purchased" : "Purchase Ticket"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredEvents.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No events found matching "{searchTerm}"</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
            {/* Refund Confirmation Modal */}
            {pendingRefundPayment && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                      <RefreshCw className="w-8 h-8 text-amber-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Refund</h3>
                    <p className="text-gray-500 text-sm mb-5">
                      You are about to request a refund for the cancelled event:
                    </p>

                    {/* Refund Details Card */}
                    <div className="w-full bg-gray-50 rounded-xl p-4 text-left mb-6 border border-gray-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Event</span>
                        <span className="font-semibold text-gray-900">{pendingRefundPayment.eventTitle}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Refund Amount</span>
                        <span className="font-bold text-green-700 text-lg">
                          {pendingRefundPayment.currency} {Number(pendingRefundPayment.amount).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Order ID</span>
                        <span className="text-xs text-gray-600 font-mono">{pendingRefundPayment.orderId}</span>
                      </div>
                    </div>

                    <div className="flex gap-3 w-full">
                      <button
                        onClick={() => setPendingRefundPayment(null)}
                        disabled={refundingOrderId === pendingRefundPayment.orderId}
                        className="flex-1 py-2.5 px-4 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        disabled={refundingOrderId === pendingRefundPayment.orderId}
                        onClick={async () => {
                          const orderId = pendingRefundPayment.orderId;
                          setRefundingOrderId(orderId);
                          try {
                            await paymentApi.refundPayment(orderId);
                            setRefundedOrderIds(prev => new Set([...prev, orderId]));
                            setPendingRefundPayment(null);
                            toast.success('Refund processed successfully!');
                          } catch {
                            toast.error('Refund failed. Please contact support.');
                          } finally {
                            setRefundingOrderId(null);
                          }
                        }}
                        className="flex-1 py-2.5 px-4 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm flex items-center justify-center gap-2"
                      >
                        {refundingOrderId === pendingRefundPayment.orderId ? (
                          <><RefreshCw className="w-4 h-4 animate-spin" /> Processing...</>
                        ) : (
                          <>✓ Confirm Refund</>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">My Tickets</h2>
              <span className="text-gray-500 text-sm">{myTickets.length} active tickets</span>
            </div>

            {myTickets.length === 0 && cancelledPayments.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-2xl border border-gray-100 border-dashed">
                <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No tickets yet</h3>
                <p className="text-gray-500 mt-2 mb-6">Browse events and book your first experience!</p>
                <button onClick={() => setActiveTab('discover')}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
                  Browse Events
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Cancelled event refund banners */}
                {cancelledPayments.map((payment) => (
                  refundedOrderIds.has(payment.orderId) ? (
                    // Refund success — show green confirmation card with event info
                    <div key={payment.orderId} className="bg-green-50 border border-green-200 rounded-xl p-5 flex flex-col md:flex-row gap-4 items-center animate-in fade-in duration-500">
                      <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      </div>
                      <div className="flex-1 text-center md:text-left">
                        <h3 className="font-bold text-green-900 text-lg">Refund Processed Successfully!</h3>
                        <p className="text-green-700 text-sm mt-1">
                          Your refund of <span className="font-semibold">{payment.currency} {Number(payment.amount).toFixed(2)}</span> for{' '}
                          <span className="font-semibold">"{payment.eventTitle}"</span> has been processed.
                        </p>
                        <p className="text-green-500 text-xs mt-1">Order: {payment.orderId} • Refund ID: REF-{payment.orderId.slice(-8).toUpperCase()}</p>
                      </div>
                      <span className="px-3 py-1.5 bg-green-200 text-green-800 text-xs font-bold rounded-full uppercase tracking-wide flex-shrink-0">
                        ✓ Refunded
                      </span>
                    </div>
                  ) : (
                    // Cancellation notice with Refund button
                    <div key={payment.orderId} className="bg-red-50 border border-red-200 rounded-xl p-5 flex flex-col md:flex-row gap-4 items-start">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-red-900 text-lg">This event is no longer available</h3>
                        <p className="text-red-700 text-sm mt-1">
                          <span className="font-semibold">"{payment.eventTitle}"</span> has been cancelled by the organizer.
                          You are eligible for a full refund of{' '}
                          <span className="font-semibold">{payment.currency} {Number(payment.amount).toFixed(2)}</span>.
                        </p>
                        <p className="text-red-500 text-xs mt-1">Order: {payment.orderId}</p>
                      </div>
                      <div className="flex-shrink-0">
                        <button
                          disabled={refundingOrderId === payment.orderId}
                          onClick={() => setPendingRefundPayment(payment)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
                        >
                          Refund My Money
                        </button>
                      </div>
                    </div>
                  )
                ))}


                {/* Active tickets */}
                {myTickets.map((event) => (
                  <div key={event.id} className="bg-white p-4 md:p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">
                    <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={event.imageUrl || ""} alt={event.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{event.title}</h3>
                          <div className="flex items-center text-gray-500 text-sm mt-1">
                            <Calendar className="w-4 h-4 mr-1.5" />
                            {event.date} at {event.time}
                          </div>
                          <div className="flex items-center text-gray-500 text-sm mt-1">
                            <MapPin className="w-4 h-4 mr-1.5" />
                            {event.location}
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase tracking-wide flex items-center">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Confirmed
                        </span>
                      </div>
                      <div className="mt-6 flex gap-3">
                        <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
                          <Ticket className="w-4 h-4 mr-2" />
                          View Ticket
                        </button>
                        <button className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                          Add to Calendar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
