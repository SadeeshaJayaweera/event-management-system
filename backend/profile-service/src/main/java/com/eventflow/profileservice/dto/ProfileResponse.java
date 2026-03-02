package com.eventflow.profileservice.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class ProfileResponse {
  private UUID id;
  private UUID userId;
  private String bio;
  private String avatarUrl;
  private String phoneNumber;
  private String address;
  private String city;
  private String country;
  private PreferencesDto preferences;
  private EmergencyContactDto emergencyContact;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;

  // Constructors
  public ProfileResponse() {}

  public ProfileResponse(UUID id, UUID userId, String bio, String avatarUrl, String phoneNumber,
                        String address, String city, String country, PreferencesDto preferences,
                        EmergencyContactDto emergencyContact, LocalDateTime createdAt, LocalDateTime updatedAt) {
    this.id = id;
    this.userId = userId;
    this.bio = bio;
    this.avatarUrl = avatarUrl;
    this.phoneNumber = phoneNumber;
    this.address = address;
    this.city = city;
    this.country = country;
    this.preferences = preferences;
    this.emergencyContact = emergencyContact;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // Getters and Setters
  public UUID getId() {
    return id;
  }

  public void setId(UUID id) {
    this.id = id;
  }

  public UUID getUserId() {
    return userId;
  }

  public void setUserId(UUID userId) {
    this.userId = userId;
  }

  public String getBio() {
    return bio;
  }

  public void setBio(String bio) {
    this.bio = bio;
  }

  public String getAvatarUrl() {
    return avatarUrl;
  }

  public void setAvatarUrl(String avatarUrl) {
    this.avatarUrl = avatarUrl;
  }

  public String getPhoneNumber() {
    return phoneNumber;
  }

  public void setPhoneNumber(String phoneNumber) {
    this.phoneNumber = phoneNumber;
  }

  public String getAddress() {
    return address;
  }

  public void setAddress(String address) {
    this.address = address;
  }

  public String getCity() {
    return city;
  }

  public void setCity(String city) {
    this.city = city;
  }

  public String getCountry() {
    return country;
  }

  public void setCountry(String country) {
    this.country = country;
  }

  public PreferencesDto getPreferences() {
    return preferences;
  }

  public void setPreferences(PreferencesDto preferences) {
    this.preferences = preferences;
  }

  public EmergencyContactDto getEmergencyContact() {
    return emergencyContact;
  }

  public void setEmergencyContact(EmergencyContactDto emergencyContact) {
    this.emergencyContact = emergencyContact;
  }

  public LocalDateTime getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(LocalDateTime createdAt) {
    this.createdAt = createdAt;
  }

  public LocalDateTime getUpdatedAt() {
    return updatedAt;
  }

  public void setUpdatedAt(LocalDateTime updatedAt) {
    this.updatedAt = updatedAt;
  }
}
