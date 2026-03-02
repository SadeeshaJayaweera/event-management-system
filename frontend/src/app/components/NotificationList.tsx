import { Bell, Check } from "lucide-react";
import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { notificationApi, type InAppNotification } from "../services/eventflow";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";

export function NotificationList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const isMountedRef = useRef(true);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    
    try {
      const notifs = await notificationApi.getUserNotifications(user.id);
      
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setNotifications(notifs);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      if (isMountedRef.current) {
        toast.error("Failed to load notifications");
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [user]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchNotifications();
    
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchNotifications]);

  const handleMarkAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationApi.markAsRead(notificationId);
      if (isMountedRef.current) {
        await fetchNotifications();
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  }, [fetchNotifications]);

  const handleMarkAllAsRead = useCallback(async () => {
    if (!user) return;
    
    try {
      await notificationApi.markAllAsRead(user.id);
      if (isMountedRef.current) {
        await fetchNotifications();
        toast.success("All notifications marked as read");
      }
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      if (isMountedRef.current) {
        toast.error("Failed to mark notifications as read");
      }
    }
  }, [user, fetchNotifications]);

  const handleNotificationClick = useCallback((notification: InAppNotification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }
    
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  }, [handleMarkAsRead, navigate]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "TICKET_CONFIRMATION":
        return "🎫";
      case "EVENT_REMINDER":
        return "⏰";
      case "EVENT_CREATED":
        return "✅";
      case "TICKET_SOLD":
        return "🎫";
      case "NEW_EVENT_CREATED":
        return "📅";
      case "NEW_USER_REGISTERED":
        return "👤";
      case "SYSTEM_MESSAGE":
        return "📢";
      default:
        return "🔔";
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 mt-1">Stay updated with your activities</p>
        </div>
        {notifications.some(n => !n.isRead) && (
          <button
            onClick={handleMarkAllAsRead}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Mark all read
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No notifications yet</p>
            <p className="text-sm mt-1">We'll notify you when something important happens</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`w-full p-5 text-left hover:bg-gray-50 transition-colors ${
                  !notification.isRead ? "bg-indigo-50" : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  <span className="text-3xl flex-shrink-0">
                    {getNotificationIcon(notification.notificationType)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-base ${!notification.isRead ? "font-semibold text-gray-900" : "text-gray-700"}`}>
                      {notification.message}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatTime(notification.createdAt)}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <span className="w-3 h-3 bg-indigo-600 rounded-full flex-shrink-0 mt-1" />
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
