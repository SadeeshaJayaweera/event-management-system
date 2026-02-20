package com.eventflow.attendeeservice.service;

import com.eventflow.attendeeservice.dto.AttendeeCreateRequest;
import com.eventflow.attendeeservice.dto.AttendeeStatusUpdateRequest;
import com.eventflow.attendeeservice.model.Attendee;
import com.eventflow.attendeeservice.repository.AttendeeRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class AttendeeService {
  private final AttendeeRepository attendeeRepository;

  public AttendeeService(AttendeeRepository attendeeRepository) {
    this.attendeeRepository = attendeeRepository;
  }

  public List<Attendee> list(UUID eventId) {
    if (eventId == null) {
      return attendeeRepository.findAll();
    }
    return attendeeRepository.findByEventId(eventId);
  }

  public Attendee get(UUID id) {
    return attendeeRepository.findById(id)
      .orElseThrow(() -> new IllegalArgumentException("Attendee not found"));
  }

  public Attendee create(AttendeeCreateRequest request) {
    Attendee attendee = new Attendee();
    attendee.setEventId(request.getEventId());
    attendee.setName(request.getName());
    attendee.setEmail(request.getEmail());
    attendee.setStatus("Pending");
    attendee.setRegisteredAt(LocalDateTime.now());

    return attendeeRepository.save(attendee);
  }

  public Attendee updateStatus(UUID id, AttendeeStatusUpdateRequest request) {
    Attendee attendee = get(id);
    attendee.setStatus(request.getStatus());
    return attendeeRepository.save(attendee);
  }

  public long count() {
    return attendeeRepository.count();
  }
}

