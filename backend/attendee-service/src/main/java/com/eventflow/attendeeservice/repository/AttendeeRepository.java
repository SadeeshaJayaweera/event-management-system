package com.eventflow.attendeeservice.repository;

import com.eventflow.attendeeservice.model.Attendee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AttendeeRepository extends JpaRepository<Attendee, UUID> {
  List<Attendee> findByEventId(UUID eventId);
}

