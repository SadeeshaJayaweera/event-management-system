package com.nsbm.userservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token; // JWT token (placeholder for now)
    private String type; // Token type (e.g., "Bearer")
    private Long userId;
    private String email;
    private String firstName;
    private String lastName;
    private String role;
    private String message;
    private UserDTO user; // Complete user object
}
