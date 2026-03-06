package com.eventflow.notificationservice.service;

import com.eventflow.notificationservice.dto.InAppNotificationRequest;
import com.eventflow.notificationservice.dto.NotificationCreateRequest;
import com.eventflow.notificationservice.model.Notification;
import com.eventflow.notificationservice.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class NotificationService {

  private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

  private final NotificationRepository notificationRepository;
  private final EmailService emailService;

  public NotificationService(NotificationRepository notificationRepository,
                             EmailService emailService) {
    this.notificationRepository = notificationRepository;
    this.emailService = emailService;
  }

  public List<Notification> list() {
    return notificationRepository.findAll();
  }

  public Notification create(NotificationCreateRequest request) {

    // 1️⃣ Create and save notification
    Notification notification = new Notification();
    notification.setChannel(request.getChannel());
    notification.setRecipient(request.getRecipient());
    notification.setSubject(request.getSubject());
    notification.setMessage(request.getMessage());
    notification.setStatus("SENT"); // Always mark as sent for demo
    notification.setCreatedAt(LocalDateTime.now());

    notification = notificationRepository.save(notification);

    // 2️⃣ For demo: Skip actual email sending, just log it
    if ("EMAIL".equalsIgnoreCase(notification.getChannel())) {
      log.info("DEMO MODE: Email notification created (not sent) - To: {}, Subject: {}", 
               notification.getRecipient(), notification.getSubject());
    }

    return notification;
  }

  // In-app notification methods
  public Notification createInAppNotification(InAppNotificationRequest request) {
    Notification notification = new Notification();
    notification.setChannel("IN_APP");
    notification.setRecipient(request.getUserId().toString());
    notification.setSubject("In-App Notification");
    notification.setMessage(request.getMessage());
    notification.setStatus("SENT");
    notification.setCreatedAt(LocalDateTime.now());
    notification.setUserId(request.getUserId());
    notification.setNotificationType(request.getNotificationType());
    notification.setIsRead(false);
    notification.setActionUrl(request.getActionUrl());

    return notificationRepository.save(notification);
  }

  public List<Notification> getUserNotifications(UUID userId) {
    return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
  }

  public Notification markAsRead(UUID notificationId) {
    Notification notification = notificationRepository.findById(notificationId)
      .orElseThrow(() -> new IllegalArgumentException("Notification not found"));
    notification.setIsRead(true);
    return notificationRepository.save(notification);
  }

  public void markAllAsRead(UUID userId) {
    List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    notifications.forEach(n -> n.setIsRead(true));
    notificationRepository.saveAll(notifications);
  }

  public long getUnreadCount(UUID userId) {
    return notificationRepository.countByUserIdAndIsRead(userId, false);
  }
}

