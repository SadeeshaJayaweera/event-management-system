package com.eventflow.eventservice.client;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Component
public class AuthServiceClient {
  private final RestTemplate restTemplate;
  private static final String AUTH_SERVICE_URL = "http://auth-service/api/auth/users";

  public AuthServiceClient(RestTemplate restTemplate) {
    this.restTemplate = restTemplate;
  }

  public List<UUID> getAdminUserIds() {
    try {
      ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
        AUTH_SERVICE_URL + "?role=admin",
        HttpMethod.GET,
        null,
        new ParameterizedTypeReference<>() {}
      );
      
      if (response.getBody() != null) {
        return response.getBody().stream()
          .map(user -> UUID.fromString((String) user.get("id")))
          .toList();
      }
    } catch (Exception e) {
      System.err.println("Failed to fetch admin users: " + e.getMessage());
    }
    return List.of();
  }
}
