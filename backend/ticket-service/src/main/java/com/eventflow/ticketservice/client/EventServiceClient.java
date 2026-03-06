package com.eventflow.ticketservice.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.UUID;

@Component
public class EventServiceClient {
  private final RestTemplate restTemplate;
  private final String eventServiceUrl;

  public EventServiceClient(RestTemplate restTemplate,
      @Value("${event-service.url:http://event-service:8081}") String eventServiceUrl) {
    this.restTemplate = restTemplate;
    this.eventServiceUrl = eventServiceUrl;
  }

  public Map<String, Object> getEvent(UUID eventId) {
    try {
      return restTemplate.getForObject(eventServiceUrl + "/api/events/" + eventId, Map.class);
    } catch (Exception e) {
      System.err.println("Failed to fetch event from " + eventServiceUrl + ": " + e.getMessage());
      return null;
    }
  }
}
