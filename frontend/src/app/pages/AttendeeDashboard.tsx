import { eventApi, ticketApi, type EventItem, type TicketItem } from "../services/eventflow";
import { Calendar, MapPin, Ticket, TrendingUp, Clock, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";

export function AttendeeDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [upcomingEvents, setUpcomingEvents] = useState<EventItem[]>([]);
  const [myTickets, setMyTickets] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [eventsData, ticketsData] = await Promise.all([
          eventApi.list(),
          ticketApi.list({ userId: user.id }),
        ]);

        // Store all user tickets (not just unique events)
        setMyTickets(ticketsData);
        setUpcomingEvents(eventsData.slice(0, 6));
      } catch (error) {
        console.error(error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    void loadDashboardData();
  }, [user?.id]);

  // Get unique event IDs for display purposes
  const uniqueEventIds = new Set(myTickets.map(t => t.eventId));
  const myTicketedEvents = upcomingEvents.filter(e => uniqueEventIds.has(e.id));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">My Tickets</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{myTickets.length}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
              <Ticket className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
          <button
            onClick={() => navigate('/attendee/tickets')}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium mt-4"
          >
            View all tickets →
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Available Events</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{upcomingEvents.length}</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <button
            onClick={() => navigate('/attendee/discover')}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium mt-4"
          >
            Discover events →
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Events Attending</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{myTicketedEvents.length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">Unique events you're attending</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-8 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-semibold uppercase tracking-wide">Featured</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Discover Amazing Events</h2>
            <p className="text-indigo-100 max-w-md">
              Browse through concerts, workshops, conferences, and more. Find experiences that match your interests.
            </p>
          </div>
          <button
            onClick={() => navigate('/attendee/discover')}
            className="hidden md:block px-6 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-50 transition-colors shadow-lg"
          >
            Explore Now
          </button>
        </div>
        <button
          onClick={() => navigate('/attendee/discover')}
          className="md:hidden w-full mt-6 px-6 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
        >
          Explore Now
        </button>
      </div>

      {/* My Upcoming Events */}
      {myTicketedEvents.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">My Upcoming Events</h2>
            <button
              onClick={() => navigate('/attendee/tickets')}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              View all →
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myTicketedEvents.slice(0, 4).map((event) => {
              const eventTicketCount = myTickets.filter(t => t.eventId === event.id).length;
              return (
                <div key={event.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group cursor-pointer" onClick={() => navigate(`/attendee/events/${event.id}`)}>
                  <div className="flex flex-col sm:flex-row gap-4 p-4">
                    <div className="w-full sm:w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={event.imageUrl || ""} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h3 className="font-bold text-lg text-gray-900 mb-1 truncate">{event.title}</h3>
                        {eventTicketCount > 1 && (
                          <span className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full whitespace-nowrap">
                            {eventTicketCount} tickets
                          </span>
                        )}
                      </div>
                      <span className="inline-block px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium mb-2">
                        {event.category}
                      </span>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="truncate">{event.date} • {event.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Trending Events */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Trending Events</h2>
          <button
            onClick={() => navigate('/attendee/discover')}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            View all →
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingEvents.slice(0, 6).map((event) => (
            <div key={event.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group cursor-pointer" onClick={() => navigate(`/attendee/events/${event.id}`)}>
              <div className="relative h-40 overflow-hidden">
                <img src={event.imageUrl || ""} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-3 left-3 px-2 py-1 rounded text-xs font-semibold text-gray-900 bg-white/90 shadow-sm">
                  LKR {event.price}
                </div>
              </div>
              <div className="p-4">
                <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium">
                  {event.category}
                </span>
                <h3 className="font-bold text-base text-gray-900 mt-2 mb-1 line-clamp-1">{event.title}</h3>
                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span className="truncate">{event.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    <span className="truncate">{event.location}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
