package com.eventflow.profileservice.controller;

import com.eventflow.profileservice.dto.*;
import com.eventflow.profileservice.service.ProfileService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/api/profiles")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"})
public class ProfileController {
  private final ProfileService profileService;

  public ProfileController(ProfileService profileService) {
    this.profileService = profileService;
  }

  /**
   * Get user profile by user ID
   */
  @GetMapping("/{userId}")
  public ResponseEntity<ProfileResponse> getProfile(@PathVariable UUID userId) {
    return ResponseEntity.ok(profileService.getProfileByUserId(userId));
  }

  /**
   * Create a new profile for a user
   */
  @PostMapping("/{userId}")
  public ResponseEntity<ProfileResponse> createProfile(@PathVariable UUID userId) {
    return ResponseEntity.status(HttpStatus.CREATED)
      .body(profileService.createProfile(userId));
  }

  /**
   * Update user profile information
   */
  @PutMapping("/{userId}")
  public ResponseEntity<ProfileResponse> updateProfile(
    @PathVariable UUID userId,
    @Valid @RequestBody ProfileUpdateRequest request) {
    return ResponseEntity.ok(profileService.updateProfile(userId, request));
  }

  /**
   * Upload profile avatar/picture
   */
  @PostMapping(value = "/{userId}/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<ProfileResponse> uploadAvatar(
    @PathVariable UUID userId,
    @RequestParam("file") MultipartFile file) {
    
    // Validate file
    if (file.isEmpty()) {
      throw new IllegalArgumentException("File cannot be empty");
    }
    
    String contentType = file.getContentType();
    if (contentType == null || !contentType.startsWith("image/")) {
      throw new IllegalArgumentException("File must be an image");
    }
    
    // Check file size (5MB max)
    if (file.getSize() > 5 * 1024 * 1024) {
      throw new IllegalArgumentException("File size must not exceed 5MB");
    }
    
    return ResponseEntity.ok(profileService.uploadAvatar(userId, file));
  }

  /**
   * Get user preferences
   */
  @GetMapping("/{userId}/preferences")
  public ResponseEntity<PreferencesDto> getPreferences(@PathVariable UUID userId) {
    ProfileResponse profile = profileService.getProfileByUserId(userId);
    return ResponseEntity.ok(profile.getPreferences());
  }

  /**
   * Update user preferences (notification settings, language, timezone)
   */
  @PutMapping("/{userId}/preferences")
  public ResponseEntity<ProfileResponse> updatePreferences(
    @PathVariable UUID userId,
    @Valid @RequestBody PreferencesUpdateRequest request) {
    return ResponseEntity.ok(profileService.updatePreferences(userId, request));
  }

  /**
   * Get emergency contact information
   */
  @GetMapping("/{userId}/emergency-contact")
  public ResponseEntity<EmergencyContactDto> getEmergencyContact(@PathVariable UUID userId) {
    ProfileResponse profile = profileService.getProfileByUserId(userId);
    if (profile.getEmergencyContact() == null) {
      return ResponseEntity.notFound().build();
    }
    return ResponseEntity.ok(profile.getEmergencyContact());
  }

  /**
   * Create or update emergency contact information
   */
  @PutMapping("/{userId}/emergency-contact")
  public ResponseEntity<ProfileResponse> updateEmergencyContact(
    @PathVariable UUID userId,
    @Valid @RequestBody EmergencyContactRequest request) {
    return ResponseEntity.ok(profileService.updateEmergencyContact(userId, request));
  }

  /**
   * Delete emergency contact information
   */
  @DeleteMapping("/{userId}/emergency-contact")
  public ResponseEntity<Void> deleteEmergencyContact(@PathVariable UUID userId) {
    profileService.deleteEmergencyContact(userId);
    return ResponseEntity.noContent().build();
  }

  /**
   * Exception handler for validation errors
   */
  @ExceptionHandler(IllegalArgumentException.class)
  public ResponseEntity<ErrorResponse> handleBadRequest(IllegalArgumentException ex) {
    return ResponseEntity.badRequest()
      .body(new ErrorResponse(ex.getMessage()));
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<ErrorResponse> handleGenericError(Exception ex) {
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
      .body(new ErrorResponse("An error occurred: " + ex.getMessage()));
  }

  // Simple error response DTO
  private static class ErrorResponse {
    private String message;

    public ErrorResponse(String message) {
      this.message = message;
    }

    public String getMessage() {
      return message;
    }

    public void setMessage(String message) {
      this.message = message;
    }
  }
}
