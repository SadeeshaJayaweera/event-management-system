package com.eventflow.notificationservice.model;

public enum NotificationType {
  // Attendee Notifications
  TICKET_CONFIRMATION,
  EVENT_REMINDER,
  
  // Organizer Notifications
  EVENT_CREATED,
  TICKET_SOLD,
  
  // Admin Notifications
  NEW_EVENT_CREATED,
  NEW_USER_REGISTERED,
  
  // Broadcast
  SYSTEM_MESSAGE
}
