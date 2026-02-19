import { apiRequest } from "./client";

export type UserRole = "organizer" | "attendee" | "admin";

export interface AuthResponse {
  userId: string;
  name: string;
  role: UserRole;
  token: string;
}

export interface EventItem {
  id: string;
  title: string;
  category: string;
  date: string;
  time: string;
  location: string;
  price: number;
  status: string;
  description: string;
  imageUrl?: string | null;
}

export interface AttendeeItem {
  id: string;
  eventId: string;
  name: string;
  email: string;
  status: string;
  registeredAt: string;
}

export interface TicketItem {
  id: string;
  eventId: string;
  attendeeId: string;
  price: number;
  status: string;
  purchasedAt: string;
}

export interface AnalyticsOverview {
  totalRevenue: string;
  totalAttendees: string;
  eventsHosted: string;
  avgTicketPrice: string;
}

export interface RevenuePoint {
  name: string;
  revenue: number;
}

export const authApi = {
  register: (payload: { name: string; email: string; password: string; role: UserRole }) =>
    apiRequest<AuthResponse>("/api/auth/register", { method: "POST", body: payload }),
  login: (payload: { email: string; password: string }) =>
    apiRequest<AuthResponse>("/api/auth/login", { method: "POST", body: payload }),
};

export const eventApi = {
  list: () => apiRequest<EventItem[]>("/api/events"),
  create: (payload: {
    title: string;
    category: string;
    date: string;
    time: string;
    location: string;
    price: number;
    description: string;
    imageUrl?: string | null;
  }) => apiRequest<EventItem>("/api/events", { method: "POST", body: payload }),
};

export const attendeeApi = {
  list: (eventId?: string) =>
    apiRequest<AttendeeItem[]>(eventId ? `/api/attendees?eventId=${eventId}` : "/api/attendees"),

  create: (payload: { eventId: string; name: string; email: string }) =>
    apiRequest<AttendeeItem>("/api/attendees", {
      method: "POST",
      body: payload
    }),

  checkIn: (id: string, status: string) =>
    apiRequest<AttendeeItem>(`/api/attendees/${id}/status`, {
      method: "PATCH",
      body: { status }
    }),
};

export const ticketApi = {
  list: (params?: { eventId?: string; attendeeId?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.eventId) queryParams.append("eventId", params.eventId);
    if (params?.attendeeId) queryParams.append("attendeeId", params.attendeeId);

    const queryString = queryParams.toString();
    return apiRequest<TicketItem[]>(queryString ? `/api/tickets?${queryString}` : "/api/tickets");
  },

  purchase: (payload: { eventId: string; attendeeId: string; price: number }) =>
    apiRequest<TicketItem>("/api/tickets", {
      method: "POST",
      body: payload
    }),
};

export const analyticsApi = {
  overview: async () => {
    // Aggregate from existing endpoints
    try {
      const events = await apiRequest<EventItem[]>("/api/events");
      const bookings = await apiRequest<any[]>("/api/bookings").catch(() => []);

      const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
      const totalAttendees = bookings.length;
      const eventsHosted = events.length;
      const avgTicketPrice = totalAttendees > 0 ? totalRevenue / totalAttendees : 0;

      return {
        totalRevenue: `$${totalRevenue.toFixed(2)}`,
        totalAttendees: totalAttendees.toString(),
        eventsHosted: eventsHosted.toString(),
        avgTicketPrice: `$${avgTicketPrice.toFixed(2)}`,
      };
    } catch (error) {
      // Return mock data if backend not available
      return {
        totalRevenue: "$0.00",
        totalAttendees: "0",
        eventsHosted: "0",
        avgTicketPrice: "$0.00",
      };
    }
  },
  revenue: async () => {
    // Return mock revenue data
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    return months.map((name) => ({
      name,
      revenue: Math.floor(Math.random() * 5000) + 1000,
    }));
  },
};

export interface DashboardStats {
  totalEvents: number;
  upcomingEvents: number;
  completedEvents: number;
  totalUsers: number;
  totalAttendees: number;
  totalTicketsSold: number;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  status?: string;
}

export const adminApi = {
  getDashboardStats: () => apiRequest<DashboardStats>("/api/admin/dashboard/stats"),
  
  // Event Management
  getAllEvents: () => apiRequest<EventItem[]>("/api/admin/events"),
  getEvent: (id: string) => apiRequest<EventItem>(`/api/admin/events/${id}`),
  updateEvent: (id: string, payload: Partial<EventItem>) =>
    apiRequest<EventItem>(`/api/admin/events/${id}`, { method: "PUT", body: payload }),
  deleteEvent: (id: string) =>
    apiRequest<void>(`/api/admin/events/${id}`, { method: "DELETE" }),

  // User Management
  getAllUsers: () => apiRequest<UserResponse[]>("/api/admin/users"),
  getUser: (id: string) => apiRequest<UserResponse>(`/api/admin/users/${id}`),
  deleteUser: (id: string) =>
    apiRequest<void>(`/api/admin/users/${id}`, { method: "DELETE" }),
  banUser: (id: string) =>
    apiRequest<void>(`/api/admin/users/${id}/ban`, { method: "PUT" }),
  unbanUser: (id: string) =>
    apiRequest<void>(`/api/admin/users/${id}/unban`, { method: "PUT" }),
};

