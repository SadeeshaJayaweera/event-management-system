package com.eventflow.ticketservice.service;

import com.eventflow.ticketservice.client.EventServiceClient;
import com.eventflow.ticketservice.client.NotificationServiceClient;
import com.eventflow.ticketservice.dto.TicketPurchaseRequest;
import com.eventflow.ticketservice.dto.TicketStatusUpdateRequest;
import com.eventflow.ticketservice.model.Ticket;
import com.eventflow.ticketservice.repository.TicketRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class TicketService {
  private final TicketRepository ticketRepository;
  private final NotificationServiceClient notificationClient;
  private final EventServiceClient eventServiceClient;

  public TicketService(TicketRepository ticketRepository,
                      NotificationServiceClient notificationClient,
                      EventServiceClient eventServiceClient) {
    this.ticketRepository = ticketRepository;
    this.notificationClient = notificationClient;
    this.eventServiceClient = eventServiceClient;
  }

  public List<Ticket> purchase(TicketPurchaseRequest request) {
    // Get event details to check capacity — if event-service unreachable, continue
    // with soft validation
    Map<String, Object> event = eventServiceClient.getEvent(request.getEventId());

    if (event != null) {
      Integer maxTickets = event.get("maxTickets") != null
          ? Integer.valueOf(event.get("maxTickets").toString())
          : null;

      if (maxTickets != null) {
        long existingTicketCount = ticketRepository.findByEventId(request.getEventId()).size();
        long remainingTickets = maxTickets - existingTicketCount;
        if (remainingTickets < request.getQuantity()) {
          throw new IllegalArgumentException("Only " + remainingTickets + " ticket(s) remaining.");
        }
      }
    } else {
      System.err.println("Warning: Could not reach event-service to validate capacity. Proceeding with purchase.");
    }
    // Check if user already has 3 or more tickets for this event
    long userExistingTickets = ticketRepository.findByEventIdAndUserId(request.getEventId(), request.getUserId()).size();
    if (userExistingTickets >= 3) {
      throw new IllegalArgumentException("You have already purchased the maximum of 3 tickets for this event");
    }
    
    // Check if user's total tickets (existing + new) would exceed 3
    if (userExistingTickets + request.getQuantity() > 3) {
      throw new IllegalArgumentException("You can only purchase " + (3 - userExistingTickets) + " more ticket(s) for this event");
    }

    // Check if enough tickets are available
    // (already validated above when event != null)

    // Create multiple tickets based on quantity
    List<Ticket> createdTickets = new java.util.ArrayList<>();
    for (int i = 0; i < request.getQuantity(); i++) {
      Ticket ticket = new Ticket();
      ticket.setEventId(request.getEventId());
      ticket.setUserId(request.getUserId());
      ticket.setPrice(request.getPrice());
      ticket.setStatus("Confirmed");
      ticket.setPurchasedAt(LocalDateTime.now());
      createdTickets.add(ticketRepository.save(ticket));
    }

    // Send notifications
    try {
      String eventTitle = event != null ? (String) event.get("title") : "your event";

      // Notify attendee (buyer)
      String ticketText = request.getQuantity() == 1 ? "ticket" : "tickets";
      notificationClient.sendInAppNotification(
        request.getUserId(),
        "TICKET_CONFIRMATION",
        "Your " + request.getQuantity() + " " + ticketText + " for " + eventTitle + " has been confirmed",
        "/attendee/tickets"
      );

      // Notify organizer
      if (event != null) {
        Object organizerIdObj = event.get("organizerId");
        if (organizerIdObj != null) {
          UUID organizerId = UUID.fromString(organizerIdObj.toString());
          notificationClient.sendInAppNotification(
            organizerId,
            "TICKET_SOLD",
            request.getQuantity() + " " + ticketText + " purchased for " + eventTitle,
            "/dashboard/events/" + request.getEventId()
          );
        }
      }
    } catch (Exception e) {
      System.err.println("Failed to send ticket purchase notifications: " + e.getMessage());
    }

    return createdTickets;
  }

  public Ticket get(UUID id) {
    return ticketRepository.findById(id)
      .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));
  }

  public List<Ticket> list(UUID eventId, UUID userId) {
    if (eventId != null) {
      return ticketRepository.findByEventId(eventId);
    }
    if (userId != null) {
      return ticketRepository.findByUserId(userId);
    }
    return ticketRepository.findAll();
  }

  public Ticket updateStatus(UUID id, TicketStatusUpdateRequest request) {
    Ticket ticket = get(id);
    ticket.setStatus(request.getStatus());
    return ticketRepository.save(ticket);
  }

  public long count() {
    return ticketRepository.count();
  }
}

