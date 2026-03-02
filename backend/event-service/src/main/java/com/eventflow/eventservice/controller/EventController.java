package com.eventflow.eventservice.controller;

import com.eventflow.eventservice.dto.EventCreateRequest;
import com.eventflow.eventservice.dto.EventResponse;
import com.eventflow.eventservice.dto.EventUpdateRequest;
import com.eventflow.eventservice.model.Event;
import com.eventflow.eventservice.service.EventService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/events")
public class EventController {
  private final EventService eventService;

  public EventController(EventService eventService) {
    this.eventService = eventService;
  }

  @GetMapping
  public List<EventResponse> list(@RequestParam(required = false) UUID organizerId) {
    if (organizerId != null) {
      return eventService.listByOrganizer(organizerId).stream().map(this::toResponse).toList();
    }
    return eventService.list().stream().map(this::toResponse).toList();
  }

  @GetMapping("/{id}")
  public EventResponse get(@PathVariable UUID id) {
    return toResponse(eventService.get(id));
  }

  @PostMapping
  public ResponseEntity<EventResponse> create(@Valid @RequestBody EventCreateRequest request) {
    return ResponseEntity.ok(toResponse(eventService.create(request)));
  }

  @PutMapping("/{id}")
  public ResponseEntity<EventResponse> update(@PathVariable UUID id, @Valid @RequestBody EventUpdateRequest request) {
    return ResponseEntity.ok(toResponse(eventService.update(id, request)));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable UUID id) {
    eventService.delete(id);
    return ResponseEntity.noContent().build();
  }

  @ExceptionHandler(IllegalArgumentException.class)
  public ResponseEntity<String> handleBadRequest(IllegalArgumentException ex) {
    return ResponseEntity.badRequest().body(ex.getMessage());
  }

  private EventResponse toResponse(Event event) {
    return new EventResponse(
      event.getId(),
      event.getTitle(),
      event.getCategory(),
      event.getDate(),
      event.getTime(),
      event.getLocation(),
      event.getPrice(),
      event.getStatus(),
      event.getDescription(),
      event.getImageUrl(),
      event.getOrganizerId()
    );
  }
}

