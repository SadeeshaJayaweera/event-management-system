package com.eventflow.adminservice.dto;

public class DashboardStats {
  private long totalEvents;
  private long upcomingEvents;
  private long completedEvents;
  private long totalUsers;
  private long totalAttendees;
  private long totalTicketsSold;

  public DashboardStats() {
  }

  public DashboardStats(long totalEvents, long upcomingEvents, long completedEvents,
                        long totalUsers, long totalAttendees, long totalTicketsSold) {
    this.totalEvents = totalEvents;
    this.upcomingEvents = upcomingEvents;
    this.completedEvents = completedEvents;
    this.totalUsers = totalUsers;
    this.totalAttendees = totalAttendees;
    this.totalTicketsSold = totalTicketsSold;
  }

  public long getTotalEvents() {
    return totalEvents;
  }

  public void setTotalEvents(long totalEvents) {
    this.totalEvents = totalEvents;
  }

  public long getUpcomingEvents() {
    return upcomingEvents;
  }

  public void setUpcomingEvents(long upcomingEvents) {
    this.upcomingEvents = upcomingEvents;
  }

  public long getCompletedEvents() {
    return completedEvents;
  }

  public void setCompletedEvents(long completedEvents) {
    this.completedEvents = completedEvents;
  }

  public long getTotalUsers() {
    return totalUsers;
  }

  public void setTotalUsers(long totalUsers) {
    this.totalUsers = totalUsers;
  }

  public long getTotalAttendees() {
    return totalAttendees;
  }

  public void setTotalAttendees(long totalAttendees) {
    this.totalAttendees = totalAttendees;
  }

  public long getTotalTicketsSold() {
    return totalTicketsSold;
  }

  public void setTotalTicketsSold(long totalTicketsSold) {
    this.totalTicketsSold = totalTicketsSold;
  }
}
