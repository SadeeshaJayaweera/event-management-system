package com.eventflow.adminservice.client;

import com.eventflow.adminservice.dto.UserResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@FeignClient(name = "auth-service")
public interface AuthServiceClient {

  @GetMapping("/api/users")
  List<UserResponse> getAllUsers();

  @GetMapping("/api/users/{id}")
  UserResponse getUser(@PathVariable UUID id);

  @DeleteMapping("/api/users/{id}")
  void deleteUser(@PathVariable UUID id);

  @PutMapping("/api/users/{id}/ban")
  void banUser(@PathVariable UUID id);

  @PutMapping("/api/users/{id}/unban")
  void unbanUser(@PathVariable UUID id);
}
