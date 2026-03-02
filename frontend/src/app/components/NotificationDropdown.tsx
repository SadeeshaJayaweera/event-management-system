import { Check, CheckCheck, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { type InAppNotification } from "../services/eventflow";
import { useAuth } from "../contexts/AuthContext";

interface NotificationDropdownProps {
  notifications: InAppNotification[];
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
  onClose: () => void;
}

export function NotificationDropdown({ 
  notifications, 
  onMarkAsRead, 
  onMarkAllAsRead,
  onClose 
}: NotificationDropdownProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleNotificationClick = (notification: InAppNotification) => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
    
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
    onClose();
  };

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
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMins < 1) return "Just now";
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-20 max-h-[500px] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Notifications</h3>
        {notifications.some(n => !n.isRead) && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMarkAllAsRead();
            }}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
          >
            <CheckCheck className="w-3 h-3" />
            Mark all read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="overflow-y-auto flex-1">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No notifications yet</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <button
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`w-full p-4 text-left border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                !notification.isRead ? "bg-indigo-50" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">
                  {getNotificationIcon(notification.notificationType)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!notification.isRead ? "font-semibold text-gray-900" : "text-gray-700"}`}>
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatTime(notification.createdAt)}
                  </p>
                </div>
                {!notification.isRead && (
                  <span className="w-2 h-2 bg-indigo-600 rounded-full flex-shrink-0 mt-1" />
                )}
              </div>
            </button>
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-200 text-center">
          <button
            onClick={() => {
              const path = user?.role === 'attendee' ? '/attendee/notifications' : '/dashboard/notifications';
              navigate(path);
              onClose();
            }}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            View all notifications
          </button>
        </div>
      )}
    </div>
  );
}
