package com.eventflow.eventservice.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public class EventResponse {
  private UUID id;
  private String title;
  private String category;
  private LocalDate date;
  private LocalTime time;
  private String location;
  private BigDecimal price;
  private String status;
  private String description;
  private String imageUrl;
  private UUID organizerId;

  public EventResponse(UUID id, String title, String category, LocalDate date, LocalTime time,
                       String location, BigDecimal price, String status, String description, String imageUrl, UUID organizerId) {
    this.id = id;
    this.title = title;
    this.category = category;
    this.date = date;
    this.time = time;
    this.location = location;
    this.price = price;
    this.status = status;
    this.description = description;
    this.imageUrl = imageUrl;
    this.organizerId = organizerId;
  }

  public UUID getId() {
    return id;
  }

  public String getTitle() {
    return title;
  }

  public String getCategory() {
    return category;
  }

  public LocalDate getDate() {
    return date;
  }

  public LocalTime getTime() {
    return time;
  }

  public String getLocation() {
    return location;
  }

  public BigDecimal getPrice() {
    return price;
  }

  public String getStatus() {
    return status;
  }

  public String getDescription() {
    return description;
  }

  public String getImageUrl() {
    return imageUrl;
  }

  public UUID getOrganizerId() {
    return organizerId;
  }
}

