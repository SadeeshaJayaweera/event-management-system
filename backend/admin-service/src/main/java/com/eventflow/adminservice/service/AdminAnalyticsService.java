package com.eventflow.adminservice.service;

import com.eventflow.adminservice.client.AttendeeServiceClient;
import com.eventflow.adminservice.client.AuthServiceClient;
import com.eventflow.adminservice.client.EventServiceClient;
import com.eventflow.adminservice.client.TicketServiceClient;
import com.eventflow.adminservice.dto.DashboardStats;
import com.eventflow.adminservice.dto.EventSummary;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminAnalyticsService {
  private final EventServiceClient eventServiceClient;
  private final AuthServiceClient authServiceClient;
  private final AttendeeServiceClient attendeeServiceClient;
  private final TicketServiceClient ticketServiceClient;

  public AdminAnalyticsService(EventServiceClient eventServiceClient,
                                AuthServiceClient authServiceClient,
                                AttendeeServiceClient attendeeServiceClient,
                                TicketServiceClient ticketServiceClient) {
    this.eventServiceClient = eventServiceClient;
    this.authServiceClient = authServiceClient;
    this.attendeeServiceClient = attendeeServiceClient;
    this.ticketServiceClient = ticketServiceClient;
  }

  public DashboardStats getDashboardStats() {
    try {
      List<EventSummary> events = eventServiceClient.getAllEvents();
      long totalEvents = events.size();
      long upcomingEvents = events.stream()
          .filter(e -> "Upcoming".equals(e.getStatus()))
          .count();
      long completedEvents = events.stream()
          .filter(e -> "Completed".equals(e.getStatus()))
          .count();

      long totalUsers = authServiceClient.getAllUsers().size();
      long totalAttendees = attendeeServiceClient.getAttendeeCount();
      long totalTicketsSold = ticketServiceClient.getTicketCount();

      return new DashboardStats(
          totalEvents,
          upcomingEvents,
          completedEvents,
          totalUsers,
          totalAttendees,
          totalTicketsSold
      );
    } catch (Exception e) {
      // Return default stats if any service is unavailable
      return new DashboardStats(0, 0, 0, 0, 0, 0);
    }
  }
}
