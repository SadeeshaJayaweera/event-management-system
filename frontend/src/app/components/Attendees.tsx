
import { Search, Mail, Calendar, CheckCircle, Clock, XCircle, MoreHorizontal, Download, DollarSign } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ticketApi, eventApi, type TicketItem, type EventItem } from "../services/eventflow";
import { useAuth } from "../contexts/AuthContext";

interface TicketWithEvent extends TicketItem {
  eventTitle?: string;
}

export function Attendees() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<TicketWithEvent[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // For organizers, only fetch their own events
        const organizerId = user?.role === 'organizer' ? user.id : undefined;
        
        const [ticketsData, eventsData]: [TicketItem[], EventItem[]] = await Promise.all([
          ticketApi.list(),
          eventApi.list(organizerId),
        ]);

        // Create a map of event IDs to event titles
        const eventMap = new Map(eventsData.map(e => [e.id, e.title]));
        
        // For organizers, only show tickets for their events
        const eventIds = new Set(eventsData.map(e => e.id));
        const filteredTickets = ticketsData.filter(ticket => eventIds.has(ticket.eventId));

        // Enrich tickets with event titles
        const enrichedTickets = filteredTickets.map(ticket => ({
          ...ticket,
          eventTitle: eventMap.get(ticket.eventId) || 'Unknown Event'
        }));

        setTickets(enrichedTickets);
      } catch (error) {
        console.error("Failed to load tickets:", error);
        toast.error("Failed to load tickets");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.id, user?.role]);

  const filteredTickets = tickets.filter(ticket => 
    ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (ticket.eventTitle && ticket.eventTitle.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusColor = (status: string) => {
    switch(status) {
      case "Confirmed": return "bg-green-50 text-green-700 border-green-100";
      case "Checked In": return "bg-blue-50 text-blue-700 border-blue-100";
      case "Pending": return "bg-yellow-50 text-yellow-700 border-yellow-100";
      case "Cancelled": return "bg-red-50 text-red-700 border-red-100";
      default: return "bg-gray-50 text-gray-700 border-gray-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case "Confirmed": return <CheckCircle className="w-3 h-3 mr-1" />;
      case "Checked In": return <CheckCircle className="w-3 h-3 mr-1" />;
      case "Pending": return <Clock className="w-3 h-3 mr-1" />;
      case "Cancelled": return <XCircle className="w-3 h-3 mr-1" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ticket Sales</h1>
          <p className="text-gray-500 mt-1">View all ticket purchases across events.</p>
        </div>
        <button 
          onClick={() => toast.success("Exporting CSV...")}
          className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex gap-4">
           <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by ticket ID, user ID, or event..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 font-medium">
                  <tr>
                    <th className="px-6 py-4">Ticket ID</th>
                    <th className="px-6 py-4">Event</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Purchase Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredTickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                            #{ticket.id.slice(0, 4)}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 font-mono text-xs">{ticket.id.slice(0, 8)}...</div>
                            <div className="text-gray-500 text-xs">User: {ticket.userId.slice(0, 8)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{ticket.eventTitle}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-gray-900 font-medium">
                          <DollarSign className="w-3 h-3 mr-0.5" />
                          {ticket.price}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                          {getStatusIcon(ticket.status)}
                          {ticket.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1.5" />
                          {new Date(ticket.purchasedAt).toLocaleDateString()}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredTickets.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No tickets found matching your search.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
