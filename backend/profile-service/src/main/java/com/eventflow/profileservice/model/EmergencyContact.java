package com.eventflow.profileservice.model;

import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

@Entity
@Table(name = "emergency_contacts")
public class EmergencyContact {
  @Id
  @GeneratedValue
  @UuidGenerator
  private UUID id;

  @OneToOne
  @JoinColumn(name = "profile_id", nullable = false)
  private Profile profile;

  @Column(nullable = false)
  private String fullName;

  @Column(nullable = false)
  private String relationship;

  @Column(nullable = false)
  private String phoneNumber;

  @Column
  private String alternatePhoneNumber;

  @Column
  private String email;

  @Column
  private String address;

  // Getters and Setters
  public UUID getId() {
    return id;
  }

  public void setId(UUID id) {
    this.id = id;
  }

  public Profile getProfile() {
    return profile;
  }

  public void setProfile(Profile profile) {
    this.profile = profile;
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
