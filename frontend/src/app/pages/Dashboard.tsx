import { useEffect, useState } from "react";
import { analyticsApi, eventApi, ticketApi, type AnalyticsOverview, type EventItem, type RevenuePoint, type TicketItem } from "../services/eventflow";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Calendar, Clock, MapPin, DollarSign, Users, TrendingUp, Mail, User } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";

const fallbackRevenue = [
  { name: "Jan", revenue: 4000 },
  { name: "Feb", revenue: 3000 },
  { name: "Mar", revenue: 2000 },
  { name: "Apr", revenue: 2780 },
  { name: "May", revenue: 1890 },
  { name: "Jun", revenue: 2390 },
  { name: "Jul", revenue: 3490 },
];

export function Dashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [revenue, setRevenue] = useState<RevenuePoint[]>(fallbackRevenue);
  const [loading, setLoading] = useState(true);
  const [eventTickets, setEventTickets] = useState<Record<string, TicketItem[]>>({});
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // For organizers, filter by their organizerId
        const organizerId = user?.role === 'organizer' ? user.id : undefined;
        
        const [eventsData, overviewData, revenueData] = await Promise.all([
          eventApi.list(organizerId),
          analyticsApi.overview(organizerId),
          analyticsApi.revenue(organizerId),
        ]);
        setEvents(eventsData);
        setOverview(overviewData);
        setRevenue(revenueData);

        // Fetch tickets for each event
        const ticketsMap: Record<string, TicketItem[]> = {};
        await Promise.all(
          eventsData.map(async (event) => {
            try {
              const tickets = await ticketApi.list({ eventId: event.id });
              ticketsMap[event.id] = tickets;
            } catch (error) {
              console.error(`Failed to load tickets for event ${event.id}`, error);
              ticketsMap[event.id] = [];
            }
          })
        );
        setEventTickets(ticketsMap);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.id, user?.role]);

  const stats = overview
    ? [
        { label: "Total Revenue", value: overview.totalRevenue, icon: DollarSign, trend: "+12.5%", color: "text-green-500" },
        { label: "Total Attendees", value: overview.totalAttendees, icon: Users, trend: "+8.2%", color: "text-blue-500" },
        { label: "Events Hosted", value: overview.eventsHosted, icon: Calendar, trend: "+24%", color: "text-purple-500" },
        { label: "Avg. Ticket Price", value: overview.avgTicketPrice, icon: TrendingUp, trend: "-2.1%", color: "text-orange-500" },
      ]
    : [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here's what's happening with your events.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg bg-gray-50 ${stat.color.replace("text-", "bg-").replace("500", "100")}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <span className={`text-sm font-medium ${stat.trend.startsWith("+") ? "text-green-600" : "text-red-600"}`}>
                {stat.trend}
              </span>
            </div>
            <h3 className="text-gray-500 text-sm font-medium">{stat.label}</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Revenue Analytics</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenue} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 12 }} tickFormatter={(value) => `$${value}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#fff", borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                  itemStyle={{ color: "#4f46e5" }}
                  formatter={(value) => [`$${value}`, "Revenue"]}
                />
                <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Upcoming Events</h2>
          <div className="space-y-4">
            {events.slice(0, 3).map((event) => (
              <div key={event.id} className="flex gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer group">
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
                  <img src={event.imageUrl || ""} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 text-sm truncate">{event.title}</h4>
                  <div className="flex items-center text-gray-500 text-xs mt-1">
                    <Calendar className="w-3 h-3 mr-1" />
                    {event.date}
                  </div>
                  <div className="flex items-center text-gray-500 text-xs mt-1">
                    <MapPin className="w-3 h-3 mr-1" />
                    {event.location}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2 text-sm text-indigo-600 font-medium hover:text-indigo-800 transition-colors">
            View All Events
          </button>
        </div>
      </div>

      {/* Event Attendees Section */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">Event Attendees</h2>
          <span className="text-sm text-gray-500">{events.length} events</span>
        </div>

        <div className="space-y-4">
          {events.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No events yet. Create your first event to start managing attendees.</p>
            </div>
          ) : (
            events.map((event) => {
              const tickets = eventTickets[event.id] || [];
              const isExpanded = expandedEvent === event.id;

              return (
                <div key={event.id} className="border border-gray-200 rounded-lg overflow-hidden transition-all">
                  <button
                    onClick={() => setExpandedEvent(isExpanded ? null : event.id)}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      {event.imageUrl && (
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
                          <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{event.title}</h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="w-3.5 h-3.5 mr-1.5" />
                            {event.date}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="w-3.5 h-3.5 mr-1.5" />
                            {event.location}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full">
                          <Users className="w-4 h-4" />
                          <span className="font-semibold text-sm">{tickets.length}</span>
                        </div>
                        <svg
                          className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-gray-200 bg-gray-50 p-4">
                      {tickets.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                          <p className="text-sm">No tickets sold yet</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {tickets.map((ticket) => (
                            <div
                              key={ticket.id}
                              className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow"
                            >
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                  <User className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-gray-900 truncate">Ticket #{ticket.id.slice(0, 8)}</h4>
                                  <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                                    <DollarSign className="w-3.5 h-3.5 flex-shrink-0" />
                                    <span>${ticket.price}</span>
                                  </div>
                                  <p className="text-xs text-gray-400 mt-1">
                                    Purchased: {new Date(ticket.purchasedAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
