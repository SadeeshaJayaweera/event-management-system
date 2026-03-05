package com.eventflow.attendeeservice.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class AttendeeResponse {
  private UUID id;
  private UUID eventId;
  private String name;
  private String email;
  private String status;
  private LocalDateTime registeredAt;

  public AttendeeResponse(UUID id, UUID eventId, String name, String email, String status, LocalDateTime registeredAt) {
    this.id = id;
    this.eventId = eventId;
    this.name = name;
    this.email = email;
    this.status = status;
    this.registeredAt = registeredAt;
  }

  public UUID getId() {
    return id;
  }

  public UUID getEventId() {
    return eventId;
  }

  public String getName() {
    return name;
  }

  public String getEmail() {
    return email;
  }

  public String getStatus() {
    return status;
  }

  public LocalDateTime getRegisteredAt() {
    return registeredAt;
  }
}

