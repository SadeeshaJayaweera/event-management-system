package com.eventflow.ticketservice.client;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Component
public class NotificationServiceClient {
  private final RestTemplate restTemplate;
  private static final String NOTIFICATION_SERVICE_URL = "http://notification-service/api/notifications/in-app";

  public NotificationServiceClient(RestTemplate restTemplate) {
    this.restTemplate = restTemplate;
  }

  public void sendInAppNotification(UUID userId, String notificationType, String message, String actionUrl) {
    try {
      Map<String, Object> request = new HashMap<>();
      request.put("userId", userId.toString());
      request.put("notificationType", notificationType);
      request.put("message", message);
      request.put("actionUrl", actionUrl);

      restTemplate.postForEntity(NOTIFICATION_SERVICE_URL, request, Object.class);
    } catch (Exception e) {
      // Log error but don't fail the main operation
      System.err.println("Failed to send notification: " + e.getMessage());
    }
  }
}
