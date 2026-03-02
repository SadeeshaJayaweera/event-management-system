package com.eventflow.eventservice.service;

import com.eventflow.eventservice.client.AuthServiceClient;
import com.eventflow.eventservice.client.NotificationServiceClient;
import com.eventflow.eventservice.dto.EventCreateRequest;
import com.eventflow.eventservice.dto.EventUpdateRequest;
import com.eventflow.eventservice.model.Event;
import com.eventflow.eventservice.repository.EventRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class EventService {
  private final EventRepository eventRepository;
  private final NotificationServiceClient notificationClient;
  private final AuthServiceClient authServiceClient;

  public EventService(EventRepository eventRepository, 
                     NotificationServiceClient notificationClient,
                     AuthServiceClient authServiceClient) {
    this.eventRepository = eventRepository;
    this.notificationClient = notificationClient;
    this.authServiceClient = authServiceClient;
  }

  public List<Event> list() {
    return eventRepository.findAll();
  }

  public List<Event> listByOrganizer(UUID organizerId) {
    return eventRepository.findByOrganizerId(organizerId);
  }

  public Event get(UUID id) {
    return eventRepository.findById(id)
      .orElseThrow(() -> new IllegalArgumentException("Event not found"));
  }

  public Event create(EventCreateRequest request) {
    Event event = new Event();
    event.setTitle(request.getTitle());
    event.setCategory(request.getCategory());
    event.setDate(request.getDate());
    event.setTime(request.getTime());
    event.setLocation(request.getLocation());
    event.setPrice(request.getPrice());
    event.setDescription(request.getDescription());
    event.setImageUrl(request.getImageUrl());
    event.setStatus("Upcoming");
    event.setCreatedAt(LocalDateTime.now());
    event.setUpdatedAt(LocalDateTime.now());
    
    // Set organizer ID if provided
    if (request.getOrganizerId() != null && !request.getOrganizerId().isEmpty()) {
      event.setOrganizerId(UUID.fromString(request.getOrganizerId()));
    }

    Event savedEvent = eventRepository.save(event);

    // Send notifications
    try {
      // Notify organizer
      if (savedEvent.getOrganizerId() != null) {
        notificationClient.sendInAppNotification(
          savedEvent.getOrganizerId(),
          "EVENT_CREATED",
          "Your event '" + savedEvent.getTitle() + "' has been created successfully",
          "/dashboard/events/" + savedEvent.getId()
        );
      }

      // Notify all admins
      List<UUID> adminIds = authServiceClient.getAdminUserIds();
      for (UUID adminId : adminIds) {
        notificationClient.sendInAppNotification(
          adminId,
          "NEW_EVENT_CREATED",
          "New event '" + savedEvent.getTitle() + "' created by organizer",
          "/dashboard/admin"
        );
      }
    } catch (Exception e) {
      System.err.println("Failed to send event creation notifications: " + e.getMessage());
    }

    return savedEvent;
  }

  public Event update(UUID id, EventUpdateRequest request) {
    Event event = get(id);
    
    // Store old title for notification
    String oldTitle = event.getTitle();
    
    event.setTitle(request.getTitle());
    event.setCategory(request.getCategory());
    event.setDate(request.getDate());
    event.setTime(request.getTime());
    event.setLocation(request.getLocation());
    event.setPrice(request.getPrice());
    event.setStatus(request.getStatus());
    event.setDescription(request.getDescription());
    event.setImageUrl(request.getImageUrl());
    event.setUpdatedAt(LocalDateTime.now());

    Event updatedEvent = eventRepository.save(event);
    
    // Send notifications to attendees about event update
    try {
      if (updatedEvent.getOrganizerId() != null) {
        // Notify organizer
        notificationClient.sendInAppNotification(
          updatedEvent.getOrganizerId(),
          "EVENT_UPDATED",
          "Your event '" + updatedEvent.getTitle() + "' has been updated successfully",
          "/dashboard/events/" + updatedEvent.getId()
        );
      }
      
      // Notify all admins
      List<UUID> adminIds = authServiceClient.getAdminUserIds();
      for (UUID adminId : adminIds) {
        notificationClient.sendInAppNotification(
          adminId,
          "EVENT_UPDATED",
          "Event '" + updatedEvent.getTitle() + "' has been updated",
          "/dashboard/admin"
        );
      }
    } catch (Exception e) {
      System.err.println("Failed to send event update notifications: " + e.getMessage());
    }
    
    return updatedEvent;
  }

  public void delete(UUID id) {
    Event event = get(id);
    
    // Send notifications before deleting
    try {
      if (event.getOrganizerId() != null) {
        // Notify organizer
        notificationClient.sendInAppNotification(
          event.getOrganizerId(),
          "EVENT_DELETED",
          "Your event '" + event.getTitle() + "' has been deleted",
          "/dashboard/events"
        );
      }
      
      // Notify all admins
      List<UUID> adminIds = authServiceClient.getAdminUserIds();
      for (UUID adminId : adminIds) {
        notificationClient.sendInAppNotification(
          adminId,
          "EVENT_DELETED",
          "Event '" + event.getTitle() + "' has been deleted",
          "/dashboard/admin"
        );
      }
    } catch (Exception e) {
      System.err.println("Failed to send event deletion notifications: " + e.getMessage());
    }
    
    eventRepository.deleteById(id);
  }
}

