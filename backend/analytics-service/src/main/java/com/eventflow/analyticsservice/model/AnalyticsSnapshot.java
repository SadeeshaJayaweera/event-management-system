package com.eventflow.analyticsservice.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "analytics_snapshots")
public class AnalyticsSnapshot {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private int totalEvents;

  @Column(nullable = false)
  private int totalAttendees;

  @Column(nullable = false, precision = 12, scale = 2)
  private BigDecimal totalRevenue;

  @Column(nullable = false)
  private int totalTicketsSold;

  @Column(nullable = false, precision = 10, scale = 2)
  private BigDecimal avgTicketPrice;

  @Column(nullable = false)
  private LocalDateTime snapshotDate;

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public int getTotalEvents() {
    return totalEvents;
  }

  public void setTotalEvents(int totalEvents) {
    this.totalEvents = totalEvents;
  }

  public int getTotalAttendees() {
    return totalAttendees;
  }

  public void setTotalAttendees(int totalAttendees) {
    this.totalAttendees = totalAttendees;
  }

  public BigDecimal getTotalRevenue() {
    return totalRevenue;
  }

  public void setTotalRevenue(BigDecimal totalRevenue) {
    this.totalRevenue = totalRevenue;
  }

  public int getTotalTicketsSold() {
    return totalTicketsSold;
  }

  public void setTotalTicketsSold(int totalTicketsSold) {
    this.totalTicketsSold = totalTicketsSold;
  }

  public BigDecimal getAvgTicketPrice() {
    return avgTicketPrice;
  }

  public void setAvgTicketPrice(BigDecimal avgTicketPrice) {
    this.avgTicketPrice = avgTicketPrice;
  }

  public LocalDateTime getSnapshotDate() {
    return snapshotDate;
  }

  public void setSnapshotDate(LocalDateTime snapshotDate) {
    this.snapshotDate = snapshotDate;
  }
}
