package com.eventflow.reviewservice.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

@Schema(description = "Request payload for updating an existing review. All fields are optional.")
public record ReviewUpdateRequest(
    @Schema(description = "Updated star rating from 1 to 5", example = "5", minimum = "1", maximum = "5")
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must be at most 5")
    Integer rating,

    @Schema(description = "Updated review title", example = "Even better on reflection!", maxLength = 200)
    @Size(max = 200, message = "Title must be less than 200 characters")
    String title,

    @Schema(description = "Updated review comment", example = "Revisiting my review - the follow-up content was also great.", maxLength = 2000)
    @Size(max = 2000, message = "Comment must be less than 2000 characters")
    String comment,

    @Schema(description = "Updated positive highlights", example = "Networking opportunities were excellent")
    String pros,

    @Schema(description = "Updated negative aspects", example = "Could improve catering options")
    String cons
) {
}
