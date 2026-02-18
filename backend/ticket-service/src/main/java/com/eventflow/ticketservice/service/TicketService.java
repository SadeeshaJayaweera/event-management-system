package com.eventflow.ticketservice.service;

import com.eventflow.ticketservice.dto.TicketPurchaseRequest;
import com.eventflow.ticketservice.dto.TicketStatusUpdateRequest;
import com.eventflow.ticketservice.model.Ticket;
import com.eventflow.ticketservice.repository.TicketRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class TicketService {
  private final TicketRepository ticketRepository;

  public TicketService(TicketRepository ticketRepository) {
    this.ticketRepository = ticketRepository;
  }

  public Ticket purchase(TicketPurchaseRequest request) {
    Ticket ticket = new Ticket();
    ticket.setEventId(request.getEventId());
    ticket.setAttendeeId(request.getAttendeeId());
    ticket.setPrice(request.getPrice());
    ticket.setStatus("Confirmed");
    ticket.setPurchasedAt(LocalDateTime.now());

    return ticketRepository.save(ticket);
  }

  public Ticket get(UUID id) {
    return ticketRepository.findById(id)
      .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));
  }

  public List<Ticket> list(UUID eventId, UUID attendeeId) {
    if (eventId != null) {
      return ticketRepository.findByEventId(eventId);
    }
    if (attendeeId != null) {
      return ticketRepository.findByAttendeeId(attendeeId);
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

