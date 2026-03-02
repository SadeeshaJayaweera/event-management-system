package com.eventflow.analyticsservice.service;

import com.eventflow.analyticsservice.dto.CategoryCount;
import com.eventflow.analyticsservice.dto.EventDTO;
import com.eventflow.analyticsservice.dto.OverviewResponse;
import com.eventflow.analyticsservice.dto.RevenuePoint;
import com.eventflow.analyticsservice.dto.TicketDTO;
import com.eventflow.analyticsservice.model.AnalyticsSnapshot;
import com.eventflow.analyticsservice.repository.AnalyticsSnapshotRepository;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

  private final RestTemplate restTemplate;
  private final AnalyticsSnapshotRepository snapshotRepository;

  private static final String EVENT_SERVICE_URL = "http://event-service/api/events";
  private static final String TICKET_SERVICE_URL = "http://ticket-service/api/tickets";

  public AnalyticsService(RestTemplate restTemplate, AnalyticsSnapshotRepository snapshotRepository) {
    this.restTemplate = restTemplate;
    this.snapshotRepository = snapshotRepository;
  }

  public OverviewResponse getOverview(UUID organizerId) {
    List<EventDTO> events = fetchEvents();
    
    // Filter by organizerId if provided
    if (organizerId != null) {
      String organizerIdStr = organizerId.toString();
      events = events.stream()
          .filter(e -> organizerIdStr.equals(e.getOrganizerId()))
          .toList();
    }
    
    // Get event IDs to filter tickets
    List<String> eventIds = events.stream()
        .map(EventDTO::getId)
        .filter(Objects::nonNull)
        .toList();
    
    List<TicketDTO> tickets = fetchTickets();
    
    // Filter tickets to only those for the filtered events
    if (organizerId != null && !eventIds.isEmpty()) {
      tickets = tickets.stream()
          .filter(t -> eventIds.contains(t.getEventId()))
          .toList();
    }
    
    int totalMembers = countUniqueUsers(tickets);
    int totalEvents = events.size();
    int totalTicketsSold = tickets.size();

    BigDecimal totalRevenue = tickets.stream()
        .map(TicketDTO::getPrice)
        .filter(Objects::nonNull)
        .reduce(BigDecimal.ZERO, BigDecimal::add);

    BigDecimal avgPrice = totalTicketsSold > 0
        ? totalRevenue.divide(BigDecimal.valueOf(totalTicketsSold), 2, RoundingMode.HALF_UP)
        : BigDecimal.ZERO;

    return new OverviewResponse(
        "$" + formatDecimal(totalRevenue),
        String.valueOf(totalMembers),
        String.valueOf(totalEvents),
        "$" + avgPrice.setScale(2, RoundingMode.HALF_UP)
    );
  }

  public List<RevenuePoint> getMonthlyRevenue(UUID organizerId) {
    List<EventDTO> events = fetchEvents();
    
    // Filter by organizerId if provided
    if (organizerId != null) {
      String organizerIdStr = organizerId.toString();
      events = events.stream()
          .filter(e -> organizerIdStr.equals(e.getOrganizerId()))
          .toList();
    }
    
    // Get event IDs to filter tickets
    List<String> eventIds = events.stream()
        .map(EventDTO::getId)
        .filter(Objects::nonNull)
        .toList();
    
    List<TicketDTO> tickets = fetchTickets();
    
    // Filter tickets to only those for the filtered events
    if (organizerId != null && !eventIds.isEmpty()) {
      tickets = tickets.stream()
          .filter(t -> eventIds.contains(t.getEventId()))
          .toList();
    }

    Map<Month, BigDecimal> revenueByMonth = new LinkedHashMap<>();
    for (Month month : Month.values()) {
      revenueByMonth.put(month, BigDecimal.ZERO);
    }

    for (TicketDTO ticket : tickets) {
      if (ticket.getPurchasedAt() != null && ticket.getPrice() != null) {
        try {
          LocalDateTime purchasedAt = LocalDateTime.parse(ticket.getPurchasedAt());
          Month month = purchasedAt.getMonth();
          revenueByMonth.merge(month, ticket.getPrice(), BigDecimal::add);
        } catch (Exception e) {
          // Skip tickets with unparseable dates
        }
      }
    }

    List<RevenuePoint> result = new ArrayList<>();
    for (Month month : Month.values()) {
      BigDecimal rev = revenueByMonth.get(month);
      if (rev.compareTo(BigDecimal.ZERO) > 0) {
        result.add(new RevenuePoint(
            month.getDisplayName(TextStyle.SHORT, Locale.ENGLISH),
            rev.doubleValue()
        ));
      }
    }

    return result;
  }

  public List<CategoryCount> getEventsByCategory(UUID organizerId) {
    List<EventDTO> events = fetchEvents();
    
    // Filter by organizerId if provided
    if (organizerId != null) {
      String organizerIdStr = organizerId.toString();
      events = events.stream()
          .filter(e -> organizerIdStr.equals(e.getOrganizerId()))
          .toList();
    }

    Map<String, Long> categoryMap = events.stream()
        .filter(e -> e.getCategory() != null)
        .collect(Collectors.groupingBy(EventDTO::getCategory, Collectors.counting()));

    return categoryMap.entrySet().stream()
        .map(entry -> new CategoryCount(entry.getKey(), entry.getValue().intValue()))
        .sorted((a, b) -> b.getCount() - a.getCount())
        .toList();
  }

  public AnalyticsSnapshot saveSnapshot() {
    List<EventDTO> events = fetchEvents();
    List<TicketDTO> tickets = fetchTickets();
    int totalMembers = countUniqueUsers(tickets);

    BigDecimal totalRevenue = tickets.stream()
        .map(TicketDTO::getPrice)
        .filter(Objects::nonNull)
        .reduce(BigDecimal.ZERO, BigDecimal::add);

    BigDecimal avgPrice = !tickets.isEmpty()
        ? totalRevenue.divide(BigDecimal.valueOf(tickets.size()), 2, RoundingMode.HALF_UP)
        : BigDecimal.ZERO;

    AnalyticsSnapshot snapshot = new AnalyticsSnapshot();
    snapshot.setTotalEvents(events.size());
    snapshot.setTotalAttendees(totalMembers);
    snapshot.setTotalRevenue(totalRevenue);
    snapshot.setTotalTicketsSold(tickets.size());
    snapshot.setAvgTicketPrice(avgPrice);
    snapshot.setSnapshotDate(LocalDateTime.now());

    return snapshotRepository.save(snapshot);
  }

  public List<AnalyticsSnapshot> getSnapshots() {
    return snapshotRepository.findAll();
  }

  // --- Inter-service communication methods ---

  private List<EventDTO> fetchEvents() {
    try {
      ResponseEntity<List<EventDTO>> response = restTemplate.exchange(
          EVENT_SERVICE_URL,
          HttpMethod.GET,
          null,
          new ParameterizedTypeReference<List<EventDTO>>() {}
      );
      return response.getBody() != null ? response.getBody() : Collections.emptyList();
    } catch (Exception e) {
      return Collections.emptyList();
    }
  }

  private List<TicketDTO> fetchTickets() {
    try {
      ResponseEntity<List<TicketDTO>> response = restTemplate.exchange(
          TICKET_SERVICE_URL,
          HttpMethod.GET,
          null,
          new ParameterizedTypeReference<List<TicketDTO>>() {}
      );
      return response.getBody() != null ? response.getBody() : Collections.emptyList();
    } catch (Exception e) {
      return Collections.emptyList();
    }
  }

  private int countUniqueUsers(List<TicketDTO> tickets) {
    return (int) tickets.stream()
        .map(TicketDTO::getUserId)
        .filter(Objects::nonNull)
        .distinct()
        .count();
  }

  private String formatDecimal(BigDecimal value) {
    if (value.compareTo(BigDecimal.valueOf(1000)) >= 0) {
      return String.format("%,.2f", value.doubleValue());
    }
    return value.setScale(2, RoundingMode.HALF_UP).toString();
  }
}
