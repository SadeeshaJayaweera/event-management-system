package com.eventflow.eventservice.service;

import com.eventflow.eventservice.dto.EventCreateRequest;
import com.eventflow.eventservice.dto.EventUpdateRequest;
import com.eventflow.eventservice.model.Event;
import com.eventflow.eventservice.repository.EventRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class EventService {
  private final EventRepository eventRepository;

  public EventService(EventRepository eventRepository) {
    this.eventRepository = eventRepository;
  }

  public List<Event> list() {
    return eventRepository.findAll();
  }

  public Event get(UUID id) {
    return eventRepository.findById(id)
        .orElseThrow(() -> new IllegalArgumentException("Event not found"));
  }

  public Event create(EventCreateRequest request) {
    Event event = new Event();
    event.setTitle(request.getTitle());
    event.setCategory(request.getCategory());
    event.setDate(request.getDate());
    event.setTime(request.getTime());
    event.setLocation(request.getLocation());
    event.setPrice(request.getPrice());
    event.setDescription(request.getDescription());
    event.setImageUrl(request.getImageUrl());
    event.setStatus("Upcoming");
    event.setCreatedAt(LocalDateTime.now());
    event.setUpdatedAt(LocalDateTime.now());

    return eventRepository.save(event);
  }

  public Event update(UUID id, EventUpdateRequest request) {
    Event event = get(id);
    event.setTitle(request.getTitle());
    event.setCategory(request.getCategory());
    event.setDate(request.getDate());
    event.setTime(request.getTime());
    event.setLocation(request.getLocation());
    if (request.getPrice() != null)
      event.setPrice(request.getPrice());
    if (request.getStatus() != null)
      event.setStatus(request.getStatus());
    event.setDescription(request.getDescription());
    event.setImageUrl(request.getImageUrl());
    event.setUpdatedAt(LocalDateTime.now());

    return eventRepository.save(event);
  }

  public void delete(UUID id) {
    eventRepository.deleteById(id);
  }
}
