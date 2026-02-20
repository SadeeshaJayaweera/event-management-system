package com.eventflow.adminservice.controller;

import com.eventflow.adminservice.dto.DashboardStats;
import com.eventflow.adminservice.dto.EventSummary;
import com.eventflow.adminservice.dto.EventUpdateRequest;
import com.eventflow.adminservice.dto.UserResponse;
import com.eventflow.adminservice.service.AdminAnalyticsService;
import com.eventflow.adminservice.service.AdminEventService;
import com.eventflow.adminservice.service.AdminUserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Admin Controller - Provides administrative endpoints for managing the event system.
 * 
 * Security Note: In production, these endpoints should be protected with proper
 * authentication and authorization. Only users with 'admin' role should have access.
 * Consider implementing:
 * - Spring Security with JWT validation
 * - Role-based access control (RBAC)
 * - Request header validation for user roles
 */
@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"})
public class AdminController {

  private final AdminEventService adminEventService;
  private final AdminUserService adminUserService;
  private final AdminAnalyticsService adminAnalyticsService;

  public AdminController(AdminEventService adminEventService,
                         AdminUserService adminUserService,
                         AdminAnalyticsService adminAnalyticsService) {
    this.adminEventService = adminEventService;
    this.adminUserService = adminUserService;
    this.adminAnalyticsService = adminAnalyticsService;
  }

  // Dashboard Analytics
  @GetMapping("/dashboard/stats")
  public ResponseEntity<DashboardStats> getDashboardStats() {
    return ResponseEntity.ok(adminAnalyticsService.getDashboardStats());
  }

  // Event Management Endpoints
  @GetMapping("/events")
  public ResponseEntity<List<EventSummary>> getAllEvents() {
    return ResponseEntity.ok(adminEventService.getAllEvents());
  }

  @GetMapping("/events/{id}")
  public ResponseEntity<EventSummary> getEvent(@PathVariable UUID id) {
    return ResponseEntity.ok(adminEventService.getEvent(id));
  }

  @PutMapping("/events/{id}")
  public ResponseEntity<EventSummary> updateEvent(@PathVariable UUID id,
                                                   @Valid @RequestBody EventUpdateRequest request) {
    return ResponseEntity.ok(adminEventService.updateEvent(id, request));
  }

  @DeleteMapping("/events/{id}")
  public ResponseEntity<Void> deleteEvent(@PathVariable UUID id) {
    adminEventService.deleteEvent(id);
    return ResponseEntity.noContent().build();
  }

  // User Management Endpoints
  @GetMapping("/users")
  public ResponseEntity<List<UserResponse>> getAllUsers() {
    return ResponseEntity.ok(adminUserService.getAllUsers());
  }

  @GetMapping("/users/{id}")
  public ResponseEntity<UserResponse> getUser(@PathVariable UUID id) {
    return ResponseEntity.ok(adminUserService.getUser(id));
  }

  @DeleteMapping("/users/{id}")
  public ResponseEntity<Void> deleteUser(@PathVariable UUID id) {
    adminUserService.deleteUser(id);
    return ResponseEntity.noContent().build();
  }

  @PutMapping("/users/{id}/ban")
  public ResponseEntity<Void> banUser(@PathVariable UUID id) {
    adminUserService.banUser(id);
    return ResponseEntity.noContent().build();
  }

  @PutMapping("/users/{id}/unban")
  public ResponseEntity<Void> unbanUser(@PathVariable UUID id) {
    adminUserService.unbanUser(id);
    return ResponseEntity.noContent().build();
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<String> handleException(Exception ex) {
    return ResponseEntity.badRequest().body(ex.getMessage());
  }
}

