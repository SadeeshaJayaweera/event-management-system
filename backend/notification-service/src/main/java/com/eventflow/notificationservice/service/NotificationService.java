package com.eventflow.notificationservice.service;

import com.eventflow.notificationservice.dto.NotificationCreateRequest;
import com.eventflow.notificationservice.model.Notification;
import com.eventflow.notificationservice.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

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
    notification.setStatus("QUEUED");
    notification.setCreatedAt(LocalDateTime.now());

    notification = notificationRepository.save(notification);

    // 2️⃣ Try to send email
    try {
      if ("EMAIL".equalsIgnoreCase(notification.getChannel())) {
        emailService.sendEmail(
                notification.getRecipient(),
                notification.getSubject(),
                notification.getMessage()
        );
        notification.setStatus("SENT");
      }
    } catch (Exception e) {
      notification.setStatus("FAILED");
    }

    // 3️⃣ Update final status
    return notificationRepository.save(notification);
  }
}

