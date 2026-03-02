
import { Search, Edit2, Trash2, Calendar, MapPin, Users, Plus, AlertTriangle, X } from "lucide-react";
import { useState } from "react";

interface EventListProps {
  events: any[];
  userRole?: string;
  onCreateClick: () => void;
  onBuyTickets: (event: any) => void;
  onEditEvent?: (event: any) => void;
  onDeleteEvent?: (event: any) => void;
}

export function EventList({ events, userRole, onCreateClick, onBuyTickets, onEditEvent, onDeleteEvent }: EventListProps) {
  const isOrganizer = userRole === 'organizer';
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [confirmDeleteEvent, setConfirmDeleteEvent] = useState<any | null>(null);

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "All" || event.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["All", ...new Set(events.map(e => e.category))];

  const handleDeleteConfirm = () => {
    if (confirmDeleteEvent) {
      onDeleteEvent?.(confirmDeleteEvent);
      setConfirmDeleteEvent(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      {/* Delete Confirmation Modal */}
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
                  Attendees who purchased tickets will be notified and can request a refund.
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
          <button onClick={onCreateClick}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Create Event
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search events..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilterCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filterCategory === cat
                ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event: any) => (
          <div key={event.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group flex flex-col h-full">
            <div className="relative h-48 overflow-hidden">
              <img src={event.imageUrl || event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold text-gray-900 shadow-sm">
                ${event.price}
              </div>
              <div className={`absolute top-3 left-3 px-2 py-1 rounded text-xs font-semibold text-white shadow-sm ${event.status === 'Upcoming' ? 'bg-green-500/90' : 'bg-gray-500/90'}`}>
                {event.status}
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
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span>{event.attendees?.toLocaleString() || 0} attendees</span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-gray-100 flex justify-between items-center gap-2">
                {isOrganizer ? (
                  <>
                    <button
                      onClick={() => onEditEvent?.(event)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-indigo-50 hover:text-indigo-700 text-gray-700 text-sm font-medium rounded-lg transition-colors flex-1 justify-center">
                      <Edit2 className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => setConfirmDeleteEvent(event)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium rounded-lg transition-colors flex-1 justify-center">
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => onBuyTickets(event)}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm w-full">
                    Get Tickets
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100 border-dashed">
          <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Search className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No events found</h3>
          <p className="text-gray-500 mt-1">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
}
