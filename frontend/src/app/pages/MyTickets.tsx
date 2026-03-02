import { eventApi, ticketApi, type EventItem } from "../services/eventflow";
import { Calendar, MapPin, Ticket, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";

export function MyTickets() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [myTickets, setMyTickets] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const loadTickets = async () => {
      try {
        setLoading(true);
        const [eventsData, ticketsData] = await Promise.all([
          eventApi.list(),
          ticketApi.list({ userId: user.id }),
        ]);

        const ticketEventIds = new Set(ticketsData.map((ticket) => ticket.eventId));
        const userTicketedEvents = eventsData.filter(e => ticketEventIds.has(e.id));
        setMyTickets(userTicketedEvents);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load tickets");
      } finally {
        setLoading(false);
      }
    };

    void loadTickets();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Tickets</h2>
          <p className="text-sm text-gray-500 mt-1">View and manage your purchased tickets</p>
        </div>
        <span className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-sm font-semibold rounded-lg">
          {myTickets.length} {myTickets.length === 1 ? 'ticket' : 'tickets'}
        </span>
      </div>
      
      {myTickets.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-gray-100 border-dashed">
          <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No tickets yet</h3>
          <p className="text-gray-500 mt-2 mb-6">Browse events and book your first experience!</p>
          <button 
            onClick={() => navigate('/attendee')}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Browse Events
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {myTickets.map((event) => (
            <div key={event.id} className="bg-white p-4 md:p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">
              <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden flex-shrink-0">
                <img src={event.imageUrl || ""} alt={event.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{event.title}</h3>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium">
                      {event.category}
                    </span>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase tracking-wide flex items-center">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Confirmed
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-600 text-sm">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    {event.date} at {event.time}
                  </div>
                  <div className="flex items-center text-gray-600 text-sm">
                    <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                    {event.location}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
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
  );
}
