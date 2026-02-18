package com.eventflow.adminservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

@FeignClient(name = "attendee-service")
public interface AttendeeServiceClient {

  @GetMapping("/api/attendees/count")
  long getAttendeeCount();
}
