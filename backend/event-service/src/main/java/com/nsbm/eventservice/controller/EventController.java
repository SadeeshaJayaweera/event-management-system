package com.nsbm.eventservice.controller;

import com.nsbm.eventservice.dto.*;
import com.nsbm.eventservice.model.EventCategory;
import com.nsbm.eventservice.service.EventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    // ==================== CRUD Endpoints ====================

    @PostMapping
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    public ResponseEntity<EventDTO> createEvent(@Valid @RequestBody CreateEventRequest request) {
        EventDTO event = eventService.createEvent(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(event);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventDTO> getEventById(@PathVariable Long id) {
        EventDTO event = eventService.getEventById(id);
        return ResponseEntity.ok(event);
    }

    @GetMapping
    public ResponseEntity<List<EventDTO>> getAllEvents() {
        List<EventDTO> events = eventService.getAllEvents();
        return ResponseEntity.ok(events);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    public ResponseEntity<EventDTO> updateEvent(
            @PathVariable Long id,
            @Valid @RequestBody UpdateEventRequest request) {
        EventDTO event = eventService.updateEvent(id, request);
        return ResponseEntity.ok(event);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        eventService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }

    // ==================== Query Endpoints ====================

    @GetMapping("/published")
    public ResponseEntity<List<EventDTO>> getPublishedEvents() {
        List<EventDTO> events = eventService.getPublishedEvents();
        return ResponseEntity.ok(events);
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<EventDTO>> getUpcomingEvents() {
        List<EventDTO> events = eventService.getUpcomingEvents();
        return ResponseEntity.ok(events);
    }

    @GetMapping("/featured")
    public ResponseEntity<List<EventDTO>> getFeaturedEvents() {
        List<EventDTO> events = eventService.getFeaturedEvents();
        return ResponseEntity.ok(events);
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<EventDTO>> getEventsByCategory(@PathVariable EventCategory category) {
        List<EventDTO> events = eventService.getEventsByCategory(category);
        return ResponseEntity.ok(events);
    }

    @GetMapping("/organizer/{organizerId}")
    public ResponseEntity<List<EventDTO>> getEventsByOrganizer(@PathVariable Long organizerId) {
        List<EventDTO> events = eventService.getEventsByOrganizer(organizerId);
        return ResponseEntity.ok(events);
    }

    @GetMapping("/search")
    public ResponseEntity<List<EventDTO>> searchEvents(@RequestParam String query) {
        List<EventDTO> events = eventService.searchEvents(query);
        return ResponseEntity.ok(events);
    }

    @GetMapping("/paginated")
    public ResponseEntity<Page<EventDTO>> getEventsPaginated(Pageable pageable) {
        Page<EventDTO> events = eventService.getEventsPaginated(pageable);
        return ResponseEntity.ok(events);
    }

    // ==================== Status Management Endpoints ====================

    @PutMapping("/{id}/publish")
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    public ResponseEntity<EventDTO> publishEvent(@PathVariable Long id) {
        EventDTO event = eventService.publishEvent(id);
        return ResponseEntity.ok(event);
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    public ResponseEntity<EventDTO> cancelEvent(@PathVariable Long id) {
        EventDTO event = eventService.cancelEvent(id);
        return ResponseEntity.ok(event);
    }

    // ==================== Seat Management Endpoints ====================

    @PostMapping("/{id}/reserve-seats")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<EventDTO> reserveSeats(
            @PathVariable Long id,
            @RequestParam int numberOfSeats) {
        EventDTO event = eventService.reserveSeats(id, numberOfSeats);
        return ResponseEntity.ok(event);
    }

    @PostMapping("/{id}/release-seats")
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    public ResponseEntity<EventDTO> releaseSeats(
            @PathVariable Long id,
            @RequestParam int numberOfSeats) {
        EventDTO event = eventService.releaseSeats(id, numberOfSeats);
        return ResponseEntity.ok(event);
    }

    @GetMapping("/{id}/available-seats")
    public ResponseEntity<Boolean> hasAvailableSeats(
            @PathVariable Long id,
            @RequestParam int numberOfSeats) {
        boolean available = eventService.hasAvailableSeats(id, numberOfSeats);
        return ResponseEntity.ok(available);
    }

    // ==================== Utility Endpoints ====================

    @GetMapping("/{id}/exists")
    public ResponseEntity<Boolean> eventExists(@PathVariable Long id) {
        boolean exists = eventService.existsById(id);
        return ResponseEntity.ok(exists);
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Event Service is running");
    }
}
