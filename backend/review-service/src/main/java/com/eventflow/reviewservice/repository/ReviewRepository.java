package com.eventflow.reviewservice.repository;

import com.eventflow.reviewservice.model.Review;
import com.eventflow.reviewservice.model.ReviewStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID> {

  List<Review> findByEventIdOrderByCreatedAtDesc(UUID eventId);

  List<Review> findByEventIdAndStatusOrderByCreatedAtDesc(UUID eventId, ReviewStatus status);

  List<Review> findByUserIdOrderByCreatedAtDesc(UUID userId);

  Optional<Review> findByEventIdAndUserId(UUID eventId, UUID userId);

  boolean existsByEventIdAndUserId(UUID eventId, UUID userId);

  @Query("SELECT AVG(r.rating) FROM Review r WHERE r.eventId = :eventId AND r.status = com.eventflow.reviewservice.model.ReviewStatus.APPROVED")
  Double findAverageRatingByEventId(@Param("eventId") UUID eventId);

  @Query("SELECT r.rating, COUNT(r) FROM Review r WHERE r.eventId = :eventId AND r.status = com.eventflow.reviewservice.model.ReviewStatus.APPROVED GROUP BY r.rating ORDER BY r.rating")
  List<Object[]> findRatingDistributionByEventId(@Param("eventId") UUID eventId);

  @Query("SELECT COUNT(r) FROM Review r WHERE r.eventId = :eventId AND r.status = com.eventflow.reviewservice.model.ReviewStatus.APPROVED")
  long countApprovedByEventId(@Param("eventId") UUID eventId);
}
