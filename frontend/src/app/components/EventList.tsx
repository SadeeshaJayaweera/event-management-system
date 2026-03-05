import { Search, MoreVertical, Calendar, MapPin, Users, Plus, AlertTriangle, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { eventApi, ticketApi, type EventItem } from "../services/eventflow";
import { toast } from "sonner";
import { EventCardSkeleton } from "./LoadingSpinner";
import { useAuth } from "../contexts/AuthContext";

interface EventWithAttendees extends EventItem {
  attendeeCount?: number;
}

export function EventList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [events, setEvents] = useState<EventWithAttendees[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [confirmDeleteEvent, setConfirmDeleteEvent] = useState<EventItem | null>(null);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const organizerId = user?.role === 'organizer' ? user.id : undefined;
        const data = await eventApi.list(organizerId);
        
        const eventsWithCounts = await Promise.all(
          data.map(async (event) => {
            try {
              const tickets = await ticketApi.list({ eventId: event.id });
              return { ...event, attendeeCount: tickets.length };
            } catch (error) {
              return { ...event, attendeeCount: 0 };
            }
          })
        );
        
        setEvents(eventsWithCounts);
      } catch (error) {
        toast.error("Failed to load events");
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [user?.id, user?.role]);

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "All" || event.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["All", ...new Set(events.map(e => e.category))];

  const handleDeleteConfirm = async () => {
    if (confirmDeleteEvent) {
      try {
        await eventApi.delete(confirmDeleteEvent.id);
        setEvents(events.filter(e => e.id !== confirmDeleteEvent.id));
        toast.success("Event deleted successfully");
      } catch (error) {
        toast.error("Failed to delete event");
      } finally {
        setConfirmDeleteEvent(null);
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      {confirmDeleteEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">Delete Event?</h3>
                <p className="text-gray-500 text-sm mt-1">
                  Are you sure you want to delete <span className="font-semibold text-gray-800">"{confirmDeleteEvent.title}"</span>?
                </p>
              </div>
              <button onClick={() => setConfirmDeleteEvent(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setConfirmDeleteEvent(null)}
                className="flex-1 py-2.5 px-4 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleDeleteConfirm}
                className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm">
                Yes, Delete Event
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Events</h1>
          <p className="text-gray-500 mt-1">Manage and organize your upcoming events.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/dashboard/events/create')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Event
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search events..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilterCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterCategory === cat
                ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <><EventCardSkeleton /><EventCardSkeleton /><EventCardSkeleton /></>
        ) : (
          filteredEvents.map((event) => (
            <div key={event.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group flex flex-col h-full">
              <div className="relative h-48 overflow-hidden">
                <img src={event.imageUrl || ""} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-3 right-3 bg-white/90 px-2 py-1 rounded text-xs font-semibold text-gray-900">LKR {event.price}</div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-lg text-gray-900 mb-2">{event.title}</h3>
                <div className="mt-auto space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /><span>{event.date}</span></div>
                  <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /><span>{event.location}</span></div>
                </div>
                <div className="mt-5 pt-4 border-t border-gray-100 flex justify-between items-center">
                   <button onClick={() => navigate(`/dashboard/events/${event.id}`)} className="text-sm font-medium text-indigo-600">View Details</button>
                   <button onClick={() => setConfirmDeleteEvent(event)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                     <X className="w-4 h-4" />
                   </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
