package com.eventflow.profileservice.dto;

import java.util.UUID;

public class PreferencesDto {
  private UUID id;
  private Boolean emailNotifications;
  private Boolean smsNotifications;
  private Boolean pushNotifications;
  private Boolean eventReminders;
  private Boolean marketingEmails;
  private String language;
  private String timezone;
  private String dateFormat;
  private String timeFormat;

  // Constructors
  public PreferencesDto() {}

  public PreferencesDto(UUID id, Boolean emailNotifications, Boolean smsNotifications,
                       Boolean pushNotifications, Boolean eventReminders, Boolean marketingEmails,
                       String language, String timezone, String dateFormat, String timeFormat) {
    this.id = id;
    this.emailNotifications = emailNotifications;
    this.smsNotifications = smsNotifications;
    this.pushNotifications = pushNotifications;
    this.eventReminders = eventReminders;
    this.marketingEmails = marketingEmails;
    this.language = language;
    this.timezone = timezone;
    this.dateFormat = dateFormat;
    this.timeFormat = timeFormat;
  }

  // Getters and Setters
  public UUID getId() {
    return id;
  }

  public void setId(UUID id) {
    this.id = id;
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
