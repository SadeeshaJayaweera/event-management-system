package com.nsbm.reviewservice.controller;

import com.nsbm.reviewservice.entity.Review;
import com.nsbm.reviewservice.repository.ReviewRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewRepository reviewRepository;

    @PostMapping
    public ResponseEntity<Review> createReview(@RequestBody ReviewRequest request) {
        Review review = Review.builder()
                .eventId(request.getEventId())
                .userId(request.getUserId())
                .rating(request.getRating())
                .comment(request.getComment())
                .postedAt(LocalDateTime.now())
                .build();
        return ResponseEntity.ok(reviewRepository.save(review));
    }

    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<Review>> getReviewsByEvent(@PathVariable Long eventId) {
        return ResponseEntity.ok(reviewRepository.findByEventId(eventId));
    }

    @Data
    public static class ReviewRequest {
        private Long eventId;
        private Long userId;
        private int rating;
        private String comment;
    }
}
