package com.eventflow.profileservice.dto;

import jakarta.validation.constraints.NotBlank;

public class PreferencesUpdateRequest {
  private Boolean emailNotifications;
  private Boolean smsNotifications;
  private Boolean pushNotifications;
  private Boolean eventReminders;
  private Boolean marketingEmails;
  
  @NotBlank(message = "Language is required")
  private String language;
  
  @NotBlank(message = "Timezone is required")
  private String timezone;
  
  private String dateFormat;
  private String timeFormat;

  // Getters and Setters
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
