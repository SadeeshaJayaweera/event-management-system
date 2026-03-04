package com.eventflow.reviewservice.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.Map;
import java.util.UUID;

@Schema(description = "Rating statistics for an event")
public record RatingStatsResponse(
    @Schema(description = "UUID of the event", example = "123e4567-e89b-12d3-a456-426614174000")
    UUID eventId,

    @Schema(description = "Average star rating across all reviews", example = "4.2")
    Double averageRating,

    @Schema(description = "Total number of approved reviews", example = "57")
    long totalReviews,

    @Schema(description = "Count of reviews per star rating (key: star 1-5, value: count)", example = "{\"1\": 2, \"2\": 3, \"3\": 8, \"4\": 20, \"5\": 24}")
    Map<Integer, Long> distribution
) {
}
