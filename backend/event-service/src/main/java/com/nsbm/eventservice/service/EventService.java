package com.nsbm.eventservice.service;

import com.nsbm.eventservice.dto.*;
import com.nsbm.eventservice.exception.InsufficientSeatsException;
import com.nsbm.eventservice.exception.ResourceNotFoundException;
import com.nsbm.eventservice.model.Event;
import com.nsbm.eventservice.model.EventCategory;
import com.nsbm.eventservice.model.EventStatus;
import com.nsbm.eventservice.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class EventService {

    private final EventRepository eventRepository;

    public EventDTO createEvent(CreateEventRequest request) {
        Event event = Event.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .eventDate(request.getEventDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .location(request.getLocation())
                .address(request.getAddress())
                .capacity(request.getCapacity())
                .availableSeats(request.getCapacity())
                .price(new java.math.BigDecimal(request.getPrice()))
                .category(request.getCategory())
                .organizerId(request.getOrganizerId())
                .organizerName(request.getOrganizerName())
                .status(EventStatus.PUBLISHED) // Auto-publish on creation
                .imageUrls(request.getImageUrls() != null ? request.getImageUrls() : List.of())
                .thumbnailUrl(request.getThumbnailUrl())
                .featured(request.getFeatured() != null ? request.getFeatured() : false)
                .build();

        event = eventRepository.save(event);
        return toDTO(event);
    }

    @Transactional(readOnly = true)
    public EventDTO getEventById(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", id));
        return toDTO(event);
    }

    @Transactional(readOnly = true)
    public List<EventDTO> getAllEvents() {
        return eventRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EventDTO> getPublishedEvents() {
        return eventRepository.findByStatus(EventStatus.PUBLISHED).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EventDTO> getUpcomingEvents() {
        return eventRepository.findUpcomingEvents(EventStatus.PUBLISHED, LocalDate.now()).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EventDTO> getFeaturedEvents() {
        return eventRepository.findByFeaturedTrueAndStatus(EventStatus.PUBLISHED).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EventDTO> getEventsByCategory(EventCategory category) {
        return eventRepository.findByCategoryAndUpcoming(category, EventStatus.PUBLISHED, LocalDate.now()).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EventDTO> getEventsByOrganizer(Long organizerId) {
        return eventRepository.findByOrganizerId(organizerId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EventDTO> searchEvents(String query) {
        return eventRepository.searchEvents(query, EventStatus.PUBLISHED).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<EventDTO> getEventsPaginated(Pageable pageable) {
        return eventRepository.findByStatusAndEventDateGreaterThanEqual(
                EventStatus.PUBLISHED, LocalDate.now(), pageable)
                .map(this::toDTO);
    }

    public EventDTO updateEvent(Long id, UpdateEventRequest request) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", id));

        if (request.getTitle() != null) {
            event.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            event.setDescription(request.getDescription());
        }
        if (request.getEventDate() != null) {
            event.setEventDate(request.getEventDate());
        }
        if (request.getStartTime() != null) {
            event.setStartTime(request.getStartTime());
        }
        if (request.getEndTime() != null) {
            event.setEndTime(request.getEndTime());
        }
        if (request.getLocation() != null) {
            event.setLocation(request.getLocation());
        }
        if (request.getAddress() != null) {
            event.setAddress(request.getAddress());
        }
        if (request.getCapacity() != null) {
            int bookedSeats = event.getCapacity() - event.getAvailableSeats();
            if (request.getCapacity() < bookedSeats) {
                throw new IllegalStateException("New capacity cannot be less than booked seats");
            }
            event.setCapacity(request.getCapacity());
            event.setAvailableSeats(request.getCapacity() - bookedSeats);
        }
        if (request.getPrice() != null) {
            event.setPrice(request.getPrice());
        }
        if (request.getCategory() != null) {
            event.setCategory(request.getCategory());
        }
        if (request.getStatus() != null) {
            event.setStatus(request.getStatus());
        }
        if (request.getImageUrls() != null) {
            event.setImageUrls(request.getImageUrls());
        }
        if (request.getThumbnailUrl() != null) {
            event.setThumbnailUrl(request.getThumbnailUrl());
        }
        if (request.getFeatured() != null) {
            event.setFeatured(request.getFeatured());
        }

        event = eventRepository.save(event);
        return toDTO(event);
    }

    public EventDTO publishEvent(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", id));
        event.setStatus(EventStatus.PUBLISHED);
        event = eventRepository.save(event);
        return toDTO(event);
    }

    public EventDTO cancelEvent(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", id));
        event.setStatus(EventStatus.CANCELLED);
        event = eventRepository.save(event);
        return toDTO(event);
    }

    public void deleteEvent(Long id) {
        if (!eventRepository.existsById(id)) {
            throw new ResourceNotFoundException("Event", "id", id);
        }
        eventRepository.deleteById(id);
    }

    // Methods for Booking Service integration
    public EventDTO reserveSeats(Long eventId, int numberOfSeats) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", eventId));

        if (!event.hasAvailableSeats(numberOfSeats)) {
            throw new InsufficientSeatsException(eventId, numberOfSeats, event.getAvailableSeats());
        }

        event.reserveSeats(numberOfSeats);
        event = eventRepository.save(event);
        return toDTO(event);
    }

    public EventDTO releaseSeats(Long eventId, int numberOfSeats) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", eventId));

        event.releaseSeats(numberOfSeats);
        event = eventRepository.save(event);
        return toDTO(event);
    }

    @Transactional(readOnly = true)
    public boolean hasAvailableSeats(Long eventId, int numberOfSeats) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", eventId));
        return event.hasAvailableSeats(numberOfSeats);
    }

    @Transactional(readOnly = true)
    public boolean existsById(Long id) {
        return eventRepository.existsById(id);
    }

    private EventDTO toDTO(Event event) {
        return EventDTO.builder()
                .id(event.getId())
                .title(event.getTitle())
                .description(event.getDescription())
                .eventDate(event.getEventDate())
                .startTime(event.getStartTime())
                .endTime(event.getEndTime())
                .location(event.getLocation())
                .address(event.getAddress())
                .capacity(event.getCapacity())
                .availableSeats(event.getAvailableSeats())
                .price(event.getPrice())
                .category(event.getCategory())
                .organizerId(event.getOrganizerId())
                .organizerName(event.getOrganizerName())
                .status(event.getStatus())
                .imageUrls(event.getImageUrls())
                .thumbnailUrl(event.getThumbnailUrl())
                .featured(event.getFeatured())
                .createdAt(event.getCreatedAt())
                .updatedAt(event.getUpdatedAt())
                .build();
    }
}
