package com.eventflow.authservice.service;

import com.eventflow.authservice.dto.AuthResponse;
import com.eventflow.authservice.dto.LoginRequest;
import com.eventflow.authservice.dto.RegisterRequest;
import com.eventflow.authservice.model.User;
import com.eventflow.authservice.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;

@Service
public class AuthService {
  private final UserRepository userRepository;
  private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

  public AuthService(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  public AuthResponse register(RegisterRequest request) {
    if (userRepository.findByEmail(request.getEmail()).isPresent()) {
      throw new IllegalArgumentException("Email already registered");
    }

    User user = new User();
    user.setName(request.getName());
    user.setEmail(request.getEmail());
    user.setRole(request.getRole());
    user.setPasswordHash(encoder.encode(request.getPassword()));
    user.setStatus("active");

    User saved = userRepository.save(user);
    return new AuthResponse(saved.getId(), saved.getName(), saved.getRole(), issueToken(saved));
  }

  public AuthResponse login(LoginRequest request) {
    User user = userRepository.findByEmail(request.getEmail())
      .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

    if (!encoder.matches(request.getPassword(), user.getPasswordHash())) {
      throw new IllegalArgumentException("Invalid credentials");
    }

    if ("banned".equals(user.getStatus())) {
      throw new IllegalArgumentException("Your account has been banned. Please contact support.");
    }

    return new AuthResponse(user.getId(), user.getName(), user.getRole(), issueToken(user));
  }

  private String issueToken(User user) {
    String payload = user.getId() + ":" + user.getRole() + ":" + Instant.now().toEpochMilli();
    return Base64.getUrlEncoder().withoutPadding().encodeToString(payload.getBytes(StandardCharsets.UTF_8));
  }
}

