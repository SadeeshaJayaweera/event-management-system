package com.eventflow.profileservice.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class EmergencyContactRequest {
  @NotBlank(message = "Full name is required")
  private String fullName;

  @NotBlank(message = "Relationship is required")
  private String relationship;

  @NotBlank(message = "Phone number is required")
  private String phoneNumber;

  private String alternatePhoneNumber;

  @Email(message = "Email should be valid")
  private String email;

  private String address;

  // Getters and Setters
  public String getFullName() {
    return fullName;
  }

  public void setFullName(String fullName) {
    this.fullName = fullName;
  }

  public String getRelationship() {
    return relationship;
  }

  public void setRelationship(String relationship) {
    this.relationship = relationship;
  }

  public String getPhoneNumber() {
    return phoneNumber;
  }

  public void setPhoneNumber(String phoneNumber) {
    this.phoneNumber = phoneNumber;
  }

  public String getAlternatePhoneNumber() {
    return alternatePhoneNumber;
  }

  public void setAlternatePhoneNumber(String alternatePhoneNumber) {
    this.alternatePhoneNumber = alternatePhoneNumber;
  }

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public String getAddress() {
    return address;
  }

  public void setAddress(String address) {
    this.address = address;
  }
}
