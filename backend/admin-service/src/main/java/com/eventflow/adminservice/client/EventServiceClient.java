package com.eventflow.adminservice.client;

import com.eventflow.adminservice.dto.EventSummary;
import com.eventflow.adminservice.dto.EventUpdateRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@FeignClient(name = "event-service")
public interface EventServiceClient {

  @GetMapping("/api/events")
  List<EventSummary> getAllEvents();

  @GetMapping("/api/events/{id}")
  EventSummary getEvent(@PathVariable UUID id);

  @PutMapping("/api/events/{id}")
  EventSummary updateEvent(@PathVariable UUID id, @RequestBody EventUpdateRequest request);

  @DeleteMapping("/api/events/{id}")
  void deleteEvent(@PathVariable UUID id);
}
