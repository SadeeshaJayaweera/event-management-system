package com.eventflow.reviewservice.controller;

import com.eventflow.reviewservice.dto.RatingStatsResponse;
import com.eventflow.reviewservice.dto.ReviewCreateRequest;
import com.eventflow.reviewservice.dto.ReviewResponse;
import com.eventflow.reviewservice.dto.ReviewUpdateRequest;
import com.eventflow.reviewservice.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/reviews")
@Tag(name = "Reviews", description = "API for managing event reviews and ratings")
public class ReviewController {

  private final ReviewService reviewService;

  public ReviewController(ReviewService reviewService) {
    this.reviewService = reviewService;
  }

  // ---- Health ----

  @Operation(summary = "Health check", description = "Returns the health status of the review service")
  @ApiResponse(responseCode = "200", description = "Service is up and running")
  @GetMapping("/health")
  public ResponseEntity<Map<String, String>> health() {
    return ResponseEntity.ok(Map.of(
        "status", "UP",
        "service", "review-service",
        "port", "8089"
    ));
  }

  // ---- CRUD ----

  @Operation(summary = "Create a review", description = "Submit a new review for an event. A user can only review an event once.")
  @ApiResponses({
      @ApiResponse(responseCode = "201", description = "Review created successfully",
          content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = ReviewResponse.class))),
      @ApiResponse(responseCode = "400", description = "Invalid input or validation failure", content = @Content),
      @ApiResponse(responseCode = "409", description = "User has already reviewed this event", content = @Content)
  })
  @PostMapping
  public ResponseEntity<ReviewResponse> createReview(@Valid @RequestBody ReviewCreateRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED).body(reviewService.createReview(request));
  }

  @Operation(summary = "Get a review by ID", description = "Retrieve a single review by its unique identifier")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "Review found",
          content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = ReviewResponse.class))),
      @ApiResponse(responseCode = "404", description = "Review not found", content = @Content)
  })
  @GetMapping("/{id}")
  public ResponseEntity<ReviewResponse> getReview(
      @Parameter(description = "UUID of the review", required = true) @PathVariable UUID id) {
    return ResponseEntity.ok(reviewService.getReview(id));
  }

  @Operation(summary = "Update a review", description = "Update the rating or content of an existing review. Only the original author can update.")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "Review updated successfully",
          content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = ReviewResponse.class))),
      @ApiResponse(responseCode = "400", description = "Invalid input", content = @Content),
      @ApiResponse(responseCode = "403", description = "User is not the author of this review", content = @Content),
      @ApiResponse(responseCode = "404", description = "Review not found", content = @Content)
  })
  @PutMapping("/{id}")
  public ResponseEntity<ReviewResponse> updateReview(
      @Parameter(description = "UUID of the review", required = true) @PathVariable UUID id,
      @Parameter(description = "UUID of the user performing the update", required = true) @RequestParam UUID userId,
      @Valid @RequestBody ReviewUpdateRequest request) {
    return ResponseEntity.ok(reviewService.updateReview(id, userId, request));
  }

  @Operation(summary = "Delete a review", description = "Permanently delete a review. Only the original author can delete.")
  @ApiResponses({
      @ApiResponse(responseCode = "204", description = "Review deleted successfully"),
      @ApiResponse(responseCode = "403", description = "User is not the author of this review", content = @Content),
      @ApiResponse(responseCode = "404", description = "Review not found", content = @Content)
  })
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteReview(
      @Parameter(description = "UUID of the review", required = true) @PathVariable UUID id,
      @Parameter(description = "UUID of the user requesting deletion", required = true) @RequestParam UUID userId) {
    reviewService.deleteReview(id, userId);
    return ResponseEntity.noContent().build();
  }

  // ---- Event reviews ----

  @Operation(summary = "Get reviews for an event", description = "Retrieve all approved reviews for a specific event")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "List of reviews",
          content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
              array = @ArraySchema(schema = @Schema(implementation = ReviewResponse.class))))
  })
  @GetMapping("/event/{eventId}")
  public ResponseEntity<List<ReviewResponse>> getReviewsByEvent(
      @Parameter(description = "UUID of the event", required = true) @PathVariable UUID eventId) {
    return ResponseEntity.ok(reviewService.getReviewsByEvent(eventId));
  }

  // ---- User reviews ----

  @Operation(summary = "Get reviews by user", description = "Retrieve all reviews submitted by a specific user")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "List of reviews",
          content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
              array = @ArraySchema(schema = @Schema(implementation = ReviewResponse.class))))
  })
  @GetMapping("/user/{userId}")
  public ResponseEntity<List<ReviewResponse>> getReviewsByUser(
      @Parameter(description = "UUID of the user", required = true) @PathVariable UUID userId) {
    return ResponseEntity.ok(reviewService.getReviewsByUser(userId));
  }

  // ---- Rating analytics ----

  @Operation(summary = "Get average rating for an event", description = "Returns the average star rating for an event based on all approved reviews")
  @ApiResponse(responseCode = "200", description = "Average rating data")
  @GetMapping("/event/{eventId}/rating")
  public ResponseEntity<Map<String, Object>> getAverageRating(
      @Parameter(description = "UUID of the event", required = true) @PathVariable UUID eventId) {
    return ResponseEntity.ok(Map.of(
        "eventId", eventId,
        "averageRating", reviewService.getAverageRating(eventId)
    ));
  }

  @Operation(summary = "Get rating statistics for an event", description = "Returns detailed rating statistics including distribution per star rating")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "Rating statistics",
          content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = RatingStatsResponse.class)))
  })
  @GetMapping("/event/{eventId}/stats")
  public ResponseEntity<RatingStatsResponse> getRatingStats(
      @Parameter(description = "UUID of the event", required = true) @PathVariable UUID eventId) {
    return ResponseEntity.ok(reviewService.getRatingStats(eventId));
  }

  // ---- Verification ----

  @Operation(summary = "Check if user can review an event",
      description = "Verifies whether a user is eligible to review an event (has attended and not already reviewed)")
  @ApiResponse(responseCode = "200", description = "Eligibility result")
  @GetMapping("/can-review/{eventId}")
  public ResponseEntity<Map<String, Object>> canReview(
      @Parameter(description = "UUID of the event", required = true) @PathVariable UUID eventId,
      @Parameter(description = "UUID of the user", required = true) @RequestParam UUID userId) {
    boolean canReview = reviewService.canUserReview(userId, eventId);
    return ResponseEntity.ok(Map.of(
        "eventId", eventId,
        "userId", userId,
        "canReview", canReview
    ));
  }

  // ---- Helpful votes ----

  @Operation(summary = "Mark a review as helpful", description = "Increment the helpful count of a review by one")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "Review updated with incremented helpful count",
          content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = ReviewResponse.class))),
      @ApiResponse(responseCode = "404", description = "Review not found", content = @Content)
  })
  @PostMapping("/{id}/helpful")
  public ResponseEntity<ReviewResponse> markHelpful(
      @Parameter(description = "UUID of the review", required = true) @PathVariable UUID id) {
    return ResponseEntity.ok(reviewService.markHelpful(id));
  }
}
