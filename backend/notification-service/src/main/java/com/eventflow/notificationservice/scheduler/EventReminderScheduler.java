package com.eventflow.notificationservice.scheduler;

import com.eventflow.notificationservice.dto.InAppNotificationRequest;
import com.eventflow.notificationservice.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
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
  private static final Logger log = LoggerFactory.getLogger(EventReminderScheduler.class);
  
  private final NotificationService notificationService;
  private final RestTemplate restTemplate;

  @Value("${event-service.url:http://event-service:8081}")
  private String eventServiceUrl;

  @Value("${ticket-service.url:http://ticket-service:8084}")
  private String ticketServiceUrl;

  public EventReminderScheduler(NotificationService notificationService, RestTemplate restTemplate) {
    this.notificationService = notificationService;
    this.restTemplate = restTemplate;
  }

  // Run every day at 9:00 AM
  @Scheduled(cron = "0 0 9 * * ?")
  public void sendEventReminders() {
    log.info("Running event reminder job at {}", LocalDateTime.now());
    
    try {
      // Calculate tomorrow's date
      LocalDate tomorrow = LocalDate.now().plusDays(1);
      
      // Get all events from event-service
      String eventsUrl = eventServiceUrl + "/api/events";
      List<Map<String, Object>> events = restTemplate.getForObject(eventsUrl, List.class);
      
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
            String ticketsUrl = ticketServiceUrl + "/api/tickets?eventId=" + eventId;
            List<Map<String, Object>> tickets = restTemplate.getForObject(ticketsUrl, List.class);
            
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
          log.error("Failed to process event for reminders: {}", e.getMessage());
        }
      }
    } catch (Exception e) {
      log.error("Event reminder job failed: {}", e.getMessage());
    }
  }
}
