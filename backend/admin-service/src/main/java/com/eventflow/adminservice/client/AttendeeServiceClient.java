package com.eventflow.adminservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

@FeignClient(name = "ticket-service", contextId = "attendeeServiceClient", url = "${TICKET_SERVICE_URL:http://ticket-service:8084}")
public interface AttendeeServiceClient {

  @GetMapping("/api/tickets/count")
  long getAttendeeCount();
}
