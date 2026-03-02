package com.eventflow.adminservice.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public class EventSummary {
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

  public EventSummary() {
  }

  public EventSummary(UUID id, String title, String category, LocalDate date, LocalTime time,
                      String location, BigDecimal price, String status, String description, String imageUrl) {
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
  }

  public UUID getId() {
    return id;
  }

  public void setId(UUID id) {
    this.id = id;
  }

  public String getTitle() {
    return title;
  }

  public void setTitle(String title) {
    this.title = title;
  }

  public String getCategory() {
    return category;
  }

  public void setCategory(String category) {
    this.category = category;
  }

  public LocalDate getDate() {
    return date;
  }

  public void setDate(LocalDate date) {
    this.date = date;
  }

  public LocalTime getTime() {
    return time;
  }

  public void setTime(LocalTime time) {
    this.time = time;
  }

  public String getLocation() {
    return location;
  }

  public void setLocation(String location) {
    this.location = location;
  }

  public BigDecimal getPrice() {
    return price;
  }

  public void setPrice(BigDecimal price) {
    this.price = price;
  }

  public String getStatus() {
    return status;
  }

  public void setStatus(String status) {
    this.status = status;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public String getImageUrl() {
    return imageUrl;
  }

  public void setImageUrl(String imageUrl) {
    this.imageUrl = imageUrl;
  }

  public UUID getOrganizerId() {
    return organizerId;
  }

  public void setOrganizerId(UUID organizerId) {
    this.organizerId = organizerId;
  }
}
