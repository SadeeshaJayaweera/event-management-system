package com.eventflow.reviewservice.dto;

import com.eventflow.reviewservice.model.ReviewStatus;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.UUID;

@Schema(description = "Review data returned by the API")
public record ReviewResponse(
    @Schema(description = "Unique identifier of the review", example = "550e8400-e29b-41d4-a716-446655440000")
    UUID id,

    @Schema(description = "UUID of the reviewed event", example = "123e4567-e89b-12d3-a456-426614174000")
    UUID eventId,

    @Schema(description = "UUID of the reviewer", example = "987fcdeb-51a2-43d7-b890-123456789abc")
    UUID userId,

    @Schema(description = "Star rating from 1 to 5", example = "4")
    Integer rating,

    @Schema(description = "Short review title", example = "Great event!")
    String title,

    @Schema(description = "Detailed review comment", example = "Very well organised with insightful content.")
    String comment,

    @Schema(description = "Positive highlights", example = "Great venue, excellent speakers")
    String pros,

    @Schema(description = "Negative aspects", example = "Parking was difficult")
    String cons,

    @Schema(description = "Whether the reviewer is a verified attendee", example = "true")
    Boolean verified,

    @Schema(description = "Number of users who found this review helpful", example = "12")
    Integer helpfulCount,

    @Schema(description = "Current moderation status of the review")
    ReviewStatus status,

    @Schema(description = "Timestamp when the review was created")
    LocalDateTime createdAt,

    @Schema(description = "Timestamp when the review was last updated")
    LocalDateTime updatedAt
) {
}
