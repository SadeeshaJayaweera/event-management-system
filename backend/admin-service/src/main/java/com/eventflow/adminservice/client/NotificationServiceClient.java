package com.eventflow.adminservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

@FeignClient(name = "notification-service", url = "${NOTIFICATION_SERVICE_URL:http://notification-service:8085}")
public interface NotificationServiceClient {

  @PostMapping("/api/notifications/in-app")
  void sendInAppNotification(@RequestBody Map<String, Object> request);
}
