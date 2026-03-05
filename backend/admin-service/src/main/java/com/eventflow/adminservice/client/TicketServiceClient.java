package com.eventflow.adminservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

@FeignClient(name = "ticket-service", contextId = "ticketServiceClient", url = "${TICKET_SERVICE_URL:http://ticket-service:8084}")
public interface TicketServiceClient {

  @GetMapping("/api/tickets/count")
  long getTicketCount();
}
