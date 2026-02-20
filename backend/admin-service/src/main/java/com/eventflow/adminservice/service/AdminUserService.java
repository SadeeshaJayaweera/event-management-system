package com.eventflow.adminservice.service;

import com.eventflow.adminservice.client.AuthServiceClient;
import com.eventflow.adminservice.dto.UserResponse;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class AdminUserService {
  private final AuthServiceClient authServiceClient;

  public AdminUserService(AuthServiceClient authServiceClient) {
    this.authServiceClient = authServiceClient;
  }

  public List<UserResponse> getAllUsers() {
    return authServiceClient.getAllUsers();
  }

  public UserResponse getUser(UUID id) {
    return authServiceClient.getUser(id);
  }

  public void deleteUser(UUID id) {
    authServiceClient.deleteUser(id);
  }

  public void banUser(UUID id) {
    authServiceClient.banUser(id);
  }

  public void unbanUser(UUID id) {
    authServiceClient.unbanUser(id);
  }
}
