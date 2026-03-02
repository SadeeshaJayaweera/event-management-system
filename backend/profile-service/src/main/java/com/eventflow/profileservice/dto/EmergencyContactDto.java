package com.eventflow.profileservice.dto;

import java.util.UUID;

public class EmergencyContactDto {
  private UUID id;
  private String fullName;
  private String relationship;
  private String phoneNumber;
  private String alternatePhoneNumber;
  private String email;
  private String address;

  // Constructors
  public EmergencyContactDto() {}

  public EmergencyContactDto(UUID id, String fullName, String relationship, String phoneNumber,
                            String alternatePhoneNumber, String email, String address) {
    this.id = id;
    this.fullName = fullName;
    this.relationship = relationship;
    this.phoneNumber = phoneNumber;
    this.alternatePhoneNumber = alternatePhoneNumber;
    this.email = email;
    this.address = address;
  }

  // Getters and Setters
  public UUID getId() {
    return id;
  }

  public void setId(UUID id) {
    this.id = id;
  }

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
