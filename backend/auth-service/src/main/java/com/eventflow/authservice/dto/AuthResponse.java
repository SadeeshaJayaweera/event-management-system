package com.eventflow.authservice.dto;

import java.util.UUID;

public class AuthResponse {
  private UUID userId;
  private String name;
  private String role;
  private String token;
  private String email;

  public AuthResponse(UUID userId, String name, String role, String token, String email) {
    this.userId = userId;
    this.name = name;
    this.role = role;
    this.token = token;
    this.email = email;
  }

  public UUID getUserId() {
    return userId;
  }

  public String getName() {
    return name;
  }

  public String getRole() {
    return role;
  }

  public String getToken() {
    return token;
  }

  public String getEmail() {
    return email;
  }
}
