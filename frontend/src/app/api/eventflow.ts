import { apiRequest } from "./client";

export type UserRole = "organizer" | "attendee";

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
  get: (id: string) => apiRequest<EventItem>(`/api/events/${id}`),
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
  update: (id: string, payload: {
    title: string;
    category: string;
    date: string;
    time: string;
    location: string;
    description: string;
    imageUrl?: string | null;
  }) => apiRequest<EventItem>(`/api/events/${id}`, { method: "PUT", body: payload }),
  delete: (id: string) => apiRequest<void>(`/api/events/${id}`, { method: "DELETE" }),
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

export interface PaymentInitPayload {
  eventId: string;
  userId: string;
  amount: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  eventTitle?: string;
}

export interface PaymentInitResult {
  orderId: string;
  merchantId: string;
  hash: string;
  amount: string;
  currency: string;
  itemName: string;
  returnUrl: string;
  cancelUrl: string;
  notifyUrl: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  sandbox: boolean;
}

export interface PaymentStatus {
  id: string;
  orderId: string;
  eventId: string;
  userId: string;
  amount: number;
  currency: string;
  status: string; // PENDING, COMPLETED, FAILED, CANCELLED
  paymentId: string | null;
  firstName: string;
  lastName: string;
  email: string;
  eventTitle: string;
  createdAt: string;
  updatedAt: string | null;
}

export const paymentApi = {
  initPayment: (payload: PaymentInitPayload) =>
    apiRequest<PaymentInitResult>("/api/payment/init", { method: "POST", body: payload }),

  getPaymentStatus: (orderId: string) =>
    apiRequest<PaymentStatus>(`/api/payment/status/${orderId}`),

  getByEventId: (eventId: string) =>
    apiRequest<PaymentStatus[]>(`/api/payment/event/${eventId}`),

  simulatePaymentSuccess: (orderId: string) =>
    apiRequest<void>(`/api/payment/dev/force-complete/${orderId}`, { method: "POST" }),

  getByUserId: (userId: string) =>
    apiRequest<PaymentStatus[]>(`/api/payment/user/${userId}`),

  refundPayment: (orderId: string) =>
    apiRequest<void>(`/api/payment/refund/${orderId}`, { method: "POST" }),
};

