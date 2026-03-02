package com.eventflow.adminservice.service;

import com.eventflow.adminservice.client.AuthServiceClient;
import com.eventflow.adminservice.client.NotificationServiceClient;
import com.eventflow.adminservice.dto.UserResponse;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class BroadcastService {
  private final NotificationServiceClient notificationClient;
  private final AuthServiceClient authServiceClient;

  public BroadcastService(NotificationServiceClient notificationClient,
                         AuthServiceClient authServiceClient) {
    this.notificationClient = notificationClient;
    this.authServiceClient = authServiceClient;
  }

  public void broadcastMessage(String message) {
    try {
      // Get all users
      List<UserResponse> users = authServiceClient.getAllUsers();
      
      // Send notification to each user
      for (UserResponse user : users) {
        Map<String, Object> request = new HashMap<>();
        request.put("userId", user.getId().toString());
        request.put("notificationType", "SYSTEM_MESSAGE");
        request.put("message", message);
        request.put("actionUrl", null);
        
        try {
          notificationClient.sendInAppNotification(request);
        } catch (Exception e) {
          System.err.println("Failed to send notification to user " + user.getId() + ": " + e.getMessage());
        }
      }
    } catch (Exception e) {
      System.err.println("Failed to broadcast message: " + e.getMessage());
      throw new RuntimeException("Failed to broadcast message");
    }
  }
}
