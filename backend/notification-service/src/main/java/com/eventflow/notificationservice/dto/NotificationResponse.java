package com.eventflow.notificationservice.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class NotificationResponse {
  private UUID id;
  private String channel;
  private String recipient;
  private String subject;
  private String message;
  private String status;
  private LocalDateTime createdAt;
  private UUID userId;
  private String notificationType;
  private Boolean isRead;
  private String actionUrl;

  public NotificationResponse(UUID id, String channel, String recipient, String subject,
                              String message, String status, LocalDateTime createdAt) {
    this.id = id;
    this.channel = channel;
    this.recipient = recipient;
    this.subject = subject;
    this.message = message;
    this.status = status;
    this.createdAt = createdAt;
  }

  public NotificationResponse(UUID id, String channel, String recipient, String subject,
                              String message, String status, LocalDateTime createdAt,
                              UUID userId, String notificationType, Boolean isRead, String actionUrl) {
    this.id = id;
    this.channel = channel;
    this.recipient = recipient;
    this.subject = subject;
    this.message = message;
    this.status = status;
    this.createdAt = createdAt;
    this.userId = userId;
    this.notificationType = notificationType;
    this.isRead = isRead;
    this.actionUrl = actionUrl;
  }

  public UUID getId() {
    return id;
  }

  public String getChannel() {
    return channel;
  }

  public String getRecipient() {
    return recipient;
  }

  public String getSubject() {
    return subject;
  }

  public String getMessage() {
    return message;
  }

  public String getStatus() {
    return status;
  }

  public LocalDateTime getCreatedAt() {
    return createdAt;
  }

  public UUID getUserId() {
    return userId;
  }

  public void setUserId(UUID userId) {
    this.userId = userId;
  }

  public String getNotificationType() {
    return notificationType;
  }

  public void setNotificationType(String notificationType) {
    this.notificationType = notificationType;
  }

  public Boolean getIsRead() {
    return isRead;
  }

  public void setIsRead(Boolean isRead) {
    this.isRead = isRead;
  }

  public String getActionUrl() {
    return actionUrl;
  }

  public void setActionUrl(String actionUrl) {
    this.actionUrl = actionUrl;
  }
}

