package com.eventflow.reviewservice.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

@Schema(description = "Request payload for creating a new event review")
public record ReviewCreateRequest(
    @Schema(description = "UUID of the event being reviewed", example = "123e4567-e89b-12d3-a456-426614174000", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "Event ID is required")
    UUID eventId,

    @Schema(description = "UUID of the user submitting the review", example = "987fcdeb-51a2-43d7-b890-123456789abc", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "User ID is required")
    UUID userId,

    @Schema(description = "Star rating from 1 (poor) to 5 (excellent)", example = "4", minimum = "1", maximum = "5", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must be at most 5")
    Integer rating,

    @Schema(description = "Short title summarising the review", example = "Great event!", maxLength = 200)
    @Size(max = 200, message = "Title must be less than 200 characters")
    String title,

    @Schema(description = "Detailed review comment", example = "The organisation was excellent and the speakers were very informative.", maxLength = 2000)
    @Size(max = 2000, message = "Comment must be less than 2000 characters")
    String comment,

    @Schema(description = "Positive highlights of the event", example = "Great venue, excellent speakers")
    String pros,

    @Schema(description = "Negative aspects or areas for improvement", example = "Parking was difficult")
    String cons
) {
}
