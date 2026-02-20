package com.eventflow.adminservice.service;

import com.eventflow.adminservice.client.EventServiceClient;
import com.eventflow.adminservice.dto.EventSummary;
import com.eventflow.adminservice.dto.EventUpdateRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class AdminEventService {
  private final EventServiceClient eventServiceClient;

  public AdminEventService(EventServiceClient eventServiceClient) {
    this.eventServiceClient = eventServiceClient;
  }

  public List<EventSummary> getAllEvents() {
    return eventServiceClient.getAllEvents();
  }

  public EventSummary getEvent(UUID id) {
    return eventServiceClient.getEvent(id);
  }

  public EventSummary updateEvent(UUID id, EventUpdateRequest request) {
    return eventServiceClient.updateEvent(id, request);
  }

  public void deleteEvent(UUID id) {
    eventServiceClient.deleteEvent(id);
  }
}
