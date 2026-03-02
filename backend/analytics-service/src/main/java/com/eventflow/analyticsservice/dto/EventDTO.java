package com.eventflow.analyticsservice.dto;

import java.math.BigDecimal;

public class EventDTO {

  private String id;
  private String title;
  private String category;
  private String date;
  private String time;
  private String location;
  private BigDecimal price;
  private String status;
  private String organizerId;

  public EventDTO() {
  }

  public String getId() {
    return id;
  }

  public void setId(String id) {
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

  public String getDate() {
    return date;
  }

  public void setDate(String date) {
    this.date = date;
  }

  public String getTime() {
    return time;
  }

  public void setTime(String time) {
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

  public String getOrganizerId() {
    return organizerId;
  }

  public void setOrganizerId(String organizerId) {
    this.organizerId = organizerId;
  }
}
