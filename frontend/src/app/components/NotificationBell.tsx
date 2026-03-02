import { Bell } from "lucide-react";
import { useEffect, useState, useCallback, useRef } from "react";
import { notificationApi, type InAppNotification } from "../services/eventflow";
import { useAuth } from "../contexts/AuthContext";
import { NotificationDropdown } from "./NotificationDropdown";

export function NotificationBell() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const isMountedRef = useRef(true);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    
    try {
      const [notifs, countResponse] = await Promise.all([
        notificationApi.getUserNotifications(user.id),
        notificationApi.getUnreadCount(user.id)
      ]);
      
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setNotifications(notifs.slice(0, 5)); // Show only 5 most recent
        // Handle both number and object response types
        const count = typeof countResponse === 'number' ? countResponse : (countResponse as any);
        setUnreadCount(count);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  }, [user]);

  useEffect(() => {
    isMountedRef.current = true;
    
    if (user) {
      fetchNotifications();
      
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => {
        clearInterval(interval);
        isMountedRef.current = false;
      };
    }
  }, [user, fetchNotifications]);

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
      }
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  }, [user, fetchNotifications]);

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          />
          <NotificationDropdown
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
            onClose={() => setShowDropdown(false)}
          />
        </>
      )}
    </div>
  );
}
