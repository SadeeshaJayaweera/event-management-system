import { apiRequest, getAuthToken, API_BASE_URL } from "./client";

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
  organizerId?: string;
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
  userId: string;
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
  list: (organizerId?: string) => {
    const queryParams = new URLSearchParams();
    if (organizerId) queryParams.append("organizerId", organizerId);
    const queryString = queryParams.toString();
    return apiRequest<EventItem[]>(queryString ? `/api/events?${queryString}` : "/api/events");
  },
  create: (payload: {
    title: string;
    category: string;
    date: string;
    time: string;
    location: string;
    price: number;
    description: string;
    imageUrl?: string | null;
    organizerId?: string;
  }) => apiRequest<EventItem>("/api/events", { method: "POST", body: payload }),
  update: (id: string, payload: {
    title: string;
    category: string;
    date: string;
    time: string;
    location: string;
    price: number;
    description: string;
    status: string;
    imageUrl?: string | null;
  }) => apiRequest<EventItem>(`/api/events/${id}`, { method: "PUT", body: payload }),
  delete: (id: string) => apiRequest<void>(`/api/events/${id}`, { method: "DELETE" }),
};

export const attendeeApi = {
  // Note: Attendee service has been removed.
  // Use ticketApi.list({ eventId }) to get participants for an event.
  // Each ticket contains a userId that references the user from auth-service.
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
  list: (params?: { eventId?: string; userId?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.eventId) queryParams.append("eventId", params.eventId);
    if (params?.userId) queryParams.append("userId", params.userId);

    const queryString = queryParams.toString();
    return apiRequest<TicketItem[]>(queryString ? `/api/tickets?${queryString}` : "/api/tickets");
  },

  purchase: (payload: { eventId: string; userId: string; price: number }) =>
    apiRequest<TicketItem>("/api/tickets", {
      method: "POST",
      body: payload
    }),

  /**
   * Downloads the PDF ticket (with QR code) for the given ticket ID.
   * Triggers a browser file-save dialogue automatically.
   */
  download: async (ticketId: string): Promise<void> => {
    const headers: Record<string, string> = {};
    const token = getAuthToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}/api/tickets/${ticketId}/download`, { headers });
    if (!response.ok) {
      throw new Error(`Failed to download ticket: ${response.statusText}`);
    }

    const blob = await response.blob();
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `ticket-${ticketId}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};

export const analyticsApi = {
  overview: async (organizerId?: string) => {
    try {
      const queryParams = new URLSearchParams();
      if (organizerId) queryParams.append("organizerId", organizerId);
      const queryString = queryParams.toString();
      const overviewData = await apiRequest<AnalyticsOverview>(
        queryString ? `/api/analytics/overview?${queryString}` : "/api/analytics/overview"
      );
      return overviewData;
    } catch (error) {
      console.error("Failed to fetch analytics overview:", error);
      // Return default data if backend not available
      return {
        totalRevenue: "$0.00",
        totalAttendees: "0",
        eventsHosted: "0",
        avgTicketPrice: "$0.00",
      };
    }
  },
  revenue: async (organizerId?: string) => {
    try {
      const queryParams = new URLSearchParams();
      if (organizerId) queryParams.append("organizerId", organizerId);
      const queryString = queryParams.toString();
      const revenueData = await apiRequest<RevenuePoint[]>(
        queryString ? `/api/analytics/revenue?${queryString}` : "/api/analytics/revenue"
      );
      return revenueData;
    } catch (error) {
      console.error("Failed to fetch revenue data:", error);
      // Return mock revenue data as fallback
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
      return months.map((name) => ({
        name,
        revenue: Math.floor(Math.random() * 5000) + 1000,
      }));
    }
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

// Profile Service Types
export interface UserPreferences {
  id: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  eventReminders: boolean;
  marketingEmails: boolean;
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
}

export interface EmergencyContact {
  id: string;
  fullName: string;
  relationship: string;
  phoneNumber: string;
  alternatePhoneNumber?: string;
  email?: string;
  address?: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  bio?: string;
  avatarUrl?: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  country?: string;
  preferences?: UserPreferences;
  emergencyContact?: EmergencyContact;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileUpdateRequest {
  bio?: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  country?: string;
}

export interface PreferencesUpdateRequest {
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  pushNotifications?: boolean;
  eventReminders?: boolean;
  marketingEmails?: boolean;
  language: string;
  timezone: string;
  dateFormat?: string;
  timeFormat?: string;
}

export interface EmergencyContactRequest {
  fullName: string;
  relationship: string;
  phoneNumber: string;
  alternatePhoneNumber?: string;
  email?: string;
  address?: string;
}

// Profile API
export const profileApi = {
  getProfile: (userId: string) => 
    apiRequest<UserProfile>(`/api/profiles/${userId}`),
  
  createProfile: (userId: string) => 
    apiRequest<UserProfile>(`/api/profiles/${userId}`, { method: "POST" }),
  
  updateProfile: (userId: string, payload: ProfileUpdateRequest) =>
    apiRequest<UserProfile>(`/api/profiles/${userId}`, { method: "PUT", body: payload }),
  
  uploadAvatar: (userId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    
    return fetch(`/api/profiles/${userId}/avatar`, {
      method: "POST",
      body: formData,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('eventflow_auth') ? JSON.parse(localStorage.getItem('eventflow_auth')!).token : ''}`
      }
    }).then(res => {
      if (!res.ok) throw new Error('Upload failed');
      return res.json();
    });
  },
  
  getPreferences: (userId: string) =>
    apiRequest<UserPreferences>(`/api/profiles/${userId}/preferences`),
  
  updatePreferences: (userId: string, payload: PreferencesUpdateRequest) =>
    apiRequest<UserProfile>(`/api/profiles/${userId}/preferences`, { method: "PUT", body: payload }),
  
  getEmergencyContact: (userId: string) =>
    apiRequest<EmergencyContact>(`/api/profiles/${userId}/emergency-contact`),
  
  updateEmergencyContact: (userId: string, payload: EmergencyContactRequest) =>
    apiRequest<UserProfile>(`/api/profiles/${userId}/emergency-contact`, { method: "PUT", body: payload }),
  
  deleteEmergencyContact: (userId: string) =>
    apiRequest<void>(`/api/profiles/${userId}/emergency-contact`, { method: "DELETE" }),
};

// Notification Types
export interface InAppNotification {
  id: string;
  userId: string;
  notificationType: string;
  message: string;
  actionUrl?: string;
  isRead: boolean;
  createdAt: string;
}

// Notification API
export const notificationApi = {
  getUserNotifications: (userId: string) =>
    apiRequest<InAppNotification[]>(`/api/notifications/user/${userId}`),
  
  markAsRead: (notificationId: string) =>
    apiRequest<InAppNotification>(`/api/notifications/${notificationId}/read`, { method: "PATCH" }),
  
  markAllAsRead: (userId: string) =>
    apiRequest<void>(`/api/notifications/user/${userId}/read-all`, { method: "PATCH" }),
  
  getUnreadCount: (userId: string) =>
    apiRequest<number>(`/api/notifications/user/${userId}/unread-count`),
};

// Admin Broadcast API
export const broadcastApi = {
  sendBroadcast: (message: string) =>
    apiRequest<void>("/api/admin/broadcast", { method: "POST", body: { message } }),
};

// Payment API (PayHere Integration)
export const paymentApi = {
  initiate: (payload: { orderId: string; amount: number; currency: string }) =>
    apiRequest<{
      merchant_id: string;
      order_id: string;
      amount: string;
      currency: string;
      hash: string;
      action_url: string;
    }>("/api/payment/initiate", { method: "POST", body: payload }),
};

