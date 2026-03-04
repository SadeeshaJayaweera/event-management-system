import { eventApi, ticketApi, type EventItem } from "../services/eventflow";
import { Search, Calendar, MapPin, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";

export function DiscoverEvents() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [likedEvents, setLikedEvents] = useState<string[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [myTicketEventIds, setMyTicketEventIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const loadData = async () => {
      try {
        setLoading(true);
        const [eventsData, ticketsData] = await Promise.all([
          eventApi.list(),
          ticketApi.list({ userId: user.id }),
        ]);
        setEvents(eventsData);
        setMyTicketEventIds(new Set(ticketsData.map((ticket) => ticket.eventId)));
      } catch (error) {
        console.error(error);
        toast.error("Failed to load events");
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [user?.id]);

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

  const handleBuyTicket = (event: EventItem) => {
    if (!user) {
      toast.error("Please log in to purchase tickets");
      return;
    }

    if (myTicketEventIds.has(event.id)) {
      toast.error("You already have a ticket for this event!");
      return;
    }

    // Navigate to checkout page
    navigate(`/attendee/checkout/${event.id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Trending Events</h2>
          <span className="text-sm text-gray-500">{filteredEvents.length} events</span>
        </div>
        
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
            <p className="text-gray-500">
              {searchTerm 
                ? `No events found matching "${searchTerm}"`
                : "No events available at the moment"
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <div key={event.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group flex flex-col h-full">
                <div
                  className="relative h-48 overflow-hidden cursor-pointer"
                  onClick={() => navigate(`/attendee/events/${event.id}`)}
                >
                  <img src={event.imageUrl || ""} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleLike(event.id); }}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white shadow-sm transition-colors z-10"
                  >
                    <Heart className={clsx("w-4 h-4", likedEvents.includes(event.id) ? "fill-red-500 text-red-500" : "text-gray-400")} />
                  </button>
                  <div className="absolute top-3 left-3 px-2 py-1 rounded text-xs font-semibold text-gray-900 bg-white/90 shadow-sm">
                    LKR {event.price}
                  </div>
                </div>
                
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium border border-indigo-100">
                      {event.category}
                    </span>
                  </div>
                  
                  <button
                    className="text-left font-bold text-lg text-gray-900 mb-2 line-clamp-1 hover:text-indigo-600 transition-colors"
                    onClick={() => navigate(`/attendee/events/${event.id}`)}
                  >
                    {event.title}
                  </button>
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

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => navigate(`/attendee/events/${event.id}`)}
                      className="flex-1 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      View Details
                    </button>
                    <button 
                      onClick={() => handleBuyTicket(event)}
                      disabled={myTicketEventIds.has(event.id)}
                      className={clsx(
                        "flex-1 py-2 rounded-lg text-sm font-medium transition-colors",
                        myTicketEventIds.has(event.id)
                          ? "bg-green-50 text-green-700 border border-green-200 cursor-not-allowed"
                          : "bg-gray-900 text-white hover:bg-gray-800"
                      )}
                    >
                      {myTicketEventIds.has(event.id) ? "✓ Purchased" : "Get Tickets"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
