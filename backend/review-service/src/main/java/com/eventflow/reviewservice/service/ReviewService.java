package com.eventflow.reviewservice.service;

import com.eventflow.reviewservice.dto.RatingStatsResponse;
import com.eventflow.reviewservice.dto.ReviewCreateRequest;
import com.eventflow.reviewservice.dto.ReviewResponse;
import com.eventflow.reviewservice.dto.ReviewUpdateRequest;
import com.eventflow.reviewservice.exception.DuplicateReviewException;
import com.eventflow.reviewservice.exception.ReviewNotFoundException;
import com.eventflow.reviewservice.model.Review;
import com.eventflow.reviewservice.model.ReviewStatus;
import com.eventflow.reviewservice.repository.ReviewRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class ReviewService {

  private final ReviewRepository reviewRepository;

  public ReviewService(ReviewRepository reviewRepository) {
    this.reviewRepository = reviewRepository;
  }

  @Transactional
  public ReviewResponse createReview(ReviewCreateRequest request) {
    if (reviewRepository.existsByEventIdAndUserId(request.eventId(), request.userId())) {
      throw new DuplicateReviewException(
          "User " + request.userId() + " has already reviewed event " + request.eventId());
    }

    Review review = new Review();
    review.setEventId(request.eventId());
    review.setUserId(request.userId());
    review.setRating(request.rating());
    review.setTitle(request.title());
    review.setComment(request.comment());
    review.setPros(request.pros());
    review.setCons(request.cons());
    review.setStatus(ReviewStatus.APPROVED);
    review.setVerified(false);
    review.setHelpfulCount(0);

    return toResponse(reviewRepository.save(review));
  }

  public ReviewResponse getReview(UUID id) {
    return toResponse(findById(id));
  }

  @Transactional
  public ReviewResponse updateReview(UUID id, UUID requestingUserId, ReviewUpdateRequest request) {
    Review review = findById(id);

    if (!review.getUserId().equals(requestingUserId)) {
      throw new com.eventflow.reviewservice.exception.ReviewNotAllowedException(
          "You can only update your own reviews");
    }

    if (request.rating() != null) review.setRating(request.rating());
    if (request.title() != null) review.setTitle(request.title());
    if (request.comment() != null) review.setComment(request.comment());
    if (request.pros() != null) review.setPros(request.pros());
    if (request.cons() != null) review.setCons(request.cons());

    return toResponse(reviewRepository.save(review));
  }

  @Transactional
  public void deleteReview(UUID id, UUID requestingUserId) {
    Review review = findById(id);

    if (!review.getUserId().equals(requestingUserId)) {
      throw new com.eventflow.reviewservice.exception.ReviewNotAllowedException(
          "You can only delete your own reviews");
    }

    reviewRepository.delete(review);
  }

  public List<ReviewResponse> getReviewsByEvent(UUID eventId) {
    return reviewRepository.findByEventIdAndStatusOrderByCreatedAtDesc(eventId, ReviewStatus.APPROVED)
        .stream()
        .map(this::toResponse)
        .collect(Collectors.toList());
  }

  public List<ReviewResponse> getReviewsByUser(UUID userId) {
    return reviewRepository.findByUserIdOrderByCreatedAtDesc(userId)
        .stream()
        .map(this::toResponse)
        .collect(Collectors.toList());
  }

  public Double getAverageRating(UUID eventId) {
    Double avg = reviewRepository.findAverageRatingByEventId(eventId);
    return avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0;
  }

  public RatingStatsResponse getRatingStats(UUID eventId) {
    Double avg = reviewRepository.findAverageRatingByEventId(eventId);
    long total = reviewRepository.countApprovedByEventId(eventId);

    List<Object[]> rawDistribution = reviewRepository.findRatingDistributionByEventId(eventId);
    Map<Integer, Long> distribution = new HashMap<>();
    for (int i = 1; i <= 5; i++) distribution.put(i, 0L);
    for (Object[] row : rawDistribution) {
      distribution.put((Integer) row[0], (Long) row[1]);
    }

    return new RatingStatsResponse(
        eventId,
        avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0,
        total,
        distribution
    );
  }

  public boolean canUserReview(UUID userId, UUID eventId) {
    return !reviewRepository.existsByEventIdAndUserId(eventId, userId);
  }

  @Transactional
  public ReviewResponse markHelpful(UUID id) {
    Review review = findById(id);
    review.setHelpfulCount(review.getHelpfulCount() + 1);
    return toResponse(reviewRepository.save(review));
  }

  // ---- helpers ----

  private Review findById(UUID id) {
    return reviewRepository.findById(id)
        .orElseThrow(() -> new ReviewNotFoundException("Review not found with id: " + id));
  }

  private ReviewResponse toResponse(Review review) {
    return new ReviewResponse(
        review.getId(),
        review.getEventId(),
        review.getUserId(),
        review.getRating(),
        review.getTitle(),
        review.getComment(),
        review.getPros(),
        review.getCons(),
        review.getVerified(),
        review.getHelpfulCount(),
        review.getStatus(),
        review.getCreatedAt(),
        review.getUpdatedAt()
    );
  }
}
