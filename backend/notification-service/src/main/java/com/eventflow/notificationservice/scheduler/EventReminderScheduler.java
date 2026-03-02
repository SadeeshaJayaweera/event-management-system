package com.eventflow.notificationservice.scheduler;

import com.eventflow.notificationservice.dto.InAppNotificationRequest;
import com.eventflow.notificationservice.service.NotificationService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Component
public class EventReminderScheduler {
  private final NotificationService notificationService;
  private final RestTemplate restTemplate;

  public EventReminderScheduler(NotificationService notificationService, RestTemplate restTemplate) {
    this.notificationService = notificationService;
    this.restTemplate = restTemplate;
  }

  // Run every day at 9:00 AM
  @Scheduled(cron = "0 0 9 * * ?")
  public void sendEventReminders() {
    System.out.println("Running event reminder job at " + LocalDateTime.now());
    
    try {
      // Calculate tomorrow's date
      LocalDate tomorrow = LocalDate.now().plusDays(1);
      
      // Get all events from event-service
      String eventServiceUrl = "http://event-service/api/events";
      List<Map<String, Object>> events = restTemplate.getForObject(eventServiceUrl, List.class);
      
      if (events == null) return;
      
      // Filter events happening tomorrow
      for (Map<String, Object> event : events) {
        try {
          String dateStr = (String) event.get("date");
          LocalDate eventDate = LocalDate.parse(dateStr);
          
          if (eventDate.equals(tomorrow)) {
            String eventId = (String) event.get("id");
            String eventTitle = (String) event.get("title");
            String timeStr = (String) event.get("time");
            
            // Get all tickets for this event
            String ticketServiceUrl = "http://ticket-service/api/tickets?eventId=" + eventId;
            List<Map<String, Object>> tickets = restTemplate.getForObject(ticketServiceUrl, List.class);
            
            if (tickets != null) {
              // Send reminder to each attendee
              for (Map<String, Object> ticket : tickets) {
                String userId = (String) ticket.get("userId");
                
                InAppNotificationRequest request = new InAppNotificationRequest();
                request.setUserId(UUID.fromString(userId));
                request.setNotificationType("EVENT_REMINDER");
                request.setMessage(eventTitle + " starts tomorrow at " + timeStr);
                request.setActionUrl("/attendee/tickets/" + ticket.get("id"));
                
                notificationService.createInAppNotification(request);
              }
            }
          }
        } catch (Exception e) {
          System.err.println("Failed to process event for reminders: " + e.getMessage());
        }
      }
    } catch (Exception e) {
      System.err.println("Event reminder job failed: " + e.getMessage());
    }
  }
}
