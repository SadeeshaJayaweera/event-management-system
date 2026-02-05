package com.nsbm.eventservice.dto;

import com.nsbm.eventservice.model.EventCategory;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateEventRequest {

    @NotBlank(message = "Event title is required")
    @Size(min = 3, max = 200, message = "Title must be between 3 and 200 characters")
    private String title;

    @NotBlank(message = "Description is required")
    @Size(min = 10, max = 5000, message = "Description must be between 10 and 5000 characters")
    private String description;

    @NotNull(message = "Event date is required")
    @FutureOrPresent(message = "Event date must be in the future or present")
    private LocalDate eventDate;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    private LocalTime endTime;

    @NotBlank(message = "Location is required")
    @Size(max = 500, message = "Location must be at most 500 characters")
    private String location;

    @Size(max = 500, message = "Address must be at most 500 characters")
    private String address;

    @NotNull(message = "Capacity is required")
    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", message = "Price cannot be negative")
    private String price;

    @NotNull(message = "Category is required")
    private EventCategory category;

    @NotNull(message = "Organizer ID is required")
    private Long organizerId;

    private String organizerName;

    private List<String> imageUrls;

    private String thumbnailUrl;

    private Boolean featured;
}
