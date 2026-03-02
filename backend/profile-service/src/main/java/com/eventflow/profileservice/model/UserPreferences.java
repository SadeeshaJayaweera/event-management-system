package com.eventflow.profileservice.model;

import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

@Entity
@Table(name = "user_preferences")
public class UserPreferences {
  @Id
  @GeneratedValue
  @UuidGenerator
  private UUID id;

  @OneToOne
  @JoinColumn(name = "profile_id", nullable = false)
  private Profile profile;

  @Column(nullable = false)
  private Boolean emailNotifications = true;

  @Column(nullable = false)
  private Boolean smsNotifications = false;

  @Column(nullable = false)
  private Boolean pushNotifications = true;

  @Column(nullable = false)
  private Boolean eventReminders = true;

  @Column(nullable = false)
  private Boolean marketingEmails = false;

  @Column(nullable = false, length = 10)
  private String language = "en";

  @Column(nullable = false, length = 50)
  private String timezone = "UTC";

  @Column(nullable = false)
  private String dateFormat = "MM/DD/YYYY";

  @Column(nullable = false)
  private String timeFormat = "12h";

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

  public Boolean getEmailNotifications() {
    return emailNotifications;
  }

  public void setEmailNotifications(Boolean emailNotifications) {
    this.emailNotifications = emailNotifications;
  }

  public Boolean getSmsNotifications() {
    return smsNotifications;
  }

  public void setSmsNotifications(Boolean smsNotifications) {
    this.smsNotifications = smsNotifications;
  }

  public Boolean getPushNotifications() {
    return pushNotifications;
  }

  public void setPushNotifications(Boolean pushNotifications) {
    this.pushNotifications = pushNotifications;
  }

  public Boolean getEventReminders() {
    return eventReminders;
  }

  public void setEventReminders(Boolean eventReminders) {
    this.eventReminders = eventReminders;
  }

  public Boolean getMarketingEmails() {
    return marketingEmails;
  }

  public void setMarketingEmails(Boolean marketingEmails) {
    this.marketingEmails = marketingEmails;
  }

  public String getLanguage() {
    return language;
  }

  public void setLanguage(String language) {
    this.language = language;
  }

  public String getTimezone() {
    return timezone;
  }

  public void setTimezone(String timezone) {
    this.timezone = timezone;
  }

  public String getDateFormat() {
    return dateFormat;
  }

  public void setDateFormat(String dateFormat) {
    this.dateFormat = dateFormat;
  }

  public String getTimeFormat() {
    return timeFormat;
  }

  public void setTimeFormat(String timeFormat) {
    this.timeFormat = timeFormat;
  }
}
