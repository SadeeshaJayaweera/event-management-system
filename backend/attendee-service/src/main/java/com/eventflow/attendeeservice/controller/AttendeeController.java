package com.eventflow.attendeeservice.controller;

import com.eventflow.attendeeservice.dto.AttendeeCreateRequest;
import com.eventflow.attendeeservice.dto.AttendeeResponse;
import com.eventflow.attendeeservice.dto.AttendeeStatusUpdateRequest;
import com.eventflow.attendeeservice.model.Attendee;
import com.eventflow.attendeeservice.service.AttendeeService;
import jakarta.validation.Valid;
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
@RequestMapping("/api/attendees")
public class AttendeeController {
  private final AttendeeService attendeeService;

  public AttendeeController(AttendeeService attendeeService) {
    this.attendeeService = attendeeService;
  }

  @GetMapping
  public List<AttendeeResponse> list(@RequestParam(required = false) UUID eventId) {
    return attendeeService.list(eventId).stream().map(this::toResponse).toList();
  }

  @GetMapping("/count")
  public ResponseEntity<Long> count() {
    return ResponseEntity.ok(attendeeService.count());
  }

  @GetMapping("/{id}")
  public AttendeeResponse get(@PathVariable UUID id) {
    return toResponse(attendeeService.get(id));
  }

  @PostMapping
  public ResponseEntity<AttendeeResponse> create(@Valid @RequestBody AttendeeCreateRequest request) {
    return ResponseEntity.ok(toResponse(attendeeService.create(request)));
  }

  @PatchMapping("/{id}/status")
  public ResponseEntity<AttendeeResponse> updateStatus(@PathVariable UUID id,
                                                       @Valid @RequestBody AttendeeStatusUpdateRequest request) {
    return ResponseEntity.ok(toResponse(attendeeService.updateStatus(id, request)));
  }

  @ExceptionHandler(IllegalArgumentException.class)
  public ResponseEntity<String> handleBadRequest(IllegalArgumentException ex) {
    return ResponseEntity.badRequest().body(ex.getMessage());
  }

  private AttendeeResponse toResponse(Attendee attendee) {
    return new AttendeeResponse(
      attendee.getId(),
      attendee.getEventId(),
      attendee.getName(),
      attendee.getEmail(),
      attendee.getStatus(),
      attendee.getRegisteredAt()
    );
  }
}

