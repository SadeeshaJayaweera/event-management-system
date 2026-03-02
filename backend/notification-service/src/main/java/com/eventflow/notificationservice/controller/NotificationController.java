package com.eventflow.notificationservice.controller;

import com.eventflow.notificationservice.dto.InAppNotificationRequest;
import com.eventflow.notificationservice.dto.NotificationCreateRequest;
import com.eventflow.notificationservice.dto.NotificationResponse;
import com.eventflow.notificationservice.model.Notification;
import com.eventflow.notificationservice.service.NotificationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
  private final NotificationService notificationService;

  public NotificationController(NotificationService notificationService) {
    this.notificationService = notificationService;
  }

  @GetMapping
  public List<NotificationResponse> list() {
    return notificationService.list().stream().map(this::toResponse).toList();
  }

  @PostMapping
  public ResponseEntity<NotificationResponse> create(@Valid @RequestBody NotificationCreateRequest request) {
    return ResponseEntity.ok(toResponse(notificationService.create(request)));
  }

  // In-app notification endpoints
  @PostMapping("/in-app")
  public ResponseEntity<NotificationResponse> createInApp(@RequestBody InAppNotificationRequest request) {
    return ResponseEntity.ok(toResponse(notificationService.createInAppNotification(request)));
  }

  @GetMapping("/user/{userId}")
  public List<NotificationResponse> getUserNotifications(@PathVariable UUID userId) {
    return notificationService.getUserNotifications(userId).stream().map(this::toResponse).toList();
  }

  @PatchMapping("/{id}/read")
  public ResponseEntity<NotificationResponse> markAsRead(@PathVariable UUID id) {
    return ResponseEntity.ok(toResponse(notificationService.markAsRead(id)));
  }

  @PatchMapping("/user/{userId}/read-all")
  public ResponseEntity<Void> markAllAsRead(@PathVariable UUID userId) {
    notificationService.markAllAsRead(userId);
    return ResponseEntity.ok().build();
  }

  @GetMapping("/user/{userId}/unread-count")
  public ResponseEntity<Long> getUnreadCount(@PathVariable UUID userId) {
    return ResponseEntity.ok(notificationService.getUnreadCount(userId));
  }

  @ExceptionHandler(IllegalArgumentException.class)
  public ResponseEntity<String> handleBadRequest(IllegalArgumentException ex) {
    return ResponseEntity.badRequest().body(ex.getMessage());
  }

  private NotificationResponse toResponse(Notification notification) {
    return new NotificationResponse(
            notification.getId(),
            notification.getChannel(),
            notification.getRecipient(),
            notification.getSubject(),
            notification.getMessage(),
            notification.getStatus(),
            notification.getCreatedAt(),
            notification.getUserId(),
            notification.getNotificationType(),
            notification.getIsRead(),
            notification.getActionUrl()
    );
  }
}

