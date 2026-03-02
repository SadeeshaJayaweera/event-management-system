package com.eventflow.ticketservice.controller;

import com.eventflow.ticketservice.dto.TicketPurchaseRequest;
import com.eventflow.ticketservice.dto.TicketResponse;
import com.eventflow.ticketservice.dto.TicketStatusUpdateRequest;
import com.eventflow.ticketservice.model.Ticket;
import com.eventflow.ticketservice.service.TicketPdfService;
import com.eventflow.ticketservice.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {
  private final TicketService ticketService;
  private final TicketPdfService ticketPdfService;

  public TicketController(TicketService ticketService, TicketPdfService ticketPdfService) {
    this.ticketService = ticketService;
    this.ticketPdfService = ticketPdfService;
  }

  @PostMapping
  public ResponseEntity<TicketResponse> purchase(@Valid @RequestBody TicketPurchaseRequest request) {
    return ResponseEntity.ok(toResponse(ticketService.purchase(request)));
  }

  @GetMapping("/{id}")
  public TicketResponse get(@PathVariable UUID id) {
    return toResponse(ticketService.get(id));
  }

  @GetMapping
  public List<TicketResponse> list(@RequestParam(required = false) UUID eventId,
                                   @RequestParam(required = false) UUID userId) {
    return ticketService.list(eventId, userId).stream().map(this::toResponse).toList();
  }

  @GetMapping("/count")
  public ResponseEntity<Long> count() {
    return ResponseEntity.ok(ticketService.count());
  }

  @PatchMapping("/{id}/status")
  public ResponseEntity<TicketResponse> updateStatus(@PathVariable UUID id,
                                                     @Valid @RequestBody TicketStatusUpdateRequest request) {
    return ResponseEntity.ok(toResponse(ticketService.updateStatus(id, request)));
  }

  /**
   * Downloads a PDF ticket with an embedded QR code for the given booking.
   * GET /api/tickets/{id}/download
   */
  @GetMapping("/{id}/download")
  public ResponseEntity<byte[]> download(@PathVariable UUID id) {
    byte[] pdfBytes = ticketPdfService.generateTicketPdf(id);
    String filename = "ticket-" + id + ".pdf";
    return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
        .contentType(MediaType.APPLICATION_PDF)
        .contentLength(pdfBytes.length)
        .body(pdfBytes);
  }

  @ExceptionHandler(IllegalArgumentException.class)
  public ResponseEntity<String> handleBadRequest(IllegalArgumentException ex) {
    return ResponseEntity.badRequest().body(ex.getMessage());
  }

  private TicketResponse toResponse(Ticket ticket) {
    return new TicketResponse(
      ticket.getId(),
      ticket.getEventId(),
      ticket.getUserId(),
      ticket.getPrice(),
      ticket.getStatus(),
      ticket.getPurchasedAt()
    );
  }
}

