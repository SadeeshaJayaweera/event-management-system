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

  public Ticket purchase(TicketPurchaseRequest request) {
    Ticket ticket = new Ticket();
    ticket.setEventId(request.getEventId());
    ticket.setUserId(request.getUserId());
    ticket.setPrice(request.getPrice());
    ticket.setStatus("Confirmed");
    ticket.setPurchasedAt(LocalDateTime.now());

    Ticket savedTicket = ticketRepository.save(ticket);

    // Send notifications
    try {
      // Get event details
      Map<String, Object> event = eventServiceClient.getEvent(savedTicket.getEventId());
      
      if (event != null) {
        String eventTitle = (String) event.get("title");
        
        // Notify attendee (buyer)
        notificationClient.sendInAppNotification(
          savedTicket.getUserId(),
          "TICKET_CONFIRMATION",
          "Your ticket for " + eventTitle + " has been confirmed",
          "/attendee/tickets"
        );

        // Notify organizer
        Object organizerIdObj = event.get("organizerId");
        if (organizerIdObj != null) {
          UUID organizerId = UUID.fromString(organizerIdObj.toString());
          notificationClient.sendInAppNotification(
            organizerId,
            "TICKET_SOLD",
            "New ticket purchased for " + eventTitle,
            "/dashboard/events/" + savedTicket.getEventId()
          );
        }
      }
    } catch (Exception e) {
      System.err.println("Failed to send ticket purchase notifications: " + e.getMessage());
    }

    return savedTicket;
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

