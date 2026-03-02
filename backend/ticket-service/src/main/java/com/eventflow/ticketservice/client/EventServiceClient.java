package com.eventflow.ticketservice.client;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.UUID;

@Component
public class EventServiceClient {
  private final RestTemplate restTemplate;
  private static final String EVENT_SERVICE_URL = "http://event-service/api/events";

  public EventServiceClient(RestTemplate restTemplate) {
    this.restTemplate = restTemplate;
  }

  public Map<String, Object> getEvent(UUID eventId) {
    try {
      return restTemplate.getForObject(EVENT_SERVICE_URL + "/" + eventId, Map.class);
    } catch (Exception e) {
      System.err.println("Failed to fetch event: " + e.getMessage());
      return null;
    }
  }
}
