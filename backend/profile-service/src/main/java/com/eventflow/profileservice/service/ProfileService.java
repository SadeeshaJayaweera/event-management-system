package com.eventflow.profileservice.service;

import com.eventflow.profileservice.dto.*;
import com.eventflow.profileservice.model.EmergencyContact;
import com.eventflow.profileservice.model.Profile;
import com.eventflow.profileservice.model.UserPreferences;
import com.eventflow.profileservice.repository.ProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class ProfileService {
  private final ProfileRepository profileRepository;
  private final String avatarStoragePath = "/data/avatars";

  public ProfileService(ProfileRepository profileRepository) {
    this.profileRepository = profileRepository;
  }

  @Transactional(readOnly = true)
  public ProfileResponse getProfileByUserId(UUID userId) {
    Profile profile = profileRepository.findByUserId(userId)
      .orElseThrow(() -> new IllegalArgumentException("Profile not found for user: " + userId));
    return toResponse(profile);
  }

  @Transactional
  public ProfileResponse createProfile(UUID userId) {
    if (profileRepository.existsByUserId(userId)) {
      throw new IllegalArgumentException("Profile already exists for user: " + userId);
    }

    Profile profile = new Profile();
    profile.setUserId(userId);

    // Create default preferences
    UserPreferences preferences = new UserPreferences();
    preferences.setProfile(profile);
    profile.setPreferences(preferences);

    Profile savedProfile = profileRepository.save(profile);
    return toResponse(savedProfile);
  }

  @Transactional
  public ProfileResponse updateProfile(UUID userId, ProfileUpdateRequest request) {
    Profile profile = profileRepository.findByUserId(userId)
      .orElseThrow(() -> new IllegalArgumentException("Profile not found for user: " + userId));

    if (request.getBio() != null) {
      profile.setBio(request.getBio());
    }
    if (request.getPhoneNumber() != null) {
      profile.setPhoneNumber(request.getPhoneNumber());
    }
    if (request.getAddress() != null) {
      profile.setAddress(request.getAddress());
    }
    if (request.getCity() != null) {
      profile.setCity(request.getCity());
    }
    if (request.getCountry() != null) {
      profile.setCountry(request.getCountry());
    }

    Profile updatedProfile = profileRepository.save(profile);
    return toResponse(updatedProfile);
  }

  @Transactional
  public ProfileResponse uploadAvatar(UUID userId, MultipartFile file) {
    Profile profile = profileRepository.findByUserId(userId)
      .orElseThrow(() -> new IllegalArgumentException("Profile not found for user: " + userId));

    try {
      // Create directory if it doesn't exist
      Path uploadPath = Paths.get(avatarStoragePath);
      if (!Files.exists(uploadPath)) {
        Files.createDirectories(uploadPath);
      }

      // Generate unique filename
      String originalFilename = file.getOriginalFilename();
      String fileExtension = originalFilename != null && originalFilename.contains(".")
        ? originalFilename.substring(originalFilename.lastIndexOf("."))
        : ".jpg";
      String filename = userId + "_" + System.currentTimeMillis() + fileExtension;
      Path filePath = uploadPath.resolve(filename);

      // Save file
      Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

      // Update profile with avatar URL
      profile.setAvatarUrl("/avatars/" + filename);
      Profile updatedProfile = profileRepository.save(profile);

      return toResponse(updatedProfile);
    } catch (IOException e) {
      throw new RuntimeException("Failed to store avatar file", e);
    }
  }

  @Transactional
  public ProfileResponse updatePreferences(UUID userId, PreferencesUpdateRequest request) {
    Profile profile = profileRepository.findByUserId(userId)
      .orElseThrow(() -> new IllegalArgumentException("Profile not found for user: " + userId));

    UserPreferences preferences = profile.getPreferences();
    if (preferences == null) {
      preferences = new UserPreferences();
      preferences.setProfile(profile);
      profile.setPreferences(preferences);
    }

    if (request.getEmailNotifications() != null) {
      preferences.setEmailNotifications(request.getEmailNotifications());
    }
    if (request.getSmsNotifications() != null) {
      preferences.setSmsNotifications(request.getSmsNotifications());
    }
    if (request.getPushNotifications() != null) {
      preferences.setPushNotifications(request.getPushNotifications());
    }
    if (request.getEventReminders() != null) {
      preferences.setEventReminders(request.getEventReminders());
    }
    if (request.getMarketingEmails() != null) {
      preferences.setMarketingEmails(request.getMarketingEmails());
    }
    if (request.getLanguage() != null) {
      preferences.setLanguage(request.getLanguage());
    }
    if (request.getTimezone() != null) {
      preferences.setTimezone(request.getTimezone());
    }
    if (request.getDateFormat() != null) {
      preferences.setDateFormat(request.getDateFormat());
    }
    if (request.getTimeFormat() != null) {
      preferences.setTimeFormat(request.getTimeFormat());
    }

    Profile updatedProfile = profileRepository.save(profile);
    return toResponse(updatedProfile);
  }

  @Transactional
  public ProfileResponse updateEmergencyContact(UUID userId, EmergencyContactRequest request) {
    Profile profile = profileRepository.findByUserId(userId)
      .orElseThrow(() -> new IllegalArgumentException("Profile not found for user: " + userId));

    EmergencyContact contact = profile.getEmergencyContact();
    if (contact == null) {
      contact = new EmergencyContact();
      contact.setProfile(profile);
      profile.setEmergencyContact(contact);
    }

    contact.setFullName(request.getFullName());
    contact.setRelationship(request.getRelationship());
    contact.setPhoneNumber(request.getPhoneNumber());
    contact.setAlternatePhoneNumber(request.getAlternatePhoneNumber());
    contact.setEmail(request.getEmail());
    contact.setAddress(request.getAddress());

    Profile updatedProfile = profileRepository.save(profile);
    return toResponse(updatedProfile);
  }

  @Transactional
  public void deleteEmergencyContact(UUID userId) {
    Profile profile = profileRepository.findByUserId(userId)
      .orElseThrow(() -> new IllegalArgumentException("Profile not found for user: " + userId));

    profile.setEmergencyContact(null);
    profileRepository.save(profile);
  }

  private ProfileResponse toResponse(Profile profile) {
    PreferencesDto preferencesDto = null;
    if (profile.getPreferences() != null) {
      UserPreferences prefs = profile.getPreferences();
      preferencesDto = new PreferencesDto(
        prefs.getId(),
        prefs.getEmailNotifications(),
        prefs.getSmsNotifications(),
        prefs.getPushNotifications(),
        prefs.getEventReminders(),
        prefs.getMarketingEmails(),
        prefs.getLanguage(),
        prefs.getTimezone(),
        prefs.getDateFormat(),
        prefs.getTimeFormat()
      );
    }

    EmergencyContactDto emergencyContactDto = null;
    if (profile.getEmergencyContact() != null) {
      EmergencyContact contact = profile.getEmergencyContact();
      emergencyContactDto = new EmergencyContactDto(
        contact.getId(),
        contact.getFullName(),
        contact.getRelationship(),
        contact.getPhoneNumber(),
        contact.getAlternatePhoneNumber(),
        contact.getEmail(),
        contact.getAddress()
      );
    }

    return new ProfileResponse(
      profile.getId(),
      profile.getUserId(),
      profile.getBio(),
      profile.getAvatarUrl(),
      profile.getPhoneNumber(),
      profile.getAddress(),
      profile.getCity(),
      profile.getCountry(),
      preferencesDto,
      emergencyContactDto,
      profile.getCreatedAt(),
      profile.getUpdatedAt()
    );
  }
}
