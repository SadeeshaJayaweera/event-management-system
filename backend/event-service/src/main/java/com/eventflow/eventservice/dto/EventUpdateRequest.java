package com.eventflow.eventservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

public class EventUpdateRequest {
  @NotBlank
  private String title;

  @NotBlank
  private String category;

  @NotNull
  private LocalDate date;

  @NotNull
  private LocalTime time;

  @NotBlank
  private String location;

  private BigDecimal price;

  @NotNull
  @Min(value = 1, message = "Max tickets must be at least 1")
  private Integer maxTickets;

  @NotBlank
  private String status;

  @NotBlank
  private String description;

  private String imageUrl;

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

  public Integer getMaxTickets() {
    return maxTickets;
  }

  public void setMaxTickets(Integer maxTickets) {
    this.maxTickets = maxTickets;
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
}
